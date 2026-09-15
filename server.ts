import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Helper to handle temporary 503/429 errors from Gemini API
async function generateContentWithRetry(ai: GoogleGenAI, options: any, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(options);
    } catch (err: any) {
      const msg = err.message || "";
      if ((msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("429") || err.status === 503 || err.status === 429) && attempt < maxRetries) {
        const delay = attempt * 1500;
        console.warn(`Gemini API 503/429 error. Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }
}

// 1. Plan Breakdown API
app.post("/api/plan/breakdown", async (req, res) => {
  try {
    const { rawPlan, planType } = req.body;
    if (!rawPlan || typeof rawPlan !== "string") {
      return res.status(400).json({ error: "rawPlan string is required." });
    }

    const ai = getAI();
    const prompt = `Analyze the following plan, project idea, learning syllabus, or task list.
Break it down into 3 to 8 concrete, actionable, high-momentum tasks.
Format your output as a strict JSON array of objects.
Each object must have:
- title (concise, action-oriented, e.g. "Draft Core Architecture Outline")
- description (1-2 sentences on what to do)
- priority ("high", "medium", or "low")
- estimatedMinutes (number, typically 5 to 60)
- category ("learning", "project", "routine", "deep_work", or "quick_win")
- cognitiveLoad ("deep_focus", "moderate", "light_listening", or "hands_free_verbal")
- environmentReq ("desk_laptop", "anywhere_mobile", "hands_free_audio", or "physical")
- substeps (array of strings, 2-4 mini steps)

User Input:
"${rawPlan}"
Plan context type: ${planType || "general"}`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              priority: { type: Type.STRING },
              estimatedMinutes: { type: Type.NUMBER },
              category: { type: Type.STRING },
              cognitiveLoad: { type: Type.STRING },
              environmentReq: { type: Type.STRING },
              substeps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["title", "description", "priority", "estimatedMinutes", "category", "cognitiveLoad", "environmentReq"],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "[]");
    return res.json({ tasks: parsed });
  } catch (err: any) {
    console.error("Error in /api/plan/breakdown:", err);
    return res.status(500).json({ error: err.message || "Failed to breakdown plan" });
  }
});

// 2. Real-World Context Matcher ("What are you doing right now?")
app.post("/api/execute/context-match", async (req, res) => {
  try {
    const { currentActivity, tasks } = req.body;
    if (!currentActivity || !tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ error: "currentActivity and tasks array are required." });
    }

    const ai = getAI();
    const prompt = `The user is currently doing the following real-world activity:
"${currentActivity}"

Here are the user's available pending tasks:
${JSON.stringify(
  tasks.map((t: any) => ({
    id: t.id,
    title: t.title,
    category: t.category,
    cognitiveLoad: t.cognitiveLoad,
    environmentReq: t.environmentReq,
    estimatedMinutes: t.estimatedMinutes,
    priority: t.priority,
  })),
  null,
  2
)}

Determine which task can be performed alongside or executed without hindering what the user is currently doing in the real world.
For example:
- If commuting/bus: reading a theory drop, reviewing flashcards, mobile outlining.
- If washing dishes/folding laundry/walking: listening to audio readout, mental formulation, voice memos, passive review.
- If at desk: high cognitive deep focus tasks.
- If tired/in bed: low cognitive quick wins or relaxing audio review.

Respond in strict JSON with:
- recommendedTaskId: ID of the best matching task
- whyCompatible: 1-2 sentences explaining why this fits their current real-world activity without hindrance
- executionStrategy: Concrete advice on how to execute it right now while doing their activity
- handsFreeAudioOption: If applicable, how they can consume or review this via audio/TTS or voice
- mindsetBooster: 1 punchy motivational sentence to beat procrastination
- alternativeTaskIds: Array of 1-2 secondary compatible task IDs`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedTaskId: { type: Type.STRING },
            whyCompatible: { type: Type.STRING },
            executionStrategy: { type: Type.STRING },
            handsFreeAudioOption: { type: Type.STRING },
            mindsetBooster: { type: Type.STRING },
            alternativeTaskIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["recommendedTaskId", "whyCompatible", "executionStrategy", "mindsetBooster"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (err: any) {
    console.error("Error in /api/execute/context-match:", err);
    return res.status(500).json({ error: err.message || "Failed to match context" });
  }
});

// 3. Learning Interval Theory Micro-Read Generator (1-5 minute read)
app.post("/api/theory/generate-drop", async (req, res) => {
  try {
    const { planTitle, subjectOrSkill, currentDay, dropIndex, previousConcepts } = req.body;

    const ai = getAI();
    const prompt = `Generate an engaging, concise theory micro-read for a student learning "${subjectOrSkill || planTitle}".
This is Day ${currentDay || 1}, Drop #${dropIndex || 1}.
Previous concepts covered: ${JSON.stringify(previousConcepts || [])}.

Constraints:
- Length: A crisp 1 to 4 minute read (around 200-350 words).
- High signal-to-noise ratio: Cut the fluff, focus on core principles and real-world application.
- Structure:
  1. Core Concept (title and 1 summary punchline)
  2. The "Why It Matters" (brief intuition)
  3. Key Principle & Example / Mental Model
  4. 1 Immediate Action or Thought Experiment

Respond in strict JSON with:
- title: string
- readTimeMinutes: number (between 1 and 5)
- keyConcept: string (1 sentence summary)
- content: string (rich markdown formatted micro-lesson)
- mentalCheckQuestion: string (a thought-provoking question to ponder)`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            readTimeMinutes: { type: Type.INTEGER },
            keyConcept: { type: Type.STRING },
            content: { type: Type.STRING },
            mentalCheckQuestion: { type: Type.STRING },
          },
          required: ["title", "readTimeMinutes", "keyConcept", "content", "mentalCheckQuestion"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (err: any) {
    console.error("Error in /api/theory/generate-drop:", err);
    return res.status(500).json({ error: err.message || "Failed to generate theory drop" });
  }
});

// 4. Daily MCQ Test for End-of-Day Gamified Completion
app.post("/api/mcq/generate-daily-test", async (req, res) => {
  try {
    const { planTitle, theoryDrops, completedTasks } = req.body;

    const ai = getAI();
    const prompt = `Create an end-of-day multiple choice quiz (MCQ test) to verify execution and mastery for the user's daily progress.
Plan/Subject: "${planTitle || "Execution Mastery"}"
Theory concepts covered today:
${JSON.stringify((theoryDrops || []).map((d: any) => ({ title: d.title, keyConcept: d.keyConcept, content: d.content?.slice(0, 300) })))}

Tasks worked on today:
${JSON.stringify((completedTasks || []).map((t: any) => t.title))}

Generate exactly 3 to 4 high-quality multiple-choice questions testing their practical understanding and conceptual retention of today's topics.
Make the questions thoughtful, not overly simplistic.
Respond in strict JSON with an array of objects:
- id: unique string (e.g. "q1")
- question: clear question text
- options: array of exactly 4 strings
- correctAnswerIndex: number (0, 1, 2, or 3)
- explanation: 1-2 sentences explaining why the correct answer is right
- conceptTested: short string name of the concept tested`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              conceptTested: { type: Type.STRING },
            },
            required: ["id", "question", "options", "correctAnswerIndex", "explanation", "conceptTested"],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "[]");
    return res.json({ questions: parsed });
  } catch (err: any) {
    console.error("Error in /api/mcq/generate-daily-test:", err);
    return res.status(500).json({ error: err.message || "Failed to generate MCQ test" });
  }
});

// 5. Anti-Procrastination Momentum Unblocker
app.post("/api/procrastination/unblock", async (req, res) => {
  try {
    const { taskTitle, taskDescription, userObstacle } = req.body;

    const ai = getAI();
    const prompt = `The user is struggling with procrastination or friction on the following task:
Task: "${taskTitle}"
Description: "${taskDescription || "None provided"}"
Specific obstacle/feeling: "${userObstacle || "Procrastination / resistance / overwhelming feeling"}"

Provide an anti-friction momentum kickstarter based on behavioral psychology:
- frictionDiagnosis: 1 empathetic sentence diagnosing why the brain resists this task.
- twoMinuteFirstStep: An insanely easy, zero-resistance action they can do in literally 120 seconds (e.g., "Just open the document and type 1 sentence", "Write down 3 bullet points on paper", "Open the terminal and run one command").
- momentumMicroAction: The immediate follow-up step once the 2 minutes are done.
- countdownMinutes: 2

Respond in strict JSON with those 4 fields.`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            frictionDiagnosis: { type: Type.STRING },
            twoMinuteFirstStep: { type: Type.STRING },
            momentumMicroAction: { type: Type.STRING },
            countdownMinutes: { type: Type.INTEGER },
          },
          required: ["frictionDiagnosis", "twoMinuteFirstStep", "momentumMicroAction", "countdownMinutes"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (err: any) {
    console.error("Error in /api/procrastination/unblock:", err);
    return res.status(500).json({ error: err.message || "Failed to unblock task" });
  }
});

// Vite middleware or production static
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EXEC server running on http://0.0.0.0:${PORT}`);
  });
}

start();
