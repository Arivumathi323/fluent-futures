import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublicProfile, getUserExerciseStats } from "@/lib/progressService";
import Barcode from "react-barcode";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { Trophy, Award, BookOpen, MapPin, Calendar, Mail } from "lucide-react";
import { Loader2 } from "lucide-react";

const PublicIDCard = () => {
    const { uid } = useParams();
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (uid) {
            Promise.all([
                getPublicProfile(uid),
                getUserExerciseStats(uid)
            ]).then(([p, s]) => {
                setProfile(p);
                setStats(s);
            }).finally(() => setLoading(false));
        }
    }, [uid]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-2xl font-bold text-destructive mb-2">Invalid Student ID</h1>
                <p className="text-muted-foreground mb-6">The ID card you are looking for does not exist or has been removed.</p>
                <Link to="/" className="text-primary font-bold hover:underline">Return to Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                {/* ID Card Container */}
                <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-2xl relative">
                    <div className="absolute top-0 left-0 w-full h-24 bg-primary/10 -z-10" />
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full -z-10" />

                    {/* Header */}
                    <div className="p-8 pb-0 flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl gradient-button flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold font-display text-primary leading-none">EngliLearn</h1>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Student Portal</p>
                            </div>
                        </div>
                        <div className="bg-primary/5 text-primary text-[10px] font-bold px-3 py-1 rounded-full border border-primary/20">
                            VALID 2024-2025
                        </div>
                    </div>

                    <div className="p-8 flex flex-col items-center">
                        {/* Profile Photo */}
                        <div className="w-40 h-40 rounded-[2.5rem] bg-muted border-4 border-white shadow-xl overflow-hidden mb-6 mt-4 rotate-3 hover:rotate-0 transition-transform duration-500">
                            {profile.photoURL ? (
                                <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-5xl font-bold bg-primary/5 text-primary/40">
                                    {profile.name?.charAt(0)}
                                </div>
                            )}
                        </div>

                        {/* Name & Details */}
                        <div className="text-center">
                            <h2 className="text-2xl font-extrabold font-display leading-tight">{profile.name}</h2>
                            <p className="text-primary font-bold uppercase tracking-widest text-sm mt-1">{profile.level} Learner</p>

                            <div className="flex items-center justify-center gap-4 mt-6">
                                <div className="text-center">
                                    <p className="text-xl font-black">{profile.xp || 0}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Total XP</p>
                                </div>
                                <div className="w-px h-8 bg-border" />
                                <div className="text-center">
                                    <p className="text-xl font-black">{stats?.totalExercises || 0}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Exercises</p>
                                </div>
                                <div className="w-px h-8 bg-border" />
                                <div className="text-center">
                                    <p className="text-xl font-black">{stats?.avgScore || 0}%</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Accuracy</p>
                                </div>
                            </div>
                        </div>

                        {/* Info Rows */}
                        <div className="w-full mt-8 space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                    <Award className="w-4 h-4 text-primary/70" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Institution</p>
                                    <p className="font-semibold">{profile.institution || "EngliLearn Academy"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                    <MapPin className="w-4 h-4 text-primary/70" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Location</p>
                                    <p className="font-semibold">Integrated Learning Hub</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Barcode */}
                        <div className="w-full mt-10 pt-6 border-t border-dashed border-border flex flex-col items-center">
                            <div className="scale-[0.8] mb-2 grayscale opacity-80">
                                <Barcode
                                    value={profile.uid}
                                    height={50}
                                    width={1.0}
                                    fontSize={12}
                                    background="transparent"
                                />
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Verified Digital Certificate</p>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-center text-muted-foreground text-xs mt-8">
                    Scan the barcode or search for student ID <strong>#{profile.uid.slice(-6).toUpperCase()}</strong> to verify authenticity.
                </p>
            </motion.div>
        </div>
    );
};

export default PublicIDCard;
