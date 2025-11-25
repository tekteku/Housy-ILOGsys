#!/usr/bin/env node

/**
 * VÉRIFICATION RAPIDE DES DONNÉES PGADMIN
 * =======================================
 * Ce script vérifie rapidement les données importées dans pgAdmin
 */

import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();

// Configuration directe avec l'URL de la base
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:0000@localhost:5432/housy_tunisia';
const pool = new Pool({ connectionString });

console.log('🔍 VÉRIFICATION RAPIDE PGADMIN');
console.log('==============================');

async function quickCheck() {
  let client;
  try {
    console.log('🔌 Connexion à PostgreSQL...');
    client = await pool.connect();
    console.log('   ✅ Connexion réussie !');
    
    // Test simple des données
    console.log('\n📊 COMPTAGE DES DONNÉES:');
    console.log('========================');
    
    // Matériaux
    const materials = await client.query('SELECT COUNT(*) as count FROM materials;');
    console.log(`🔨 Matériaux: ${materials.rows[0].count}`);
    
    // Propriétés 
    const properties = await client.query('SELECT COUNT(*) as count FROM real_estate_market;');
    console.log(`🏠 Propriétés: ${properties.rows[0].count}`);
    
    // Projets
    const projects = await client.query('SELECT COUNT(*) as count FROM projects;');
    console.log(`📋 Projets: ${projects.rows[0].count}`);
    
    // Utilisateurs
    const users = await client.query('SELECT COUNT(*) as count FROM users;');
    console.log(`👥 Utilisateurs: ${users.rows[0].count}`);
    
    // Échantillons de données
    console.log('\n📄 ÉCHANTILLONS:');
    console.log('================');
    
    // Matériaux
    const sampleMaterials = await client.query('SELECT name, category, price_per_unit, unit FROM materials WHERE name IS NOT NULL LIMIT 5;');
    console.log('🔨 Matériaux (échantillon):');
    sampleMaterials.rows.forEach((mat, i) => {
      console.log(`   ${i+1}. ${mat.name} (${mat.category}) - ${mat.price_per_unit} TND/${mat.unit}`);
    });
    
    // Propriétés
    const sampleProperties = await client.query('SELECT title, location, price, property_type FROM real_estate_market WHERE title IS NOT NULL LIMIT 5;');
    console.log('\n🏠 Propriétés (échantillon):');
    sampleProperties.rows.forEach((prop, i) => {
      console.log(`   ${i+1}. ${prop.title} (${prop.property_type}) - ${prop.location} - ${parseFloat(prop.price).toLocaleString()} TND`);
    });
    
    // Projets
    const sampleProjects = await client.query('SELECT name, status, budget FROM projects WHERE name IS NOT NULL LIMIT 5;');
    console.log('\n📋 Projets (échantillon):');
    sampleProjects.rows.forEach((proj, i) => {
      console.log(`   ${i+1}. ${proj.name} (${proj.status}) - ${parseFloat(proj.budget || 0).toLocaleString()} TND`);
    });
    
    // Statistiques par catégorie
    console.log('\n📈 STATISTIQUES:');
    console.log('================');
    
    // Top 5 catégories de matériaux
    const topCategories = await client.query(`
      SELECT category, COUNT(*) as count 
      FROM materials 
      WHERE category IS NOT NULL 
      GROUP BY category 
      ORDER BY count DESC 
      LIMIT 5
    `);
    console.log('🔨 Top 5 catégories matériaux:');
    topCategories.rows.forEach((cat, i) => {
      console.log(`   ${i+1}. ${cat.category}: ${cat.count} matériaux`);
    });
    
    // Top 5 villes
    const topCities = await client.query(`
      SELECT location, COUNT(*) as count 
      FROM real_estate_market 
      WHERE location IS NOT NULL 
      GROUP BY location 
      ORDER BY count DESC 
      LIMIT 5
    `);
    console.log('\n🌍 Top 5 villes:');
    topCities.rows.forEach((city, i) => {
      console.log(`   ${i+1}. ${city.location}: ${city.count} propriétés`);
    });
    
    // Prix moyens
    const avgPrices = await client.query(`
      SELECT 
        AVG(price_per_unit) as avg_material_price,
        AVG(price) as avg_property_price
      FROM materials, real_estate_market
      WHERE materials.price_per_unit > 0 AND real_estate_market.price > 0
    `);
    console.log('\n💰 Prix moyens:');
    console.log(`   🔨 Matériaux: ${parseFloat(avgPrices.rows[0].avg_material_price || 0).toFixed(2)} TND/unité`);
    console.log(`   🏠 Propriétés: ${parseFloat(avgPrices.rows[0].avg_property_price || 0).toLocaleString()} TND`);
    
    console.log('\n✅ IMPORT RÉUSSI !');
    console.log('==================');
    console.log('🎉 Toutes vos données sont maintenant dans pgAdmin');
    console.log('🔗 Vous pouvez les consulter avec ces requêtes SQL :');
    console.log('');
    console.log('-- Voir tous les matériaux');
    console.log('SELECT * FROM materials ORDER BY name;');
    console.log('');
    console.log('-- Voir toutes les propriétés');
    console.log('SELECT * FROM real_estate_market ORDER BY price DESC;');
    console.log('');
    console.log('-- Voir tous les projets');
    console.log('SELECT * FROM projects ORDER BY name;');
    console.log('');
    console.log('-- Statistiques par ville');
    console.log('SELECT location, COUNT(*), AVG(price) as prix_moyen FROM real_estate_market GROUP BY location ORDER BY COUNT(*) DESC;');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n🔧 Solutions possibles:');
    console.log('   1. Vérifiez que PostgreSQL est démarré');
    console.log('   2. Vérifiez que pgAdmin est connecté');
    console.log('   3. Vérifiez le mot de passe dans .env');
    console.log('   4. Vérifiez que la base housy_tunisia existe');
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Exécution
quickCheck().catch(console.error);
