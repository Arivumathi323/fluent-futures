const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || "";
const BASE_URL = "https://api.elevenlabs.io/v1";

// Default voice - Rachel (clear, neutral English)
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

export async function textToSpeech(
    text: string,
    voiceId: string = DEFAULT_VOICE_ID
): Promise<Blob> {
    const response = await fetch(`${BASE_URL}/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0.0,
                use_speaker_boost: true,
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("ElevenLabs error:", errorText);
        throw new Error("Failed to generate speech. Please check your API key.");
    }

    return response.blob();
}

export function playAudioBlob(blob: Blob): HTMLAudioElement {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
    audio.onended = () => URL.revokeObjectURL(url);
    return audio;
}

export interface Voice {
    voice_id: string;
    name: string;
    category: string;
}

export async function getVoices(): Promise<Voice[]> {
    const response = await fetch(`${BASE_URL}/voices`, {
        headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch voices");
    }

    const data = await response.json();
    return data.voices;
}
