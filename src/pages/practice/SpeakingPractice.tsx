import { useState, useRef, useCallback } from "react";
import { ArrowLeft, Mic, MicOff, Volume2, Sparkles, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getSpeakingFeedback } from "@/lib/gemini";
import { textToSpeech, playAudioBlob } from "@/lib/elevenlabs";
import { saveExerciseResult } from "@/lib/progressService";

const prompts = [
  { id: 1, text: "Describe your daily routine in 3-4 sentences.", example: "I wake up at 7 AM every day. After breakfast, I go to school. In the evening, I study and play with my friends." },
  { id: 2, text: "Tell me about your favorite food.", example: "My favorite food is pasta. I love it because it is delicious and easy to cook." },
  { id: 3, text: "What did you do last weekend?", example: "Last weekend, I went to the park with my family. We had a picnic and played games." },
  { id: 4, text: "Describe the weather today.", example: "Today the weather is sunny and warm. There are a few clouds in the sky." },
  { id: 5, text: "What is your favorite hobby and why?", example: "My favorite hobby is reading. I enjoy it because it helps me learn new things and relax." },
];

const SpeakingPractice = () => {
  const { user } = useAuth();
  const [promptIdx, setPromptIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [error, setError] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const recognitionRef = useRef<any>(null);

  const prompt = prompts[promptIdx];

  const listenToPrompt = async () => {
    setTtsLoading(true);
    try {
      const blob = await textToSpeech(prompt.text);
      playAudioBlob(blob);
    } catch (err: any) {
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(prompt.text);
      utterance.lang = "en-US";
      speechSynthesis.speak(utterance);
    } finally {
      setTtsLoading(false);
    }
  };

  const startRecording = useCallback(() => {
    setError("");
    setTranscript("");
    setShowFeedback(false);
    setAiFeedback("");

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let result = "";
      for (let i = 0; i < event.results.length; i++) {
        result += event.results[i][0].transcript;
      }
      setTranscript(result);
    };

    recognition.onerror = (event: any) => {
      setError(`Error: ${event.error}`);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setShowFeedback(true);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    if (transcript) {
      setShowFeedback(true);
      // Get AI feedback
      setFeedbackLoading(true);
      getSpeakingFeedback(transcript, prompt.text)
        .then((fb) => setAiFeedback(fb))
        .catch(() => setAiFeedback("AI feedback unavailable."))
        .finally(() => setFeedbackLoading(false));
      // Save result
      if (user) {
        saveExerciseResult(user.uid, "speaking", 1, 1).catch(console.error);
      }
    }
  }, [transcript, prompt.text, user]);

  const nextPrompt = () => {
    setPromptIdx((i) => (i + 1) % prompts.length);
    setTranscript("");
    setShowFeedback(false);
    setError("");
    setAiFeedback("");
  };

  return (
    <AppLayout title="Speaking Practice">
      <div className="px-5 py-6 max-w-2xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6 hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-feature-pink" />
                <CardTitle className="text-base font-display">Prompt {promptIdx + 1}</CardTitle>
              </div>
              <Button
                onClick={listenToPrompt}
                variant="outline"
                size="sm"
                disabled={ttsLoading}
                className="text-xs"
              >
                {ttsLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Volume2 className="w-3 h-3 mr-1" />}
                Listen
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium mb-3">{prompt.text}</p>
            <p className="text-xs text-muted-foreground"><strong>Example:</strong> {prompt.example}</p>
          </CardContent>
        </Card>

        <div className="flex flex-col items-center my-8">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isRecording
                ? "bg-destructive text-destructive-foreground animate-pulse shadow-lg"
                : "gradient-button shadow-md"
              }`}
          >
            {isRecording ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
          </button>
          <p className="text-sm text-muted-foreground mt-3">
            {isRecording ? "Listening... Tap to stop" : "Tap to start speaking"}
          </p>
        </div>

        {error && (
          <div className="rounded-xl p-4 bg-destructive/10 border border-destructive/30 mb-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {transcript && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-sm font-display">Your Speech</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{transcript}</p>
              <p className="text-xs text-muted-foreground mt-2">Words spoken: {transcript.split(/\s+/).length}</p>
            </CardContent>
          </Card>
        )}

        {showFeedback && transcript && (
          <Card className="mb-4 border-accent/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-accent" />
                <span className="font-semibold text-sm font-display">AI Feedback</span>
              </div>
              {feedbackLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Analyzing your speech...</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{aiFeedback}</p>
              )}
            </CardContent>
          </Card>
        )}

        {showFeedback && !feedbackLoading && (
          <Button onClick={nextPrompt} className="gradient-button w-full">Next Prompt</Button>
        )}
      </div>
    </AppLayout>
  );
};

export default SpeakingPractice;
