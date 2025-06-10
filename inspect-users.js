/**
 * Vérification structure users
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
  
  // Voir toutes les tables
  const tables = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public'
  `);
  
  console.log('📋 Tables disponibles :');
  tables.rows.forEach(row => console.log(`- ${row.table_name}`));
  
  // Si users existe, voir sa structure
  if (tables.rows.some(row => row.table_name === 'users')) {
    const columns = await client.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    
    console.log('\n🏗️ Structure table users :');
    columns.rows.forEach(col => console.log(`- ${col.column_name}: ${col.data_type}`));
    
    // Voir les données existantes
    const data = await client.query('SELECT * FROM users LIMIT 3');
    console.log('\n📊 Données existantes :');
    console.log(data.rows);
  } else {
    console.log('\n❌ Table users n\'existe pas');
  }
  
  await client.end();
} catch (error) {
  console.error('❌ Erreur:', error.message);
}
