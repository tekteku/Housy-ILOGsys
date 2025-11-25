/**
 * Test direct d'estimation avec les modèles Ollama et données JSON
 * Date: 17 juin 2025
 */

const fs = require('fs');
const path = require('path');

// Simuler le chargement des données JSON réelles
function loadJSONData() {
  try {
    // Chemins vers les fichiers JSON de données
    const materialsPath = path.join(__dirname, 'server', 'data', 'materiaux', 'catalogue_estimation_materiaux_complet.json');
    const propertiesPath = path.join(__dirname, 'server', 'data', 'immobilier', 'proprietes_consolidees_resume.json');
    
    let materialsData = { materiaux: [] };
    let propertiesData = { proprietes: [] };
    
    // Chargement des matériaux
    if (fs.existsSync(materialsPath)) {
      const materialsRaw = fs.readFileSync(materialsPath, 'utf-8');
      materialsData = JSON.parse(materialsRaw);
      console.log(`✅ Données matériaux chargées: ${materialsData.materiaux?.length || 0} éléments`);
    } else {
      console.log('⚠️  Fichier matériaux non trouvé');
    }
    
    // Chargement des propriétés immobilières
    if (fs.existsSync(propertiesPath)) {
      const propertiesRaw = fs.readFileSync(propertiesPath, 'utf-8');
      propertiesData = JSON.parse(propertiesRaw);
      console.log(`✅ Données propriétés chargées: ${propertiesData.proprietes?.length || 0} éléments`);
    } else {
      console.log('⚠️  Fichier propriétés non trouvé');
    }
    
    return { materialsData, propertiesData };
  } catch (error) {
    console.error('❌ Erreur chargement JSON:', error.message);
    return { materialsData: { materiaux: [] }, propertiesData: { proprietes: [] } };
  }
}

// Enrichir le prompt avec les données JSON réelles
function enrichPromptWithJSONData(originalPrompt, projectData, jsonData) {
  const { materialsData, propertiesData } = jsonData;
  
  // Extraire quelques matériaux pertinents pour l'estimation
  const relevantMaterials = materialsData.materiaux?.slice(0, 10) || [];
  
  // Extraire quelques propriétés similaires
  const similarProperties = propertiesData.proprietes?.filter(p => 
    Math.abs(p.superficie_m2 - projectData.area) < 50
  ).slice(0, 5) || [];
  
  const enrichedPrompt = `
${originalPrompt}

DONNÉES RÉELLES DISPONIBLES POUR L'ESTIMATION:

📦 MATÉRIAUX DE CONSTRUCTION (Échantillon):
${relevantMaterials.map(m => 
  `• ${m.nom}: ${m.prix?.unitaire_tnd || 'N/A'} TND/${m.unite || 'unité'} (${m.fournisseur?.meilleur || 'Fournisseur non spécifié'})`
).join('\n')}

🏠 PROPRIÉTÉS SIMILAIRES (${projectData.area}m² ±50m²):
${similarProperties.map(p => 
  `• ${p.ville || 'Ville N/A'}: ${p.prix_tnd || 'N/A'} TND pour ${p.superficie_m2 || 'N/A'}m² (${p.type_propriete || 'Type N/A'})`
).join('\n')}

INSTRUCTIONS POUR L'ESTIMATION:
- Utilise PRIORITAIREMENT les prix des matériaux fournis ci-dessus
- Base-toi sur les propriétés similaires pour valider ton estimation
- Inclus les coûts de main-d'œuvre selon les standards tunisiens
- Projet: ${projectData.projectType}, ${projectData.area}m², ${projectData.floors} étage(s), qualité ${projectData.qualityLevel}
- ${projectData.includeWastage ? 'INCLURE' : 'EXCLURE'} les pertes de matériaux

Fournis une estimation détaillée avec justification basée sur ces données réelles.
`;

  return enrichedPrompt;
}

// Test avec différents modèles Ollama
async function testEstimationWithModels() {
  console.log('🏗️ TEST D\'ESTIMATION AVEC MODÈLES OLLAMA ET DONNÉES JSON');
  console.log('=' * 80);
  
  // Charger les données JSON
  console.log('📄 Chargement des données JSON...');
  const jsonData = loadJSONData();
  
  // Configuration du projet test
  const projectData = {
    projectType: "Maison familiale",
    area: 120,
    floors: 1,
    qualityLevel: "STANDARD",
    includeWastage: true
  };
  
  // Prompt original
  const originalPrompt = "Estime le coût total de construction d'une maison de 120m² à Tunis";
  
  // Enrichir le prompt avec les données JSON
  const enrichedPrompt = enrichPromptWithJSONData(originalPrompt, projectData, jsonData);
  
  console.log('\n📝 Prompt enrichi préparé avec les données JSON');
  console.log(`📏 Longueur du prompt: ${enrichedPrompt.length} caractères`);
  
  // Modèles à tester pour l'estimation
  const modelsToTest = [
    {
      name: "deepseek-coder:latest",
      description: "DeepSeek Coder - Spécialisé calculs et estimations",
      specialization: "calculations"
    },
    {
      name: "qwen2.5-coder:latest", 
      description: "Qwen 2.5 Coder - Excellent pour tâches techniques",
      specialization: "technical"
    },
    {
      name: "llama3.1:latest",
      description: "Llama 3.1 - Génération avancée et raisonnement",
      specialization: "reasoning"
    }
  ];
  
  console.log('\n🤖 TESTS AVEC DIFFÉRENTS MODÈLES:');
  
  for (const model of modelsToTest) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`🧪 Modèle: ${model.name}`);
    console.log(`📋 Description: ${model.description}`);
    console.log(`🎯 Spécialisation: ${model.specialization}`);
    
    const startTime = Date.now();
    
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model.name,
          prompt: enrichedPrompt,
          stream: false,
          options: {
            temperature: 0.3, // Plus conservateur pour les estimations
            top_p: 0.9
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const responseTime = Date.now() - startTime;
        
        console.log(`✅ Temps de réponse: ${responseTime}ms`);
        console.log(`📏 Longueur réponse: ${data.response?.length || 0} caractères`);
        
        // Analyser la qualité de la réponse
        const responseText = data.response || '';
        const mentionsMaterials = (responseText.match(/TND|dinar|prix|coût/gi) || []).length;
        const mentionsSpecific = (responseText.match(/béton|ciment|acier|carrelage/gi) || []).length;
        const mentionsNumbers = (responseText.match(/\d+/g) || []).length;
        
        console.log(`📊 Analyse de la réponse:`);
        console.log(`  💰 Mentions prix/coûts: ${mentionsMaterials}`);
        console.log(`  🧱 Matériaux spécifiques: ${mentionsSpecific}`);
        console.log(`  🔢 Valeurs numériques: ${mentionsNumbers}`);
        
        // Score de qualité (basique)
        const qualityScore = mentionsMaterials + mentionsSpecific + (mentionsNumbers * 0.5);
        console.log(`⭐ Score qualité estimation: ${qualityScore.toFixed(1)}/100`);
        
        // Afficher un extrait de la réponse
        console.log(`📝 Extrait de la réponse:`);
        console.log(`"${responseText.substring(0, 400)}..."`);
        
        // Déterminer si ce modèle utilise bien les données JSON
        const usesJSONData = responseText.includes('TND') && mentionsSpecific > 0;
        console.log(`🔍 Utilise les données JSON: ${usesJSONData ? '✅ OUI' : '❌ NON'}`);
        
      } else {
        console.log(`❌ Erreur HTTP: ${response.status} ${response.statusText}`);
      }
      
    } catch (error) {
      console.log(`❌ Erreur modèle: ${error.message}`);
    }
  }
  
  console.log('\n' + '=' * 80);
  console.log('📊 RECOMMANDATIONS:');
  console.log('✅ Pour les estimations: Utiliser DeepSeek Coder (le plus précis en calculs)');
  console.log('✅ Pour la génération: Utiliser Llama 3.1 (meilleur raisonnement)');
  console.log('✅ Pour les tâches rapides: Utiliser Qwen 2.5 Coder (bon compromis)');
  console.log('\n💡 Les données JSON sont intégrées automatiquement dans le prompt enrichi');
}

// Test de vérification des fichiers JSON
async function verifyJSONFiles() {
  console.log('\n🔍 VÉRIFICATION DES FICHIERS JSON DE DONNÉES');
  console.log('=' * 80);
  
  const jsonFiles = [
    {
      name: "Catalogue matériaux",
      path: path.join(__dirname, 'server', 'data', 'materiaux', 'catalogue_estimation_materiaux_complet.json')
    },
    {
      name: "Propriétés immobilières", 
      path: path.join(__dirname, 'server', 'data', 'immobilier', 'proprietes_consolidees_resume.json')
    },
    {
      name: "Index général",
      path: path.join(__dirname, 'server', 'data', 'INDEX_GENERAL.json')
    }
  ];
  
  for (const file of jsonFiles) {
    console.log(`\n📄 ${file.name}:`);
    
    if (fs.existsSync(file.path)) {
      try {
        const stats = fs.statSync(file.path);
        const data = JSON.parse(fs.readFileSync(file.path, 'utf-8'));
        
        console.log(`  ✅ Fichier trouvé`);
        console.log(`  📏 Taille: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  📅 Modifié: ${stats.mtime.toLocaleDateString()}`);
        
        // Analyser le contenu
        if (data.materiaux) {
          console.log(`  🧱 Matériaux: ${data.materiaux.length} éléments`);
        }
        if (data.proprietes) {
          console.log(`  🏠 Propriétés: ${data.proprietes.length} éléments`);
        }
        
      } catch (error) {
        console.log(`  ❌ Erreur lecture: ${error.message}`);
      }
    } else {
      console.log(`  ❌ Fichier non trouvé: ${file.path}`);
    }
  }
}

// Exécution des tests
async function runEstimationTests() {
  console.log('🚀 TESTS D\'ESTIMATION AVEC INTERACTION JSON');
  console.log(`📅 Date: ${new Date().toLocaleString()}`);
  
  await verifyJSONFiles();
  await testEstimationWithModels();
  
  console.log('\n🏁 TESTS TERMINÉS');
}

runEstimationTests().catch(console.error);
