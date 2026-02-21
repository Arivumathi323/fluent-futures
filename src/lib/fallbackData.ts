import { GrammarQuestion, ReadingPassage, WritingExercise, QuizQuestion } from "./gemini";

// ===================== GRAMMAR QUESTIONS =====================

const beginnerGrammar: GrammarQuestion[] = [
    { id: 1, type: "mcq", question: "Choose the correct form: She ___ to school every day.", options: ["go", "goes", "going", "gone"], answer: "goes", explanation: "Third person singular (she/he/it) uses 'goes'." },
    { id: 2, type: "mcq", question: "Which sentence is correct?", options: ["I am happy.", "I is happy.", "I are happy.", "I be happy."], answer: "I am happy.", explanation: "'I' always takes 'am' as the verb to be." },
    { id: 3, type: "fill", question: "Fill in the blank: They ___ (play) football yesterday.", answer: "played", explanation: "'Yesterday' indicates past tense, so we use 'played'." },
    { id: 4, type: "mcq", question: "She ___ a book right now.", options: ["reads", "is reading", "read", "has read"], answer: "is reading", explanation: "'Right now' indicates present continuous tense." },
    { id: 5, type: "fill", question: "Fill in the blank: He ___ (not/like) spicy food.", answer: "doesn't like", explanation: "Negative present simple with third person uses 'doesn't like'." },
];

const intermediateGrammar: GrammarQuestion[] = [
    { id: 1, type: "mcq", question: "If I ___ rich, I would travel the world.", options: ["am", "was", "were", "be"], answer: "were", explanation: "In second conditional (hypothetical), we use 'were' for all subjects." },
    { id: 2, type: "mcq", question: "She asked me where I ___.", options: ["live", "lived", "living", "lives"], answer: "lived", explanation: "In reported speech, present simple changes to past simple." },
    { id: 3, type: "fill", question: "Fill in the blank: By the time we arrived, the movie ___ (already/start).", answer: "had already started", explanation: "Past perfect is used for an action completed before another past action." },
    { id: 4, type: "mcq", question: "I wish I ___ harder for the exam.", options: ["study", "studied", "had studied", "studying"], answer: "had studied", explanation: "'Wish + past perfect' expresses regret about a past action." },
    { id: 5, type: "fill", question: "Fill in the blank: This is the book ___ I told you about.", answer: "that", explanation: "'That' or 'which' is used as a relative pronoun for things." },
];

const advancedGrammar: GrammarQuestion[] = [
    { id: 1, type: "mcq", question: "Hardly ___ the door when the phone rang.", options: ["I had opened", "had I opened", "I opened", "did I open"], answer: "had I opened", explanation: "After 'hardly', we use inverted word order with past perfect." },
    { id: 2, type: "fill", question: "Fill in the blank: Not only ___ (he/fail) the test, but he also lost his notes.", answer: "did he fail", explanation: "'Not only' at the start requires auxiliary inversion." },
    { id: 3, type: "mcq", question: "The report ___ by the time the meeting starts.", options: ["will finish", "will be finished", "will have been finished", "is finished"], answer: "will have been finished", explanation: "Future perfect passive for an action completed before a future point." },
    { id: 4, type: "mcq", question: "She spoke ___ everyone could understand.", options: ["so clearly that", "such clearly that", "so clear that", "such clear that"], answer: "so clearly that", explanation: "'So + adverb + that' is the correct structure." },
    { id: 5, type: "fill", question: "Fill in the blank: Had I known about the delay, I ___ (leave) later.", answer: "would have left", explanation: "Third conditional: 'Had + past participle, would have + past participle'." },
];

export function getFallbackGrammar(difficulty: string): GrammarQuestion[] {
    switch (difficulty) {
        case "intermediate": return intermediateGrammar;
        case "advanced": return advancedGrammar;
        default: return beginnerGrammar;
    }
}

// ===================== READING PASSAGES =====================

const fallbackPassages: Record<string, ReadingPassage> = {
    beginner: {
        title: "A Day at the Park",
        text: "Last Saturday, Emma went to the park with her family. The sun was shining, and the birds were singing. She played on the swings and went down the slide. Her brother Tom flew a colorful kite. Their mother sat on a bench and read a book. After playing, they had a picnic under a big tree. They ate sandwiches, fruit, and cookies. Emma said it was the best day ever.",
        vocabulary: [
            { word: "swings", meaning: "seats hanging from chains for playing" },
            { word: "kite", meaning: "a light frame covered with paper, flown in the wind" },
            { word: "picnic", meaning: "a meal eaten outdoors" },
        ],
        questions: [
            { question: "When did Emma go to the park?", options: ["Last Sunday", "Last Saturday", "Last Friday", "Yesterday"], answer: "Last Saturday" },
            { question: "What did Tom do at the park?", options: ["Read a book", "Played on swings", "Flew a kite", "Ate cookies"], answer: "Flew a kite" },
            { question: "Where did they have their picnic?", options: ["On a bench", "Under a big tree", "Near the slide", "At home"], answer: "Under a big tree" },
        ],
    },
    intermediate: {
        title: "The Rise of Electric Vehicles",
        text: "Electric vehicles (EVs) are becoming increasingly popular around the world. Unlike traditional cars that run on gasoline, EVs use electric motors powered by rechargeable batteries. This makes them more environmentally friendly, as they produce zero direct emissions. Many governments are encouraging the switch to EVs by offering tax benefits and building more charging stations. However, challenges remain, including the high cost of batteries and limited driving range compared to gasoline cars. Despite these obstacles, experts predict that EVs will dominate the automotive market within the next two decades.",
        vocabulary: [
            { word: "emissions", meaning: "gases released into the atmosphere" },
            { word: "rechargeable", meaning: "able to be refilled with electrical energy" },
            { word: "dominate", meaning: "to be the most important or powerful" },
        ],
        questions: [
            { question: "What powers electric vehicles?", options: ["Gasoline", "Solar panels", "Rechargeable batteries", "Diesel"], answer: "Rechargeable batteries" },
            { question: "What is a challenge for EVs?", options: ["Too much speed", "High battery cost", "Too many charging stations", "Low popularity"], answer: "High battery cost" },
            { question: "What do experts predict about EVs?", options: ["They will disappear", "They will dominate the market", "They will stay the same", "They will become more expensive"], answer: "They will dominate the market" },
        ],
    },
    advanced: {
        title: "The Ethics of Artificial Intelligence",
        text: "As artificial intelligence systems become more sophisticated, questions about their ethical implications grow more pressing. AI algorithms now make decisions that profoundly affect people's lives — from determining creditworthiness to influencing criminal sentencing. Critics argue that these systems often perpetuate existing biases present in their training data, disproportionately affecting marginalized communities. Furthermore, the opacity of many AI models, often referred to as 'black boxes,' makes it difficult to understand how decisions are reached. Proponents counter that AI, when properly designed, can reduce human bias and improve efficiency. The challenge lies in developing robust governance frameworks that ensure accountability while fostering innovation.",
        vocabulary: [
            { word: "perpetuate", meaning: "to cause something to continue indefinitely" },
            { word: "opacity", meaning: "the quality of being difficult to understand" },
            { word: "governance", meaning: "the system of rules and practices for directing and controlling" },
        ],
        questions: [
            { question: "What does the term 'black boxes' refer to?", options: ["Physical hardware", "Opaque AI decision-making", "Data storage", "Network systems"], answer: "Opaque AI decision-making" },
            { question: "What concern do critics raise about AI?", options: ["It's too slow", "It perpetuates biases", "It's too transparent", "It costs nothing"], answer: "It perpetuates biases" },
            { question: "What do proponents believe about AI?", options: ["It should be banned", "It can reduce bias", "It is always biased", "It replaces governance"], answer: "It can reduce bias" },
        ],
    },
};

export function getFallbackPassage(level: string): ReadingPassage {
    return fallbackPassages[level] || fallbackPassages.beginner;
}

// ===================== WRITING EXERCISES =====================

const fallbackWriting: WritingExercise[] = [
    { id: 1, type: "formation", instruction: "Form a correct sentence: quickly / the / ran / dog / very", hint: "Subject + Verb + Adverb", answer: "The dog ran very quickly." },
    { id: 2, type: "correction", instruction: 'Correct this sentence: "She don\'t like eating vegetables."', answer: "She doesn't like eating vegetables." },
    { id: 3, type: "formation", instruction: "Form a correct sentence: have / never / I / to / been / Paris", hint: "Present perfect structure", answer: "I have never been to Paris." },
    { id: 4, type: "correction", instruction: 'Correct this sentence: "He goed to the store yesterday."', answer: "He went to the store yesterday." },
    { id: 5, type: "prompt", instruction: "Write 3-4 sentences about your favorite hobby. Explain why you enjoy it and how often you do it." },
];

export function getFallbackWriting(): WritingExercise[] {
    return fallbackWriting;
}

// ===================== QUIZ QUESTIONS =====================

const fallbackQuiz: QuizQuestion[] = [
    { id: 1, category: "Grammar", question: "Which sentence uses the present perfect correctly?", options: ["I have went there.", "I have gone there.", "I has gone there.", "I have go there."], answer: "I have gone there." },
    { id: 2, category: "Vocabulary", question: "What does 'eloquent' mean?", options: ["Silent", "Fluent and persuasive", "Angry", "Tired"], answer: "Fluent and persuasive" },
    { id: 3, category: "Grammar", question: "Choose the correct word: 'Neither the cat ___ the dog was outside.'", options: ["or", "and", "nor", "but"], answer: "nor" },
    { id: 4, category: "Idioms", question: "What does 'break the ice' mean?", options: ["Destroy something", "Start a conversation", "Feel cold", "Take a break"], answer: "Start a conversation" },
    { id: 5, category: "Vocabulary", question: "What is the synonym of 'benevolent'?", options: ["Cruel", "Kind", "Lazy", "Brave"], answer: "Kind" },
    { id: 6, category: "Grammar", question: "She ___ to the concert if she had finished her work.", options: ["would go", "would have gone", "will go", "goes"], answer: "would have gone" },
    { id: 7, category: "Comprehension", question: "In the sentence 'Despite the rain, they continued playing,' what does 'despite' indicate?", options: ["Because of", "In contrast to", "After", "During"], answer: "In contrast to" },
    { id: 8, category: "Idioms", question: "What does 'a piece of cake' mean?", options: ["A dessert", "Something very easy", "A celebration", "Something expensive"], answer: "Something very easy" },
];

export function getFallbackQuiz(): QuizQuestion[] {
    return fallbackQuiz;
}
