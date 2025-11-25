#!/usr/bin/env node

import pg from 'pg';

const dbConfig = {
  user: 'postgres',
  password: '0000',
  host: 'localhost',
  port: 5432,
  database: 'housy_tunisia',
  ssl: false
};

async function checkTableStructure() {
  const client = new pg.Client(dbConfig);
  
  try {
    await client.connect();
    console.log('✅ Connexion réussie à PostgreSQL');

    // Vérifier la structure de la table materials
    const structure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'materials' 
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 Structure de la table "materials":');
    structure.rows.forEach(row => {
      console.log(`   • ${row.column_name} (${row.data_type}) - ${row.is_nullable === 'YES' ? 'nullable' : 'not null'}`);
    });

    // Compter les matériaux existants
    const count = await client.query('SELECT COUNT(*) FROM materials');
    console.log(`\n📊 Matériaux actuels en base: ${count.rows[0].count}`);

    if (count.rows[0].count > 0) {
      const samples = await client.query('SELECT * FROM materials LIMIT 3');
      console.log('\n📋 Exemples de matériaux existants:');
      samples.rows.forEach((row, i) => {
        console.log(`   ${i+1}. ${JSON.stringify(row, null, 2)}`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
  }
}

checkTableStructure().catch(console.error);
