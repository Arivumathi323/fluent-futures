import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "./firebase";

const functions = getFunctions(auth.app);
const generateElevenLabsSpeechCallable = httpsCallable(functions, "generateElevenLabsSpeech");

const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

export async function textToSpeech(
    text: string,
    voiceId: string = DEFAULT_VOICE_ID
): Promise<Blob> {
    try {
        const result = await generateElevenLabsSpeechCallable({ text, voiceId });
        const data = result.data as { audioBase64: string };
        const binaryString = atob(data.audioBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return new Blob([bytes], { type: "audio/mpeg" });
    } catch (error) {
        console.error("Error generating speech from Cloud Function:", error);
        throw new Error("Failed to generate speech via Cloud Function.");
    }
}

export function playAudioBlob(blob: Blob): HTMLAudioElement {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
    audio.onended = () => URL.revokeObjectURL(url);
    return audio;
}
