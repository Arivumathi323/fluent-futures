import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Status = "school" | "college" | "work";
type Level = "beginner" | "intermediate" | "pro";

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1
  const [name, setName] = useState("");
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

  const handleComplete = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-card rounded-2xl border border-border p-8 shadow-lg">
        {step === 1 ? (
          <>
            <h1 className="text-2xl font-bold font-display mb-1">Tell us about yourself</h1>
            <p className="text-muted-foreground text-sm mb-8">Help us personalize your learning experience</p>

            <div className="space-y-5">
              <div>
                <Label className="text-sm font-medium">Your Name</Label>
                <Input placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 bg-secondary/50" />
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
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                      level === l.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
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
                <button onClick={handleComplete} className="py-3 rounded-lg font-semibold gradient-button text-sm">
                  Complete
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
