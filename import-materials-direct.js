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

console.log('🏗️ Import direct des matériaux dans PostgreSQL...');
console.log('📊 Configuration:', {
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user
});

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

// Importer les matériaux
async function importMaterials() {
  console.log('\n1️⃣ Connexion à la base de données...');
  
  let client;
  try {
    client = await createConnection();
    console.log('✅ Connexion réussie à PostgreSQL');

    // Vérifier si la table materials existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'materials'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Table "materials" non trouvée. Veuillez d\'abord exécuter les migrations.');
      return;
    }

    console.log('✅ Table "materials" trouvée');

    // Lire le catalogue principal
    const cataloguePath = path.join(__dirname, 'attached_asset', 'catalogue_estimation_materiaux_complet.json');
    const catalogue = readJsonFile(cataloguePath);
    
    if (!catalogue || !catalogue.materiaux) {
      console.log('❌ Impossible de lire le catalogue de matériaux');
      return;
    }

    console.log(`📦 Traitement de ${catalogue.materiaux.length} matériaux...`);

    let imported = 0;
    for (const materiau of catalogue.materiaux) {
      try {
        // Déterminer la catégorie
        let category = 'autres';
        if (materiau.categorie) {
          category = materiau.categorie;
        } else if (materiau.nom) {
          const nom = materiau.nom.toLowerCase();
          if (nom.includes('brique') || nom.includes('béton') || nom.includes('ciment') || nom.includes('fer')) {
            category = 'gros_oeuvre';
          } else if (nom.includes('carrelage') || nom.includes('parquet') || nom.includes('peinture')) {
            category = 'finition';
          } else if (nom.includes('plâtre') || nom.includes('isolation') || nom.includes('plomberie')) {
            category = 'second_oeuvre';
          }
        }

        // Extraire le prix
        let price = 1.0; // Prix par défaut
        if (materiau.prix) {
          if (typeof materiau.prix === 'number') {
            price = materiau.prix;
          } else if (materiau.prix.unitaire_tnd) {
            price = materiau.prix.unitaire_tnd;
          } else if (materiau.prix.moyen_tnd) {
            price = materiau.prix.moyen_tnd;
          }
        }

        // Insérer le matériau
        const query = `
          INSERT INTO materials (name, category, unit, price, price_currency, supplier, description, created_at, last_updated)
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        `;

        const values = [
          materiau.nom || 'Matériau',
          category,
          materiau.unite || 'unité',
          Math.max(price, 0.1),
          'TND',
          materiau.fournisseur?.meilleur || 'Fournisseur Local',
          materiau.description || `${materiau.nom} - ${materiau.unite}`
        ];

        await client.query(query, values);
        imported++;
        console.log(`✅ ${materiau.nom} - ${price} TND/${materiau.unite || 'unité'}`);

      } catch (error) {
        console.warn(`⚠️  Erreur import ${materiau.nom}:`, error.message);
      }
    }

    console.log(`\n🎉 ${imported} matériaux importés avec succès !`);

    // Vérifier le résultat
    const count = await client.query('SELECT COUNT(*) FROM materials');
    console.log(`📊 Total matériaux en base: ${count.rows[0].count}`);

    // Afficher quelques exemples
    const samples = await client.query('SELECT name, category, price, price_currency, unit FROM materials LIMIT 5');
    console.log('\n📋 Exemples de matériaux:');
    samples.rows.forEach(row => {
      console.log(`   • ${row.name} (${row.category}) - ${row.price} ${row.price_currency}/${row.unit}`);
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
importMaterials().catch(console.error);
