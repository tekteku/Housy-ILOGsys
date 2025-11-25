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

console.log('🏠 Import des propriétés immobilières depuis attached_assets...');

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
  if (!text || text === 'NaN') return null;
  return String(text).replace(/[^\w\s\-\.]/g, ' ').trim().substring(0, 500) || null;
}

// Fonction pour extraire le prix numérique
function extractPrice(priceData) {
  if (!priceData || priceData === 'NaN') return 100000; // Prix par défaut
  
  if (typeof priceData === 'number') return Math.max(priceData, 1000);
  
  if (typeof priceData === 'string') {
    // Extraire les chiffres de la chaîne
    const matches = priceData.match(/[\d,\.]+/g);
    if (matches) {
      const numStr = matches[0].replace(/,/g, '');
      const num = parseFloat(numStr);
      return isNaN(num) ? 100000 : Math.max(num, 1000);
    }
  }
  
  return 100000; // Prix par défaut si rien trouvé
}

// Fonction pour extraire la superficie
function extractArea(areaData) {
  if (!areaData || areaData === 'NaN') return null;
  
  if (typeof areaData === 'number') return Math.max(areaData, 0);
  
  if (typeof areaData === 'string') {
    const matches = areaData.match(/[\d,\.]+/);
    if (matches) {
      const num = parseFloat(matches[0].replace(/,/g, ''));
      return isNaN(num) ? null : Math.max(num, 0);
    }
  }
  
  return null;
}

// Fonction pour normaliser le type de propriété
function normalizePropertyType(type) {
  if (!type || type === 'NaN') return 'Appartement';
  
  const typeStr = String(type).toLowerCase();
  if (typeStr.includes('villa') || typeStr.includes('house') || typeStr.includes('maison')) {
    return 'Villa';
  } else if (typeStr.includes('appartement') || typeStr.includes('apartment')) {
    return 'Appartement';
  } else if (typeStr.includes('studio')) {
    return 'Studio';
  } else if (typeStr.includes('duplex')) {
    return 'Duplex';
  } else if (typeStr.includes('bureau') || typeStr.includes('office')) {
    return 'Bureau';
  } else if (typeStr.includes('terrain') || typeStr.includes('land')) {
    return 'Terrain';
  }
  
  return cleanText(type) || 'Appartement';
}

// Fonction pour normaliser la ville/gouvernorat
function normalizeLocation(location) {
  if (!location || location === 'NaN') return 'Tunis';
  
  const locationStr = String(location).toLowerCase();
  
  // Gouvernorats tunisiens
  const gouvernorats = [
    'tunis', 'sfax', 'sousse', 'kairouan', 'bizerte', 'gabes', 'ariana', 
    'gafsa', 'monastir', 'ben arous', 'kasserine', 'medenine', 'nabeul',
    'tataouine', 'beja', 'jendouba', 'mahdia', 'manouba', 'siliana',
    'tozeur', 'zaghouan', 'kef', 'sidi bouzid', 'kebili'
  ];
  
  for (const gouvernorat of gouvernorats) {
    if (locationStr.includes(gouvernorat)) {
      return gouvernorat.charAt(0).toUpperCase() + gouvernorat.slice(1);
    }
  }
  
  return cleanText(location) || 'Tunis';
}

// Import des propriétés
async function importProperties() {
  console.log('\n🏠 Import des propriétés immobilières...');
  
  const propertyFiles = [
    'proprietes_consolidees_resume.json',
    'proprietes_tecnocasa_tn.json',
    'proprietes_mubawab_tn.json',
    'proprietes_remax_com_tn.json'
  ];

  let totalProperties = 0;
  let totalErrors = 0;

  for (const file of propertyFiles) {
    const data = readJsonFile(path.join(ATTACHED_ASSETS_PATH, file));
    if (!data) continue;

    console.log(`🏘️  Traitement du fichier: ${file}`);

    try {
      let properties = [];
      
      // Extraire les propriétés selon la structure
      if (data.proprietes && Array.isArray(data.proprietes)) {
        properties = data.proprietes;
      } else if (data.proprietes_echantillon && Array.isArray(data.proprietes_echantillon)) {
        properties = data.proprietes_echantillon;
      } else if (data.properties && Array.isArray(data.properties)) {
        properties = data.properties;
      } else if (data.listings && Array.isArray(data.listings)) {
        properties = data.listings;
      } else if (Array.isArray(data)) {
        properties = data;
      } else {
        console.log(`   ⚠️  Structure inconnue pour ${file}`);
        console.log(`   🔍  Clés disponibles:`, Object.keys(data).slice(0, 5));
        continue;
      }

      console.log(`   📦 ${properties.length} propriétés trouvées`);

      for (const property of properties.slice(0, 200)) { // Augmenter à 200 par fichier
        try {
          const propertyQuery = `
            INSERT INTO real_estate_market (
              property_id, title, description, price, price_currency, area, 
              rooms, property_type, city, governorate, address, source, 
              url, scraped_at, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
          `;

          const propertyId = property.property_id || property.id || `${file}_${totalProperties}`;
          const title = cleanText(property.title || property.nom || property.name || 'Propriété');
          const description = cleanText(property.description || property.desc || title);
          const price = extractPrice(property.price || property.prix || property.cost);
          const area = extractArea(property.area || property.superficie || property.surface);
          const rooms = cleanText(property.rooms || property.bedrooms || property.chambres) || '2';
          const propertyType = normalizePropertyType(property.property_type || property.type || property.category);
          const city = normalizeLocation(property.city || property.ville || property.location || property.region);
          const governorate = normalizeLocation(property.governorate || property.gouvernorat || city);
          const address = cleanText(property.address || property.adresse || property.location);
          const source = file.includes('remax') ? 'remax.com.tn' : 
                       file.includes('mubawab') ? 'mubawab.tn' : 
                       file.includes('tecnocasa') ? 'tecnocasa.tn' : 'housy_import';
          const url = cleanText(property.listing_url || property.url || property.link);

          await pool.query(propertyQuery, [
            String(propertyId),
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
            new Date(),
          ]);

          totalProperties++;
          
          if (totalProperties % 20 === 0) {
            console.log(`   📈 ${totalProperties} propriétés importées...`);
          }
        } catch (error) {
          totalErrors++;
          if (totalErrors <= 5) { // Afficher seulement les 5 premières erreurs
            console.warn(`   ⚠️  Erreur propriété: ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️  Erreur fichier ${file}: ${error.message}`);
    }
  }

  console.log(`✅ ${totalProperties} propriétés importées (${totalErrors} erreurs)`);
}

// Fonction pour corriger les valeurs NaN dans les fichiers
async function fixNaNValues() {
  console.log('\n🔧 Correction des valeurs NaN...');
  
  const propertyFiles = [
    'proprietes_consolidees_resume.json',
    'proprietes_tecnocasa_tn.json',
    'proprietes_mubawab_tn.json',
    'proprietes_remax_com_tn.json'
  ];

  for (const file of propertyFiles) {
    const filePath = path.join(ATTACHED_ASSETS_PATH, file);
    if (!fs.existsSync(filePath)) continue;

    console.log(`🔧 Correction de ${file}...`);

    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Remplacer les différents types de NaN
      content = content
        .replace(/:\s*NaN,/g, ': null,')
        .replace(/:\s*NaN\s*}/g, ': null }')
        .replace(/:\s*NaN\s*]/g, ': null ]')
        .replace(/\[\s*NaN,/g, '[ null,')
        .replace(/,\s*NaN,/g, ', null,')
        .replace(/,\s*NaN\s*]/g, ', null ]');

      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`   ✅ ${file} corrigé`);
    } catch (error) {
      console.warn(`   ⚠️  Erreur correction ${file}: ${error.message}`);
    }
  }
}

// Fonction principale
async function main() {
  try {
    console.log('🎯 Connexion à la base de données housy_tunisia...');
    await pool.query('SELECT NOW()');
    console.log('✅ Connexion réussie !');

    await fixNaNValues();
    await importProperties();

    // Statistiques finales
    console.log('\n📊 Statistiques finales:');
    
    const propertiesResult = await pool.query('SELECT COUNT(*) FROM real_estate_market');
    console.log(`   🏠 ${propertiesResult.rows[0].count} propriétés au total`);

    const materialsResult = await pool.query('SELECT COUNT(*) FROM materials');
    console.log(`   🔨 ${materialsResult.rows[0].count} matériaux au total`);

    const projectsResult = await pool.query('SELECT COUNT(*) FROM projects');
    console.log(`   📋 ${projectsResult.rows[0].count} projets au total`);

    console.log('\n🎉 Import des propriétés terminé !');
    console.log('🔗 Base de données housy_tunisia maintenant complète !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  } finally {
    await pool.end();
  }
}

// Lancer l'import
main().catch(console.error);
