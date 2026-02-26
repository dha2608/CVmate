/**
 * Seed script: creates admin user, sample articles, and sample jobs.
 * Run: npm run db:seed (or npx tsx api/scripts/seed.ts)
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Article from '../models/Article.js';
import Job from '../models/Job.js';

dotenv.config();

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@cvmate.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || 'CVmate Admin';

async function seed() {
  try {
    await connectDB();

    // 1. Admin user
    let admin = await User.findOne({ email: ADMIN_EMAIL });
    if (!admin) {
      admin = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
        onboardingCompleted: true,
      });
      console.log('Created admin user:', admin.email);
    } else {
      admin.role = 'admin';
      await admin.save();
      console.log('Updated existing user to admin:', admin.email);
    }

    const authorId = admin._id;

    // 2. Sample articles
    const articleCount = await Article.countDocuments();
    if (articleCount < 3) {
      const articles = [
        {
          title: '5 Tips to Make Your CV ATS-Friendly',
          content: 'Applicant Tracking Systems (ATS) scan your resume before a human does. Use clear section headings, standard job titles, and keywords from the job description. Avoid tables, headers/footers, and graphics that can break parsing.',
          summary: 'How to optimize your CV for ATS and get past the first filter.',
          category: 'Tips CV',
          author: authorId,
          isPublished: true,
          tags: ['CV', 'ATS', 'career'],
        },
        {
          title: 'How to Answer "Tell Me About Yourself" in an Interview',
          content: 'Structure your answer in three parts: present (current role and focus), past (relevant experience), and future (why this role and company). Keep it under 2 minutes and end with a question.',
          summary: 'A simple framework for the most common interview question.',
          category: 'Interview Hack',
          author: authorId,
          isPublished: true,
          tags: ['interview', 'preparation'],
        },
        {
          title: 'Remote Work Trends in Tech 2025',
          content: 'Remote and hybrid roles continue to grow in software development, product, and design. Companies are standardizing async communication and outcome-based performance.',
          summary: 'Overview of remote work trends in the tech industry.',
          category: 'Market News',
          author: authorId,
          isPublished: true,
          tags: ['remote', 'market'],
        },
      ];
      await Article.insertMany(articles);
      console.log('Created', articles.length, 'sample articles');
    } else {
      console.log('Articles already exist, skip seeding articles');
    }

    // 3. Sample jobs
    const jobCount = await Job.countDocuments();
    if (jobCount < 3) {
      const jobs = [
        {
          title: 'Senior Frontend Developer',
          company: 'Tech Solutions Inc',
          location: 'Ho Chi Minh City, Vietnam',
          type: 'Full-time',
          salary: 'Competitive',
          experienceLevel: 'Senior',
          companySize: 'Medium',
          description: 'We are looking for a Senior Frontend Developer to build scalable web applications using React and TypeScript. You will work with design and backend teams to deliver great user experiences.',
          requirements: ['5+ years frontend experience', 'React, TypeScript', 'REST/GraphQL', 'English communication'],
          postedBy: authorId,
          applicants: [],
        },
        {
          title: 'Backend Engineer (Node.js)',
          company: 'StartupXYZ',
          location: 'Remote',
          type: 'Remote',
          salary: '$2,000 - $3,500',
          experienceLevel: 'Mid',
          companySize: 'Startup',
          description: 'Join our small engineering team to design and implement APIs and services. We use Node.js, PostgreSQL, and AWS.',
          requirements: ['3+ years Node.js', 'SQL databases', 'API design', 'Self-driven'],
          postedBy: authorId,
          applicants: [],
        },
        {
          title: 'Full-stack Developer Intern',
          company: 'CVmate',
          location: 'Hanoi / Remote',
          type: 'Internship',
          experienceLevel: 'Entry',
          companySize: 'Small',
          description: 'Internship for students or career switchers. You will work on real features: CV builder, blog, and dashboard. Mentorship and flexible hours.',
          requirements: ['Basic JavaScript/React', 'Eager to learn', 'Portfolio or GitHub'],
          postedBy: authorId,
          applicants: [],
        },
      ];
      await Job.insertMany(jobs);
      console.log('Created', jobs.length, 'sample jobs');
    } else {
      console.log('Jobs already exist, skip seeding jobs');
    }

    await mongoose.connection.close();
    console.log('Seed completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seed();
