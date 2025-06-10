/**
 * Vérification rapide des utilisateurs admin
 */

import pkg from 'pg';
const { Client } = pkg;

async function checkAdminUsers() {
  console.log('🔍 VÉRIFICATION DES COMPTES ADMINISTRATEUR HOUSY');
  console.log('===============================================');

  const client = new Client({
    user: 'postgres',
    password: '0000',
    host: 'localhost',
    port: 5432,
    database: 'Housy',
    ssl: false
  });

  try {
    await client.connect();
    console.log('✅ Connexion base de données réussie');

    // Lister tous les utilisateurs
    const users = await client.query(`
      SELECT username, email, role, full_name 
      FROM users 
      ORDER BY role DESC, username
    `);

    console.log('\n👥 UTILISATEURS DISPONIBLES :');
    console.log('==============================');

    users.rows.forEach(user => {
      const roleIcon = user.role === 'admin' || user.role === 'super_admin' ? '👑' : '👤';
      const roleColor = user.role === 'admin' || user.role === 'super_admin' ? 'ADMIN' : 'CLIENT';
      console.log(`${roleIcon} ${user.username} (${user.full_name})`);
      console.log(`   📧 ${user.email}`);
      console.log(`   🏷️  ${roleColor}`);
      console.log('');
    });

    console.log('🔐 IDENTIFIANTS POUR ACCÈS ADMINISTRATEUR :');
    console.log('==========================================');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('');
    console.log('OU');
    console.log('Username: taher');
    console.log('Password: admin123');
    console.log('');
    console.log('🌐 URL d\'accès : http://localhost:5173');

    await client.end();

  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.log('\n💡 Solutions possibles :');
    console.log('1. Vérifier que PostgreSQL est démarré');
    console.log('2. Vérifier les identifiants de connexion');
    console.log('3. Exécuter: npm run dev');
  }
}

checkAdminUsers();
