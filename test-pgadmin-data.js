#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration de la base de données
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'housy_tunisia',
  user: 'postgres',
  password: '0000',
  ssl: false
});

const ATTACHED_ASSETS_PATH = path.join(__dirname, 'attached_asset');

console.log('🔍 TEST COMPLET DES DONNÉES DANS PGADMIN');
console.log('==========================================\n');

// Fonction pour lire les fichiers JSON
function readJsonFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return { error: `Fichier non trouvé: ${filePath}` };
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return { error: `Erreur lecture: ${error.message}` };
  }
}

// Fonction pour compter les entrées dans les fichiers source
function countSourceData() {
  console.log('📁 ANALYSE DES FICHIERS SOURCE (attached_asset)');
  console.log('================================================\n');

  const files = {
    materiaux: [
      'catalogue_estimation_materiaux_complet.json',
      'catalogue_estimation_materiaux_resume.json',
      'materiaux_construction_tunisie.json',
      'materiaux_prix_tunisie.json'
    ],
    proprietes: [
      'proprietes_consolidees_resume.json',
      'proprietes_tecnocasa_tn.json',
      'proprietes_mubawab_tn.json',
      'proprietes_remax_com_tn.json'
    ],
    projets: [
      'projets_exemple.json',
      'projets_tunisie.json',
      'exemples_projets_construction.json'
    ],
    analyses: [
      'analyses_ia_immobilier.json',
      'analyses_predictions_marche.json',
      'estimations_prix_exemple.json'
    ],
    autres: [
      'users_exemple.json',
      'clients_exemple.json',
      'rapport_marche_immobilier.json'
    ]
  };

  const sourceCounts = {};

  Object.keys(files).forEach(category => {
    console.log(`📂 ${category.toUpperCase()}:`);
    sourceCounts[category] = 0;
    
    files[category].forEach(file => {
      const filePath = path.join(ATTACHED_ASSETS_PATH, file);
      const data = readJsonFile(filePath);
      
      if (data.error) {
        console.log(`   ❌ ${file}: ${data.error}`);
        return;
      }

      let count = 0;
      if (Array.isArray(data)) {
        count = data.length;
      } else if (data.materiaux) {
        count = Array.isArray(data.materiaux) ? data.materiaux.length : 0;
      } else if (data.proprietes) {
        count = Array.isArray(data.proprietes) ? data.proprietes.length : 0;
      } else if (data.proprietes_echantillon) {
        count = Array.isArray(data.proprietes_echantillon) ? data.proprietes_echantillon.length : 0;
      } else if (data.projets) {
        count = Array.isArray(data.projets) ? data.projets.length : 0;
      } else if (data.analyses) {
        count = Array.isArray(data.analyses) ? data.analyses.length : 0;
      } else if (data.users) {
        count = Array.isArray(data.users) ? data.users.length : 0;
      } else if (typeof data === 'object') {
        count = Object.keys(data).length;
      }

      sourceCounts[category] += count;
      console.log(`   📄 ${file}: ${count} entrées`);
    });
    
    console.log(`   📊 Total ${category}: ${sourceCounts[category]} entrées\n`);
  });

  return sourceCounts;
}

// Test complet de la base de données
async function testDatabase() {
  console.log('🗄️  TEST DES DONNÉES EN BASE DE DONNÉES');
  console.log('========================================\n');

  try {
    // Test de connexion
    console.log('🔌 Test de connexion...');
    const connectionTest = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log(`   ✅ Connexion réussie à PostgreSQL`);
    console.log(`   🕐 Heure serveur: ${connectionTest.rows[0].current_time}`);
    console.log(`   📦 Version: ${connectionTest.rows[0].pg_version.split(' ')[0]}\n`);

    // Vérifier l'existence des tables
    console.log('📋 Vérification des tables...');
    const tablesQuery = `
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    const tablesResult = await pool.query(tablesQuery);
    
    console.log(`   📊 ${tablesResult.rows.length} tables trouvées:`);
    tablesResult.rows.forEach(table => {
      console.log(`   📋 ${table.table_name} (${table.column_count} colonnes)`);
    });

    // Statistiques détaillées par table
    console.log('\n📈 STATISTIQUES DÉTAILLÉES PAR TABLE');
    console.log('=====================================\n');

    // Table materials
    if (tablesResult.rows.some(t => t.table_name === 'materials')) {
      console.log('🔨 TABLE MATERIALS:');
      
      const materialsCount = await pool.query('SELECT COUNT(*) FROM materials');
      console.log(`   📊 Total: ${materialsCount.rows[0].count} matériaux`);

      const materialsByCategory = await pool.query(`
        SELECT category, COUNT(*) as count 
        FROM materials 
        WHERE category IS NOT NULL 
        GROUP BY category 
        ORDER BY count DESC
      `);
      console.log('   📂 Par catégorie:');
      materialsByCategory.rows.forEach(row => {
        console.log(`      ${row.category}: ${row.count}`);
      });

      const materialsBySource = await pool.query(`
        SELECT source, COUNT(*) as count 
        FROM materials 
        WHERE source IS NOT NULL 
        GROUP BY source 
        ORDER BY count DESC
      `);
      console.log('   🔗 Par source:');
      materialsBySource.rows.forEach(row => {
        console.log(`      ${row.source}: ${row.count}`);
      });

      // Échantillon de matériaux
      const sampleMaterials = await pool.query(`
        SELECT name, category, unit_price, unit, source 
        FROM materials 
        WHERE name IS NOT NULL 
        ORDER BY RANDOM() 
        LIMIT 5
      `);
      console.log('   📝 Échantillon:');
      sampleMaterials.rows.forEach(material => {
        console.log(`      ${material.name} (${material.category}) - ${material.unit_price} TND/${material.unit} [${material.source}]`);
      });
      console.log('');
    }

    // Table real_estate_market
    if (tablesResult.rows.some(t => t.table_name === 'real_estate_market')) {
      console.log('🏠 TABLE REAL_ESTATE_MARKET:');
      
      const propertiesCount = await pool.query('SELECT COUNT(*) FROM real_estate_market');
      console.log(`   📊 Total: ${propertiesCount.rows[0].count} propriétés`);

      const propertiesByType = await pool.query(`
        SELECT property_type, COUNT(*) as count 
        FROM real_estate_market 
        WHERE property_type IS NOT NULL 
        GROUP BY property_type 
        ORDER BY count DESC
      `);
      console.log('   🏘️  Par type:');
      propertiesByType.rows.forEach(row => {
        console.log(`      ${row.property_type}: ${row.count}`);
      });

      const propertiesByCity = await pool.query(`
        SELECT city, COUNT(*) as count 
        FROM real_estate_market 
        WHERE city IS NOT NULL 
        GROUP BY city 
        ORDER BY count DESC 
        LIMIT 10
      `);
      console.log('   🌍 Par ville (top 10):');
      propertiesByCity.rows.forEach(row => {
        console.log(`      ${row.city}: ${row.count}`);
      });

      const propertiesBySource = await pool.query(`
        SELECT source, COUNT(*) as count 
        FROM real_estate_market 
        WHERE source IS NOT NULL 
        GROUP BY source 
        ORDER BY count DESC
      `);
      console.log('   🔗 Par source:');
      propertiesBySource.rows.forEach(row => {
        console.log(`      ${row.source}: ${row.count}`);
      });

      // Statistiques de prix
      const priceStats = await pool.query(`
        SELECT 
          AVG(price) as avg_price,
          MIN(price) as min_price,
          MAX(price) as max_price,
          COUNT(CASE WHEN price > 0 THEN 1 END) as properties_with_price
        FROM real_estate_market
      `);
      console.log('   💰 Statistiques de prix:');
      if (priceStats.rows[0].avg_price) {
        console.log(`      Prix moyen: ${Math.round(priceStats.rows[0].avg_price)} TND`);
        console.log(`      Prix min: ${priceStats.rows[0].min_price} TND`);
        console.log(`      Prix max: ${priceStats.rows[0].max_price} TND`);
        console.log(`      Propriétés avec prix: ${priceStats.rows[0].properties_with_price}`);
      }

      // Échantillon de propriétés
      const sampleProperties = await pool.query(`
        SELECT title, property_type, city, price, area, source 
        FROM real_estate_market 
        WHERE title IS NOT NULL 
        ORDER BY RANDOM() 
        LIMIT 5
      `);
      console.log('   📝 Échantillon:');
      sampleProperties.rows.forEach(property => {
        console.log(`      ${property.title} (${property.property_type}) - ${property.city} - ${property.price} TND - ${property.area}m² [${property.source}]`);
      });
      console.log('');
    }

    // Table projects
    if (tablesResult.rows.some(t => t.table_name === 'projects')) {
      console.log('📋 TABLE PROJECTS:');
      
      const projectsCount = await pool.query('SELECT COUNT(*) FROM projects');
      console.log(`   📊 Total: ${projectsCount.rows[0].count} projets`);

      const projectsByStatus = await pool.query(`
        SELECT status, COUNT(*) as count 
        FROM projects 
        WHERE status IS NOT NULL 
        GROUP BY status 
        ORDER BY count DESC
      `);
      console.log('   📈 Par statut:');
      projectsByStatus.rows.forEach(row => {
        console.log(`      ${row.status}: ${row.count}`);
      });

      const projectsByType = await pool.query(`
        SELECT project_type, COUNT(*) as count 
        FROM projects 
        WHERE project_type IS NOT NULL 
        GROUP BY project_type 
        ORDER BY count DESC
      `);
      console.log('   🏗️  Par type:');
      projectsByType.rows.forEach(row => {
        console.log(`      ${row.project_type}: ${row.count}`);
      });

      // Échantillon de projets
      const sampleProjects = await pool.query(`
        SELECT project_name, project_type, status, estimated_cost, location 
        FROM projects 
        WHERE project_name IS NOT NULL 
        ORDER BY RANDOM() 
        LIMIT 5
      `);
      console.log('   📝 Échantillon:');
      sampleProjects.rows.forEach(project => {
        console.log(`      ${project.project_name} (${project.project_type}) - ${project.status} - ${project.estimated_cost} TND - ${project.location}`);
      });
      console.log('');
    }

    // Table users
    if (tablesResult.rows.some(t => t.table_name === 'users')) {
      console.log('👥 TABLE USERS:');
      
      const usersCount = await pool.query('SELECT COUNT(*) FROM users');
      console.log(`   📊 Total: ${usersCount.rows[0].count} utilisateurs`);

      const usersByRole = await pool.query(`
        SELECT role, COUNT(*) as count 
        FROM users 
        WHERE role IS NOT NULL 
        GROUP BY role 
        ORDER BY count DESC
      `);
      console.log('   👤 Par rôle:');
      usersByRole.rows.forEach(row => {
        console.log(`      ${row.role}: ${row.count}`);
      });

      // Échantillon d'utilisateurs (sans mots de passe)
      const sampleUsers = await pool.query(`
        SELECT username, email, role, created_at 
        FROM users 
        WHERE username IS NOT NULL 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      console.log('   📝 Échantillon:');
      sampleUsers.rows.forEach(user => {
        console.log(`      ${user.username} (${user.email}) - ${user.role} - créé le ${user.created_at?.toISOString().split('T')[0]}`);
      });
      console.log('');
    }

    // Autres tables
    const otherTables = tablesResult.rows.filter(t => 
      !['materials', 'real_estate_market', 'projects', 'users'].includes(t.table_name)
    );

    if (otherTables.length > 0) {
      console.log('📦 AUTRES TABLES:');
      for (const table of otherTables) {
        const count = await pool.query(`SELECT COUNT(*) FROM ${table.table_name}`);
        console.log(`   📋 ${table.table_name}: ${count.rows[0].count} entrées`);
      }
      console.log('');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test de la base:', error.message);
  }
}

// Comparaison source vs base
async function compareSourceVsDatabase(sourceCounts) {
  console.log('⚖️  COMPARAISON SOURCE VS BASE DE DONNÉES');
  console.log('==========================================\n');

  try {
    const dbCounts = {};

    // Compter les données en base
    const materialsResult = await pool.query('SELECT COUNT(*) FROM materials');
    dbCounts.materiaux = parseInt(materialsResult.rows[0].count);

    const propertiesResult = await pool.query('SELECT COUNT(*) FROM real_estate_market');
    dbCounts.proprietes = parseInt(propertiesResult.rows[0].count);

    const projectsResult = await pool.query('SELECT COUNT(*) FROM projects');
    dbCounts.projets = parseInt(projectsResult.rows[0].count);

    const usersResult = await pool.query('SELECT COUNT(*) FROM users');
    dbCounts.users = parseInt(usersResult.rows[0].count);

    // Comparaison
    console.log('📊 RÉSUMÉ DE COMPARAISON:');
    console.log('=========================\n');

    console.log('🔨 MATÉRIAUX:');
    console.log(`   📁 Source: ${sourceCounts.materiaux || 0} entrées`);
    console.log(`   🗄️  Base: ${dbCounts.materiaux} entrées`);
    console.log(`   📈 Taux d'import: ${dbCounts.materiaux > 0 ? Math.round((dbCounts.materiaux / (sourceCounts.materiaux || 1)) * 100) : 0}%\n`);

    console.log('🏠 PROPRIÉTÉS:');
    console.log(`   📁 Source: ${sourceCounts.proprietes || 0} entrées`);
    console.log(`   🗄️  Base: ${dbCounts.proprietes} entrées`);
    console.log(`   📈 Taux d'import: ${dbCounts.proprietes > 0 ? Math.round((dbCounts.proprietes / (sourceCounts.proprietes || 1)) * 100) : 0}%\n`);

    console.log('📋 PROJETS:');
    console.log(`   📁 Source: ${sourceCounts.projets || 0} entrées`);
    console.log(`   🗄️  Base: ${dbCounts.projets} entrées`);
    console.log(`   📈 Taux d'import: ${dbCounts.projets > 0 ? Math.round((dbCounts.projets / (sourceCounts.projets || 1)) * 100) : 0}%\n`);

    console.log('👥 UTILISATEURS:');
    console.log(`   📁 Source: ${sourceCounts.autres || 0} entrées`);
    console.log(`   🗄️  Base: ${dbCounts.users} entrées\n`);

    // Recommandations
    console.log('💡 RECOMMANDATIONS:');
    console.log('===================\n');

    if (dbCounts.materiaux === 0) {
      console.log('⚠️  Aucun matériau en base - Relancer import-max.js ou import-all-assets.js');
    } else if (dbCounts.materiaux < (sourceCounts.materiaux || 0) * 0.8) {
      console.log('⚠️  Import partiel des matériaux - Vérifier les erreurs d\'import');
    } else {
      console.log('✅ Import des matériaux complet');
    }

    if (dbCounts.proprietes === 0) {
      console.log('⚠️  Aucune propriété en base - Relancer import-properties.js');
    } else if (dbCounts.proprietes < (sourceCounts.proprietes || 0) * 0.8) {
      console.log('⚠️  Import partiel des propriétés - Vérifier les limites d\'import');
    } else {
      console.log('✅ Import des propriétés complet');
    }

    if (dbCounts.projets === 0) {
      console.log('⚠️  Aucun projet en base - Relancer import-final.js ou import-max.js');
    } else {
      console.log('✅ Import des projets complet');
    }

    if (dbCounts.users === 0) {
      console.log('⚠️  Aucun utilisateur en base - Créer des utilisateurs de test');
    } else {
      console.log('✅ Utilisateurs présents en base');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la comparaison:', error.message);
  }
}

// Fonction principale
async function main() {
  try {
    console.log('🎯 Connexion à la base de données housy_tunisia...\n');
    await pool.query('SELECT NOW()');

    // 1. Analyser les fichiers source
    const sourceCounts = countSourceData();

    // 2. Tester la base de données
    await testDatabase();

    // 3. Comparer source vs base
    await compareSourceVsDatabase(sourceCounts);

    console.log('\n🎉 TEST COMPLET TERMINÉ !');
    console.log('========================\n');
    console.log('✨ Vous pouvez maintenant vérifier ces données dans pgAdmin');
    console.log('🔗 Utilisez les requêtes SQL suivantes dans pgAdmin:');
    console.log('');
    console.log('   SELECT COUNT(*) FROM materials;');
    console.log('   SELECT COUNT(*) FROM real_estate_market;');
    console.log('   SELECT COUNT(*) FROM projects;');
    console.log('   SELECT COUNT(*) FROM users;');
    console.log('');
    console.log('   SELECT * FROM materials LIMIT 10;');
    console.log('   SELECT * FROM real_estate_market LIMIT 10;');
    console.log('   SELECT * FROM projects LIMIT 10;');
    console.log('   SELECT * FROM users LIMIT 10;');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  } finally {
    await pool.end();
  }
}

// Lancer le test
main().catch(console.error);
