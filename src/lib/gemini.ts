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

export async function getSpeakingFeedback(
    transcript: string,
    prompt: string
): Promise<string> {
    const feedbackPrompt = `You are an English speaking coach. A student was asked to speak about: "${prompt}"

Their transcribed speech was: "${transcript}"

Provide brief, constructive feedback on:
1. Relevance to the prompt
2. Grammar and sentence structure
3. Vocabulary range
4. Suggestions for improvement

Keep feedback concise (3-5 sentences). Be encouraging.`;

    try {
        const result = await model.generateContent(feedbackPrompt);
        return result.response.text();
    } catch (error) {
        console.warn("Gemini unavailable for speaking feedback:", error);
        return "Nice attempt! You addressed the topic and communicated your ideas. To improve, try using more varied vocabulary and longer sentences. Practice speaking regularly to build confidence and fluency. Keep up the great work!";
    }
}
