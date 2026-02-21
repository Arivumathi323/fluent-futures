import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type Status = "school" | "college" | "work";
type Level = "beginner" | "intermediate" | "pro";

const Signup = () => {
  const navigate = useNavigate();
  const { signup, loginWithGoogle, loginWithGithub } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [status, setStatus] = useState<Status>("school");
  const [institution, setInstitution] = useState("");

  // Step 2
  const [level, setLevel] = useState<Level>("beginner");

  const statusLabel: Record<Status, string> = {
    school: "School Name",
    college: "College Name",
    work: "Company Name",
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    setLoading(true);
    try {
      if (provider === "google") {
        await loginWithGoogle();
      } else {
        await loginWithGithub();
      }
      toast({ title: "Welcome!", description: "Account created successfully." });
      navigate("/dashboard");
    } catch (error: any) {
      toast({ title: "Error", description: error.message || `Could not sign in with ${provider}.`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!name || !email || !password) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await signup(email, password, {
        name,
        age: parseInt(age) || 0,
        status,
        institution,
        level,
      });
      toast({ title: "Welcome!", description: "Your account has been created successfully." });
      navigate("/dashboard");
    } catch (error: any) {
      let message = "Signup failed. Please try again.";
      if (error.code === "auth/email-already-in-use") message = "An account with this email already exists.";
      else if (error.code === "auth/weak-password") message = "Password is too weak.";
      else if (error.code === "auth/invalid-email") message = "Invalid email address.";
      toast({ title: "Signup Failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-card rounded-2xl border border-border p-8 shadow-lg">
        {step === 1 ? (
          <>
            <h1 className="text-2xl font-bold font-display mb-1">Tell us about yourself</h1>
            <p className="text-muted-foreground text-sm mb-6">Help us personalize your learning experience</p>

            {/* Social Signup Buttons */}
            <div className="flex gap-3 mb-5">
              <button onClick={() => handleSocialLogin("google")} disabled={loading} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/60 transition-colors text-sm font-medium disabled:opacity-50">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                Google
              </button>
              <button onClick={() => handleSocialLogin("github")} disabled={loading} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/60 transition-colors text-sm font-medium disabled:opacity-50">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>
                GitHub
              </button>
            </div>

            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
              <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or sign up with email</span></div>
            </div>

            <div className="space-y-5">
              <div>
                <Label className="text-sm font-medium">Your Name</Label>
                <Input placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 bg-secondary/50" />
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <Input placeholder="your@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 bg-secondary/50" />
              </div>
              <div>
                <Label className="text-sm font-medium">Password</Label>
                <Input placeholder="At least 6 characters" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 bg-secondary/50" />
              </div>
              <div>
                <Label className="text-sm font-medium">Age</Label>
                <Input placeholder="Enter your age" type="number" value={age} onChange={(e) => setAge(e.target.value)} className="mt-1.5 bg-secondary/50" />
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">I am currently at</Label>
                <RadioGroup value={status} onValueChange={(v) => setStatus(v as Status)} className="space-y-2">
                  {(["school", "college", "work"] as const).map((s) => (
                    <div key={s} className="flex items-center gap-3">
                      <RadioGroupItem value={s} id={s} />
                      <Label htmlFor={s} className="capitalize cursor-pointer">{s === "work" ? "Work" : s.charAt(0).toUpperCase() + s.slice(1)}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="text-sm font-medium">{statusLabel[status]}</Label>
                <Input placeholder={`Enter your ${statusLabel[status].toLowerCase()}`} value={institution} onChange={(e) => setInstitution(e.target.value)} className="mt-1.5 bg-secondary/50" />
              </div>

              <button onClick={() => setStep(2)} className="w-full py-3 rounded-lg font-semibold gradient-button text-sm">
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold font-display mb-1">Your English Level</h1>
            <p className="text-muted-foreground text-sm mb-8">This helps us customize your lessons</p>

            <div className="space-y-5">
              <Label className="text-sm font-medium block">Select your English level</Label>
              <RadioGroup value={level} onValueChange={(v) => setLevel(v as Level)} className="space-y-3">
                {[
                  { value: "beginner", label: "Beginner", desc: "I'm just starting to learn English" },
                  { value: "intermediate", label: "Intermediate", desc: "I can communicate but want to improve" },
                  { value: "pro", label: "Pro", desc: "I'm fluent and want to master English" },
                ].map((l) => (
                  <label
                    key={l.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${level === l.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      }`}
                  >
                    <RadioGroupItem value={l.value} id={l.value} />
                    <div>
                      <span className="font-semibold text-sm">{l.label}</span>
                      <span className="text-muted-foreground text-sm ml-2">{l.desc}</span>
                    </div>
                  </label>
                ))}
              </RadioGroup>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={() => setStep(1)} className="py-3 rounded-lg font-semibold border border-border text-sm hover:bg-secondary transition-colors">
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="py-3 rounded-lg font-semibold gradient-button text-sm disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Complete"}
                </button>
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Signup;
