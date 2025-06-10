// Test file to verify PostgreSQL database connection
import pkg from 'pg';
const { Pool } = pkg;

// Load environment variables
const pool = new Pool({
  connectionString: 'postgresql://postgres:0000@localhost:5432/Housy',
  ssl: false
});

async function testDatabaseConnection() {
  try {
    console.log('🔗 Testing PostgreSQL database connection...');
    console.log('📍 Connection String: postgresql://postgres:****@localhost:5432/Housy');
    
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL database!');
    
    // Test query execution
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('⏰ Current Time:', result.rows[0].current_time);
    console.log('🐘 PostgreSQL Version:', result.rows[0].postgres_version.split(' ')[0]);
    
    // Test project data
    const projectsResult = await client.query('SELECT COUNT(*) as project_count FROM projects');
    console.log('📊 Total Projects in Database:', projectsResult.rows[0].project_count);
    
    // Test materials data
    const materialsResult = await client.query('SELECT COUNT(*) as material_count FROM materials');
    console.log('🧱 Total Materials in Database:', materialsResult.rows[0].material_count);
    
    // Test estimation data
    const estimationsResult = await client.query('SELECT COUNT(*) as estimation_count FROM project_estimations');
    console.log('📈 Total Estimations in Database:', estimationsResult.rows[0].estimation_count);
    
    client.release();
    console.log('✅ VERIFICATION COMPLETE: Using REAL PostgreSQL Database');
    console.log('🎯 Database Name: Housy');
    console.log('🌍 Environment: Development (Real Database)');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await pool.end();
  }
}

testDatabaseConnection();
