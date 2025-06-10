import pg from 'pg';

async function testDatabaseConnection() {
    console.log('🔍 Testing database connection...');
    
    // Different connection attempts
    const connectionConfigs = [
        {
            host: 'localhost',
            port: 5432,
            database: 'Housy',
            user: 'postgres',
            password: 'postgres',
            ssl: false
        },
        {
            host: 'localhost',
            port: 5432,
            database: 'postgres',
            user: 'postgres',
            password: 'postgres',
            ssl: false
        },
        {
            host: 'localhost',
            port: 5432,
            database: 'Housy',
            user: 'postgres',
            password: '',
            ssl: false
        }
    ];
    
    for (let i = 0; i < connectionConfigs.length; i++) {
        const config = connectionConfigs[i];
        console.log(`\n🔗 Attempt ${i + 1}: Connecting to ${config.database} as ${config.user}...`);
        
        try {
            const client = new pg.Client(config);
            await client.connect();
            
            console.log(`✅ Successfully connected to database: ${config.database}`);
            
            // List databases
            const dbResult = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname;');
            console.log('📊 Available databases:');
            dbResult.rows.forEach(row => console.log(`  - ${row.datname}`));
            
            // If connected to the right database, list tables
            if (config.database === 'Housy') {
                const tablesResult = await client.query(`
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    ORDER BY table_name;
                `);
                
                console.log('\n📋 Tables in Housy database:');
                tablesResult.rows.forEach(row => console.log(`  - ${row.table_name}`));
                
                // Count records in each table
                console.log('\n📊 Record counts:');
                for (const table of tablesResult.rows) {
                    try {
                        const countResult = await client.query(`SELECT COUNT(*) as count FROM ${table.table_name};`);
                        console.log(`  - ${table.table_name}: ${countResult.rows[0].count} records`);
                    } catch (err) {
                        console.log(`  - ${table.table_name}: Unable to count (${err.message})`);
                    }
                }
            }
            
            await client.end();
            break; // Success, exit loop
            
        } catch (error) {
            console.log(`❌ Connection failed: ${error.message}`);
            if (i === connectionConfigs.length - 1) {
                console.log('\n💡 All connection attempts failed. Please check:');
                console.log('   - PostgreSQL service is running');
                console.log('   - Database "Housy" exists');
                console.log('   - Username/password are correct');
                console.log('   - Port 5432 is accessible');
            }
        }
    }
}

testDatabaseConnection().catch(console.error);
