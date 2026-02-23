import { GoogleGenerativeAI } from "@google/generative-ai";
import { getFallbackGrammar, getFallbackPassage, getFallbackWriting, getFallbackQuiz } from "./fallbackData";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

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
        const result = await model.generateContent(prompt);
        const text = result.response.text();
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
        const result = await model.generateContent(prompt);
        const text = result.response.text();
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
        const result = await model.generateContent(prompt);
        const text = result.response.text();
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
        const result = await model.generateContent(prompt);
        const text = result.response.text();
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
        const result = await model.generateContent(prompt);
        return result.response.text();
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
}

export async function getSpeakingFeedback(
    transcript: string,
    prompt: string
): Promise<SpeakingFeedback> {
    const feedbackPrompt = `You are an English speaking coach. A student was asked to speak about: "${prompt}"

Their transcribed speech was: "${transcript}"

Analyze their pronunciation word by word.
Return ONLY a JSON object with this structure:
{
  "feedback": "Concise feedback paragraph (3-5 sentences) focusing on grammar, relevance and tips.",
  "words": [
    { "word": "word1", "accuracy": "good" },
    { "word": "word2", "accuracy": "poor" }
  ]
}
Labels for accuracy: "good" (clear pronunciation), "poor" (needs improvement). 
Do not include any text outside the JSON object.`;

    try {
        const result = await model.generateContent(feedbackPrompt);
        const text = result.response.text();
        const cleaned = cleanJsonResponse(text);
        return JSON.parse(cleaned);
    } catch (error) {
        console.warn("Gemini unavailable for speaking feedback:", error);
        return {
            feedback: "Nice attempt! You addressed the topic. Practice speaking regularly to build confidence.",
            words: transcript.split(/\s+/).map(w => ({ word: w, accuracy: "good" }))
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
        const result = await model.generateContent(analysisPrompt);
        return result.response.text();
    } catch (error) {
        console.warn("Gemini unavailable for weakness analysis:", error);
        return "We've noticed you're working hard on your grammar and pronunciation. Focus on consistent practice and reviewing lesson materials. You're doing great!";
    }
}

// ---------- Chat Sessions (Scenario Based Learning) ----------

export function startScenarioChat(scenario: string) {
    const systemPrompt = `You are an English teacher and interlocutor. We are practicing a real-life scenario: "${scenario}".
Your goal is to sustain a realistic conversation. 
1. Keep your responses concise (1-3 sentences) to encourage the student to speak more.
2. If the student makes a glaring grammar mistake, gently point it out at the end of your response, but keep the conversation flow.
3. Use natural, conversational English appropriate for a ${scenario} setting.
4. Start the conversation yourself based on the scenario.`;

    return model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: systemPrompt }],
            },
            {
                role: "model",
                parts: [{ text: "Understood. I am ready to start the simulation. How should we begin?" }],
            },
        ],
    });
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
        const result = await model.generateContent(analysisPrompt);
        return result.response.text();
    } catch (error) {
        console.warn("Gemini unavailable for monthly analysis:", error);
        return "You've shown great dedication to your English studies this month! Your consistent practice across all modules is helping you build a strong foundation. Keep up the momentum!";
    }
}
