# AI disclosure copy (for BIZ-06)

> BIZ-06 adds, **at each AI entry point and in the key prompt** (`aiKeySetupPrompt`, `index.html:46167`), one line saying what that feature sends and to whom. Each line must name "Anthropic" (BIZ-06's extra criterion). The data lists below were checked against the request builders at v3.517; privacy.md has the line-by-line evidence. Copy only. The request payloads stay untouched (BIZ-06 criterion 3).
>
> Style: one sentence, plain words, starting with "Sends". Say "using your key" so people know the request is theirs and goes directly to Anthropic.

## 1. The key prompt, and the AI Features Setup card

Shown inside `aiKeySetupPrompt` before "Take me there", and in the AI Features Setup card in Settings (`index.html:6625`), next to the existing "straight from this device" sentence.

> **Before you add a key:** AI features send what you ask, plus the parts of your log that feature needs, straight from this phone to Anthropic using your key. Nothing goes to us. Two run on their own once a key is saved: the weekly check-ins when you save a week, and a one-line note when you finish a session that shows signs of overreaching. Everything else runs only when you tap it.

Shorter cut for the inline prompt, if space is tight (must keep "Anthropic"):

> AI features send your request, and the parts of your log each one needs, to Anthropic using your key. Nothing goes to us.

## 2. One line per entry point

| Entry point (where it renders) | Disclosure line |
|---|---|
| **Cross-Metric Insights**, under "Generate insights" (`#genCrossInsightsBtn`, `index.html:6663`) | Sends your recent weight, food, sleep, water, effort, pain check-ins and PRs to Anthropic using your key. |
| **Coach chat intro**, in the coach panel (`#coachFabPanel`, `index.html:7462`) and the Coach tab chat (`#coachChatInput`, `index.html:6992`) | Sends your message and a summary of your training, food, sleep and recent pain check-ins to Anthropic using your key. |
| **Photo** (Snap a Meal; `#photoLogBtn`, `index.html:6318`) | Sends the photo to Anthropic using your key. |
| **Describe** (`#describeFoodBtn`, `index.html:6320`) | Sends what you type to Anthropic using your key. |
| **Recipes** (`#recipeFinderBtn`, `index.html:6322`) | Sends your request, diet settings, foods you avoid and today's remaining macros to Anthropic using your key. |
| **Scan label** (`#scanLabelBtn`, `index.html:6352`) | Sends the label photo to Anthropic using your key. |
| **Compare with AI** (progress photos; the existing confirmation at `index.html:38935`) | Already says it: "This sends these two specific photos to Anthropic's API…". No change needed; keep it. |
| **Form feedback** (`#coachVideoInput`, `index.html:6976`; replaces the note at `index.html:6969`) | Sends 8 still frames from your clip, the exercise name and your last review of it to Anthropic using your key. The video itself never leaves your phone. |
| **Adapt workout** (`#adaptWorkoutBtn`, `index.html:5911`) | Sends today's planned exercises and what you type to Anthropic using your key. |
| **Swap advice on a resting area** (`.ex-ai-tailor-btn`, `index.html:29300`) | Sends this exercise and your latest pain check-in for this area, including your note, to Anthropic using your key. |
| **Supplement recommendations** (`#supplementRequestSubmit`, `index.html:7010`) | Sends your goal, program, diet settings, any health conditions in your profile, and your question to Anthropic using your key. |
| **Supplement insight** ("Get AI insight" at `index.html:35972`, and "Preview AI insight") | Sends the product name and its label ingredients to Anthropic using your key. |
| **Weekly check-ins** (under "Save this week & start fresh", `#archiveWeekBtn`, `index.html:5931`; show only when a key is saved) | With your AI key saved, this also sends the week's averages (workouts, weight, food, sleep, water) to Anthropic for a short check-in. |
| **Session-complete note** (no button; the key prompt in §1 covers it) | No separate line. It sends no logged numbers, only a fixed request and your program's coaching style. |

## 3. Notes for the build-automator

- **Health conditions.** The profile's Health conditions hint (`index.html:6211`) says "stored only on this device", but Supplement recommendations sends the flagged conditions. Suggested replacement for that sentence: "Optional, and stored only on this device. Sent to Anthropic only if you ask for AI supplement recommendations." This is a copy change in the same area as BIZ-06; the project-manager decides whether it rides with BIZ-06.
- **No-key state** (BIZ-06's main change): "Add an AI key to use this", and the coach intro "Needs your Anthropic key (Settings)". These lines sit above the disclosure line, which stays visible in both states, so people know what will be sent before they decide to add a key.
- Don't promise anything about what Anthropic does with the data. Our copy states only what we send.
