#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration de la base de données
const dbConfig = {
  user: 'postgres',
  password: '0000',
  host: 'localhost',
  port: 5432,
  database: 'housy_tunisia',
  ssl: false
};

console.log('🏗️ Import complet des matériaux depuis tous les catalogues...');

// Fonction pour lire et parser un fichier JSON
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

// Créer la connexion PostgreSQL
async function createConnection() {
  const client = new pg.Client(dbConfig);
  await client.connect();
  return client;
}

// Importer depuis le catalogue Brico Direct
async function importBricoDirectMaterials(client) {
  console.log('\n2️⃣ Import depuis Brico Direct...');
  
  const cataloguePath = path.join(__dirname, 'attached_asset', 'catalogue_brico_direct_detaille.json');
  const catalogue = readJsonFile(cataloguePath);
  
  if (!catalogue || !catalogue.produits) {
    console.log('❌ Catalogue Brico Direct non trouvé ou invalide');
    return 0;
  }

  console.log(`📦 Traitement de ${catalogue.produits.length} produits Brico Direct...`);

  let imported = 0;
  for (const produit of catalogue.produits) {
    try {
      // Déterminer la catégorie basée sur le nom
      let category = 'autres';
      const nom = (produit.nom || produit.nom_produit || '').toLowerCase();
      
      if (nom.includes('ciment') || nom.includes('béton') || nom.includes('mortier')) {
        category = 'gros_oeuvre';
      } else if (nom.includes('carrelage') || nom.includes('faience') || nom.includes('revêtement')) {
        category = 'revêtement';
      } else if (nom.includes('peinture') || nom.includes('enduit')) {
        category = 'finition';
      } else if (nom.includes('fer') || nom.includes('acier') || nom.includes('armature')) {
        category = 'gros_oeuvre';
      } else if (nom.includes('plomberie') || nom.includes('tuyau') || nom.includes('robinet')) {
        category = 'plomberie';
      } else if (nom.includes('électrique') || nom.includes('câble') || nom.includes('gaine')) {
        category = 'électricité';
      } else if (nom.includes('isolation') || nom.includes('placo')) {
        category = 'isolation';
      }

      // Extraire le prix
      let price = 1.0;
      if (produit.prix_tnd) {
        price = produit.prix_tnd;
      } else if (produit.prix && typeof produit.prix === 'number') {
        price = produit.prix;
      } else if (produit.prix_unitaire) {
        price = produit.prix_unitaire;
      }

      const query = `
        INSERT INTO materials (name, category, unit, price, price_currency, supplier, description, created_at, last_updated)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      `;

      const values = [
        produit.nom || produit.nom_produit || 'Produit Brico Direct',
        category,
        produit.unite || 'unité',
        Math.max(price, 0.1),
        'TND',
        'Brico Direct',
        produit.description || `Produit ${produit.nom} de Brico Direct`
      ];

      await client.query(query, values);
      imported++;

    } catch (error) {
      console.warn(`⚠️  Erreur import ${produit.nom}:`, error.message);
    }
  }

  console.log(`✅ ${imported} produits Brico Direct importés`);
  return imported;
}

// Créer des matériaux de base essentiels
async function createEssentialMaterials(client) {
  console.log('\n3️⃣ Ajout de matériaux essentiels...');

  const essentialMaterials = [
    // Gros œuvre
    { name: 'Bloc béton 20x20x50', category: 'gros_oeuvre', unit: 'pièce', price: 1.85, description: 'Bloc béton standard pour murs porteurs' },
    { name: 'Poutrelle béton 12cm', category: 'gros_oeuvre', unit: 'ml', price: 28.50, description: 'Poutrelle préfabriquée en béton armé' },
    { name: 'Hourdis béton 16+4', category: 'gros_oeuvre', unit: 'pièce', price: 12.30, description: 'Hourdis béton pour plancher' },
    { name: 'Linteau béton armé', category: 'gros_oeuvre', unit: 'ml', price: 35.20, description: 'Linteau préfabriqué en béton armé' },
    
    // Revêtements
    { name: 'Carrelage 30x30 blanc', category: 'revêtement', unit: 'm²', price: 18.50, description: 'Carrelage céramique blanc standard' },
    { name: 'Carrelage 60x60 grès', category: 'revêtement', unit: 'm²', price: 32.80, description: 'Carrelage grès cérame grand format' },
    { name: 'Faience 20x25 salle de bain', category: 'revêtement', unit: 'm²', price: 28.90, description: 'Faience murale pour salle de bain' },
    { name: 'Parquet stratifié 8mm', category: 'revêtement', unit: 'm²', price: 45.60, description: 'Parquet stratifié résistant' },
    
    // Finition
    { name: 'Peinture acrylique intérieur', category: 'finition', unit: 'pot 15L', price: 89.50, description: 'Peinture acrylique mate pour intérieur' },
    { name: 'Peinture façade siloxane', category: 'finition', unit: 'pot 15L', price: 125.30, description: 'Peinture façade haute résistance' },
    { name: 'Enduit monocouche', category: 'finition', unit: 'sac 25kg', price: 22.80, description: 'Enduit de façade prêt à l\'emploi' },
    
    // Plomberie
    { name: 'Tube PVC évacuation Ø100', category: 'plomberie', unit: 'ml', price: 8.90, description: 'Tube PVC pour évacuation eaux usées' },
    { name: 'Tube PVC évacuation Ø125', category: 'plomberie', unit: 'ml', price: 12.40, description: 'Tube PVC pour évacuation principale' },
    { name: 'Tube multicouche Ø20', category: 'plomberie', unit: 'ml', price: 6.75, description: 'Tube multicouche pour alimentation' },
    
    // Électricité
    { name: 'Câble électrique 2.5mm²', category: 'électricité', unit: 'ml', price: 2.80, description: 'Câble électrique pour prises' },
    { name: 'Câble électrique 1.5mm²', category: 'électricité', unit: 'ml', price: 2.10, description: 'Câble électrique pour éclairage' },
    { name: 'Gaine électrique Ø16', category: 'électricité', unit: 'ml', price: 1.20, description: 'Gaine de protection pour câbles' },
    
    // Isolation
    { name: 'Laine de verre 100mm', category: 'isolation', unit: 'm²', price: 8.50, description: 'Isolation thermique et acoustique' },
    { name: 'Polystyrène extrudé 40mm', category: 'isolation', unit: 'm²', price: 12.90, description: 'Isolation thermique sols et murs' },
    { name: 'Placo BA13 standard', category: 'isolation', unit: 'm²', price: 9.80, description: 'Plaque de plâtre standard 13mm' }
  ];

  let created = 0;
  for (const material of essentialMaterials) {
    try {
      const query = `
        INSERT INTO materials (name, category, unit, price, price_currency, supplier, description, created_at, last_updated)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      `;

      const values = [
        material.name,
        material.category,
        material.unit,
        material.price,
        'TND',
        'Magasins Locaux',
        material.description
      ];

      await client.query(query, values);
      created++;
      console.log(`✅ ${material.name} - ${material.price} TND/${material.unit}`);

    } catch (error) {
      console.warn(`⚠️  Erreur création ${material.name}:`, error.message);
    }
  }

  console.log(`✅ ${created} matériaux essentiels ajoutés`);
  return created;
}

// Fonction principale
async function importAllMaterials() {
  let client;
  try {
    client = await createConnection();
    console.log('✅ Connexion réussie à PostgreSQL');

    let totalImported = 0;
    
    // Import Brico Direct
    totalImported += await importBricoDirectMaterials(client);
    
    // Ajout matériaux essentiels
    totalImported += await createEssentialMaterials(client);

    // Vérifier le résultat final
    const count = await client.query('SELECT COUNT(*) FROM materials');
    console.log(`\n🎉 Import terminé ! Total: ${count.rows[0].count} matériaux en base`);

    // Statistiques par catégorie
    const stats = await client.query(`
      SELECT category, COUNT(*) as count, 
             MIN(price) as min_price, 
             MAX(price) as max_price,
             ROUND(AVG(price)::numeric, 2) as avg_price
      FROM materials 
      GROUP BY category 
      ORDER BY count DESC
    `);

    console.log('\n📊 Statistiques par catégorie:');
    stats.rows.forEach(row => {
      console.log(`   • ${row.category}: ${row.count} matériaux (${row.min_price}-${row.max_price} TND, moy: ${row.avg_price} TND)`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

// Exécuter l'import
importAllMaterials().catch(console.error);
