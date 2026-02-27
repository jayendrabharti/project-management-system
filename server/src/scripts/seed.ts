import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import User from '../models/User';
import Project from '../models/Project';
import Task from '../models/Task';
import Comment from '../models/Comment';
import ActivityLog from '../models/ActivityLog';

dotenv.config();

const users = [
  {
    name: 'Jayendra Bharti',
    email: 'jayendra@example.com',
    password: 'password123',
    role: 'admin',
  },
  { name: 'Priya Sharma', email: 'priya@example.com', password: 'password123', role: 'member' },
  { name: 'Arjun Patel', email: 'arjun@example.com', password: 'password123', role: 'member' },
  { name: 'Sneha Gupta', email: 'sneha@example.com', password: 'password123', role: 'member' },
  { name: 'Rahul Singh', email: 'rahul@example.com', password: 'password123', role: 'member' },
  { name: 'Ananya Desai', email: 'ananya@example.com', password: 'password123', role: 'member' },
  { name: 'Vikram Rao', email: 'vikram@example.com', password: 'password123', role: 'member' },
  { name: 'Kavya Nair', email: 'kavya@example.com', password: 'password123', role: 'member' },
  { name: 'Aditya Kumar', email: 'aditya@example.com', password: 'password123', role: 'member' },
  { name: 'Meera Joshi', email: 'meera@example.com', password: 'password123', role: 'member' },
];

const projectColors = [
  '#7c3aed',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#ec4899',
  '#8b5cf6',
];
const projectIcons = ['🚀', '📱', '🛒', '📊', '☁️', '🔒', '🎨', '⚡', '📝', '🔧'];

const projectTemplates = [
  {
    name: 'E-Commerce Platform v2.0',
    description:
      'Complete redesign and rebuild of the e-commerce platform with microservices architecture, real-time inventory, and AI-powered recommendations.',
    status: 'active',
    icon: '🛒',
    color: '#3b82f6',
  },
  {
    name: 'Mobile App - iOS & Android',
    description:
      'Native mobile application for both platforms with offline support, push notifications, and biometric authentication.',
    status: 'active',
    icon: '📱',
    color: '#10b981',
  },
  {
    name: 'Analytics Dashboard',
    description:
      'Real-time business analytics dashboard with customizable widgets, automated reports, and data visualization.',
    status: 'active',
    icon: '📊',
    color: '#7c3aed',
  },
  {
    name: 'Cloud Infrastructure Migration',
    description:
      'Migrate on-premise infrastructure to AWS with containerization, auto-scaling, and CI/CD pipelines.',
    status: 'active',
    icon: '☁️',
    color: '#06b6d4',
  },
  {
    name: 'Customer Support Portal',
    description:
      'Self-service portal with ticket management, knowledge base, live chat, and AI chatbot integration.',
    status: 'active',
    icon: '💬',
    color: '#f59e0b',
  },
  {
    name: 'Marketing Campaign Q1 2026',
    description:
      'Multi-channel digital marketing campaign including social media, email, SEO, and content marketing.',
    status: 'completed',
    icon: '📣',
    color: '#ec4899',
  },
  {
    name: 'Security Audit & Compliance',
    description:
      'Comprehensive security audit, penetration testing, and SOC 2 compliance implementation.',
    status: 'completed',
    icon: '🔒',
    color: '#ef4444',
  },
  {
    name: 'Design System v3',
    description:
      'Unified design system with component library, design tokens, accessibility guidelines, and Figma integration.',
    status: 'active',
    icon: '🎨',
    color: '#8b5cf6',
  },
  {
    name: 'API Gateway & Microservices',
    description:
      'Build centralized API gateway with authentication, rate limiting, and service mesh architecture.',
    status: 'active',
    icon: '⚡',
    color: '#f97316',
  },
  {
    name: 'Internal Knowledge Base',
    description:
      'Company-wide knowledge management system with search, tagging, and collaborative editing.',
    status: 'archived',
    icon: '📝',
    color: '#6b7280',
  },
];

const labelSets = [
  ['bug', 'frontend'],
  ['feature', 'backend'],
  ['improvement', 'ui/ux'],
  ['bug', 'critical'],
  ['feature', 'api'],
  ['documentation'],
  ['testing'],
  ['devops', 'infrastructure'],
  ['design', 'ui/ux'],
  ['performance'],
  ['security'],
  ['feature', 'frontend'],
];

const taskTemplates = [
  // E-commerce tasks
  {
    title: 'Design product listing page',
    priority: 'high',
    status: 'completed',
    labels: ['design', 'ui/ux'],
    subtasks: [
      { title: 'Create wireframes', completed: true },
      { title: 'Design mobile layout', completed: true },
      { title: 'Get stakeholder approval', completed: true },
    ],
  },
  {
    title: 'Implement shopping cart API',
    priority: 'high',
    status: 'completed',
    labels: ['feature', 'backend'],
    subtasks: [
      { title: 'Cart CRUD operations', completed: true },
      { title: 'Price calculation logic', completed: true },
      { title: 'Apply promo codes', completed: false },
    ],
  },
  {
    title: 'Payment gateway integration',
    priority: 'urgent',
    status: 'in-progress',
    labels: ['feature', 'backend'],
    subtasks: [
      { title: 'Stripe SDK setup', completed: true },
      { title: 'Payment flow UI', completed: false },
      { title: 'Webhook handlers', completed: false },
      { title: 'Error handling & retries', completed: false },
    ],
  },
  {
    title: 'Product search & filtering',
    priority: 'medium',
    status: 'in-progress',
    labels: ['feature', 'frontend'],
    subtasks: [
      { title: 'Elasticsearch integration', completed: true },
      { title: 'Faceted filters', completed: false },
      { title: 'Sort options', completed: false },
    ],
  },
  {
    title: 'Order tracking dashboard',
    priority: 'medium',
    status: 'todo',
    labels: ['feature', 'ui/ux'],
    subtasks: [
      { title: 'Order status timeline', completed: false },
      { title: 'Real-time updates', completed: false },
    ],
  },
  {
    title: 'Fix cart total miscalculation',
    priority: 'urgent',
    status: 'in-review',
    labels: ['bug', 'critical'],
    subtasks: [],
  },
  {
    title: 'Inventory management system',
    priority: 'high',
    status: 'todo',
    labels: ['feature', 'backend'],
    subtasks: [
      { title: 'Stock tracking', completed: false },
      { title: 'Low stock alerts', completed: false },
      { title: 'Batch updates', completed: false },
    ],
  },
  {
    title: 'Write unit tests for cart module',
    priority: 'medium',
    status: 'todo',
    labels: ['testing'],
    subtasks: [],
  },
  {
    title: 'Performance audit & optimization',
    priority: 'low',
    status: 'todo',
    labels: ['performance'],
    subtasks: [
      { title: 'Lighthouse audit', completed: false },
      { title: 'Lazy loading images', completed: false },
      { title: 'Bundle size optimization', completed: false },
    ],
  },

  // Mobile app tasks
  {
    title: 'Setup React Native project',
    priority: 'high',
    status: 'completed',
    labels: ['devops'],
    subtasks: [
      { title: 'Initialize project', completed: true },
      { title: 'Configure navigation', completed: true },
      { title: 'Setup state management', completed: true },
    ],
  },
  {
    title: 'Implement biometric auth',
    priority: 'high',
    status: 'in-progress',
    labels: ['feature', 'security'],
    subtasks: [
      { title: 'Face ID integration', completed: true },
      { title: 'Fingerprint support', completed: true },
      { title: 'Fallback PIN', completed: false },
    ],
  },
  {
    title: 'Push notification system',
    priority: 'medium',
    status: 'todo',
    labels: ['feature', 'backend'],
    subtasks: [
      { title: 'Firebase setup', completed: false },
      { title: 'Notification preferences', completed: false },
    ],
  },
  {
    title: 'Offline data sync',
    priority: 'high',
    status: 'in-progress',
    labels: ['feature', 'backend'],
    subtasks: [
      { title: 'Local database setup', completed: true },
      { title: 'Sync conflict resolution', completed: false },
      { title: 'Background sync', completed: false },
    ],
  },
  {
    title: 'App store submission prep',
    priority: 'low',
    status: 'todo',
    labels: ['documentation'],
    subtasks: [
      { title: 'Screenshots', completed: false },
      { title: 'App description', completed: false },
      { title: 'Privacy policy', completed: false },
    ],
  },

  // Analytics dashboard tasks
  {
    title: 'Build dashboard layout',
    priority: 'high',
    status: 'completed',
    labels: ['design', 'frontend'],
    subtasks: [
      { title: 'Grid system', completed: true },
      { title: 'Responsive breakpoints', completed: true },
    ],
  },
  {
    title: 'Implement chart components',
    priority: 'high',
    status: 'in-progress',
    labels: ['feature', 'frontend'],
    subtasks: [
      { title: 'Line charts', completed: true },
      { title: 'Bar charts', completed: true },
      { title: 'Pie charts', completed: false },
      { title: 'Heatmaps', completed: false },
    ],
  },
  {
    title: 'Data export functionality',
    priority: 'medium',
    status: 'todo',
    labels: ['feature'],
    subtasks: [
      { title: 'CSV export', completed: false },
      { title: 'PDF reports', completed: false },
    ],
  },
  {
    title: 'Fix timezone rendering bug',
    priority: 'high',
    status: 'in-review',
    labels: ['bug', 'frontend'],
    subtasks: [],
  },
  {
    title: 'Add date range picker',
    priority: 'medium',
    status: 'in-progress',
    labels: ['feature', 'ui/ux'],
    subtasks: [],
  },
  {
    title: 'Automated email reports',
    priority: 'low',
    status: 'todo',
    labels: ['feature', 'backend'],
    subtasks: [
      { title: 'Email template design', completed: false },
      { title: 'Scheduling logic', completed: false },
      { title: 'Test email delivery', completed: false },
    ],
  },

  // Cloud infrastructure
  {
    title: 'Setup Terraform configs',
    priority: 'high',
    status: 'completed',
    labels: ['devops', 'infrastructure'],
    subtasks: [
      { title: 'VPC setup', completed: true },
      { title: 'Security groups', completed: true },
      { title: 'IAM roles', completed: true },
    ],
  },
  {
    title: 'Containerize applications',
    priority: 'high',
    status: 'in-progress',
    labels: ['devops'],
    subtasks: [
      { title: 'Dockerize API', completed: true },
      { title: 'Dockerize frontend', completed: true },
      { title: 'Docker Compose setup', completed: false },
    ],
  },
  {
    title: 'CI/CD pipeline setup',
    priority: 'urgent',
    status: 'in-progress',
    labels: ['devops', 'infrastructure'],
    subtasks: [
      { title: 'GitHub Actions workflow', completed: true },
      { title: 'Staging deployment', completed: false },
      { title: 'Production deployment', completed: false },
    ],
  },
  {
    title: 'Database migration plan',
    priority: 'high',
    status: 'todo',
    labels: ['backend', 'infrastructure'],
    subtasks: [],
  },
  {
    title: 'Load testing',
    priority: 'medium',
    status: 'todo',
    labels: ['testing', 'performance'],
    subtasks: [],
  },

  // Generic tasks spread across projects
  {
    title: 'Setup linting & formatting',
    priority: 'low',
    status: 'completed',
    labels: ['devops'],
    subtasks: [],
  },
  {
    title: 'Create API documentation',
    priority: 'medium',
    status: 'in-progress',
    labels: ['documentation'],
    subtasks: [
      { title: 'Auth endpoints', completed: true },
      { title: 'CRUD endpoints', completed: false },
      { title: 'WebSocket events', completed: false },
    ],
  },
  {
    title: 'User onboarding flow',
    priority: 'high',
    status: 'todo',
    labels: ['feature', 'ui/ux'],
    subtasks: [
      { title: 'Welcome screen', completed: false },
      { title: 'Feature tour', completed: false },
      { title: 'Setup wizard', completed: false },
    ],
  },
  {
    title: 'Accessibility audit',
    priority: 'medium',
    status: 'todo',
    labels: ['improvement', 'ui/ux'],
    subtasks: [
      { title: 'Screen reader testing', completed: false },
      { title: 'Color contrast checks', completed: false },
      { title: 'Keyboard navigation', completed: false },
    ],
  },
  {
    title: 'Error monitoring setup',
    priority: 'high',
    status: 'in-review',
    labels: ['devops'],
    subtasks: [
      { title: 'Sentry integration', completed: true },
      { title: 'Alert rules', completed: true },
      { title: 'Error grouping config', completed: false },
    ],
  },
];

const commentTemplates = [
  'Looks good! I tested this locally and everything works as expected.',
  'Can we add error handling for edge cases here?',
  'I think we should refactor this to use the new API pattern we discussed.',
  'Updated the implementation based on code review feedback.',
  'This is blocked by the API changes in the backend. Waiting for that PR to merge.',
  'Added unit tests for this feature. All passing ✅',
  "Great progress! Let's schedule a demo for the stakeholders.",
  'I noticed a minor UI issue on mobile. Will fix in the next PR.',
  'Performance looks much better after the optimization. Load time down by 40%.',
  'We should consider caching this endpoint. Seeing high latency under load.',
  'Merged the latest changes from main. Ready for review.',
  'The design team approved the mockups. Moving to implementation.',
];

const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const getRandomElements = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const getRandomDate = (daysOffset: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date;
};

const getRandomPastDate = (daysAgo: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
};

export const seedDatabase = async (exitProcess = true) => {
  try {
    console.log('🌱 Starting database seeding...\n');

    if (exitProcess) {
      await connectDB();
    }

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Comment.deleteMany({});
    await ActivityLog.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = await User.create(users);
    console.log(`✅ Created ${createdUsers.length} users\n`);

    // Create projects
    console.log('📁 Creating projects...');
    const createdProjects = [];

    for (let i = 0; i < projectTemplates.length; i++) {
      const template = projectTemplates[i];
      // First user owns more projects for demo purposes
      const owner = i < 5 ? createdUsers[0] : getRandomElement(createdUsers);
      const memberCount = Math.floor(Math.random() * 4) + 2; // 2-5 members
      const members = getRandomElements(
        createdUsers.filter((u) => u._id.toString() !== owner._id.toString()),
        memberCount
      ).map((u) => u._id);

      const project = await Project.create({
        ...template,
        owner: owner._id,
        members,
      });

      createdProjects.push(project);

      // Log activity
      await ActivityLog.create({
        user: owner._id,
        action: 'created',
        entityType: 'project',
        entityId: project._id.toString(),
        entityName: project.name,
        projectId: project._id,
        createdAt: getRandomPastDate(30),
      });
    }

    console.log(`✅ Created ${createdProjects.length} projects\n`);

    // Create tasks
    console.log('📋 Creating tasks...');
    let taskCount = 0;
    const createdTasks: any[] = [];

    // Distribute tasks across projects
    const tasksPerProject = Math.ceil(taskTemplates.length / createdProjects.length);
    let taskIndex = 0;

    for (const project of createdProjects) {
      const projectOwner = await User.findById(project.owner);
      const projectMembers = await User.find({ _id: { $in: project.members } });
      const allProjectUsers = [projectOwner, ...projectMembers].filter(Boolean);

      const count = Math.min(
        tasksPerProject + Math.floor(Math.random() * 3),
        taskTemplates.length - taskIndex
      );

      for (let i = 0; i < count && taskIndex < taskTemplates.length; i++) {
        const template = taskTemplates[taskIndex];
        const assignedUser = Math.random() > 0.2 ? getRandomElement(allProjectUsers) : null;
        const creator = getRandomElement(allProjectUsers);
        const hasDueDate = Math.random() > 0.3;

        const task = await Task.create({
          title: template.title,
          description: `${template.title} — part of the ${project.name} project. This task involves detailed planning, implementation, and testing.`,
          status: template.status,
          priority: template.priority,
          project: project._id,
          assignedTo: assignedUser?._id,
          createdBy: creator?._id || createdUsers[0]._id,
          dueDate: hasDueDate ? getRandomDate(Math.floor(Math.random() * 30) - 10) : undefined,
          labels: template.labels || [],
          tags: [],
          subtasks: template.subtasks || [],
          order: i,
        });

        createdTasks.push(task);
        taskCount++;
        taskIndex++;

        // Log task creation activity
        await ActivityLog.create({
          user: creator?._id || createdUsers[0]._id,
          action: 'created',
          entityType: 'task',
          entityId: task._id.toString(),
          entityName: task.title,
          projectId: project._id,
          createdAt: getRandomPastDate(20),
        });
      }
    }

    console.log(`✅ Created ${taskCount} tasks\n`);

    // Create comments
    console.log('💬 Creating comments...');
    let commentCount = 0;

    for (const task of createdTasks) {
      const numComments = Math.floor(Math.random() * 4); // 0-3 comments per task
      for (let i = 0; i < numComments; i++) {
        const author = getRandomElement(createdUsers);
        const comment = await Comment.create({
          content: getRandomElement(commentTemplates),
          author: author._id,
          task: task._id,
          createdAt: getRandomPastDate(14),
        });

        // Log comment activity
        await ActivityLog.create({
          user: author._id,
          action: 'commented on',
          entityType: 'comment',
          entityId: comment._id.toString(),
          entityName: task.title,
          projectId: task.project,
          createdAt: comment.createdAt,
        });

        commentCount++;
      }
    }

    console.log(`✅ Created ${commentCount} comments\n`);

    // Create some more activity entries for realism
    console.log('📝 Creating activity entries...');
    const actions = ['updated', 'completed', 'assigned', 'changed priority of'];
    for (let i = 0; i < 30; i++) {
      const task = getRandomElement(createdTasks);
      const user = getRandomElement(createdUsers);
      await ActivityLog.create({
        user: user._id,
        action: getRandomElement(actions),
        entityType: 'task',
        entityId: task._id.toString(),
        entityName: task.title,
        projectId: task.project,
        details: getRandomElement([
          'status → completed',
          'priority → high',
          'assigned to team member',
          'added labels',
          '',
        ]),
        createdAt: getRandomPastDate(14),
      });
    }
    console.log('✅ Created additional activity entries\n');

    // Print summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Projects: ${createdProjects.length}`);
    console.log(`   - Tasks: ${taskCount}`);
    console.log(`   - Comments: ${commentCount}\n`);
    console.log('🔑 Test Credentials:');
    console.log('   Email: jayendra@example.com');
    console.log('   Password: password123\n');
    console.log('   (Other users: priya@, arjun@, sneha@ ... @example.com)');
    console.log('═══════════════════════════════════════════════════════\n');

    if (exitProcess) {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    if (exitProcess) {
      process.exit(1);
    }
    throw error;
  }
};

// Run seeding when called directly
if (require.main === module) {
  seedDatabase(true);
}
