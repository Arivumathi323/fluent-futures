import {
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    collection,
    query,
    orderBy,
    limit,
    increment,
    serverTimestamp,
    Timestamp,
    where,
    addDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

// ---------- User Progress ----------

export async function saveExerciseResult(
    userId: string,
    module: string,
    score: number,
    totalQuestions: number,
    mistakes: string[] = []
) {
    const exerciseRef = collection(db, "users", userId, "exercises");
    await addDoc(exerciseRef, {
        module,
        score,
        totalQuestions,
        mistakes,
        completedAt: serverTimestamp(),
    });

    // Award XP based on score
    const xpEarned = Math.round((score / totalQuestions) * 20);
    await updateXP(userId, xpEarned);
    await updateStreak(userId);
}

export async function getUserProgress(userId: string) {
    const exercisesRef = collection(db, "users", userId, "exercises");
    const q = query(exercisesRef, orderBy("completedAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateXP(userId: string, points: number) {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        xp: increment(points),
        lastActiveDate: serverTimestamp(),
    });
}

export async function addManualXP(userId: string, points: number) {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        xp: increment(points)
    });
}

export async function updateStreak(userId: string) {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const data = userSnap.data();
    const lastActive = data.lastActiveDate?.toDate();
    const now = new Date();

    if (lastActive) {
        const lastDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const diffDays = Math.floor((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            // Consecutive day
            await updateDoc(userRef, { streak: increment(1), lastActiveDate: serverTimestamp() });
        } else if (diffDays > 1) {
            // Streak broken
            await updateDoc(userRef, { streak: 1, lastActiveDate: serverTimestamp() });
        }
        // Same day, no change
    } else {
        await updateDoc(userRef, { streak: 1, lastActiveDate: serverTimestamp() });
    }
}

// ---------- Badges ----------

export async function getAllBadges() {
    const q = query(collection(db, "badges"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createBadge(name: string, icon: string, description: string) {
    await addDoc(collection(db, "badges"), {
        name,
        icon,
        description,
        createdAt: serverTimestamp(),
    });
}

export async function awardBadge(userId: string, badgeName: string) {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const badges = userSnap.data().badges || [];
    if (!badges.includes(badgeName)) {
        badges.push(badgeName);
        await updateDoc(userRef, { badges });
    }
}

export async function removeBadge(userId: string, badgeName: string) {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const badges = (userSnap.data().badges || []).filter((b: string) => b !== badgeName);
    await updateDoc(userRef, { badges });
}

// ---------- Leaderboard ----------

export async function getLeaderboard(topN: number = 20) {
    const q = query(collection(db, "users"), orderBy("xp", "desc"), limit(topN));
    const snap = await getDocs(q);
    return snap.docs.map((d, i) => ({
        uid: d.id,
        rank: i + 1,
        name: d.data().name || "Unknown",
        xp: d.data().xp || 0,
        level: d.data().level || "beginner",
        badges: d.data().badges || [],
    }));
}

// ---------- Resources ----------

export async function getResources() {
    const q = query(collection(db, "resources"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addResource(data: {
    title: string;
    description: string;
    url: string;
    category: string;
    level: string;
    createdBy: string;
}) {
    await addDoc(collection(db, "resources"), {
        ...data,
        createdAt: serverTimestamp(),
    });
}

export async function deleteResource(resourceId: string) {
    await deleteDoc(doc(db, "resources", resourceId));
}

export async function uploadFile(file: File, path: string): Promise<string> {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
}

// ---------- Admin: User Management ----------

export async function getAllUsers() {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
        uid: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate(),
        lastActiveDate: d.data().lastActiveDate?.toDate(),
    }));
}

export async function deleteUser(userId: string) {
    // Delete user exercises subcollection
    const exercisesRef = collection(db, "users", userId, "exercises");
    const exercisesSnap = await getDocs(exercisesRef);
    for (const doc_ of exercisesSnap.docs) {
        await deleteDoc(doc_.ref);
    }
    // Delete user document
    await deleteDoc(doc(db, "users", userId));
}

export async function updateUserProfile(
    userId: string,
    data: Record<string, any>
) {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, data);
}

export async function updateProfilePhoto(userId: string, file: File) {
    const fileName = `profile_photos/${userId}_${Date.now()}`;
    const photoURL = await uploadFile(file, fileName);
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { photoURL });
    return photoURL;
}

export async function getAggregateAnalytics() {
    const students = (await getAllUsers()).filter((u: any) => !u.isAdmin);
    const moduleStats: Record<string, { total: number; success: number }> = {};
    let totalScore = 0;
    let totalQuestions = 0;
    let totalExercises = 0;

    for (const student of students) {
        const exercisesRef = collection(db, "users", student.uid, "exercises");
        const snap = await getDocs(exercisesRef);

        snap.forEach(d => {
            const data = d.data();
            const module = data.module || "unknown";
            const score = data.score || 0;
            const total = data.totalQuestions || 0;

            if (!moduleStats[module]) moduleStats[module] = { total: 0, success: 0 };
            moduleStats[module].total++;
            if (total > 0 && (score / total) >= 0.7) {
                moduleStats[module].success++;
            }

            totalScore += score;
            totalQuestions += total;
            totalExercises++;
        });
    }

    const avgScore = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

    return {
        totalStudents: students.length,
        totalExercises,
        avgScore,
        moduleStats: Object.entries(moduleStats).map(([name, stats]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            total: stats.total,
            success: stats.success,
            failure: stats.total - stats.success,
            successRate: stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0
        }))
    };
}


export async function getUserExerciseStats(userId: string) {
    const exercises = await getUserProgress(userId);
    const moduleStats: Record<string, { total: number; success: number }> = {};
    let totalScore = 0;
    let totalQuestions = 0;
    const totalExercises = exercises.length;

    exercises.forEach((e: any) => {
        const mod = e.module || "unknown";
        const score = e.score || 0;
        const total = e.totalQuestions || 0;

        if (!moduleStats[mod]) moduleStats[mod] = { total: 0, success: 0 };
        moduleStats[mod].total++;
        if (total > 0 && (score / total) >= 0.7) {
            moduleStats[mod].success++;
        }

        totalScore += score;
        totalQuestions += total;
    });

    const avgScore = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

    return {
        totalExercises,
        avgScore,
        moduleBreakdown: moduleStats, // Keep for backward compatibility if needed
        moduleStats: Object.entries(moduleStats).map(([name, stats]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            total: stats.total,
            success: stats.success,
            failure: stats.total - stats.success,
            successRate: stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0
        }))
    };
}

export async function getPublicProfile(userId: string) {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            uid: userId,
            name: data.name || "Unknown",
            level: data.level || "beginner",
            photoURL: data.photoURL || "",
            xp: data.xp || 0,
            streak: data.streak || 0,
            badges: data.badges || [],
            institution: data.institution || "EngliLearn Academy"
        };
    }
    return null;
}

// ---------- Media Sessions (Audio/Video Practice) ----------

export interface MediaQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
}

export interface MediaSessionData {
    title: string;
    description: string;
    type: "audio" | "video";
    mediaUrl: string;
    level: string;
    questions: MediaQuestion[];
    createdBy: string;
}

export async function addMediaSession(data: MediaSessionData) {
    await addDoc(collection(db, "mediaSessions"), {
        ...data,
        createdAt: serverTimestamp(),
    });
}

export async function getMediaSessions() {
    const q = query(collection(db, "mediaSessions"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getMediaSessionsByType(type: "audio" | "video") {
    const q = query(
        collection(db, "mediaSessions"),
        where("type", "==", type),
        orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteMediaSession(sessionId: string) {
    await deleteDoc(doc(db, "mediaSessions", sessionId));
}

// ---------- Certification System ----------

export const CERT_PASS_MARK = 70;

export interface ModuleScores {
    grammar: number;
    reading: number;
    writing: number;
    speaking: number;
    quiz: number;
    overall: number;
    totalExercises: number;
}

export async function getModuleScores(userId: string): Promise<ModuleScores> {
    const exercises = await getUserProgress(userId);
    const modules: Record<string, { score: number; total: number }> = {};

    exercises.forEach((e: any) => {
        const mod = (e.module || "").toLowerCase().replace("media-", "");
        if (!modules[mod]) modules[mod] = { score: 0, total: 0 };
        modules[mod].score += (e.score || 0);
        modules[mod].total += (e.totalQuestions || 0);
    });

    const pct = (key: string) => {
        const m = modules[key];
        return m && m.total > 0 ? Math.round((m.score / m.total) * 100) : 0;
    };

    const keys = ["grammar", "reading", "writing", "speaking", "quiz"];
    const scores = keys.map(pct);
    const attempted = scores.filter((s) => s > 0);
    const overall = attempted.length > 0 ? Math.round(attempted.reduce((a, b) => a + b, 0) / attempted.length) : 0;

    return {
        grammar: pct("grammar"),
        reading: pct("reading"),
        writing: pct("writing"),
        speaking: pct("speaking"),
        quiz: pct("quiz"),
        overall,
        totalExercises: exercises.length,
    };
}

export async function issueCertificate(
    studentId: string,
    studentName: string,
    studentEmail: string,
    level: string,
    pdfFile: File,
    adminId: string
) {
    // Upload PDF to Firebase Storage
    const fileName = `certificates/${studentId}_${Date.now()}.pdf`;
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, pdfFile);
    const pdfUrl = await getDownloadURL(storageRef);

    // Save record in Firestore
    await addDoc(collection(db, "certifications"), {
        studentId,
        studentName,
        studentEmail,
        level,
        pdfUrl,
        issuedBy: adminId,
        issuedAt: serverTimestamp(),
    });
}

export async function getStudentCertification(userId: string) {
    const q = query(
        collection(db, "certifications"),
        where("studentId", "==", userId),
        orderBy("issuedAt", "desc"),
        limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as any;
}

export async function getStudentCertifications(userId: string) {
    const q = query(
        collection(db, "certifications"),
        where("studentId", "==", userId),
        orderBy("issuedAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getCertificationRequests() {
    const q = query(collection(db, "certifications"), orderBy("issuedAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteCertificate(certId: string) {
    await deleteDoc(doc(db, "certifications", certId));
}

// ---------- Telegram Integration ----------

export async function generateTelegramLinkCode(userId: string): Promise<string> {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    await updateDoc(doc(db, "users", userId), {
        telegramLinkCode: code,
    });
    return code;
}

export async function disconnectTelegram(userId: string) {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        telegramChatId: null,
        telegramLinkCode: null,
    });
}
