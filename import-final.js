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

console.log('📊 Import final de toutes les données restantes...');

// Fonction utilitaire pour lire les fichiers JSON
function readJsonFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Fichier non trouvé: ${filePath}`);
      return null;
    }
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Nettoyer le contenu avant parsing
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
    console.error(`❌ Erreur lecture ${filePath}:`, error.message);
    return null;
  }
}

// Fonction pour nettoyer le texte
function cleanText(text) {
  if (!text || text === 'NaN' || text === null) return 'Non spécifié';
  return String(text).replace(/[^\w\s\-\.éèàâôûîç]/g, ' ').trim().substring(0, 500) || 'Non spécifié';
}

// Import des matériaux bruts supplémentaires
async function importRawMaterials() {
  console.log('\n🔨 Import des matériaux bruts supplémentaires...');
  
  const rawMaterialFiles = [
    'materiaux_bruts_brico_direct_raw_20250611_095811.json',
    'materiaux_bruts_brico_direct_raw_20250611_100014.json',
    'materiaux_bruts_construction_materials_20250611_094114.json',
    'materiaux_bruts_materials_raw_20250611_093824.json'
  ];

  let totalMaterials = 0;

  for (const file of rawMaterialFiles) {
    const data = readJsonFile(path.join(ATTACHED_ASSETS_PATH, file));
    if (!data) continue;

    console.log(`🔨 Traitement du fichier: ${file}`);

    try {
      // Essayer différentes structures
      let materials = [];
      if (data.materiaux) materials = data.materiaux;
      else if (data.produits) materials = data.produits;
      else if (data.items) materials = data.items;
      else if (data.data) materials = data.data;
      else if (Array.isArray(data)) materials = data;

      if (materials.length === 0) {
        console.log(`   📋 Aucun matériau trouvé dans la structure standard`);
        // Essayer d'extraire depuis les clés
        for (const [key, value] of Object.entries(data)) {
          if (Array.isArray(value) && value.length > 0) {
            console.log(`   🔍 Tentative avec clé: ${key} (${value.length} éléments)`);
            materials = value;
            break;
          }
        }
      }

      console.log(`   📦 ${materials.length} matériaux trouvés`);

      for (const material of materials.slice(0, 50)) {
        try {
          const materialQuery = `
            INSERT INTO materials (name, category, unit, price, price_currency, supplier, brand, description, created_at, last_updated)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
          `;

          // Extraire les informations avec fallbacks
          const name = cleanText(
            material.nom || material.name || material.designation || 
            material.title || material.produit || material.article || 'Matériau'
          );
          
          const category = cleanText(
            material.categorie || material.category || material.type || 
            material.famille || 'autres'
          );
          
          const unit = cleanText(
            material.unite || material.unit || material.unité || 
            material.packaging || 'unité'
          );
          
          let price = 1.0;
          if (material.prix) price = parseFloat(material.prix) || 1.0;
          else if (material.price) price = parseFloat(material.price) || 1.0;
          else if (material.cout) price = parseFloat(material.cout) || 1.0;
          else if (material.tarif) price = parseFloat(material.tarif) || 1.0;
          
          const supplier = cleanText(
            material.fournisseur || material.supplier || material.vendeur || 
            material.distributeur || 'Fournisseur Local'
          );
          
          const brand = cleanText(
            material.marque || material.brand || material.fabricant || 'Standard'
          );
          
          const description = cleanText(
            material.description || material.desc || material.details || 
            `${name} - ${unit}`
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

          totalMaterials++;
        } catch (error) {
          // Ignorer les erreurs individuelles pour continuer l'import
        }
      }
    } catch (error) {
      console.warn(`⚠️  Erreur fichier ${file}: ${error.message}`);
    }
  }

  console.log(`✅ ${totalMaterials} matériaux bruts importés`);
}

// Import des propriétés restantes
async function importRemainingProperties() {
  console.log('\n🏠 Import des propriétés restantes...');
  
  let totalProperties = 0;

  const propertyFiles = [
    'proprietes_tecnocasa_tn.json',
    'proprietes_mubawab_tn.json', 
    'proprietes_remax_com_tn.json'
  ];

  for (const file of propertyFiles) {
    const data = readJsonFile(path.join(ATTACHED_ASSETS_PATH, file));
    if (!data) continue;

    console.log(`🏘️  Traitement du fichier: ${file}`);

    try {
      let properties = [];
      
      // Extraire les propriétés selon la structure
      if (data.proprietes) properties = data.proprietes;
      else if (data.proprietes_echantillon) properties = data.proprietes_echantillon;
      else if (data.properties) properties = data.properties;
      else if (data.listings) properties = data.listings;
      else if (Array.isArray(data)) properties = data;

      console.log(`   📦 ${properties.length} propriétés trouvées`);

      for (const property of properties.slice(0, 300)) { // Plus de propriétés
        try {
          const propertyQuery = `
            INSERT INTO real_estate_market (
              property_id, title, description, price, price_currency, area, 
              rooms, property_type, city, governorate, address, source, 
              url, scraped_at, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
          `;

          const propertyId = cleanText(property.property_id || property.id || `${file}_${totalProperties}`);
          const title = cleanText(property.title || property.nom || property.name || 'Propriété');
          const description = cleanText(property.description || property.desc || title);
          
          let price = 100000; // Prix par défaut
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

          totalProperties++;
          
          if (totalProperties % 50 === 0) {
            console.log(`   📈 ${totalProperties} propriétés importées...`);
          }
        } catch (error) {
          // Continuer même en cas d'erreur
        }
      }
    } catch (error) {
      console.warn(`⚠️  Erreur fichier ${file}: ${error.message}`);
    }
  }

  console.log(`✅ ${totalProperties} propriétés supplémentaires importées`);
}

// Statistiques et résumé final
async function generateFinalStats() {
  console.log('\n📊 RÉSUMÉ FINAL DE L\'IMPORT COMPLET:');
  console.log('=' .repeat(50));
  
  try {
    // Matériaux
    const materialsResult = await pool.query('SELECT COUNT(*) FROM materials');
    const materialsByCategory = await pool.query(`
      SELECT category, COUNT(*) as count 
      FROM materials 
      GROUP BY category 
      ORDER BY count DESC 
      LIMIT 10
    `);
    
    console.log(`🔨 MATÉRIAUX: ${materialsResult.rows[0].count} au total`);
    console.log('   Répartition par catégorie:');
    materialsByCategory.rows.forEach(row => {
      console.log(`   - ${row.category}: ${row.count}`);
    });

    // Propriétés immobilières
    const propertiesResult = await pool.query('SELECT COUNT(*) FROM real_estate_market');
    const propertiesByType = await pool.query(`
      SELECT property_type, COUNT(*) as count 
      FROM real_estate_market 
      GROUP BY property_type 
      ORDER BY count DESC 
      LIMIT 10
    `);
    
    console.log(`\n🏠 PROPRIÉTÉS: ${propertiesResult.rows[0].count} au total`);
    console.log('   Répartition par type:');
    propertiesByType.rows.forEach(row => {
      console.log(`   - ${row.property_type}: ${row.count}`);
    });

    // Projets
    const projectsResult = await pool.query('SELECT COUNT(*) FROM projects');
    const projectsByStatus = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM projects 
      GROUP BY status 
      ORDER BY count DESC
    `);
    
    console.log(`\n📋 PROJETS: ${projectsResult.rows[0].count} au total`);
    console.log('   Répartition par statut:');
    projectsByStatus.rows.forEach(row => {
      console.log(`   - ${row.status}: ${row.count}`);
    });

    // Utilisateurs
    const usersResult = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`\n👥 UTILISATEURS: ${usersResult.rows[0].count} au total`);

    console.log('\n🎉 BASE DE DONNÉES HOUSY_TUNISIA COMPLÈTEMENT ALIMENTÉE !');
    console.log('🔗 Prêt pour les tests: http://localhost:3000/estimation');
    
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

    await importRawMaterials();
    await importRemainingProperties();
    await generateFinalStats();
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  } finally {
    await pool.end();
  }
}

// Lancer l'import final
main().catch(console.error);
