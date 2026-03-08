import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import fetch from "node-fetch";
import { GoogleGenerativeAI } from "@google/generative-ai";

admin.initializeApp();
const db = admin.firestore();

// ============================================
// AI FUNCTIONS (Gemini & ElevenLabs)
// ============================================

export const generateGeminiContent = functions.https.onCall(async (data, context) => {
    // Optional: Add authentication check
    // if (!context.auth) {
    //     throw new functions.https.HttpsError('unauthenticated', 'User must be logged in to use AI features.');
    // }

    const { prompt, systemInstruction, temperature = 0.7 } = data;

    if (!prompt) {
        throw new functions.https.HttpsError('invalid-argument', 'Prompt is required.');
    }

    const apiKey = process.env.GEMINI_API_KEY || functions.config().gemini?.key;
    if (!apiKey) {
        throw new functions.https.HttpsError('internal', 'Gemini API key not configured.');
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction,
        });

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: temperature,
            }
        });

        return { text: result.response.text() };
    } catch (error: any) {
        console.error("Gemini Generation Error:", error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to generate content');
    }
});

export const generateElevenLabsSpeech = functions.https.onCall(async (data, context) => {
    const { text, voiceId = "21m00Tcm4TlvDq8ikWAM" } = data; // Default to 'Rachel'

    if (!text) {
        throw new functions.https.HttpsError('invalid-argument', 'Text is required.');
    }

    const apiKey = process.env.ELEVENLABS_API_KEY || functions.config().elevenlabs?.key;
    if (!apiKey) {
        throw new functions.https.HttpsError('internal', 'ElevenLabs API key not configured.');
    }

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: "POST",
            headers: {
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": apiKey
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_monolingual_v1",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
        }

        const audioBuffer = await response.arrayBuffer();
        // Return as base64 string
        const base64Audio = Buffer.from(audioBuffer).toString('base64');
        return { audioBase64: base64Audio };
    } catch (error: any) {
        console.error("ElevenLabs Error:", error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to generate speech');
    }
});

// ============================================
// CONFIGURATION — Telegram
//   firebase functions:config:set telegram.bot_token="YOUR_BOT_TOKEN"
// ============================================

function getBotToken(): string {
    return functions.config().telegram?.bot_token || process.env.TELEGRAM_BOT_TOKEN || "";
}

async function sendTelegramMessage(chatId: string, text: string) {
    const token = getBotToken();
    if (!token) {
        console.error("No Telegram bot token configured!");
        return;
    }
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: "HTML",
        }),
    });
}

// ============================================
// WEBHOOK — Handles /start from Telegram
// Deploy, then set webhook:
//   https://api.telegram.org/bot<TOKEN>/setWebhook?url=<FUNCTION_URL>
// ============================================

export const telegramWebhook = functions.https.onRequest(async (req, res) => {
    try {
        const body = req.body;
        const message = body?.message;
        if (!message?.text) {
            res.status(200).send("ok");
            return;
        }

        const chatId = String(message.chat.id);
        const text = message.text.trim();

        if (text.startsWith("/start")) {
            // Extract the linking code: /start <code>
            const parts = text.split(" ");
            const linkCode = parts.length > 1 ? parts[1] : null;

            if (linkCode) {
                // Find user with this linkCode and associate chatId
                const usersSnap = await db.collection("users")
                    .where("telegramLinkCode", "==", linkCode)
                    .limit(1)
                    .get();

                if (!usersSnap.empty) {
                    const userDoc = usersSnap.docs[0];
                    await userDoc.ref.update({
                        telegramChatId: chatId,
                        telegramLinkCode: admin.firestore.FieldValue.delete(),
                    });
                    await sendTelegramMessage(chatId,
                        "✅ <b>Connected!</b>\n\nYour Telegram is now linked to your EngliLearn account. You'll receive daily practice tasks here!\n\n🎯 Grammar questions\n✍️ Writing prompts\n🗣 Speaking tasks"
                    );
                } else {
                    await sendTelegramMessage(chatId,
                        "❌ Invalid link code. Please generate a new connection link from the EngliLearn Settings page."
                    );
                }
            } else {
                await sendTelegramMessage(chatId,
                    "👋 <b>Welcome to EngliLearn Bot!</b>\n\nTo connect your account, go to your EngliLearn app → Settings → Connect Telegram and use the link provided there."
                );
            }
        }

        res.status(200).send("ok");
    } catch (error) {
        console.error("Webhook error:", error);
        res.status(200).send("ok");
    }
});

// ============================================
// DAILY TASK SENDER — Runs every day at 8 AM IST
// ============================================

const grammarTasks = [
    "Fill in the blank: She ___ (go/goes/going) to school every day.",
    "Correct this sentence: 'He don't like apples.'",
    "Choose the correct option: I have been living here ___ 2015. (since/for/from)",
    "Fill in the blank: If I ___ (was/were) you, I would study harder.",
    "Identify the error: 'Each of the students have their own book.'",
    "Complete: Neither the teacher nor the students ___ (was/were) present.",
    "Choose: She is ___ (taller/tallest/more tall) than her sister.",
    "Fix this: 'Me and him went to the store.'",
    "Fill in: The news ___ (is/are) very shocking today.",
    "Correct: 'I have saw that movie before.'",
];

const writingPrompts = [
    "Write 3 sentences about your morning routine using present simple tense.",
    "Describe your favorite place in 5 sentences. Use at least 2 adjectives.",
    "Write a short email to a friend inviting them to a party.",
    "Write about what you did last weekend using past tense (4-5 sentences).",
    "Describe your dream job in a short paragraph.",
    "Write 3 sentences using 'although', 'however', and 'nevertheless'.",
    "Write a short review (3-4 sentences) of a movie you watched recently.",
    "Compose a formal complaint about a product in 4-5 sentences.",
    "Write about what makes a good friend (5 sentences).",
    "Describe the weather today and what activities suit it (3-4 sentences).",
];

const speakingTasks = [
    "Record yourself introducing yourself (name, age, hobbies) in 30 seconds.",
    "Read this tongue twister 3 times fast: 'She sells seashells by the seashore.'",
    "Speak for 1 minute about your favorite food and why you like it.",
    "Practice these minimal pairs: ship/sheep, sit/seat, live/leave.",
    "Describe what you see outside your window right now (30 seconds).",
    "Tell a short story about something funny that happened to you.",
    "Practice saying these words with correct stress: photograph, photography, photographic.",
    "Speak for 30 seconds about the advantages of learning English.",
    "Read aloud: 'The quick brown fox jumps over the lazy dog' — focus on clarity.",
    "Describe your daily commute or walk in 1 minute.",
];

export const sendDailyTasks = functions.pubsub
    .schedule("0 2 * * *") // 2:00 AM UTC = 7:30 AM IST
    .timeZone("Asia/Kolkata")
    .onRun(async () => {
        try {
            const usersSnap = await db.collection("users")
                .where("telegramChatId", "!=", null)
                .get();

            if (usersSnap.empty) {
                console.log("No users with Telegram connected.");
                return;
            }

            const dayIndex = new Date().getDate() % 10;

            for (const userDoc of usersSnap.docs) {
                const userData = userDoc.data();
                const chatId = userData.telegramChatId;
                const name = userData.name || "Learner";

                const message = `🌅 <b>Good Morning, ${name}!</b>\n\nHere are your daily English practice tasks:\n\n📝 <b>Grammar:</b>\n${grammarTasks[dayIndex]}\n\n✍️ <b>Writing:</b>\n${writingPrompts[dayIndex]}\n\n🗣 <b>Speaking:</b>\n${speakingTasks[dayIndex]}\n\n💪 Practice makes perfect! Open EngliLearn to track your progress.`;

                await sendTelegramMessage(chatId, message);
                console.log(`Sent daily tasks to ${name} (${chatId})`);
            }

            console.log(`Daily tasks sent to ${usersSnap.size} users.`);
        } catch (error) {
            console.error("Daily task error:", error);
        }
    });
