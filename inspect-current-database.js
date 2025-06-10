import { readFileSync } from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

// Database connection with multiple credential attempts
const connectionConfigs = [
  {
    user: 'postgres',
    password: '0000',
    host: 'localhost',
    port: 5432,
    database: 'Housy',
    ssl: false
  }
];

async function inspectDatabase() {
  for (const config of connectionConfigs) {
    try {
      console.log(`🔍 Trying connection with user: ${config.user}, password: ${config.password || '(empty)'}`);
      
      const pool = new Pool(config);
      
      // Test connection
      const client = await pool.connect();
      console.log('✅ Connected successfully!');
      
      // Query 1: List all tables
      console.log('\n📋 Tables in the Housy database:');
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `);
      
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
      
      // Query 2: Count records in all tables
      console.log('\n📊 Record counts in all tables:');
      try {
        const countResult = await client.query(`
          WITH table_counts AS (
            SELECT 'users' as table_name, COUNT(*) as count FROM users
            UNION ALL
            SELECT 'projects' as table_name, COUNT(*) as count FROM projects
            UNION ALL
            SELECT 'tasks' as table_name, COUNT(*) as count FROM tasks
            UNION ALL
            SELECT 'resources' as table_name, COUNT(*) as count FROM resources
            UNION ALL
            SELECT 'materials' as table_name, COUNT(*) as count FROM materials
            UNION ALL
            SELECT 'activity_logs' as table_name, COUNT(*) as count FROM activity_logs
          )
          SELECT * FROM table_counts
          ORDER BY table_name;
        `);
        
        countResult.rows.forEach(row => {
          console.log(`  ${row.table_name}: ${row.count} records`);
        });
      } catch (countError) {
        console.log('  Some tables may not exist yet');
        
        // Try individual table counts
        const basicTables = ['users', 'projects', 'tasks', 'resources', 'materials', 'activity_logs'];
        for (const table of basicTables) {
          try {
            const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
            console.log(`  ${table}: ${result.rows[0].count} records`);
          } catch (e) {
            console.log(`  ${table}: table does not exist`);
          }
        }
      }
      
      // Query 3: Check projects table structure
      console.log('\n🏗️  Projects table structure:');
      try {
        const projectsStructure = await client.query(`
          SELECT column_name, data_type, character_maximum_length, column_default, is_nullable
          FROM information_schema.columns
          WHERE table_name = 'projects'
          ORDER BY ordinal_position;
        `);
        
        projectsStructure.rows.forEach(row => {
          console.log(`  ${row.column_name} (${row.data_type}${row.character_maximum_length ? `(${row.character_maximum_length})` : ''}) - ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
      } catch (e) {
        console.log('  Projects table does not exist');
      }
      
      // Query 4: Check users table structure
      console.log('\n👥 Users table structure:');
      try {
        const usersStructure = await client.query(`
          SELECT column_name, data_type, character_maximum_length, column_default, is_nullable
          FROM information_schema.columns
          WHERE table_name = 'users'
          ORDER BY ordinal_position;
        `);
        
        usersStructure.rows.forEach(row => {
          console.log(`  ${row.column_name} (${row.data_type}${row.character_maximum_length ? `(${row.character_maximum_length})` : ''}) - ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
      } catch (e) {
        console.log('  Users table does not exist');
      }
      
      // Query 5: Sample data from projects
      console.log('\n📋 Sample projects data:');
      try {
        const projectsData = await client.query(`
          SELECT id, name, client_name, location, budget, start_date, status, progress
          FROM projects
          LIMIT 5;
        `);
        
        projectsData.rows.forEach(row => {
          console.log(`  ${row.id}: ${row.name} - ${row.client_name} (${row.location}) - ${row.budget}€`);
        });
      } catch (e) {
        console.log('  No projects data available');
      }
      
      // Query 6: Sample data from users
      console.log('\n👥 Sample users data:');
      try {
        const usersData = await client.query(`
          SELECT id, username, full_name, email, role
          FROM users
          LIMIT 5;
        `);
        
        usersData.rows.forEach(row => {
          console.log(`  ${row.id}: ${row.username} (${row.full_name}) - ${row.email} [${row.role}]`);
        });
      } catch (e) {
        console.log('  No users data available');
      }
      
      // Check for project_categories table (needed for Tunisian construction types)
      console.log('\n🏗️  Project Categories table:');
      try {
        const categoriesResult = await client.query(`
          SELECT column_name, data_type
          FROM information_schema.columns
          WHERE table_name = 'project_categories'
          ORDER BY ordinal_position;
        `);
        
        if (categoriesResult.rows.length > 0) {
          console.log('  Structure:');
          categoriesResult.rows.forEach(row => {
            console.log(`    ${row.column_name} (${row.data_type})`);
          });
          
          const categoriesData = await client.query('SELECT COUNT(*) as count FROM project_categories');
          console.log(`  Records: ${categoriesData.rows[0].count}`);
        } else {
          console.log('  Table does not exist - needs to be created for Tunisian construction types');
        }
      } catch (e) {
        console.log('  Table does not exist - needs to be created for Tunisian construction types');
      }
      
      client.release();
      await pool.end();
      return; // Exit on first successful connection
      
    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}`);
    }
  }
  
  console.log('\n❌ Could not connect to database with any of the attempted credentials');
}

inspectDatabase();
