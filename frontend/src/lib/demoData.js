export const isDemoMode = () => {
  return typeof window !== 'undefined' && localStorage.getItem('CAMPUSGENIE_DEMO_MODE') === 'true';
}

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

export const DEMO_STUDENT = {
  name: "Naitik Sharma",
  semester: "2nd Year AIML",
  avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Naitik",
  streak: 12
}

export const DEMO_ASSIGNMENTS = [
  {
    id: 'demo-assign-1',
    title: 'Advanced Database Normalization',
    subject: 'DBMS',
    dueDate: tomorrow.toISOString(),
    priority: 'high',
    status: 'todo',
    aiInsight: 'High priority: 30% of course grade. AI suggests breaking this into 3 sessions.',
    aiGenerated: true
  },
  {
    id: 'demo-assign-2',
    title: 'Quantum Mechanics Problem Set',
    subject: 'Physics',
    dueDate: yesterday.toISOString(),
    priority: 'high',
    status: 'todo',
    aiInsight: 'OVERDUE: Scheduled for immediate focus block today.',
    aiGenerated: true
  },
  {
    id: 'demo-assign-3',
    title: 'Organic Chemistry Lab Report',
    subject: 'Chemistry',
    dueDate: new Date(today.getTime() + 86400000 * 3).toISOString(), // +3 days
    priority: 'medium',
    status: 'inprogress',
    aiInsight: 'On track. Next focus session scheduled for tomorrow.',
    aiGenerated: false
  },
  {
    id: 'demo-assign-4',
    title: 'Linear Algebra Matrices',
    subject: 'Mathematics',
    dueDate: today.toISOString(),
    priority: 'high',
    status: 'done',
    aiInsight: 'Completed ahead of time! Productivity score increased.',
    aiGenerated: false
  }
]

export const DEMO_SESSIONS = [
  {
    id: 'demo-sess-1',
    subject: 'Physics',
    topic: 'Catch up: Quantum Problem Set',
    duration: 1.5,
    date: new Date(today.setHours(8, 0, 0, 0)).toISOString(),
    status: 'completed',
    aiReasoning: 'Scheduled in morning peak energy window to tackle overdue Physics task.'
  },
  {
    id: 'demo-sess-2',
    subject: 'DBMS',
    topic: 'Normalization 1st Normal Form',
    duration: 2,
    date: new Date(today.setHours(10, 30, 0, 0)).toISOString(),
    status: 'todo',
    aiReasoning: 'Follow-up to morning session. High priority deadline tomorrow.'
  },
  {
    id: 'demo-sess-3',
    subject: 'Chemistry',
    topic: 'Review Lab Observations',
    duration: 1,
    date: new Date(today.setHours(14, 0, 0, 0)).toISOString(),
    status: 'todo',
    aiReasoning: 'Lower intensity task placed post-lunch to prevent cognitive burnout.'
  },
  {
    id: 'demo-sess-4',
    subject: 'DSA',
    topic: 'Graph Traversal Algorithms',
    duration: 2.5,
    date: new Date(today.setHours(16, 0, 0, 0)).toISOString(),
    status: 'todo',
    aiReasoning: 'Deep work block assigned to your historical peak focus time (4 PM).'
  }
]

export const DEMO_NOTES = [
  {
    id: 'demo-note-1',
    title: 'DBMS ACID Properties',
    subject: 'DBMS',
    content: 'Atomicity, Consistency, Isolation, Durability. Fundamental for transaction processing.',
    updatedAt: new Date().toISOString(),
    aiSummary: 'Core database transaction principles extracted from lecture slides.'
  },
  {
    id: 'demo-note-2',
    title: 'Graph BFS vs DFS',
    subject: 'DSA',
    content: 'BFS uses a queue and finds shortest path in unweighted graphs. DFS uses a stack and goes deep first.',
    updatedAt: yesterday.toISOString(),
    aiSummary: 'Comparison of fundamental graph traversal algorithms.'
  }
]
