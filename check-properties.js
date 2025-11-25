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

async function checkProperties() {
  try {
    console.log('📊 STATISTIQUES DE LA BASE DE DONNÉES HOUSY_TUNISIA');
    console.log('=' .repeat(50));

    // Compter les propriétés
    const propertiesResult = await pool.query('SELECT COUNT(*) FROM real_estate_market');
    console.log(`🏠 PROPRIÉTÉS TOTALES: ${propertiesResult.rows[0].count}`);

    // Répartition par type
    const typeResult = await pool.query(`
      SELECT property_type, COUNT(*) as count 
      FROM real_estate_market 
      GROUP BY property_type 
      ORDER BY count DESC
    `);
    console.log('\n📊 Répartition par type:');
    typeResult.rows.forEach(row => {
      console.log(`   - ${row.property_type}: ${row.count}`);
    });

    // Répartition par ville
    const cityResult = await pool.query(`
      SELECT city, COUNT(*) as count 
      FROM real_estate_market 
      GROUP BY city 
      ORDER BY count DESC 
      LIMIT 10
    `);
    console.log('\n🏘️ Top 10 villes:');
    cityResult.rows.forEach(row => {
      console.log(`   - ${row.city}: ${row.count}`);
    });

    // Répartition par source
    const sourceResult = await pool.query(`
      SELECT source, COUNT(*) as count 
      FROM real_estate_market 
      GROUP BY source 
      ORDER BY count DESC
    `);
    console.log('\n🔗 Répartition par source:');
    sourceResult.rows.forEach(row => {
      console.log(`   - ${row.source}: ${row.count}`);
    });

    // Prix moyen par type
    const priceResult = await pool.query(`
      SELECT property_type, 
             ROUND(AVG(price)) as prix_moyen,
             MIN(price) as prix_min,
             MAX(price) as prix_max
      FROM real_estate_market 
      WHERE price IS NOT NULL
      GROUP BY property_type 
      ORDER BY prix_moyen DESC
    `);
    console.log('\n💰 Prix par type (TND):');
    priceResult.rows.forEach(row => {
      console.log(`   - ${row.property_type}: Moyen ${row.prix_moyen}, Min ${row.prix_min}, Max ${row.prix_max}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await pool.end();
  }
}

checkProperties();
