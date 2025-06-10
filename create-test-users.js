/**
 * Script simple pour créer un utilisateur admin - version compatible
 */

import pkg from 'pg';
const { Client } = pkg;

async function createAdmin() {
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
    console.log('✅ Connecté à la base de données Housy');
    
    // Vérifier si la table users existe, sinon la créer
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'client',
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Créer un hash simple du mot de passe
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash('admin123', 10);
    
    // Insérer l'utilisateur admin
    await client.query(`
      INSERT INTO users (email, password, role, name)
      VALUES ($1, $2, 'admin', 'Administrateur Housy')
      ON CONFLICT (email) DO UPDATE SET 
        password = EXCLUDED.password,
        role = 'admin',
        name = EXCLUDED.name
    `, ['admin@housy.tn', hashedPassword]);
    
    // Créer aussi un utilisateur client pour comparaison
    const clientPassword = await bcrypt.default.hash('client123', 10);
    await client.query(`
      INSERT INTO users (email, password, role, name)
      VALUES ($1, $2, 'client', 'Client Test')
      ON CONFLICT (email) DO UPDATE SET 
        password = EXCLUDED.password,
        role = 'client',
        name = EXCLUDED.name
    `, ['client@housy.tn', clientPassword]);
    
    console.log('🎯 UTILISATEURS CRÉÉS AVEC SUCCÈS !');
    console.log('==================================');
    console.log('👑 ADMINISTRATEUR :');
    console.log('   📧 Email: admin@housy.tn');
    console.log('   🔑 Mot de passe: admin123');
    console.log('');
    console.log('👤 CLIENT :');
    console.log('   📧 Email: client@housy.tn');
    console.log('   🔑 Mot de passe: client123');
    console.log('');
    console.log('🌐 Accédez à http://localhost:5173 pour vous connecter !');
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('Détails:', error);
  }
}

createAdmin();
