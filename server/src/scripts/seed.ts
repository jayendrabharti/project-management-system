import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import User from '../models/User';
import Project from '../models/Project';
import Task from '../models/Task';

dotenv.config();

const users = [
  { name: 'John Doe', email: 'user1@example.com', password: 'password123' },
  { name: 'Jane Smith', email: 'user2@example.com', password: 'password123' },
  { name: 'Bob Johnson', email: 'user3@example.com', password: 'password123' },
  { name: 'Alice Williams', email: 'user4@example.com', password: 'password123' },
  { name: 'Charlie Brown', email: 'user5@example.com', password: 'password123' },
  { name: 'Diana Prince', email: 'user6@example.com', password: 'password123' },
  { name: 'Eve Davis', email: 'user7@example.com', password: 'password123' },
  { name: 'Frank Miller', email: 'user8@example.com', password: 'password123' },
  { name: 'Grace Lee', email: 'user9@example.com', password: 'password123' },
  { name: 'Henry Wilson', email: 'user10@example.com', password: 'password123' },
];

const projectTemplates = [
  {
    name: 'Website Redesign',
    description: 'Complete overhaul of company website with modern design',
    status: 'active',
  },
  {
    name: 'Mobile App Development',
    description: 'Build native mobile app for iOS and Android',
    status: 'active',
  },
  {
    name: 'E-commerce Platform',
    description: 'Launch new e-commerce platform with payment integration',
    status: 'in-progress',
  },
  {
    name: 'Marketing Campaign Q1',
    description: 'Digital marketing campaign for Q1 2026',
    status: 'completed',
  },
  {
    name: 'Cloud Migration',
    description: 'Migrate infrastructure to AWS cloud services',
    status: 'active',
  },
  {
    name: 'Data Analytics Dashboard',
    description: 'Build comprehensive analytics dashboard for business insights',
    status: 'active',
  },
  {
    name: 'API Integration',
    description: 'Integrate third-party APIs for payment and shipping',
    status: 'active',
  },
  {
    name: 'Security Audit',
    description: 'Complete security audit and implement recommendations',
    status: 'completed',
  },
  {
    name: 'Customer Portal',
    description: 'Self-service customer portal for support tickets',
    status: 'active',
  },
  {
    name: 'Internal Tools',
    description: 'Build internal tools for team productivity',
    status: 'archived',
  },
  {
    name: 'Documentation Project',
    description: 'Create comprehensive documentation for all products',
    status: 'active',
  },
  {
    name: 'Performance Optimization',
    description: 'Optimize application performance and reduce load times',
    status: 'active',
  },
  {
    name: 'User Research Initiative',
    description: 'Conduct user research and gather feedback',
    status: 'active',
  },
  {
    name: 'Design System',
    description: 'Create unified design system for all products',
    status: 'completed',
  },
  {
    name: 'Automated Testing',
    description: 'Implement comprehensive automated testing suite',
    status: 'active',
  },
];

const taskTemplates = [
  { title: 'Design mockups', priority: 'high', status: 'completed' },
  { title: 'Set up development environment', priority: 'high', status: 'completed' },
  { title: 'Database schema design', priority: 'high', status: 'in-progress' },
  { title: 'API endpoint implementation', priority: 'medium', status: 'in-progress' },
  { title: 'Frontend component development', priority: 'medium', status: 'todo' },
  { title: 'Write unit tests', priority: 'medium', status: 'todo' },
  { title: 'Integration testing', priority: 'low', status: 'todo' },
  { title: 'Code review', priority: 'high', status: 'todo' },
  { title: 'Deploy to staging', priority: 'high', status: 'todo' },
  { title: 'User acceptance testing', priority: 'medium', status: 'todo' },
  { title: 'Performance testing', priority: 'medium', status: 'todo' },
  { title: 'Documentation updates', priority: 'low', status: 'todo' },
  { title: 'Security review', priority: 'high', status: 'todo' },
  { title: 'Bug fixes', priority: 'medium', status: 'in-progress' },
  { title: 'Feature enhancements', priority: 'low', status: 'todo' },
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

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = await User.create(users);
    console.log(`✅ Created ${createdUsers.length} users\n`);

    // Create projects
    console.log('📁 Creating projects...');
    const createdProjects = [];

    for (const template of projectTemplates) {
      const owner = getRandomElement(createdUsers);
      const memberCount = Math.floor(Math.random() * 4) + 1; // 1-4 members
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
    }

    console.log(`✅ Created ${createdProjects.length} projects\n`);

    // Create tasks
    console.log('✅ Creating tasks...');
    let taskCount = 0;

    for (const project of createdProjects) {
      const tasksPerProject = Math.floor(Math.random() * 8) + 3; // 3-10 tasks per project

      // Get project owner and members
      const projectOwner = await User.findById(project.owner);
      const projectMembers = await User.find({ _id: { $in: project.members } });
      const allProjectUsers = [projectOwner, ...projectMembers].filter(Boolean);

      for (let i = 0; i < tasksPerProject; i++) {
        const template = getRandomElement(taskTemplates);
        const assignedUser = Math.random() > 0.3 ? getRandomElement(allProjectUsers) : null;
        const hasDueDate = Math.random() > 0.5;

        await Task.create({
          title: template.title,
          description: `Task description for ${template.title} in ${project.name}`,
          status: template.status,
          priority: template.priority,
          project: project._id,
          assignedTo: assignedUser?._id,
          dueDate: hasDueDate ? getRandomDate(Math.floor(Math.random() * 30) - 10) : undefined,
        });

        taskCount++;
      }
    }

    console.log(`✅ Created ${taskCount} tasks\n`);

    // Print summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Projects: ${createdProjects.length}`);
    console.log(`   - Tasks: ${taskCount}\n`);
    console.log('🔑 Test Credentials:');
    console.log('   Email: user1@example.com through user10@example.com');
    console.log('   Password: password123\n');
    console.log('💡 Usage:');
    console.log('   1. Start the server: pnpm dev:server');
    console.log('   2. Start the client: pnpm dev:client');
    console.log('   3. Log in with any test user credentials');
    console.log('═══════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
