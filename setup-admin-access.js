/**
 * Script pour gérer les utilisateurs admin existants
 */

import pkg from 'pg';
import bcrypt from 'bcryptjs';
const { Client } = pkg;

const client = new Client({
  user: 'postgres',
  password: '0000',
  host: 'localhost',
  port: 5432, 
  database: 'Housy',
  ssl: false
});

async function setupAdminAccess() {
  try {
    await client.connect();
    console.log('✅ Connecté à la base de données Housy');
    
    // Vérifier les utilisateurs existants
    const existingUsers = await client.query('SELECT username, email, role, full_name FROM users ORDER BY role DESC');
    
    console.log('👥 Utilisateurs existants :');
    console.log('==========================');
    existingUsers.rows.forEach(user => {
      console.log(`${user.role.toUpperCase()}: ${user.full_name} (${user.username}) - ${user.email}`);
    });
    
    // Créer des mots de passe connus pour les utilisateurs admin
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Mettre à jour le mot de passe de l'admin principal
    await client.query(`
      UPDATE users 
      SET password = $1 
      WHERE username = 'admin' OR username = 'taher'
    `, [hashedPassword]);
    
    // Mettre à jour le mot de passe du super_admin aussi
    await client.query(`
      UPDATE users 
      SET password = $1 
      WHERE username = 'super_admin'
    `, [hashedPassword]);
    
    // Créer un mot de passe pour les clients de test
    const clientPassword = await bcrypt.hash('client123', 10);
    await client.query(`
      UPDATE users 
      SET password = $1 
      WHERE role = 'client'
    `, [clientPassword]);
    
    console.log('\n🔑 MOTS DE PASSE MIS À JOUR :');
    console.log('=============================');
    console.log('👑 ADMINISTRATEURS :');
    console.log('   Username: admin');
    console.log('   Mot de passe: admin123');
    console.log('');
    console.log('   Username: taher');
    console.log('   Mot de passe: admin123');
    console.log('');
    console.log('   Username: super_admin');
    console.log('   Mot de passe: admin123');
    console.log('');
    console.log('👤 CLIENTS :');
    console.log('   Username: client1 ou client2');
    console.log('   Mot de passe: client123');
    console.log('');
    console.log('🌐 Accédez à http://localhost:5173 pour tester !');
    console.log('');
    console.log('📋 PAGES ADMIN EXCLUSIVES À TESTER :');
    console.log('   🖥️  /admin/system-control');
    console.log('   🛡️  /admin/security-audit');
    console.log('   💰 /admin/financial-management');
    console.log('   🎓 /admin/training-support');
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

setupAdminAccess();
