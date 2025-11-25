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

console.log('🚀 Import complet des données depuis attached_assets...');
console.log(`📁 Répertoire source: ${ATTACHED_ASSETS_PATH}`);

// Fonction utilitaire pour lire les fichiers JSON
function readJsonFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Fichier non trouvé: ${filePath}`);
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Erreur lecture ${filePath}:`, error.message);
    return null;
  }
}

// Fonction pour nettoyer et normaliser le texte
function cleanText(text) {
  if (!text) return '';
  return String(text).replace(/[^\w\s\-\.]/g, ' ').trim().substring(0, 500);
}

// Fonction pour extraire un prix numérique
function extractPrice(priceData) {
  if (typeof priceData === 'number') return Math.max(priceData, 0.1);
  if (typeof priceData === 'object' && priceData) {
    if (priceData.unitaire_tnd) return Math.max(priceData.unitaire_tnd, 0.1);
    if (priceData.moyen_tnd) return Math.max(priceData.moyen_tnd, 0.1);
    if (priceData.prix_unitaire) return Math.max(priceData.prix_unitaire, 0.1);
    if (priceData.total_ht) return Math.max(priceData.total_ht, 0.1);
  }
  return 1.0; // Prix par défaut
}

// 1. Import des matériaux depuis les catalogues
async function importMaterials() {
  console.log('\n1️⃣ Import des matériaux...');
  
  const materialFiles = [
    'catalogue_estimation_materiaux_complet.json',
    'catalogue_brico_direct_detaille.json',
    'materiaux_bruts_brico_direct_raw_20250611_095811.json',
    'materiaux_bruts_brico_direct_raw_20250611_100014.json',
    'materiaux_bruts_construction_materials_20250611_094114.json',
    'materiaux_bruts_materials_raw_20250611_093824.json'
  ];

  let totalMaterials = 0;

  for (const file of materialFiles) {
    const data = readJsonFile(path.join(ATTACHED_ASSETS_PATH, file));
    if (!data) continue;

    console.log(`📦 Traitement du fichier: ${file}`);

    // Traiter les matériaux selon la structure du fichier
    let materials = [];
    if (data.materiaux) materials = data.materiaux;
    else if (data.produits) materials = data.produits;
    else if (data.items) materials = data.items;
    else if (Array.isArray(data)) materials = data;

    console.log(`   📋 ${materials.length} matériaux trouvés`);

    for (const material of materials) {
      try {
        // Déterminer la catégorie
        let category = 'autres';
        const nom = (material.nom || material.designation || material.name || material.type_detaille || 'Matériau').toLowerCase();
        
        if (nom.includes('brique') || nom.includes('béton') || nom.includes('ciment') || nom.includes('fer') || nom.includes('parpaing')) {
          category = 'gros_oeuvre';
        } else if (nom.includes('carrelage') || nom.includes('parquet') || nom.includes('peinture') || nom.includes('enduit')) {
          category = 'finition';
        } else if (nom.includes('plâtre') || nom.includes('isolation') || nom.includes('plomberie') || nom.includes('électri')) {
          category = 'second_oeuvre';
        } else if (nom.includes('sable') || nom.includes('gravier') || nom.includes('granulat')) {
          category = 'granulats';
        }

        const price = extractPrice(material.prix || material.price || material.cout || 1.0);
        const name = cleanText(material.nom || material.designation || material.name || material.type_detaille || 'Matériau');
        const unit = cleanText(material.unite || material.unit || material.unité || 'unité');
        const supplier = cleanText(material.fournisseur?.meilleur || material.fournisseur || material.supplier || 'Fournisseur Local');
        const description = cleanText(material.description || material.desc || `${name} - ${unit}`);

        const query = `
          INSERT INTO materials (name, category, unit, price, price_currency, supplier, brand, description, created_at, last_updated)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        `;

        await pool.query(query, [
          name,
          category,
          unit,
          price,
          'TND',
          supplier,
          'Standard',
          description
        ]);

        totalMaterials++;
      } catch (error) {
        console.warn(`   ⚠️  Erreur matériau: ${error.message}`);
      }
    }
  }

  console.log(`✅ ${totalMaterials} matériaux importés`);
}

// 2. Import des projets et estimations
async function importProjects() {
  console.log('\n2️⃣ Import des projets et estimations...');
  
  const projectFiles = [
    'estimations_projets_types.json',
    'templates_estimation_projets.json',
    'devis_devis_DEV-202506111048.json',
    'devis_devis_DEV-202506111059.json'
  ];

  let totalProjects = 0;

  for (const file of projectFiles) {
    const data = readJsonFile(path.join(ATTACHED_ASSETS_PATH, file));
    if (!data) continue;

    console.log(`📋 Traitement du fichier: ${file}`);

    try {
      // Vérifier si c'est un devis
      if (data.devis) {
        const devis = data.devis;
        
        // Créer un projet basé sur le devis
        const projectQuery = `
          INSERT INTO projects (name, description, status, budget, start_date, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())
          RETURNING id
        `;

        const projectName = cleanText(devis.project?.nom || `Projet ${devis.numero}` || 'Projet');
        const projectDesc = cleanText(devis.project?.description || 'Projet d\'estimation automatique');
        const budget = devis.total_ttc || devis.sous_total || 0;

        const projectResult = await pool.query(projectQuery, [
          projectName,
          projectDesc,
          'planning',
          budget
        ]);

        const projectId = projectResult.rows[0].id;
        console.log(`   ✅ Projet créé: ${projectName} (ID: ${projectId})`);

        totalProjects++;
      }
      // Traiter les templates d'estimation
      else if (data.templates || data.projets || data.estimations) {
        const templates = data.templates || data.projets || data.estimations || [];
        
        for (const template of templates.slice(0, 10)) { // Limiter à 10 pour éviter la surcharge
          try {
            const projectQuery = `
              INSERT INTO projects (name, description, status, budget, start_date, created_at, updated_at)
              VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())
            `;

            const name = cleanText(template.nom || template.name || template.type || 'Projet Template');
            const description = cleanText(template.description || template.desc || 'Projet d\'estimation type');
            const budget = extractPrice(template.cout_total || template.budget || template.estimation) * 100;

            await pool.query(projectQuery, [
              name,
              description,
              'template',
              budget
            ]);

            totalProjects++;
          } catch (error) {
            console.warn(`   ⚠️  Erreur template: ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️  Erreur fichier ${file}: ${error.message}`);
    }
  }

  console.log(`✅ ${totalProjects} projets importés`);
}

// 3. Import des analyses et rapports (en tant que projets spéciaux)
async function importAnalyses() {
  console.log('\n3️⃣ Import des analyses et rapports...');
  
  const analysisFiles = [
    'analyse_comparaison_detaillee_20250611_103609.json',
    'analyse_comparaison_detaillee_20250611_104802.json',
    'rapport_RAPPORT_ANALYSE_BRICODIRECT_20250611_100806.json',
    'rapport_rapport_comparaison_20250611_104802.json',
    'rapport_rapport_comparaison_20250611_105952.json',
    'rapport_RAPPORT_FINAL_ESTIMATION_20250611_101423.json'
  ];

  let totalAnalyses = 0;

  for (const file of analysisFiles) {
    const data = readJsonFile(path.join(ATTACHED_ASSETS_PATH, file));
    if (!data) continue;

    console.log(`📊 Traitement du fichier: ${file}`);

    try {
      // Créer un projet d'analyse
      const analysisQuery = `
        INSERT INTO projects (name, description, status, budget, start_date, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())
      `;

      const analysisType = file.includes('rapport') ? 'Rapport' : 'Analyse comparative';
      const name = `${analysisType} - ${file.replace('.json', '')}`;
      const description = `Analyse automatique: ${JSON.stringify(data.metadonnees || {}).substring(0, 200)}`;

      await pool.query(analysisQuery, [
        name,
        description,
        'completed',
        0
      ]);

      totalAnalyses++;
    } catch (error) {
      console.warn(`⚠️  Erreur analyse ${file}: ${error.message}`);
    }
  }

  console.log(`✅ ${totalAnalyses} analyses importées`);
}

// 4. Import de l'index général et métadonnées (simplifié)
async function importMetadata() {
  console.log('\n4️⃣ Import des métadonnées...');
  
  const indexData = readJsonFile(path.join(ATTACHED_ASSETS_PATH, 'INDEX_GENERAL.json'));
  if (!indexData) {
    console.log('⚠️  INDEX_GENERAL.json non trouvé');
    return;
  }

  try {
    // Créer un projet pour stocker les métadonnées
    const metadataQuery = `
      INSERT INTO projects (name, description, status, budget, start_date, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())
    `;

    const description = `Métadonnées système: ${JSON.stringify(indexData).substring(0, 300)}...`;

    await pool.query(metadataQuery, [
      'Métadonnées du système',
      description,
      'system',
      0
    ]);

    console.log('✅ Métadonnées importées');
  } catch (error) {
    console.warn(`⚠️  Erreur métadonnées: ${error.message}`);
  }
}

// 5. Créer quelques utilisateurs de test et données de base
async function createBasicData() {
  console.log('\n5️⃣ Création des données de base...');
  
  try {
    // Créer un utilisateur admin
    const adminQuery = `
      INSERT INTO users (username, email, password, role, full_name, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (username) DO NOTHING
    `;

    await pool.query(adminQuery, [
      'admin',
      'admin@housy.tn',
      '$2b$10$rGFqAYkzV7tU9pG6P4qK7uK.wHxF1LvGZ2Xq9jKlMnEr3YcP8sT1u', // hashedPassword
      'admin',
      'Admin Housy'
    ]);

    // Créer un utilisateur client de test
    await pool.query(adminQuery, [
      'client_test',
      'client@housy.tn',
      '$2b$10$rGFqAYkzV7tU9pG6P4qK7uK.wHxF1LvGZ2Xq9jKlMnEr3YcP8sT1u',
      'client',
      'Client Test'
    ]);

    console.log('✅ Utilisateurs de test créés');
  } catch (error) {
    console.warn(`⚠️  Erreur création utilisateurs: ${error.message}`);
  }
}

// Fonction principale
async function main() {
  try {
    console.log('🎯 Connexion à la base de données housy_tunisia...');
    await pool.query('SELECT NOW()');
    console.log('✅ Connexion réussie !');

    await importMaterials();
    await importProjects();
    await importAnalyses();
    await importMetadata();
    await createBasicData();

    // Statistiques finales
    console.log('\n📊 Statistiques finales:');
    
    const statsQueries = [
      { table: 'materials', name: 'matériaux' },
      { table: 'projects', name: 'projets' },
      { table: 'users', name: 'utilisateurs' }
    ];

    for (const stat of statsQueries) {
      try {
        const result = await pool.query(`SELECT COUNT(*) FROM ${stat.table}`);
        console.log(`   📈 ${result.rows[0].count} ${stat.name}`);
      } catch (error) {
        console.log(`   ❓ Table ${stat.table} non accessible`);
      }
    }

    console.log('\n🎉 Import complet terminé avec succès !');
    console.log('🔗 Testez maintenant: http://localhost:3000/estimation');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  } finally {
    await pool.end();
  }
}

// Lancer l'import
main().catch(console.error);
