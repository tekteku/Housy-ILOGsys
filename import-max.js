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

console.log('🚀 IMPORT MAXIMUM DE TOUTES LES DONNÉES ATTACHED_ASSETS...');

// Fonction utilitaire pour lire les fichiers JSON
function readJsonFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Nettoyer le contenu
    content = content
      .replace(/^\uFEFF/, '') // Supprimer BOM
      .replace(/:\s*NaN,/g, ': null,')
      .replace(/:\s*NaN\s*}/g, ': null }')
      .replace(/:\s*NaN\s*]/g, ': null ]')
      .replace(/\[\s*NaN,/g, '[ null,')
      .replace(/,\s*NaN,/g, ', null,')
      .replace(/,\s*NaN\s*]/g, ', null ]');
    
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Erreur lecture ${path.basename(filePath)}:`, error.message);
    return null;
  }
}

// Fonction pour nettoyer le texte
function cleanText(text) {
  if (!text || text === 'NaN' || text === null) return 'Non spécifié';
  return String(text).replace(/[^\w\s\-\.éèàâôûîç]/g, ' ').trim().substring(0, 500) || 'Non spécifié';
}

// Import MAXIMUM des propriétés
async function importMaxProperties() {
  console.log('\n🏠 IMPORT MAXIMUM DES PROPRIÉTÉS...');
  
  const propertyFiles = [
    'proprietes_consolidees_resume.json',
    'proprietes_tecnocasa_tn.json',
    'proprietes_mubawab_tn.json',
    'proprietes_remax_com_tn.json'
  ];

  let totalNewProperties = 0;

  for (const file of propertyFiles) {
    const data = readJsonFile(path.join(ATTACHED_ASSETS_PATH, file));
    if (!data) continue;

    console.log(`🏘️  Traitement COMPLET: ${file}`);

    try {
      let properties = [];
      
      // Extraire TOUTES les propriétés
      if (data.proprietes) properties = data.proprietes;
      else if (data.proprietes_echantillon) properties = data.proprietes_echantillon;
      else if (data.properties) properties = data.properties;
      else if (data.listings) properties = data.listings;
      else if (Array.isArray(data)) properties = data;

      console.log(`   📦 ${properties.length} propriétés trouvées`);

      // Prendre TOUTES les propriétés (pas de limite)
      for (let i = 0; i < properties.length; i++) {
        const property = properties[i];
        
        try {
          const propertyQuery = `
            INSERT INTO real_estate_market (
              property_id, title, description, price, price_currency, area, 
              rooms, property_type, city, governorate, address, source, 
              url, scraped_at, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
            ON CONFLICT (property_id) DO NOTHING
          `;

          const propertyId = `${file}_${i}_${Date.now()}`;
          const title = cleanText(property.title || property.nom || property.name || 'Propriété');
          const description = cleanText(property.description || property.desc || title);
          
          let price = 100000;
          if (property.price) price = parseFloat(property.price) || 100000;
          else if (property.prix) price = parseFloat(property.prix) || 100000;
          else if (property.cost) price = parseFloat(property.cost) || 100000;
          
          let area = null;
          if (property.area) area = parseFloat(property.area) || null;
          else if (property.superficie) area = parseFloat(property.superficie) || null;
          else if (property.surface) area = parseFloat(property.surface) || null;
          
          const rooms = cleanText(property.rooms || property.bedrooms || property.chambres || '2');
          const propertyType = cleanText(property.property_type || property.type || property.category || 'Appartement');
          const city = cleanText(property.city || property.ville || property.location || property.region || 'Tunis');
          const governorate = cleanText(property.governorate || property.gouvernorat || city);
          const address = cleanText(property.address || property.adresse || property.location);
          
          const source = file.includes('remax') ? 'remax.com.tn' : 
                       file.includes('mubawab') ? 'mubawab.tn' : 
                       file.includes('tecnocasa') ? 'tecnocasa.tn' : 'housy_import';
          
          const url = cleanText(property.listing_url || property.url || property.link);

          await pool.query(propertyQuery, [
            propertyId,
            title,
            description,
            price,
            'TND',
            area,
            rooms,
            propertyType,
            city,
            governorate,
            address,
            source,
            url,
            new Date()
          ]);

          totalNewProperties++;
          
          if (totalNewProperties % 100 === 0) {
            console.log(`   📈 ${totalNewProperties} nouvelles propriétés importées...`);
          }
        } catch (error) {
          // Continuer même en cas d'erreur
        }
      }
    } catch (error) {
      console.warn(`⚠️  Erreur fichier ${file}: ${error.message}`);
    }
  }

  console.log(`✅ ${totalNewProperties} nouvelles propriétés importées`);
}

// Import MAXIMUM des matériaux
async function importMaxMaterials() {
  console.log('\n🔨 IMPORT MAXIMUM DES MATÉRIAUX...');
  
  const materialFiles = [
    'catalogue_estimation_materiaux_complet.json',
    'catalogue_brico_direct_detaille.json',
    'materiaux_bruts_brico_direct_raw_20250611_095811.json',
    'materiaux_bruts_brico_direct_raw_20250611_100014.json',
    'materiaux_bruts_construction_materials_20250611_094114.json',
    'materiaux_bruts_materials_raw_20250611_093824.json'
  ];

  let totalNewMaterials = 0;

  for (const file of materialFiles) {
    const data = readJsonFile(path.join(ATTACHED_ASSETS_PATH, file));
    if (!data) continue;

    console.log(`🔨 Traitement COMPLET: ${file}`);

    try {
      let materials = [];
      
      // Extraire TOUS les matériaux
      if (data.materiaux) materials = data.materiaux;
      else if (data.produits) materials = data.produits;
      else if (data.items) materials = data.items;
      else if (data.data) materials = data.data;
      else if (Array.isArray(data)) materials = data;
      else {
        // Chercher dans toutes les clés
        for (const [key, value] of Object.entries(data)) {
          if (Array.isArray(value) && value.length > 0) {
            materials = value;
            break;
          }
        }
      }

      console.log(`   📦 ${materials.length} matériaux trouvés`);

      for (let i = 0; i < materials.length; i++) {
        const material = materials[i];
        
        try {
          const materialQuery = `
            INSERT INTO materials (name, category, unit, price, price_currency, supplier, brand, description, created_at, last_updated)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
          `;

          const name = cleanText(
            material.nom || material.name || material.designation || 
            material.title || material.produit || `Matériau ${i}`
          );
          
          const category = cleanText(
            material.categorie || material.category || material.type || 'autres'
          );
          
          const unit = cleanText(
            material.unite || material.unit || material.unité || 'unité'
          );
          
          let price = 1.0;
          if (material.prix) price = parseFloat(material.prix) || 1.0;
          else if (material.price) price = parseFloat(material.price) || 1.0;
          else if (material.cout) price = parseFloat(material.cout) || 1.0;
          
          const supplier = cleanText(
            material.fournisseur || material.supplier || 'Fournisseur Local'
          );
          
          const brand = cleanText(
            material.marque || material.brand || 'Standard'
          );
          
          const description = cleanText(
            material.description || material.desc || `${name} - ${unit}`
          );

          await pool.query(materialQuery, [
            name,
            category,
            unit,
            price,
            'TND',
            supplier,
            brand,
            description
          ]);

          totalNewMaterials++;
        } catch (error) {
          // Continuer même en cas d'erreur
        }
      }
    } catch (error) {
      console.warn(`⚠️  Erreur fichier ${file}: ${error.message}`);
    }
  }

  console.log(`✅ ${totalNewMaterials} nouveaux matériaux importés`);
}

// Import des projets/devis supplémentaires
async function importMaxProjects() {
  console.log('\n📋 IMPORT MAXIMUM DES PROJETS...');
  
  const projectFiles = [
    'devis_devis_DEV-202506111048.json',
    'devis_devis_DEV-202506111059.json',
    'templates_estimation_projets.json',
    'estimations_projets_types.json'
  ];

  let totalNewProjects = 0;

  for (const file of projectFiles) {
    const data = readJsonFile(path.join(ATTACHED_ASSETS_PATH, file));
    if (!data) continue;

    console.log(`📋 Traitement COMPLET: ${file}`);

    try {
      if (data.devis) {
        // Traiter un devis
        const devis = data.devis;
        
        const projectQuery = `
          INSERT INTO projects (name, description, client_name, status, budget, start_date, created_by, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, NOW(), 1, NOW(), NOW())
        `;

        const projectName = cleanText(devis.project?.nom || `Devis ${devis.numero}` || 'Devis');
        const projectDesc = cleanText(devis.project?.description || 'Devis d\'estimation automatique');
        const clientName = cleanText(devis.client?.nom || 'Client');
        const budget = devis.total_ttc || devis.sous_total || 0;

        await pool.query(projectQuery, [
          projectName,
          projectDesc,
          clientName,
          'planning',
          budget
        ]);

        totalNewProjects++;
      } else {
        // Traiter des templates
        let templates = [];
        if (data.templates) templates = data.templates;
        else if (data.projets) templates = data.projets;
        else if (data.estimations) templates = data.estimations;
        else if (Array.isArray(data)) templates = data;

        for (let i = 0; i < Math.min(templates.length, 20); i++) {
          const template = templates[i];
          
          try {
            const projectQuery = `
              INSERT INTO projects (name, description, status, budget, start_date, created_by, created_at, updated_at)
              VALUES ($1, $2, $3, $4, NOW(), 1, NOW(), NOW())
            `;

            const name = cleanText(template.nom || template.name || template.type || `Template ${i}`);
            const description = cleanText(template.description || template.desc || 'Template d\'estimation');
            const budget = template.cout_total || template.budget || template.estimation || 1000;

            await pool.query(projectQuery, [
              name,
              description,
              'template',
              budget
            ]);

            totalNewProjects++;
          } catch (error) {
            // Continuer
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️  Erreur fichier ${file}: ${error.message}`);
    }
  }

  console.log(`✅ ${totalNewProjects} nouveaux projets importés`);
}

// Statistiques finales détaillées
async function generateDetailedStats() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 STATISTIQUES FINALES DÉTAILLÉES');
  console.log('='.repeat(60));
  
  try {
    // Propriétés par source
    console.log('\n🏠 PROPRIÉTÉS PAR SOURCE:');
    const propBySource = await pool.query(`
      SELECT source, COUNT(*) as count, 
             AVG(price) as avg_price,
             MIN(price) as min_price,
             MAX(price) as max_price
      FROM real_estate_market 
      GROUP BY source 
      ORDER BY count DESC
    `);
    propBySource.rows.forEach(row => {
      console.log(`   ${row.source}: ${row.count} propriétés (Prix moyen: ${Math.round(row.avg_price)} TND)`);
    });

    // Propriétés par type
    console.log('\n🏘️  PROPRIÉTÉS PAR TYPE:');
    const propByType = await pool.query(`
      SELECT property_type, COUNT(*) as count 
      FROM real_estate_market 
      GROUP BY property_type 
      ORDER BY count DESC
    `);
    propByType.rows.forEach(row => {
      console.log(`   ${row.property_type}: ${row.count}`);
    });

    // Propriétés par ville
    console.log('\n🌍 PROPRIÉTÉS PAR VILLE (TOP 10):');
    const propByCity = await pool.query(`
      SELECT city, COUNT(*) as count 
      FROM real_estate_market 
      GROUP BY city 
      ORDER BY count DESC 
      LIMIT 10
    `);
    propByCity.rows.forEach(row => {
      console.log(`   ${row.city}: ${row.count}`);
    });

    // Matériaux par catégorie
    console.log('\n🔨 MATÉRIAUX PAR CATÉGORIE:');
    const matByCategory = await pool.query(`
      SELECT category, COUNT(*) as count,
             AVG(price) as avg_price
      FROM materials 
      GROUP BY category 
      ORDER BY count DESC
    `);
    matByCategory.rows.forEach(row => {
      console.log(`   ${row.category}: ${row.count} (Prix moyen: ${Math.round(row.avg_price)} TND)`);
    });

    // Totaux généraux
    const totalProps = await pool.query('SELECT COUNT(*) FROM real_estate_market');
    const totalMats = await pool.query('SELECT COUNT(*) FROM materials');
    const totalProjs = await pool.query('SELECT COUNT(*) FROM projects');
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users');

    console.log('\n🎯 TOTAUX GÉNÉRAUX:');
    console.log(`   🏠 Propriétés immobilières: ${totalProps.rows[0].count}`);
    console.log(`   🔨 Matériaux de construction: ${totalMats.rows[0].count}`);
    console.log(`   📋 Projets et templates: ${totalProjs.rows[0].count}`);
    console.log(`   👥 Utilisateurs: ${totalUsers.rows[0].count}`);

    const grandTotal = parseInt(totalProps.rows[0].count) + parseInt(totalMats.rows[0].count) + parseInt(totalProjs.rows[0].count) + parseInt(totalUsers.rows[0].count);
    console.log(`\n🚀 TOTAL GÉNÉRAL: ${grandTotal} entrées dans la base de données !`);

    console.log('\n🎉 BASE DE DONNÉES HOUSY_TUNISIA MAXIMALEMENT ALIMENTÉE !');
    console.log('🔗 Prêt pour tous les tests: http://localhost:3000/estimation');
    
  } catch (error) {
    console.error('❌ Erreur statistiques:', error.message);
  }
}

// Fonction principale
async function main() {
  try {
    console.log('🎯 Connexion à la base de données housy_tunisia...');
    await pool.query('SELECT NOW()');
    console.log('✅ Connexion réussie !');

    await importMaxProperties();
    await importMaxMaterials();
    await importMaxProjects();
    await generateDetailedStats();
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  } finally {
    await pool.end();
  }
}

// Lancer l'import maximum
main().catch(console.error);
