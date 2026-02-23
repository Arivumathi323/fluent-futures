import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    User,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider, githubProvider } from "@/lib/firebase";

const ADMIN_EMAIL = "arivumathi2612@gmail.com";

export interface UserProfile {
    uid: string;
    email: string;
    name: string;
    age: number;
    status: "school" | "college" | "work";
    institution: string;
    level: "beginner" | "intermediate" | "pro";
    isAdmin: boolean;
    xp: number;
    streak: number;
    badges: string[];
    photoURL?: string;
    lastActiveDate: Date | null;
    createdAt: Date | null;
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, profileData: Partial<UserProfile>) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    loginWithGithub: () => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const loginInProgress = useRef(false);

    const fetchProfile = async (uid: string, email?: string): Promise<UserProfile | null> => {
        try {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                let isAdmin = data.isAdmin || false;

                // Auto-upgrade admin if email matches
                const userEmail = email || data.email || "";
                if (userEmail.toLowerCase() === ADMIN_EMAIL && !isAdmin) {
                    await updateDoc(docRef, { isAdmin: true });
                    isAdmin = true;
                }

                // Heal missing fields for older users
                if (data.xp === undefined || data.streak === undefined) {
                    await updateDoc(docRef, {
                        xp: data.xp ?? 0,
                        streak: data.streak ?? 0,
                        badges: data.badges ?? [],
                    });
                }

                return {
                    uid,
                    email: data.email || "",
                    name: data.name || "",
                    age: data.age || 0,
                    status: data.status || "school",
                    institution: data.institution || "",
                    level: data.level || "beginner",
                    isAdmin,
                    xp: data.xp || 0,
                    streak: data.streak || 0,
                    badges: data.badges || [],
                    photoURL: data.photoURL || "",
                    lastActiveDate: data.lastActiveDate?.toDate() || null,
                    createdAt: data.createdAt?.toDate() || null,
                };
            }
            return null;
        } catch (error) {
            console.error("Error fetching profile:", error);
            return null;
        }
    };

    const createProfileIfNeeded = async (firebaseUser: User): Promise<UserProfile | null> => {
        const uid = firebaseUser.uid;
        const email = firebaseUser.email || "";
        const existing = await fetchProfile(uid, email);
        if (existing) return existing;

        // Create new profile for social login users
        const userDoc = {
            email,
            name: firebaseUser.displayName || "",
            age: 0,
            status: "school",
            institution: "",
            level: "beginner",
            isAdmin: email.toLowerCase() === ADMIN_EMAIL,
            xp: 0,
            streak: 0,
            badges: [],
            photoURL: "",
            lastActiveDate: serverTimestamp(),
            createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, "users", uid), userDoc);
        return await fetchProfile(uid, email);
    };

    const refreshProfile = async () => {
        if (user) {
            const p = await fetchProfile(user.uid, user.email || undefined);
            setProfile(p);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                if (!loginInProgress.current) {
                    const p = await fetchProfile(firebaseUser.uid, firebaseUser.email || undefined);
                    setProfile(p);
                }
            } else {
                setProfile(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        loginInProgress.current = true;
        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            const p = await fetchProfile(cred.user.uid, email);
            setProfile(p);
        } finally {
            loginInProgress.current = false;
        }
    };

    const signup = async (
        email: string,
        password: string,
        profileData: Partial<UserProfile>
    ) => {
        loginInProgress.current = true;
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            const userDoc = {
                email,
                name: profileData.name || "",
                age: profileData.age || 0,
                status: profileData.status || "school",
                institution: profileData.institution || "",
                level: profileData.level || "beginner",
                isAdmin: email.toLowerCase() === ADMIN_EMAIL,
                xp: 0,
                streak: 0,
                badges: [],
                photoURL: "",
                lastActiveDate: serverTimestamp(),
                createdAt: serverTimestamp(),
            };
            await setDoc(doc(db, "users", cred.user.uid), userDoc);
            const p = await fetchProfile(cred.user.uid, email);
            setProfile(p);
        } finally {
            loginInProgress.current = false;
        }
    };

    const loginWithGoogle = async () => {
        loginInProgress.current = true;
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const p = await createProfileIfNeeded(result.user);
            setProfile(p);
        } finally {
            loginInProgress.current = false;
        }
    };

    const loginWithGithub = async () => {
        loginInProgress.current = true;
        try {
            const result = await signInWithPopup(auth, githubProvider);
            const p = await createProfileIfNeeded(result.user);
            setProfile(p);
        } finally {
            loginInProgress.current = false;
        }
    };

    const logout = async () => {
        await signOut(auth);
        setProfile(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                loading,
                isAdmin: profile?.isAdmin || false,
                login,
                signup,
                loginWithGoogle,
                loginWithGithub,
                logout,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
