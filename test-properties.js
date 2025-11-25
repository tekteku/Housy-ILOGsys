#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Test de lecture des fichiers de propriétés...');

const files = [
  'proprietes_consolidees_resume.json',
  'proprietes_tecnocasa_tn.json', 
  'proprietes_mubawab_tn.json',
  'proprietes_remax_com_tn.json'
];

for (const file of files) {
  const filePath = path.join(__dirname, 'attached_asset', file);
  
  console.log(`\n📄 Test de ${file}:`);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Fichier non trouvé`);
      continue;
    }
    
    // Lire le fichier en tant que texte brut
    const rawContent = fs.readFileSync(filePath, 'utf8');
    console.log(`📝 Taille: ${rawContent.length} caractères`);
    console.log(`🔍 Premiers caractères: "${rawContent.substring(0, 50)}..."`);
    
    // Essayer de parser le JSON
    const data = JSON.parse(rawContent);
    console.log(`✅ JSON valide`);
    console.log(`🔑 Clés principales:`, Object.keys(data).slice(0, 5));
    
    if (data.proprietes_echantillon) {
      console.log(`🏠 ${data.proprietes_echantillon.length} propriétés trouvées`);
    } else if (data.proprietes) {
      console.log(`🏠 ${data.proprietes.length} propriétés trouvées`);
    } else {
      console.log(`⚠️  Pas de propriétés trouvées avec les clés standard`);
    }
    
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
  }
}

console.log('\n🎯 Test terminé !');
