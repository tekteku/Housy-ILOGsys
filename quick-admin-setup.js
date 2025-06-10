/**
 * Script simple pour créer un utilisateur admin
 */

import pkg from 'pg';
const { Client } = pkg;

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
  console.log('✅ Connecté à la base de données');
  
  // Créer table users si nécessaire
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'client',
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Hash simple du mot de passe (pour test seulement)
  const bcrypt = await import('bcryptjs');
  const hashedPassword = await bcrypt.default.hash('admin123', 10);
  
  // Insérer ou mettre à jour l'admin
  await client.query(`
    INSERT INTO users (email, password, role, first_name, last_name)
    VALUES ('admin@housy.tn', $1, 'admin', 'Admin', 'Housy')
    ON CONFLICT (email) DO UPDATE SET 
      password = $1, role = 'admin'
  `, [hashedPassword]);

  console.log('🎯 UTILISATEUR ADMIN CRÉÉ !');
  console.log('📧 Email: admin@housy.tn');
  console.log('🔑 Mot de passe: admin123');
  
  await client.end();
} catch (error) {
  console.error('❌ Erreur:', error.message);
}
