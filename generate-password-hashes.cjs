// Create test users with known passwords
const bcrypt = require('bcryptjs');

async function createPasswordHashes() {
    try {
        console.log('Generating password hashes...');
        const saltRounds = 12;
        
        const passwords = {
            'admin123': await bcrypt.hash('admin123', saltRounds),
            'client123': await bcrypt.hash('client123', saltRounds),
            'taher123': await bcrypt.hash('taher123', saltRounds),
            'password123': await bcrypt.hash('password123', saltRounds)
        };
        
        console.log('Password hashes generated:');
        console.log('==========================');
        
        for (const [plaintext, hash] of Object.entries(passwords)) {
            console.log(`${plaintext} -> ${hash}`);
        }
        
        // Generate SQL update statements
        console.log('\nSQL UPDATE statements:');
        console.log('=====================');
        console.log(`UPDATE users SET password = '${passwords['admin123']}' WHERE username = 'admin';`);
        console.log(`UPDATE users SET password = '${passwords['client123']}' WHERE username = 'client1';`);
        console.log(`UPDATE users SET password = '${passwords['taher123']}' WHERE username = 'taher';`);
        console.log(`UPDATE users SET password = '${passwords['admin123']}' WHERE username = 'super_admin';`);
        console.log(`UPDATE users SET password = '${passwords['client123']}' WHERE username = 'client2';`);
        
        // Test verification
        console.log('\nTesting verification:');
        console.log('====================');
        console.log('admin123:', await bcrypt.compare('admin123', passwords['admin123']));
        console.log('client123:', await bcrypt.compare('client123', passwords['client123']));
        console.log('taher123:', await bcrypt.compare('taher123', passwords['taher123']));
        
        console.log('\nDone!');
    } catch (error) {
        console.error('Error:', error);
    }
}

createPasswordHashes();
