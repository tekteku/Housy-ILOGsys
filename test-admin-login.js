/**
 * Test rapide de connexion admin après résolution du problème de port
 */

import pkg from 'pg';
import bcrypt from 'bcryptjs';
const { Client } = pkg;

async function testAdminLogin() {
  console.log('🔐 TEST DE CONNEXION ADMINISTRATEUR HOUSY');
  console.log('=========================================');

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
    console.log('✅ Base de données connectée');

    // Vérifier et mettre à jour les mots de passe admin
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Mettre à jour les comptes admin
    await client.query(`
      UPDATE users 
      SET password = $1 
      WHERE username IN ('admin', 'taher', 'super_admin')
    `, [hashedPassword]);

    // Vérifier les utilisateurs admin
    const admins = await client.query(`
      SELECT username, email, role, full_name 
      FROM users 
      WHERE role IN ('admin', 'super_admin')
      ORDER BY username
    `);

    console.log('\n👑 COMPTES ADMINISTRATEUR PRÊTS :');
    console.log('=================================');
    admins.rows.forEach(admin => {
      console.log(`✅ ${admin.username} (${admin.full_name})`);
      console.log(`   📧 ${admin.email}`);
      console.log(`   🏷️  ${admin.role.toUpperCase()}`);
      console.log('   🔑 Mot de passe: admin123');
      console.log('');
    });

    console.log('🚀 INSTRUCTIONS DE DÉMARRAGE :');
    console.log('==============================');
    console.log('1. Exécuter: .\\demarrer-housy.bat');
    console.log('2. Aller à: http://localhost:5173');
    console.log('3. Se connecter avec: admin / admin123');
    console.log('');
    console.log('🎯 PAGES ADMIN À TESTER :');
    console.log('========================');
    console.log('🖥️  /admin/system-control');
    console.log('🛡️  /admin/security-audit');
    console.log('💰 /admin/financial-management');
    console.log('🎓 /admin/training-support');

    await client.end();

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n💡 Vérifiez que PostgreSQL est démarré et que la base de données "Housy" existe.');
  }
}

testAdminLogin();
