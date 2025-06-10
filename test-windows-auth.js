import pg from 'pg';

async function testWindowsAuth() {
    console.log('🔍 Testing Windows authentication...');
    
    const windowsAuthConfigs = [
        {
            host: 'localhost',
            port: 5432,
            database: 'Housy',
            user: process.env.USERNAME || 'TaherCh', // Windows username
            ssl: false
        },
        {
            host: 'localhost',
            port: 5432,
            database: 'postgres',
            user: process.env.USERNAME || 'TaherCh',
            ssl: false
        }
    ];
    
    for (const config of windowsAuthConfigs) {
        console.log(`\n🔗 Trying Windows auth for ${config.user} on ${config.database}...`);
        
        try {
            const client = new pg.Client(config);
            await client.connect();
            
            console.log(`✅ Windows authentication successful!`);
            
            const result = await client.query('SELECT current_user, current_database();');
            console.log(`📊 Connected as: ${result.rows[0].current_user}`);
            console.log(`📊 Database: ${result.rows[0].current_database}`);
            
            await client.end();
            return true;
            
        } catch (error) {
            console.log(`❌ Windows auth failed: ${error.message}`);
        }
    }
    
    console.log('\n💡 Windows authentication not available. You may need to:');
    console.log('   1. Set a password for postgres user');
    console.log('   2. Enable Windows authentication in pg_hba.conf');
    console.log('   3. Create a Windows user mapping');
    return false;
}

async function suggestPasswordReset() {
    console.log('\n🔧 To reset postgres password:');
    console.log('1. Option 1 - Using pgAdmin:');
    console.log('   - Open pgAdmin');
    console.log('   - Right-click on server > Properties > Connection');
    console.log('   - Check saved password or reset it');
    console.log('');
    console.log('2. Option 2 - Using Windows Services:');
    console.log('   - Stop PostgreSQL service');
    console.log('   - Start with --trust authentication');
    console.log('   - Reset password using ALTER USER');
    console.log('');
    console.log('3. Option 3 - Check installation notes:');
    console.log('   - Look for password in installation logs');
    console.log('   - Default might be your Windows username');
}

testWindowsAuth().then(success => {
    if (!success) {
        suggestPasswordReset();
    }
});
