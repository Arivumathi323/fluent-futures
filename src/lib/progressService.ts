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
    totalQuestions: number
) {
    const exerciseRef = collection(db, "users", userId, "exercises");
    await addDoc(exerciseRef, {
        module,
        score,
        totalQuestions,
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

export async function getUserExerciseStats(userId: string) {
    const exercises = await getUserProgress(userId);
    const totalExercises = exercises.length;
    const totalScore = exercises.reduce((sum: number, e: any) => sum + (e.score || 0), 0);
    const totalQuestions = exercises.reduce((sum: number, e: any) => sum + (e.totalQuestions || 0), 0);
    const avgScore = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

    const moduleBreakdown: Record<string, number> = {};
    exercises.forEach((e: any) => {
        moduleBreakdown[e.module] = (moduleBreakdown[e.module] || 0) + 1;
    });

    return { totalExercises, avgScore, moduleBreakdown };
}
