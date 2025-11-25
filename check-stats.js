#!/usr/bin/env node

import pkg from 'pg';
const { Pool } = pkg;

// Configuration de la base de données
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'housy_tunisia',
  user: 'postgres',
  password: '0000',
  ssl: false
});

async function checkStats() {
  try {
    console.log('📊 Vérification des statistiques actuelles...');
    
    // Propriétés
    const propertiesResult = await pool.query('SELECT COUNT(*) FROM real_estate_market');
    console.log(`🏠 Propriétés: ${propertiesResult.rows[0].count}`);
    
    // Matériaux
    const materialsResult = await pool.query('SELECT COUNT(*) FROM materials');
    console.log(`🔨 Matériaux: ${materialsResult.rows[0].count}`);
    
    // Projets
    const projectsResult = await pool.query('SELECT COUNT(*) FROM projects');
    console.log(`📋 Projets: ${projectsResult.rows[0].count}`);
    
    // Utilisateurs
    const usersResult = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`👥 Utilisateurs: ${usersResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await pool.end();
  }
}

checkStats();
