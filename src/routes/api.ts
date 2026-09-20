import express from 'express';
import { z } from 'zod';
import { db } from '../db';
import { users, learningPlans, dailyTasks, theoryDrops, dailyMcqs, userProgress } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { Type } from '@google/genai';
import { getAI, generateContentWithRetry, PRIMARY_MODEL } from '../lib/gemini';

export const apiRouter = express.Router();

// 1. POST /api/auth/register
const registerSchema = z.object({
  email: z.string().email(),
});
apiRouter.post('/auth/register', async (req, res) => {
  try {
    const { email } = registerSchema.parse(req.body);
    let user = await db.select().from(users).where(eq(users.email, email)).get();
    
    if (!user) {
      const inserted = await db.insert(users).values({ email }).returning();
      user = inserted[0];
    }
    
    res.json({ userId: user.id, email: user.email });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 2. POST /api/plans/create
const createPlanSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1),
  totalDays: z.number().int().min(1).max(365),
  dailyTimeAvailableMinutes: z.number().int().min(5).default(60),
  notebooklmNotebookId: z.string().optional(),
});
apiRouter.post('/plans/create', async (req, res) => {
  try {
    const { userId, title, totalDays, dailyTimeAvailableMinutes, notebooklmNotebookId } = createPlanSchema.parse(req.body);
    
    // Insert Plan
    const [plan] = await db.insert(learningPlans).values({
      userId,
      title,
      totalDays,
      dailyTimeAvailableMinutes,
      notebooklmNotebookId,
      category: 'Learning Skill',
      startedAt: new Date(),
    }).returning();

    // Init Progress
    await db.insert(userProgress).values({
      userId,
      planId: plan.id,
    });

    // We'll generate daily breakdown via Gemini
    const ai = getAI();
    const prompt = `Generate a ${totalDays}-day learning breakdown for "${title}".
    Time available per day: ${dailyTimeAvailableMinutes} minutes.
    Respond in JSON:
    { "days": [{ "dayNumber": 1, "topicTitle": "...", "conceptKeyword": "..." }] }`;

    const response = await generateContentWithRetry(ai, {
      model: PRIMARY_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  topicTitle: { type: Type.STRING },
                  conceptKeyword: { type: Type.STRING },
                },
                required: ['dayNumber', 'topicTitle', 'conceptKeyword'],
              }
            }
          },
          required: ['days']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{"days":[]}');
    
    if (parsed.days && parsed.days.length > 0) {
      const taskValues = parsed.days.slice(0, totalDays).map((day: any) => ({
        planId: plan.id,
        dayNumber: day.dayNumber,
        topicTitle: day.topicTitle,
        conceptKeyword: day.conceptKeyword,
        durationMinutes: dailyTimeAvailableMinutes,
      }));
      await db.insert(dailyTasks).values(taskValues);
    }

    res.json({ planId: plan.id, createdPlan: plan });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GET /api/plans/:planId
apiRouter.get('/plans/:planId', async (req, res) => {
  try {
    const { planId } = req.params;
    const plan = await db.select().from(learningPlans).where(eq(learningPlans.id, planId)).get();
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const tasks = await db.select().from(dailyTasks).where(eq(dailyTasks.planId, planId)).all();
    const progress = await db.select().from(userProgress).where(eq(userProgress.planId, planId)).get();

    res.json({ plan, tasks, progress });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. GET /api/tasks/today/:planId
apiRouter.get('/tasks/today/:planId', async (req, res) => {
  try {
    const { planId } = req.params;
    const plan = await db.select().from(learningPlans).where(eq(learningPlans.id, planId)).get();
    if (!plan || !plan.startedAt) {
      return res.status(404).json({ error: 'Plan not found or not started' });
    }

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - plan.startedAt.getTime());
    const dayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (dayNumber > plan.totalDays) {
      return res.status(404).json({ error: 'Plan completed' });
    }

    const task = await db.select()
      .from(dailyTasks)
      .where(and(eq(dailyTasks.planId, planId), eq(dailyTasks.dayNumber, dayNumber)))
      .get();
      
    if (!task) return res.status(404).json({ error: 'Task not found for today' });

    const drops = await db.select().from(theoryDrops).where(eq(theoryDrops.dailyTaskId, task.id)).all();

    res.json({ task, theoryDrops: drops });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. POST /api/theory/generate-daily-drop
apiRouter.post('/theory/generate-daily-drop', async (req, res) => {
  try {
    const { dailyTaskId, notebooklmNotebookId } = req.body;
    const task = await db.select().from(dailyTasks).where(eq(dailyTasks.id, dailyTaskId)).get();
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (notebooklmNotebookId) {
      // Stub for NotebookLM Integration
      return res.json({ message: 'NotebookLM integration stubbed' });
    }

    const ai = getAI();
    const prompt = `You are a micro-learning content generator for a Java + DSA learning app.

User's daily task:
- Topic: ${task.topicTitle}
- Concept: ${task.conceptKeyword || 'General'}
- Duration target: 1–5 minutes (200–350 words)
- Level: Beginner (struggling student)

Generate EXACTLY this JSON structure (no preamble):
{
  "title": "Human-friendly title",
  "contentMarkdown": "Full markdown content with:\\n1. One-sentence intuition\\n2. Syntax explanation with type signature\\n3. Common mistake students make\\n4. One worked example with step-by-step walkthrough\\n\\nKeep total word count 200–350 words.",
  "readTimeMinutes": 3,
  "keyConceptsJsonb": ["concept1", "concept2"],
  "codeExampleSnippet": "public class Example { ... }"
}`;

    const response = await generateContentWithRetry(ai, {
      model: PRIMARY_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            contentMarkdown: { type: Type.STRING },
            readTimeMinutes: { type: Type.INTEGER },
            keyConceptsJsonb: { type: Type.ARRAY, items: { type: Type.STRING } },
            codeExampleSnippet: { type: Type.STRING },
          },
          required: ['title', 'contentMarkdown', 'readTimeMinutes']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');

    const [drop] = await db.insert(theoryDrops).values({
      dailyTaskId,
      title: parsed.title || 'Theory Drop',
      contentMarkdown: parsed.contentMarkdown || '',
      readTimeMinutes: parsed.readTimeMinutes || 3,
      keyConceptsJsonb: JSON.stringify(parsed.keyConceptsJsonb || []),
      codeExampleSnippet: parsed.codeExampleSnippet,
    }).returning();

    res.json({ theoryDrop: drop });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. POST /api/mcq/generate-daily-quiz
apiRouter.post('/mcq/generate-daily-quiz', async (req, res) => {
  try {
    const { dailyTaskId, theoryDropId } = req.body;
    
    const drop = await db.select().from(theoryDrops).where(eq(theoryDrops.id, theoryDropId)).get();
    if (!drop) return res.status(404).json({ error: 'Theory drop not found' });

    const ai = getAI();
    const prompt = `You are a quiz generator for a Java learning app.
Today's concept and content:
${drop.contentMarkdown}

Generate EXACTLY 3 multiple-choice questions testing understanding of:
- Core syntax and usage
- Common pitfalls
- Real-world application

Return this JSON structure (no preamble):
{
  "questions": [
    {
      "id": "q1",
      "question": "What does Integer.parseInt() do?",
      "options": [
        { "id": "a", "text": "Converts a String to an int" },
        { "id": "b", "text": "Converts an int to a String" },
        { "id": "c", "text": "Creates a new Integer object" },
        { "id": "d", "text": "Parses JSON data" }
      ],
      "correctAnswerId": "a",
      "explanation": "parseInt() is a static method..."
    }
  ]
}`;

    const response = await generateContentWithRetry(ai, {
      model: PRIMARY_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '{"questions":[]}');

    const [mcq] = await db.insert(dailyMcqs).values({
      dailyTaskId,
      quizDate: new Date(),
      questionsJsonb: JSON.stringify(parsed.questions || []),
    }).returning();

    // Strip answers before sending to client
    const safeQuestions = (parsed.questions || []).map((q: any) => {
      const { correctAnswerId, explanation, ...safeQ } = q;
      return safeQ;
    });

    res.json({ mcqId: mcq.id, questions: safeQuestions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. POST /api/mcq/submit-answer
apiRouter.post('/mcq/submit-answer', async (req, res) => {
  try {
    const { mcqId, answers } = req.body;
    
    const mcq = await db.select().from(dailyMcqs).where(eq(dailyMcqs.id, mcqId)).get();
    if (!mcq) return res.status(404).json({ error: 'MCQ not found' });

    const questions = JSON.parse(mcq.questionsJsonb);
    let correctCount = 0;
    const feedback: any = { missedQuestions: [], explanations: [] };

    questions.forEach((q: any) => {
      const userAns = answers.find((a: any) => a.questionId === q.id);
      if (userAns && userAns.selectedOptionId === q.correctAnswerId) {
        correctCount++;
      } else {
        feedback.missedQuestions.push(q.id);
        feedback.explanations.push({ id: q.id, explanation: q.explanation, correctOption: q.correctAnswerId });
      }
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);
    const passed = scorePercentage >= 60;

    await db.update(dailyMcqs)
      .set({
        scorePercentage,
        passed,
        userAnswersJsonb: JSON.stringify(answers),
        feedbackJsonb: JSON.stringify(feedback),
        completedAt: new Date(),
      })
      .where(eq(dailyMcqs.id, mcqId));

    // Update progress
    const task = await db.select().from(dailyTasks).where(eq(dailyTasks.id, mcq.dailyTaskId)).get();
    if (task) {
      const progress = await db.select().from(userProgress).where(eq(userProgress.planId, task.planId)).get();
      if (progress) {
        if (passed) {
          const newStreak = (progress.currentStreak || 0) + 1;
          await db.update(userProgress).set({
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, progress.longestStreak || 0),
            lastCompletionDate: new Date(),
            totalMcqsPassed: (progress.totalMcqsPassed || 0) + 1,
            totalMcqsAttempted: (progress.totalMcqsAttempted || 0) + 1,
            averageMcqScore: Math.round((((progress.averageMcqScore || 0) * (progress.totalMcqsAttempted || 0)) + scorePercentage) / ((progress.totalMcqsAttempted || 0) + 1))
          }).where(eq(userProgress.id, progress.id));
        } else {
          await db.update(userProgress).set({
            totalMcqsAttempted: (progress.totalMcqsAttempted || 0) + 1,
            averageMcqScore: Math.round((((progress.averageMcqScore || 0) * (progress.totalMcqsAttempted || 0)) + scorePercentage) / ((progress.totalMcqsAttempted || 0) + 1))
          }).where(eq(userProgress.id, progress.id));
        }
      }
    }

    res.json({ scorePercentage, passed, feedback });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. GET /api/progress/:userId/:planId
apiRouter.get('/progress/:userId/:planId', async (req, res) => {
  try {
    const { userId, planId } = req.params;
    const progress = await db.select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.planId, planId)))
      .get();
      
    if (!progress) return res.status(404).json({ error: 'Progress not found' });
    
    res.json({
      currentStreak: progress.currentStreak,
      longestStreak: progress.longestStreak,
      totalTasksCompleted: progress.totalTasksCompleted,
      totalMcqsPassed: progress.totalMcqsPassed,
      averageMcqScore: progress.averageMcqScore,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 9. POST /api/notebooklm/notebooks (Stub)
apiRouter.post('/notebooklm/notebooks', async (req, res) => {
  res.json({ message: 'NotebookLM integration pending setup' });
});
