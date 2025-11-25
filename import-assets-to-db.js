#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { storage } from './server/storage.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemins vers les fichiers de données
const ATTACHED_ASSETS_PATH = path.join(__dirname, 'attached_asset');
const SERVER_DATA_PATH = path.join(__dirname, 'server/data');

console.log('🏗️ Importation des matériaux et immobiliers depuis les assets...');

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

// Importer les matériaux depuis le catalogue
async function importMaterials() {
  console.log('\n1️⃣ Importation des matériaux...');
  
  const cataloguePaths = [
    path.join(ATTACHED_ASSETS_PATH, 'catalogue_estimation_materiaux_complet.json'),
    path.join(ATTACHED_ASSETS_PATH, 'catalogue_brico_direct_detaille.json'),
    path.join(SERVER_DATA_PATH, 'materiaux/catalogue_estimation_materiaux_complet.json'),
    path.join(SERVER_DATA_PATH, 'materiaux/catalogue_brico_direct_detaille.json')
  ];

  let totalMaterials = 0;

  for (const cataloguePath of cataloguePaths) {
    const catalogue = readJsonFile(cataloguePath);
    if (!catalogue) continue;

    if (catalogue.materiaux && Array.isArray(catalogue.materiaux)) {
      console.log(`📦 Traitement de ${catalogue.materiaux.length} matériaux de ${path.basename(cataloguePath)}`);
      
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
          let price = 0;
          if (materiau.prix) {
            if (typeof materiau.prix === 'number') {
              price = materiau.prix;
            } else if (materiau.prix.unitaire_tnd) {
              price = materiau.prix.unitaire_tnd;
            } else if (materiau.prix.moyen_tnd) {
              price = materiau.prix.moyen_tnd;
            }
          }

          // Créer l'objet matériau
          const materialData = {
            name: materiau.nom || materiau.type_detaille || 'Matériau',
            category: category,
            unit: materiau.unite || 'unité',
            price: Math.max(price, 0.1), // Prix minimum de 0.1 TND
            supplier: materiau.fournisseur?.meilleur || 'Fournisseur Local',
            availability: 'available',
            description: materiau.description || `${materiau.nom} - ${materiau.unite}`,
            specifications: materiau.specifications || {},
            createdAt: new Date(),
            updatedAt: new Date()
          };

          // Sauvegarder en base
          await storage.createMaterial(materialData);
          totalMaterials++;
          
        } catch (error) {
          console.warn(`⚠️  Erreur import matériau ${materiau.nom}:`, error.message);
        }
      }
    }
  }

  console.log(`✅ ${totalMaterials} matériaux importés avec succès`);
}

// Importer les données immobilières
async function importProperties() {
  console.log('\n2️⃣ Importation des propriétés immobilières...');
  
  const propertyPaths = [
    path.join(ATTACHED_ASSETS_PATH, 'proprietes_consolidees_resume.json'),
    path.join(SERVER_DATA_PATH, 'immobilier/proprietes_consolidees_resume.json')
  ];

  let totalProperties = 0;

  for (const propertyPath of propertyPaths) {
    const data = readJsonFile(propertyPath);
    if (!data) continue;

    if (data.proprietes && Array.isArray(data.proprietes)) {
      console.log(`🏠 Traitement de ${data.proprietes.length} propriétés de ${path.basename(propertyPath)}`);
      
      for (const propriete of data.proprietes.slice(0, 50)) { // Limiter à 50 pour éviter la surcharge
        try {
          const propertyData = {
            title: propriete.titre || 'Propriété',
            description: propriete.description || 'Description non disponible',
            type: propriete.type || 'residential',
            status: 'available',
            price: Math.max(propriete.prix || 0, 1000), // Prix minimum
            location: propriete.localisation || propriete.ville || 'Tunisie',
            area: propriete.superficie || 100,
            rooms: propriete.chambres || propriete.pieces || 3,
            bathrooms: propriete.salles_bain || 1,
            features: propriete.caracteristiques || [],
            images: propriete.photos || [],
            contact: propriete.contact || 'Non spécifié',
            createdAt: new Date(),
            updatedAt: new Date()
          };

          // Sauvegarder en base (nous devrons créer cette méthode)
          // await storage.createProperty(propertyData);
          totalProperties++;
          
        } catch (error) {
          console.warn(`⚠️  Erreur import propriété:`, error.message);
        }
      }
    }
  }

  console.log(`✅ ${totalProperties} propriétés traitées`);
}

// Créer des matériaux de base si les fichiers ne sont pas trouvés
async function createBasicMaterials() {
  console.log('\n3️⃣ Création des matériaux de base...');
  
  const basicMaterials = [
    // Gros œuvre
    { name: 'Brique rouge 6 trous', category: 'gros_oeuvre', unit: 'pièce', price: 0.85, supplier: 'Briqueterie Tunisienne' },
    { name: 'Ciment gris 50kg', category: 'gros_oeuvre', unit: 'sac', price: 12.50, supplier: 'Les Ciments de Bizerte' },
    { name: 'Béton prêt à l\'emploi', category: 'gros_oeuvre', unit: 'm³', price: 85.00, supplier: 'SOTUBAT' },
    { name: 'Fer à béton Ø8mm', category: 'gros_oeuvre', unit: 'kg', price: 1.45, supplier: 'El Fouladh' },
    { name: 'Fer à béton Ø12mm', category: 'gros_oeuvre', unit: 'kg', price: 1.55, supplier: 'El Fouladh' },
    { name: 'Hourdis 16+4', category: 'gros_oeuvre', unit: 'm²', price: 18.50, supplier: 'Société Hourdis' },
    { name: 'Parpaing 20x20x50', category: 'gros_oeuvre', unit: 'pièce', price: 1.20, supplier: 'Bloctunisie' },
    { name: 'Sable lavé', category: 'gros_oeuvre', unit: 'm³', price: 35.00, supplier: 'Carrière Laouina' },
    { name: 'Gravier 5/15', category: 'gros_oeuvre', unit: 'm³', price: 40.00, supplier: 'Carrière Laouina' },
    
    // Second œuvre
    { name: 'Plâtre gris 40kg', category: 'second_oeuvre', unit: 'sac', price: 8.50, supplier: 'Knauf Tunisie' },
    { name: 'Isolation thermique 5cm', category: 'second_oeuvre', unit: 'm²', price: 15.00, supplier: 'Isover Tunisie' },
    { name: 'Cloison placo 70mm', category: 'second_oeuvre', unit: 'm²', price: 25.00, supplier: 'Placo Tunisie' },
    { name: 'Tube PVC évacuation Ø100', category: 'second_oeuvre', unit: 'ml', price: 4.50, supplier: 'Alpipe' },
    { name: 'Tube PVC alimentation Ø20', category: 'second_oeuvre', unit: 'ml', price: 2.20, supplier: 'Alpipe' },
    { name: 'Câble électrique 2.5mm²', category: 'second_oeuvre', unit: 'ml', price: 1.80, supplier: 'Nexans Tunisie' },
    { name: 'Gaine électrique Ø16', category: 'second_oeuvre', unit: 'ml', price: 0.65, supplier: 'Electro Tunisie' },
    
    // Finitions
    { name: 'Carrelage 30x30 blanc', category: 'finition', unit: 'm²', price: 18.00, supplier: 'Ceramica' },
    { name: 'Carrelage 60x60 grès', category: 'finition', unit: 'm²', price: 35.00, supplier: 'Ceramica' },
    { name: 'Faïence salle de bain', category: 'finition', unit: 'm²', price: 22.00, supplier: 'Ceramica' },
    { name: 'Peinture acrylique blanche', category: 'finition', unit: 'litre', price: 12.00, supplier: 'Astral Paints' },
    { name: 'Peinture plastique intérieur', category: 'finition', unit: 'litre', price: 8.50, supplier: 'Astral Paints' },
    { name: 'Enduit extérieur', category: 'finition', unit: 'sac 25kg', price: 15.00, supplier: 'Weber Tunisie' },
    { name: 'Mortier colle carrelage', category: 'finition', unit: 'sac 25kg', price: 12.50, supplier: 'Weber Tunisie' },
    { name: 'Joint carrelage gris', category: 'finition', unit: 'sac 5kg', price: 8.00, supplier: 'Weber Tunisie' },
    { name: 'Parquet stratifié', category: 'finition', unit: 'm²', price: 45.00, supplier: 'Quick Step' },
    { name: 'Lambris PVC blanc', category: 'finition', unit: 'm²', price: 28.00, supplier: 'Rehau Tunisie' }
  ];

  let created = 0;
  for (const material of basicMaterials) {
    try {
      const materialData = {
        ...material,
        availability: 'available',
        description: `${material.name} - ${material.unit}`,
        specifications: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await storage.createMaterial(materialData);
      created++;
    } catch (error) {
      console.warn(`⚠️  Erreur création ${material.name}:`, error.message);
    }
  }

  console.log(`✅ ${created} matériaux de base créés`);
}

// Fonction principale
async function main() {
  try {
    console.log('🚀 Début de l\'importation des données...\n');

    // Importer les matériaux depuis les fichiers JSON
    await importMaterials();
    
    // Créer des matériaux de base
    await createBasicMaterials();
    
    // Importer les propriétés immobilières
    await importProperties();

    console.log('\n🎉 Importation terminée avec succès !');
    console.log('\n📊 Vérifications recommandées :');
    console.log('   • Vérifier les matériaux : SELECT COUNT(*) FROM materials;');
    console.log('   • Tester l\'estimation : http://localhost:3000/estimation');
    console.log('   • Vérifier les catégories : SELECT DISTINCT category FROM materials;');

  } catch (error) {
    console.error('❌ Erreur lors de l\'importation :', error);
    process.exit(1);
  }
}

// Exécuter l'importation
main().catch(console.error);
