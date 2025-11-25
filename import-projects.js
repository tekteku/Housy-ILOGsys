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

console.log('📋 Import des projets et données complémentaires...');

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

// Import des devis comme projets
async function importDevis() {
  console.log('\n📋 Import des devis...');
  
  const devisFiles = [
    'devis_devis_DEV-202506111048.json',
    'devis_devis_DEV-202506111059.json'
  ];

  let totalDevis = 0;

  for (const file of devisFiles) {
    const data = readJsonFile(path.join(ATTACHED_ASSETS_PATH, file));
    if (!data || !data.devis) continue;

    console.log(`📋 Traitement du devis: ${file}`);

    try {
      const devis = data.devis;
      
      const projectQuery = `
        INSERT INTO projects (name, description, client_name, status, budget, start_date, created_by, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), 1, NOW(), NOW())
        RETURNING id
      `;

      const projectName = cleanText(devis.project?.nom || `Devis ${devis.numero}` || 'Devis');
      const projectDesc = cleanText(devis.project?.description || 'Devis d\'estimation automatique');
      const clientName = cleanText(devis.client?.nom || 'Client');
      const budget = devis.total_ttc || devis.sous_total || 0;

      const projectResult = await pool.query(projectQuery, [
        projectName,
        projectDesc,
        clientName,
        'planning',
        budget
      ]);

      const projectId = projectResult.rows[0].id;
      console.log(`   ✅ Devis créé: ${projectName} (ID: ${projectId}) - ${budget} TND`);

      totalDevis++;
    } catch (error) {
      console.warn(`⚠️  Erreur devis ${file}: ${error.message}`);
    }
  }

  console.log(`✅ ${totalDevis} devis importés`);
}

// Import des templates et projets types
async function importTemplates() {
  console.log('\n📋 Import des templates...');
  
  const templateFiles = [
    'templates_estimation_projets.json',
    'estimations_projets_types.json'
  ];

  let totalTemplates = 0;

  for (const file of templateFiles) {
    const data = readJsonFile(path.join(ATTACHED_ASSETS_PATH, file));
    if (!data) continue;

    console.log(`📋 Traitement des templates: ${file}`);

    try {
      let templates = [];
      
      // Extraire les templates selon la structure
      if (data.templates && Array.isArray(data.templates)) {
        templates = data.templates;
      } else if (data.projets && Array.isArray(data.projets)) {
        templates = data.projets;
      } else if (data.estimations && Array.isArray(data.estimations)) {
        templates = data.estimations;
      } else if (Array.isArray(data)) {
        templates = data;
      } else {
        console.log(`   ⚠️  Structure inconnue pour ${file}`);
        continue;
      }

      console.log(`   📦 ${templates.length} templates trouvés`);

      for (const template of templates.slice(0, 10)) { // Limiter à 10
        try {
          const projectQuery = `
            INSERT INTO projects (name, description, status, budget, start_date, created_by, created_at, updated_at)
            VALUES ($1, $2, $3, $4, NOW(), 1, NOW(), NOW())
          `;

          const name = cleanText(template.nom || template.name || template.type || 'Template Projet');
          const description = cleanText(template.description || template.desc || 'Template d\'estimation');
          const budget = template.cout_total || template.budget || template.estimation || 1000;

          await pool.query(projectQuery, [
            name,
            description,
            'template',
            budget
          ]);

          totalTemplates++;
        } catch (error) {
          console.warn(`   ⚠️  Erreur template: ${error.message}`);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Erreur fichier ${file}: ${error.message}`);
    }
  }

  console.log(`✅ ${totalTemplates} templates importés`);
}

// Import des rapports et analyses
async function importReports() {
  console.log('\n📊 Import des rapports...');
  
  const reportFiles = [
    'analyse_comparaison_detaillee_20250611_103609.json',
    'analyse_comparaison_detaillee_20250611_104802.json',
    'rapport_RAPPORT_ANALYSE_BRICODIRECT_20250611_100806.json',
    'rapport_rapport_comparaison_20250611_104802.json',
    'rapport_rapport_comparaison_20250611_105952.json',
    'rapport_RAPPORT_FINAL_ESTIMATION_20250611_101423.json'
  ];

  let totalReports = 0;

  for (const file of reportFiles) {
    const data = readJsonFile(path.join(ATTACHED_ASSETS_PATH, file));
    if (!data) continue;

    console.log(`📊 Traitement du rapport: ${file}`);

    try {
      const reportQuery = `
        INSERT INTO projects (name, description, status, budget, start_date, created_by, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), 1, NOW(), NOW())
      `;

      const reportType = file.includes('rapport') ? 'Rapport' : 'Analyse';
      const name = `${reportType} - ${file.replace('.json', '').replace(/[_\-]/g, ' ')}`;
      const description = `Analyse automatique - Source: ${file}`;

      await pool.query(reportQuery, [
        name,
        description,
        'completed',
        0
      ]);

      totalReports++;
    } catch (error) {
      console.warn(`⚠️  Erreur rapport ${file}: ${error.message}`);
    }
  }

  console.log(`✅ ${totalReports} rapports importés`);
}

// Fonction principale
async function main() {
  try {
    console.log('🎯 Connexion à la base de données housy_tunisia...');
    await pool.query('SELECT NOW()');
    console.log('✅ Connexion réussie !');

    await importDevis();
    await importTemplates();
    await importReports();

    // Statistiques finales
    console.log('\n📊 Statistiques finales:');
    
    const result = await pool.query('SELECT COUNT(*) FROM projects');
    console.log(`   📈 ${result.rows[0].count} projets au total`);

    const materialsResult = await pool.query('SELECT COUNT(*) FROM materials');
    console.log(`   📈 ${materialsResult.rows[0].count} matériaux au total`);

    console.log('\n🎉 Import des projets terminé !');
    console.log('🔗 Testez maintenant: http://localhost:3000/estimation');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  } finally {
    await pool.end();
  }
}

// Lancer l'import
main().catch(console.error);
