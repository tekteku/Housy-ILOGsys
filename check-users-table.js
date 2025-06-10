/**
 * Vérification de la structure de la table users
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
  
  // Vérifier la structure de la table users
  const columns = await client.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'users'
    ORDER BY ordinal_position;
  `);
  
  console.log('📋 Structure de la table users :');
  console.log('================================');
  columns.rows.forEach(col => {
    console.log(`${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
  });
  
  // Vérifier les utilisateurs existants
  const users = await client.query('SELECT * FROM users LIMIT 5');
  console.log('\n👥 Utilisateurs existants :');
  console.log('==========================');
  console.log(users.rows);
  
  await client.end();
} catch (error) {
  console.error('❌ Erreur:', error.message);
}
