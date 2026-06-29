const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const initializeDatabase = async () => {
  console.log('Initializing database schema...');
  
  try {
    // Read schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Run schema
    await pool.query(schemaSql);
    console.log('Schema created successfully');

    // Generate Seed Data
    console.log('Seeding initial data...');
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // Insert Users
    const userRes = await pool.query(
      `INSERT INTO users (name, email, password) 
       VALUES 
       ($1, $2, $3),
       ($4, $5, $3)
       RETURNING id, email`,
      [
        'Jane Doe', 'jane@taskflow.pro', hashedPassword,
        'John Doe', 'john@taskflow.pro'
      ]
    );
    const jane = userRes.rows.find(u => u.email === 'jane@taskflow.pro');
    const john = userRes.rows.find(u => u.email === 'john@taskflow.pro');

    console.log(`Users seeded. Jane ID: ${jane.id}, John ID: ${john.id}`);

    // Insert Projects
    const projectRes = await pool.query(
      `INSERT INTO projects (user_id, name, description, is_archived)
       VALUES 
       ($1, 'Website Redesign', 'Modernizing our primary landing page and user dashboards.', false),
       ($1, 'Mobile App Launch', 'Preparing marketing assets and app store submittals.', false),
       ($1, 'Archived Marketing Plan', 'Old Q1 marketing initiative.', true),
       ($2, 'Johns Solo Project', 'Private workspace for John.', false)
       RETURNING id, name`,
      [jane.id, john.id]
    );
    const redesignProj = projectRes.rows.find(p => p.name === 'Website Redesign');
    const mobileProj = projectRes.rows.find(p => p.name === 'Mobile App Launch');
    const archivedProj = projectRes.rows.find(p => p.name === 'Archived Marketing Plan');
    const johnProj = projectRes.rows.find(p => p.name === 'Johns Solo Project');

    // Insert Tasks
    const now = new Date();
    const plusDays = (days) => {
      const d = new Date();
      d.setDate(now.getDate() + days);
      return d.toISOString().split('T')[0];
    };

    await pool.query(
      `INSERT INTO tasks (project_id, user_id, title, description, priority, status, due_date)
       VALUES 
       ($1, $2, 'Create Figma mockups', 'Draft modern UI/UX landing page styles.', 'High', 'Completed', $3),
       ($1, $2, 'Set up Vite frontend', 'Initialize React framework with custom styling system.', 'Critical', 'In Progress', $4),
       ($1, $2, 'Implement JWT auth API', 'Build backend validation, tokens, and middleware layers.', 'Medium', 'Todo', $5),
       ($1, $2, 'Write documentation', 'Draft README and swagger-like definitions for developers.', 'Low', 'Todo', $6),
       
       ($7, $2, 'Prepare app store screenshots', 'Export sizes for App Store and Google Play.', 'Medium', 'Review', $8),
       ($7, $2, 'Configure beta testers access', 'Create TestFlight group and invite external stakeholders.', 'Low', 'Todo', $9),
       
       ($10, $2, 'Archived task', 'This task belongs to an archived project.', 'Low', 'Todo', $8),
       
       ($11, $12, 'Define Database Schema', 'Implement PostgreSQL tables with indexes.', 'Critical', 'Completed', $3)`,
      [
        redesignProj.id, jane.id, plusDays(7), plusDays(3), plusDays(5), plusDays(10),
        mobileProj.id, plusDays(1), plusDays(4),
        archivedProj.id,
        johnProj.id, john.id
      ]
    );

    console.log('Tasks and projects seeded successfully!');
    console.log('Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initializeDatabase();
