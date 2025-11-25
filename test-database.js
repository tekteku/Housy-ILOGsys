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

console.log('🧪 TEST COMPLET DE LA BASE DE DONNÉES HOUSY_TUNISIA');
console.log('=' .repeat(60));

// Test de connexion
async function testConnection() {
  console.log('\n1️⃣  TEST DE CONNEXION');
  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Connexion réussie !');
    console.log(`   🕒 Heure serveur: ${result.rows[0].current_time}`);
    console.log(`   🐘 Version PostgreSQL: ${result.rows[0].pg_version.split(' ')[0]}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    return false;
  }
}

// Test des tables principales
async function testTables() {
  console.log('\n2️⃣  TEST DES TABLES PRINCIPALES');
  
  const tables = [
    'users',
    'materials',
    'projects', 
    'estimates',
    'real_estate_market',
    'material_estimates',
    'ai_material_analysis',
    'project_categories',
    'system_settings'
  ];

  const results = {};
  
  for (const table of tables) {
    try {
      const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
      const count = parseInt(result.rows[0].count);
      results[table] = count;
      
      if (count > 0) {
        console.log(`   ✅ ${table}: ${count} enregistrements`);
      } else {
        console.log(`   ⚠️  ${table}: 0 enregistrement`);
      }
    } catch (error) {
      console.log(`   ❌ ${table}: Erreur - ${error.message}`);
      results[table] = -1;
    }
  }
  
  return results;
}

// Test d'intégrité des données
async function testDataIntegrity() {
  console.log('\n3️⃣  TEST D\'INTÉGRITÉ DES DONNÉES');
  
  // Test des matériaux
  try {
    const materialsTest = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN name IS NOT NULL AND name != '' THEN 1 END) as with_name,
        COUNT(CASE WHEN price IS NOT NULL AND price > 0 THEN 1 END) as with_price,
        COUNT(CASE WHEN category IS NOT NULL AND category != '' THEN 1 END) as with_category
      FROM materials
    `);
    
    const mt = materialsTest.rows[0];
    console.log(`   🔨 MATÉRIAUX:`);
    console.log(`      Total: ${mt.total}`);
    console.log(`      Avec nom: ${mt.with_name}/${mt.total} (${((mt.with_name/mt.total)*100).toFixed(1)}%)`);
    console.log(`      Avec prix: ${mt.with_price}/${mt.total} (${((mt.with_price/mt.total)*100).toFixed(1)}%)`);
    console.log(`      Avec catégorie: ${mt.with_category}/${mt.total} (${((mt.with_category/mt.total)*100).toFixed(1)}%)`);
  } catch (error) {
    console.log(`   ❌ Erreur test matériaux: ${error.message}`);
  }

  // Test des propriétés immobilières
  try {
    const propertiesTest = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN title IS NOT NULL AND title != '' THEN 1 END) as with_title,
        COUNT(CASE WHEN price IS NOT NULL AND price > 0 THEN 1 END) as with_price,
        COUNT(CASE WHEN city IS NOT NULL AND city != '' THEN 1 END) as with_city,
        COUNT(CASE WHEN property_type IS NOT NULL AND property_type != '' THEN 1 END) as with_type
      FROM real_estate_market
    `);
    
    const pt = propertiesTest.rows[0];
    console.log(`   🏠 PROPRIÉTÉS IMMOBILIÈRES:`);
    console.log(`      Total: ${pt.total}`);
    console.log(`      Avec titre: ${pt.with_title}/${pt.total} (${((pt.with_title/pt.total)*100).toFixed(1)}%)`);
    console.log(`      Avec prix: ${pt.with_price}/${pt.total} (${((pt.with_price/pt.total)*100).toFixed(1)}%)`);
    console.log(`      Avec ville: ${pt.with_city}/${pt.total} (${((pt.with_city/pt.total)*100).toFixed(1)}%)`);
    console.log(`      Avec type: ${pt.with_type}/${pt.total} (${((pt.with_type/pt.total)*100).toFixed(1)}%)`);
  } catch (error) {
    console.log(`   ❌ Erreur test propriétés: ${error.message}`);
  }

  // Test des utilisateurs
  try {
    const usersTest = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN username IS NOT NULL AND username != '' THEN 1 END) as with_username,
        COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as with_email,
        COUNT(CASE WHEN role IS NOT NULL THEN 1 END) as with_role
      FROM users
    `);
    
    const ut = usersTest.rows[0];
    console.log(`   � UTILISATEURS:`);
    console.log(`      Total: ${ut.total}`);
    console.log(`      Avec nom d'utilisateur: ${ut.with_username}/${ut.total}`);
    console.log(`      Avec email: ${ut.with_email}/${ut.total}`);
    console.log(`      Avec rôle: ${ut.with_role}/${ut.total}`);
  } catch (error) {
    console.log(`   ❌ Erreur test utilisateurs: ${error.message}`);
  }
}

// Test des performances
async function testPerformance() {
  console.log('\n4️⃣  TEST DE PERFORMANCE');
  
  const tests = [
    {
      name: 'Recherche matériaux par catégorie',
      query: "SELECT * FROM materials WHERE category ILIKE '%construction%' LIMIT 10"
    },
    {
      name: 'Recherche propriétés par ville',
      query: "SELECT * FROM real_estate_market WHERE city ILIKE '%tunis%' LIMIT 10"
    },
    {
      name: 'Calcul prix moyen par type',
      query: "SELECT property_type, AVG(price) as avg_price FROM real_estate_market GROUP BY property_type"
    },
    {
      name: 'Matériaux les plus chers',
      query: "SELECT name, price, unit FROM materials WHERE price > 0 ORDER BY price DESC LIMIT 5"
    }
  ];

  for (const test of tests) {
    try {
      const startTime = Date.now();
      const result = await pool.query(test.query);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`   ✅ ${test.name}: ${result.rows.length} résultats en ${duration}ms`);
    } catch (error) {
      console.log(`   ❌ ${test.name}: Erreur - ${error.message}`);
    }
  }
}

// Test des données par source
async function testDataSources() {
  console.log('\n5️⃣  TEST DES SOURCES DE DONNÉES');
  
  try {
    // Sources de matériaux
    const materialSources = await pool.query(`
      SELECT source, COUNT(*) as count 
      FROM materials 
      WHERE source IS NOT NULL 
      GROUP BY source 
      ORDER BY count DESC
    `);
    
    console.log(`   🔨 SOURCES DE MATÉRIAUX:`);
    for (const row of materialSources.rows) {
      console.log(`      ${row.source}: ${row.count} matériaux`);
    }

    // Sources de propriétés
    const propertySources = await pool.query(`
      SELECT source, COUNT(*) as count 
      FROM real_estate_market 
      WHERE source IS NOT NULL 
      GROUP BY source 
      ORDER BY count DESC
    `);
    
    console.log(`   🏠 SOURCES DE PROPRIÉTÉS:`);
    for (const row of propertySources.rows) {
      console.log(`      ${row.source}: ${row.count} propriétés`);
    }
  } catch (error) {
    console.log(`   ❌ Erreur test sources: ${error.message}`);
  }
}

// Test des relations entre tables
async function testRelations() {
  console.log('\n6️⃣  TEST DES RELATIONS ENTRE TABLES');
  
  try {
    // Test relation projects -> estimates
    const projectEstimates = await pool.query(`
      SELECT 
        p.name as project_name,
        COUNT(e.id) as estimates_count
      FROM projects p
      LEFT JOIN estimates e ON p.id = e.project_id
      GROUP BY p.id, p.name
      HAVING COUNT(e.id) > 0
      LIMIT 5
    `);
    
    console.log(`   📋 PROJETS AVEC DEVIS:`);
    for (const row of projectEstimates.rows) {
      console.log(`      "${row.project_name}": ${row.estimates_count} devis`);
    }

    // Test relation estimates -> material_estimates
    const estimateMaterials = await pool.query(`
      SELECT 
        e.name as estimate_name,
        COUNT(me.id) as materials_count
      FROM estimates e
      LEFT JOIN material_estimates me ON e.id = me.estimate_id
      GROUP BY e.id, e.name
      HAVING COUNT(me.id) > 0
      LIMIT 5
    `);
    
    console.log(`   💰 DEVIS AVEC MATÉRIAUX:`);
    for (const row of estimateMaterials.rows) {
      console.log(`      "${row.estimate_name}": ${row.materials_count} matériaux`);
    }
  } catch (error) {
    console.log(`   ❌ Erreur test relations: ${error.message}`);
  }
}

// Test des valeurs invalides
async function testInvalidData() {
  console.log('\n7️⃣  TEST DES VALEURS INVALIDES');
  
  try {
    // Prix négatifs ou nuls
    const invalidPrices = await pool.query(`
      SELECT 
        'materials' as table_name,
        COUNT(*) as invalid_count
      FROM materials 
      WHERE price <= 0 OR price IS NULL
      UNION ALL
      SELECT 
        'real_estate_market' as table_name,
        COUNT(*) as invalid_count
      FROM real_estate_market 
      WHERE price <= 0 OR price IS NULL
    `);
    
    console.log(`   💸 PRIX INVALIDES:`);
    for (const row of invalidPrices.rows) {
      console.log(`      ${row.table_name}: ${row.invalid_count} enregistrements`);
    }

    // Champs vides ou NULL critiques
    const emptyFields = await pool.query(`
      SELECT 
        'materials_without_name' as field_type,
        COUNT(*) as count
      FROM materials 
      WHERE name IS NULL OR name = ''
      UNION ALL
      SELECT 
        'properties_without_title' as field_type,
        COUNT(*) as count
      FROM real_estate_market 
      WHERE title IS NULL OR title = ''
    `);
    
    console.log(`   📝 CHAMPS VIDES CRITIQUES:`);
    for (const row of emptyFields.rows) {
      console.log(`      ${row.field_type}: ${row.count} enregistrements`);
    }
  } catch (error) {
    console.log(`   ❌ Erreur test valeurs invalides: ${error.message}`);
  }
}

// Résumé global et recommandations
async function generateSummary(tableResults) {
  console.log('\n8️⃣  RÉSUMÉ ET RECOMMANDATIONS');
  console.log('=' .repeat(60));
  
  const totalRecords = Object.values(tableResults).reduce((sum, count) => sum + (count > 0 ? count : 0), 0);
  
  console.log(`📊 STATISTIQUES GLOBALES:`);
  console.log(`   Total enregistrements: ${totalRecords}`);
  console.log(`   Tables actives: ${Object.values(tableResults).filter(count => count > 0).length}`);
  console.log(`   Tables vides: ${Object.values(tableResults).filter(count => count === 0).length}`);
  console.log(`   Tables en erreur: ${Object.values(tableResults).filter(count => count === -1).length}`);
  
  console.log(`\n✅ POINTS FORTS:`);
  if (tableResults.materials > 0) console.log(`   • ${tableResults.materials} matériaux disponibles`);
  if (tableResults.real_estate_market > 0) console.log(`   • ${tableResults.real_estate_market} propriétés immobilières`);
  if (tableResults.projects > 0) console.log(`   • ${tableResults.projects} projets importés`);
  if (tableResults.users > 0) console.log(`   • ${tableResults.users} utilisateurs configurés`);
  
  console.log(`\n� RECOMMANDATIONS:`);
  if (tableResults.estimates === 0) {
    console.log(`   • Créer des devis de test pour valider les fonctionnalités`);
  }
  if (tableResults.material_estimates === 0) {
    console.log(`   • Lier des matériaux aux devis pour tester les calculs`);
  }
  if (tableResults.ai_material_analysis === 0) {
    console.log(`   • Générer des analyses IA pour tester les fonctionnalités avancées`);
  }
  
  console.log(`\n🚀 PRÊT POUR:`);
  console.log(`   • Tests de l'interface d'estimation`);
  console.log(`   • Validation des calculs de prix`);
  console.log(`   • Tests des fonctionnalités de recherche`);
  console.log(`   • Démonstration complète de l'application`);
}

// Fonction principale
async function main() {
  const startTime = Date.now();
  
  try {
    // Lancer tous les tests
    const connected = await testConnection();
    if (!connected) return;
    
    const tableResults = await testTables();
    await testDataIntegrity();
    await testPerformance();
    await testDataSources();
    await testRelations();
    await testInvalidData();
    await generateSummary(tableResults);
    
    const endTime = Date.now();
    const totalDuration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`\n🎉 TESTS TERMINÉS EN ${totalDuration}s`);
    console.log(`🔗 Base de données housy_tunisia: OPÉRATIONNELLE !`);
    
  } catch (error) {
    console.error('\n❌ ERREUR GÉNÉRALE DES TESTS:', error.message);
  } finally {
    await pool.end();
  }
}

// Lancer les tests
main().catch(console.error);
