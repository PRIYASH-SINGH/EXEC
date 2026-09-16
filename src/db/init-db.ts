import { db } from './index';
import { users, learningPlans, dailyTasks } from './schema';

async function initDb() {
  try {
    console.log('Seeding initial data...');
    
    // Create a dummy user
    const [user] = await db.insert(users).values({
      email: 'test@example.com',
    }).returning();
    
    console.log('Created user:', user.email);

    // Create a learning plan
    const [plan] = await db.insert(learningPlans).values({
      userId: user.id,
      title: 'Java Core Repair + DSA Foundations',
      description: 'A 7-day intensive repair for Java concepts and data structures.',
      category: 'Learning Skill',
      totalDays: 7,
      dailyTimeAvailableMinutes: 60,
    }).returning();
    
    console.log('Created learning plan:', plan.title);

    // Create a daily task for Day 1
    const [task] = await db.insert(dailyTasks).values({
      planId: plan.id,
      dayNumber: 1,
      topicTitle: 'Wrapper Classes & parseInt',
      conceptKeyword: 'parseInt',
      durationMinutes: 45,
    }).returning();
    
    console.log('Created daily task for Day 1:', task.topicTitle);
    
    console.log('Database initialization & seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

initDb();
