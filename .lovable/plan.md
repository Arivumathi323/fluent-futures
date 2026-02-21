

## English Learning App - Continuation Plan

The previous implementation created the Landing Page, Login, Signup, Dashboard, Leaderboard, and Profile pages, but the routes aren't wired up and several major features are missing. Here's the plan to complete the application.

---

### Phase 1: Fix Routing (App.tsx)

Wire up all existing pages in `App.tsx`:
- `/login` - Login page
- `/signup` - Signup page
- `/dashboard` - Home Dashboard
- `/leaderboard` - Leaderboard
- `/profile` - Profile/Analytics
- `/practice/reading`, `/practice/writing`, `/practice/speaking`, `/practice/quiz` - Practice modules
- `/grammar` - Grammar Test section

---

### Phase 2: Grammar Test Section

Create `src/pages/GrammarTest.tsx` with:
- Difficulty selector (Beginner / Intermediate / Advanced)
- MCQ questions with 4 options each
- Fill-in-the-blank questions
- Sentence correction exercises
- Instant feedback (correct/incorrect with explanation)
- Score calculation and display at the end
- Static sample question data (API-ready structure)

---

### Phase 3: Practice Modules

Create four practice module pages under `src/pages/practice/`:

**3a. Reading Practice (`ReadingPractice.tsx`)**
- Level-based reading passages
- Comprehension questions after each passage
- Vocabulary highlights
- Score tracking

**3b. Writing Practice (`WritingPractice.tsx`)**
- Sentence formation exercises
- Paragraph writing prompts
- Error correction challenges
- Placeholder for AI grammar feedback

**3c. Speaking Practice (`SpeakingPractice.tsx`)**
- Voice recording UI with microphone button
- Browser Web Speech API for speech recognition
- Display transcribed text
- Placeholder for pronunciation/fluency analysis feedback

**3d. Quiz Challenge (`QuizChallenge.tsx`)**
- Mixed questions from all modules
- Timer for timed challenges
- Score and completion rewards UI

---

### Phase 4: Level System

Create `src/components/LevelGate.tsx`:
- Lock/unlock indicators on practice modules
- Beginner unlocked by default, Intermediate and Advanced locked
- Visual lock icons and progress indicators
- State managed locally (no backend yet)

---

### Phase 5: Dashboard Enhancement

Update `Dashboard.tsx` to:
- Add a "Grammar Test" card linking to `/grammar`
- Show level progress indicators on each module card
- Add lock icons for locked modules

---

### Technical Details

**New files to create:**
- `src/pages/GrammarTest.tsx`
- `src/pages/practice/ReadingPractice.tsx`
- `src/pages/practice/WritingPractice.tsx`
- `src/pages/practice/SpeakingPractice.tsx`
- `src/pages/practice/QuizChallenge.tsx`
- `src/components/LevelGate.tsx`

**Files to modify:**
- `src/App.tsx` - Add all routes
- `src/pages/Dashboard.tsx` - Add Grammar Test entry point and level indicators

**Data approach:** All content (questions, passages, prompts) will use static mock data structured in API-ready format, making it easy to swap in real backend calls later.

**AI placeholders:** Speaking and Writing practice pages will include clearly marked integration points for AI feedback (grammar checking, pronunciation analysis) that can be connected to Lovable AI or ElevenLabs later.

