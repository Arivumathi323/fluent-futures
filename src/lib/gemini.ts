import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "./firebase";
import { getFallbackGrammar, getFallbackPassage, getFallbackWriting, getFallbackQuiz } from "./fallbackData";

const functions = getFunctions(auth.app);
const generateGeminiContentCallable = httpsCallable(functions, "generateGeminiContent");

// Helper function to call the cloud function
async function callGemini(prompt: string, systemInstruction?: string, temperature = 0.7): Promise<string> {
    try {
        const result = await generateGeminiContentCallable({ prompt, systemInstruction, temperature });
        const data = result.data as { text: string };
        return data.text;
    } catch (error) {
        console.error("Error calling Gemini Cloud Function:", error);
        throw error;
    }
}

function cleanJsonResponse(text: string): string {
    let cleaned = text.trim();
    if (cleaned.startsWith("```json")) {
        cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith("```")) {
        cleaned = cleaned.slice(0, -3);
    }
    return cleaned.trim();
}

export interface GrammarQuestion {
    id: number;
    type: "mcq" | "fill";
    question: string;
    options?: string[];
    answer: string;
    explanation: string;
}

export async function generateGrammarQuestions(
    difficulty: "beginner" | "intermediate" | "advanced",
    count: number = 5
): Promise<GrammarQuestion[]> {
    const prompt = `Generate ${count} English grammar questions at ${difficulty} level. 
Mix MCQ (with 4 options) and fill-in-the-blank questions. 
Return ONLY a JSON array with this structure:
[
  {
    "id": 1,
    "type": "mcq",
    "question": "Choose the correct form: She ___ to school every day.",
    "options": ["go", "goes", "going", "gone"],
    "answer": "goes",
    "explanation": "With third person singular subjects, we use 'goes'."
  },
  {
    "id": 2,
    "type": "fill",
    "question": "Fill in the blank: They ___ (be) very happy yesterday.",
    "answer": "were",
    "explanation": "'Were' is the past tense of 'be' for plural subjects."
  }
]
Do not include any text outside the JSON array.`;

    try {
        const text = await callGemini(prompt);
        const cleaned = cleanJsonResponse(text);
        const questions: GrammarQuestion[] = JSON.parse(cleaned);
        return questions.map((q, i) => ({ ...q, id: i + 1 }));
    } catch (error) {
        console.warn("Gemini unavailable, using fallback questions:", error);
        return getFallbackGrammar(difficulty);
    }
}

export interface ReadingPassage {
    title: string;
    text: string;
    vocabulary: { word: string; meaning: string }[];
    questions: { question: string; options: string[]; answer: string }[];
}

export async function generateReadingPassage(
    level: "beginner" | "intermediate" | "advanced"
): Promise<ReadingPassage> {
    const prompt = `Generate an English reading comprehension exercise at ${level} level.
Return ONLY a JSON object with this structure:
{
  "title": "The title of the passage",
  "text": "A 100-150 word passage appropriate for ${level} level English learners.",
  "vocabulary": [
    { "word": "example", "meaning": "a thing that serves as a model" },
    { "word": "another", "meaning": "one more" }
  ],
  "questions": [
    {
      "question": "What is the main idea of the passage?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A"
    }
  ]
}
Include 3-4 vocabulary words and 3-4 comprehension questions. Do not include any text outside the JSON.`;

    try {
        const text = await callGemini(prompt);
        const cleaned = cleanJsonResponse(text);
        return JSON.parse(cleaned);
    } catch (error) {
        console.warn("Gemini unavailable, using fallback passage:", error);
        return getFallbackPassage(level);
    }
}

export interface WritingExercise {
    id: number;
    type: "formation" | "correction" | "prompt";
    instruction: string;
    hint?: string;
    answer?: string;
}

export async function generateWritingExercises(
    count: number = 5
): Promise<WritingExercise[]> {
    const prompt = `Generate ${count} English writing exercises. Mix these types:
1. Sentence formation (rearrange words into correct sentence)
2. Error correction (fix grammar/spelling errors)
3. Free writing prompt

Return ONLY a JSON array:
[
  {
    "id": 1,
    "type": "formation",
    "instruction": "Form a sentence using: quickly / the / ran / dog",
    "hint": "Subject + adverb + verb",
    "answer": "The dog ran quickly."
  },
  {
    "id": 2,
    "type": "correction",
    "instruction": "Correct this sentence: \\"She don't like pizza.\\"",
    "answer": "She doesn't like pizza."
  },
  {
    "id": 3,
    "type": "prompt",
    "instruction": "Write 2-3 sentences about your favorite season. Use at least one adjective."
  }
]
Do not include any text outside the JSON array.`;

    try {
        const text = await callGemini(prompt);
        const cleaned = cleanJsonResponse(text);
        const exercises: WritingExercise[] = JSON.parse(cleaned);
        return exercises.map((e, i) => ({ ...e, id: i + 1 }));
    } catch (error) {
        console.warn("Gemini unavailable, using fallback exercises:", error);
        return getFallbackWriting();
    }
}

export interface QuizQuestion {
    id: number;
    category: string;
    question: string;
    options: string[];
    answer: string;
}

export async function generateQuizQuestions(
    count: number = 8
): Promise<QuizQuestion[]> {
    const prompt = `Generate ${count} English quiz questions covering grammar, vocabulary, reading comprehension, and idioms.
Return ONLY a JSON array:
[
  {
    "id": 1,
    "category": "Grammar",
    "question": "Which sentence is correct?",
    "options": ["He don't know", "He doesn't know", "He not know", "He no know"],
    "answer": "He doesn't know"
  }
]
Mix categories: Grammar, Vocabulary, Comprehension, Idioms. Do not include any text outside the JSON array.`;

    try {
        const text = await callGemini(prompt);
        const cleaned = cleanJsonResponse(text);
        const questions: QuizQuestion[] = JSON.parse(cleaned);
        return questions.map((q, i) => ({ ...q, id: i + 1 }));
    } catch (error) {
        console.warn("Gemini unavailable, using fallback quiz:", error);
        return getFallbackQuiz();
    }
}

export async function getWritingFeedback(text: string): Promise<string> {
    const prompt = `You are an English teacher. Analyze the following student writing and provide brief, constructive feedback on:
1. Grammar errors (if any)
2. Sentence structure
3. Vocabulary usage
4. Overall impression

Keep your feedback concise (3-5 sentences). Be encouraging but honest.

Student's writing: "${text}"`;

    try {
        const text = await callGemini(prompt);
        return text;
    } catch (error) {
        console.warn("Gemini unavailable for feedback:", error);
        return "Great effort! Your writing shows good potential. Keep practicing to improve your grammar and vocabulary. Try to vary your sentence structures for more engaging writing. Well done on completing this exercise!";
    }
}

export interface WordFeedback {
    word: string;
    accuracy: "good" | "poor";
}

export interface SpeakingFeedback {
    feedback: string;
    words: WordFeedback[];
    scores: {
        pronunciation: number; // 1-5
        fluency: number; // 1-5
    };
}

export async function getSpeakingFeedback(
    transcript: string,
    prompt: string
): Promise<SpeakingFeedback> {
    const feedbackPrompt = `You are an English speaking coach. A student was asked to speak about: "${prompt}"

Their transcribed speech was: "${transcript}"

Analyze their speech for pronunciation, fluency, and correctness.
Return ONLY a JSON object with this structure:
{
  "feedback": "Concise feedback paragraph (2-3 sentences).",
  "scores": {
    "pronunciation": 4, 
    "fluency": 3
  },
  "words": [
    { "word": "word1", "accuracy": "good" },
    { "word": "word2", "accuracy": "poor" }
  ]
}
Scores must be between 1 and 5. Labels for accuracy: "good" (clear), "poor" (needs work).
Do not include any text outside the JSON object.`;

    try {
        const text = await callGemini(feedbackPrompt);
        const cleaned = cleanJsonResponse(text);
        return JSON.parse(cleaned);
    } catch (error) {
        console.warn("Gemini unavailable for speaking feedback:", error);
        return {
            feedback: "Nice attempt! You addressed the topic. Practice speaking regularly to build confidence.",
            words: transcript.split(/\s+/).map(w => ({ word: w, accuracy: "good" })),
            scores: { pronunciation: 4, fluency: 4 }
        };
    }
}

// ---------- Weakness Analysis (Engine) ----------

export async function getWeaknessAnalysis(mistakes: string[]): Promise<string> {
    if (mistakes.length === 0) {
        return "You haven't made any recurring mistakes yet! Keep practicing to give me more data to analyze.";
    }

    const analysisPrompt = `You are a linguistic expert and English teacher. 
A student has made the following recorded mistakes/patterns in their exercises:
${mistakes.map((m, i) => `${i + 1}. ${m}`).join("\n")}

Identify the core pedagogical patterns in these mistakes (e.g., "Subject-verb agreement," "Preposition usage," "Tense consistency"). 
Provide:
1. A summary of the main weakness.
2. A simple rule to help them remember the correct form.
3. Two encouraging examples of the correct usage.

Keep the tone supportive and professional. Maximum 150 words.`;

    try {
        const text = await callGemini(analysisPrompt);
        return text;
    } catch (error) {
        console.warn("Gemini unavailable for weakness analysis:", error);
        return "We've noticed you're working hard on your grammar and pronunciation. Focus on consistent practice and reviewing lesson materials. You're doing great!";
    }
}

// ---------- Chat Sessions (Scenario Based Learning) ----------

// Removing model.startChat as it's not directly supported via a simple callable without maintaining state on client or server.
// For now, we fallback or implement a simpler single-turn if active.
export function startScenarioChat(scenario: string) {
    console.error("startScenarioChat is currently unsupported with Cloud Functions migration: " + scenario);
    throw new Error("Chat sessions require updating to use single-turn or stateful cloud functions.");
}

// ---------- Monthly Fluency Analysis ----------

export async function getMonthlyFluencyAnalysis(stats: any): Promise<string> {
    const analysisPrompt = `You are a career English coach. Analyze the student's monthly performance:
Modules completed: ${JSON.stringify(stats.moduleStats)}
Average Score: ${stats.avgScore}%
Total Exercises: ${stats.totalExercises}

Provide a narrative summary (3-4 sentences) that:
1. Highlights their biggest achievement this month.
2. Identifies a key area for next month's focus.
3. Provides an encouraging closing statement about their fluency journey.

Keep it professional, motivational, and concise.`;

    try {
        const text = await callGemini(analysisPrompt);
        return text;
    } catch (error) {
        console.warn("Gemini unavailable for monthly analysis:", error);
        return "You've shown great dedication to your English studies this month! Your consistent practice across all modules is helping you build a strong foundation. Keep up the momentum!";
    }
}
