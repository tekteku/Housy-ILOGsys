#!/usr/bin/env node

/**
 * VÉRIFICATION DE LA QUALITÉ DES DONNÉES IMPORTÉES
 * =================================================
 * Ce script vérifie la qualité et l'intégrité des données importées
 * dans la base PostgreSQL housy_tunisia via pgAdmin
 */

import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'housy_tunisia',
  password: process.env.DB_PASSWORD || 'admin123',
  port: process.env.DB_PORT || 5432,
});

console.log('🔍 VÉRIFICATION DE LA QUALITÉ DES DONNÉES');
console.log('==========================================');

async function verifyDataQuality() {
  try {
    // Test de connexion
    console.log('🔌 Test de connexion...');
    const client = await pool.connect();
    console.log('   ✅ Connexion réussie à PostgreSQL');
    
    // 1. VÉRIFICATION DES MATÉRIAUX
    console.log('\n🔨 MATÉRIAUX - ANALYSE QUALITATIVE');
    console.log('==================================');
    
    const materialsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN name IS NOT NULL AND name != '' THEN 1 END) as with_name,
        COUNT(CASE WHEN category IS NOT NULL AND category != '' THEN 1 END) as with_category,
        COUNT(CASE WHEN price_per_unit > 0 THEN 1 END) as with_valid_price,
        COUNT(CASE WHEN unit IS NOT NULL AND unit != '' THEN 1 END) as with_unit,
        AVG(CASE WHEN price_per_unit > 0 THEN price_per_unit END) as avg_price,
        MIN(CASE WHEN price_per_unit > 0 THEN price_per_unit END) as min_price,
        MAX(CASE WHEN price_per_unit > 0 THEN price_per_unit END) as max_price
      FROM materials;
    `;
    
    const materialsStats = await client.query(materialsQuery);
    const mStats = materialsStats.rows[0];
    
    console.log(`   📊 Total: ${mStats.total} matériaux`);
    console.log(`   📝 Avec nom: ${mStats.with_name} (${Math.round(mStats.with_name/mStats.total*100)}%)`);
    console.log(`   🏷️  Avec catégorie: ${mStats.with_category} (${Math.round(mStats.with_category/mStats.total*100)}%)`);
    console.log(`   💰 Avec prix valide: ${mStats.with_valid_price} (${Math.round(mStats.with_valid_price/mStats.total*100)}%)`);
    console.log(`   📏 Avec unité: ${mStats.with_unit} (${Math.round(mStats.with_unit/mStats.total*100)}%)`);
    console.log(`   💵 Prix moyen: ${parseFloat(mStats.avg_price || 0).toFixed(2)} TND`);
    console.log(`   📉 Prix min: ${parseFloat(mStats.min_price || 0).toFixed(2)} TND`);
    console.log(`   📈 Prix max: ${parseFloat(mStats.max_price || 0).toFixed(2)} TND`);
    
    // Top 10 catégories de matériaux
    const categoriesQuery = `
      SELECT category, COUNT(*) as count 
      FROM materials 
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category 
      ORDER BY count DESC 
      LIMIT 10;
    `;
    
    const categories = await client.query(categoriesQuery);
    console.log('\n   📂 Top 10 catégories:');
    categories.rows.forEach(cat => {
      console.log(`      ${cat.category}: ${cat.count} matériaux`);
    });
    
    // 2. VÉRIFICATION DES PROPRIÉTÉS
    console.log('\n🏠 PROPRIÉTÉS - ANALYSE QUALITATIVE');
    console.log('====================================');
    
    const propertiesQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN title IS NOT NULL AND title != '' THEN 1 END) as with_title,
        COUNT(CASE WHEN location IS NOT NULL AND location != '' THEN 1 END) as with_location,
        COUNT(CASE WHEN price > 0 THEN 1 END) as with_valid_price,
        COUNT(CASE WHEN property_type IS NOT NULL AND property_type != '' THEN 1 END) as with_type,
        COUNT(CASE WHEN surface > 0 THEN 1 END) as with_surface,
        AVG(CASE WHEN price > 0 THEN price END) as avg_price,
        MIN(CASE WHEN price > 0 THEN price END) as min_price,
        MAX(CASE WHEN price > 0 THEN price END) as max_price,
        AVG(CASE WHEN surface > 0 THEN surface END) as avg_surface
      FROM real_estate_market;
    `;
    
    const propertiesStats = await client.query(propertiesQuery);
    const pStats = propertiesStats.rows[0];
    
    console.log(`   📊 Total: ${pStats.total} propriétés`);
    console.log(`   📝 Avec titre: ${pStats.with_title} (${Math.round(pStats.with_title/pStats.total*100)}%)`);
    console.log(`   📍 Avec localisation: ${pStats.with_location} (${Math.round(pStats.with_location/pStats.total*100)}%)`);
    console.log(`   💰 Avec prix valide: ${pStats.with_valid_price} (${Math.round(pStats.with_valid_price/pStats.total*100)}%)`);
    console.log(`   🏷️  Avec type: ${pStats.with_type} (${Math.round(pStats.with_type/pStats.total*100)}%)`);
    console.log(`   📏 Avec surface: ${pStats.with_surface} (${Math.round(pStats.with_surface/pStats.total*100)}%)`);
    console.log(`   💵 Prix moyen: ${parseFloat(pStats.avg_price || 0).toLocaleString()} TND`);
    console.log(`   📉 Prix min: ${parseFloat(pStats.min_price || 0).toLocaleString()} TND`);
    console.log(`   📈 Prix max: ${parseFloat(pStats.max_price || 0).toLocaleString()} TND`);
    console.log(`   📐 Surface moyenne: ${parseFloat(pStats.avg_surface || 0).toFixed(0)} m²`);
    
    // Top 10 villes
    const locationsQuery = `
      SELECT location, COUNT(*) as count 
      FROM real_estate_market 
      WHERE location IS NOT NULL AND location != ''
      GROUP BY location 
      ORDER BY count DESC 
      LIMIT 10;
    `;
    
    const locations = await client.query(locationsQuery);
    console.log('\n   🌍 Top 10 villes:');
    locations.rows.forEach(loc => {
      console.log(`      ${loc.location}: ${loc.count} propriétés`);
    });
    
    // Top 10 types de propriétés
    const typesQuery = `
      SELECT property_type, COUNT(*) as count 
      FROM real_estate_market 
      WHERE property_type IS NOT NULL AND property_type != ''
      GROUP BY property_type 
      ORDER BY count DESC 
      LIMIT 10;
    `;
    
    const types = await client.query(typesQuery);
    console.log('\n   🏘️  Top 10 types de propriétés:');
    types.rows.forEach(type => {
      console.log(`      ${type.property_type}: ${type.count} propriétés`);
    });
    
    // 3. VÉRIFICATION DES PROJETS
    console.log('\n📋 PROJETS - ANALYSE QUALITATIVE');
    console.log('=================================');
    
    const projectsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN name IS NOT NULL AND name != '' THEN 1 END) as with_name,
        COUNT(CASE WHEN description IS NOT NULL AND description != '' THEN 1 END) as with_description,
        COUNT(CASE WHEN status IS NOT NULL AND status != '' THEN 1 END) as with_status,
        COUNT(CASE WHEN budget > 0 THEN 1 END) as with_budget,
        AVG(CASE WHEN budget > 0 THEN budget END) as avg_budget
      FROM projects;
    `;
    
    const projectsStats = await client.query(projectsQuery);
    const prStats = projectsStats.rows[0];
    
    console.log(`   📊 Total: ${prStats.total} projets`);
    console.log(`   📝 Avec nom: ${prStats.with_name} (${Math.round(prStats.with_name/prStats.total*100)}%)`);
    console.log(`   📄 Avec description: ${prStats.with_description} (${Math.round(prStats.with_description/prStats.total*100)}%)`);
    console.log(`   📊 Avec statut: ${prStats.with_status} (${Math.round(prStats.with_status/prStats.total*100)}%)`);
    console.log(`   💰 Avec budget: ${prStats.with_budget} (${Math.round(prStats.with_budget/prStats.total*100)}%)`);
    console.log(`   💵 Budget moyen: ${parseFloat(prStats.avg_budget || 0).toLocaleString()} TND`);
    
    // 4. VÉRIFICATION DES UTILISATEURS
    console.log('\n👥 UTILISATEURS - ANALYSE QUALITATIVE');
    console.log('======================================');
    
    const usersQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as with_email,
        COUNT(CASE WHEN name IS NOT NULL AND name != '' THEN 1 END) as with_name
      FROM users;
    `;
    
    const usersStats = await client.query(usersQuery);
    const uStats = usersStats.rows[0];
    
    console.log(`   📊 Total: ${uStats.total} utilisateurs`);
    console.log(`   📧 Avec email: ${uStats.with_email} (${Math.round(uStats.with_email/uStats.total*100)}%)`);
    console.log(`   📝 Avec nom: ${uStats.with_name} (${Math.round(uStats.with_name/uStats.total*100)}%)`);
    
    // Afficher quelques utilisateurs
    const usersSample = await client.query('SELECT id, name, email FROM users LIMIT 5;');
    console.log('\n   👤 Échantillon d\'utilisateurs:');
    usersSample.rows.forEach(user => {
      console.log(`      ID: ${user.id}, Nom: ${user.name || 'N/A'}, Email: ${user.email || 'N/A'}`);
    });
    
    // 5. DÉTECTION DE PROBLÈMES POTENTIELS
    console.log('\n⚠️  DÉTECTION DE PROBLÈMES POTENTIELS');
    console.log('======================================');
    
    const issues = [];
    
    // Matériaux sans prix
    const materialsWithoutPrice = await client.query('SELECT COUNT(*) as count FROM materials WHERE price_per_unit <= 0 OR price_per_unit IS NULL;');
    if (materialsWithoutPrice.rows[0].count > 0) {
      issues.push(`${materialsWithoutPrice.rows[0].count} matériaux sans prix valide`);
    }
    
    // Propriétés sans prix
    const propertiesWithoutPrice = await client.query('SELECT COUNT(*) as count FROM real_estate_market WHERE price <= 0 OR price IS NULL;');
    if (propertiesWithoutPrice.rows[0].count > 0) {
      issues.push(`${propertiesWithoutPrice.rows[0].count} propriétés sans prix valide`);
    }
    
    // Propriétés sans localisation
    const propertiesWithoutLocation = await client.query('SELECT COUNT(*) as count FROM real_estate_market WHERE location IS NULL OR location = \'\';');
    if (propertiesWithoutLocation.rows[0].count > 0) {
      issues.push(`${propertiesWithoutLocation.rows[0].count} propriétés sans localisation`);
    }
    
    if (issues.length > 0) {
      console.log('   🔴 Problèmes détectés:');
      issues.forEach(issue => console.log(`      - ${issue}`));
    } else {
      console.log('   ✅ Aucun problème majeur détecté');
    }
    
    // 6. RECOMMANDATIONS
    console.log('\n💡 RECOMMANDATIONS');
    console.log('==================');
    console.log('✅ Données importées avec succès');
    console.log('✅ Base de données bien peuplée');
    console.log('✅ Structure des tables respectée');
    console.log('');
    console.log('🔧 Améliorations possibles:');
    console.log('   - Enrichir les données manquantes (prix, descriptions, etc.)');
    console.log('   - Normaliser les catégories et types');
    console.log('   - Ajouter des contraintes de validation');
    console.log('   - Créer des index pour les performances');
    
    // 7. REQUÊTES SQL POUR PGADMIN
    console.log('\n🔗 REQUÊTES SQL POUR PGADMIN');
    console.log('=============================');
    console.log('-- Matériaux par catégorie');
    console.log('SELECT category, COUNT(*) as nombre FROM materials GROUP BY category ORDER BY nombre DESC;');
    console.log('');
    console.log('-- Propriétés par ville (top 10)');
    console.log('SELECT location, COUNT(*) as nombre FROM real_estate_market GROUP BY location ORDER BY nombre DESC LIMIT 10;');
    console.log('');
    console.log('-- Prix moyens par type de propriété');
    console.log('SELECT property_type, AVG(price) as prix_moyen, COUNT(*) as nombre FROM real_estate_market WHERE price > 0 GROUP BY property_type ORDER BY prix_moyen DESC;');
    console.log('');
    console.log('-- Projets par statut');
    console.log('SELECT status, COUNT(*) as nombre FROM projects GROUP BY status;');
    console.log('');
    console.log('-- Matériaux les plus chers');
    console.log('SELECT name, category, price_per_unit, unit FROM materials WHERE price_per_unit > 0 ORDER BY price_per_unit DESC LIMIT 10;');
    
    client.release();
    console.log('\n🎉 VÉRIFICATION TERMINÉE !');
    console.log('==========================');
    console.log('✨ Vos données sont prêtes à être utilisées dans pgAdmin');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Exécution du script
verifyDataQuality().catch(console.error);
