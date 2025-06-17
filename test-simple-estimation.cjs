/**
 * Test simplifié pour identifier le meilleur modèle d'estimation
 * Date: 17 juin 2025
 */

async function testEstimationModelsSimple() {
  console.log('🏗️ TEST SIMPLIFIÉ - MODÈLES D\'ESTIMATION HOUSY');
  console.log('=' * 60);
  
  // Prompt d'estimation simple mais précis
  const estimationPrompt = `
Tu es un expert en estimation de coûts de construction en Tunisie.

PROJET À ESTIMER:
- Type: Maison familiale résidentielle
- Surface: 120m² 
- Étages: 1 étage (RDC)
- Qualité: Standard tunisien
- Localisation: Tunis, Tunisie

DONNÉES DE RÉFÉRENCE (Tunisie 2025):
- Béton: 150-200 TND/m³
- Acier: 3-4 TND/kg  
- Carrelage: 25-50 TND/m²
- Main d'œuvre: 50-80 TND/jour

TÂCHE:
Calcule le coût total de construction et donne une estimation détaillée par poste.
Réponds en français et inclus les justifications de tes calculs.
`;

  const models = [
    { name: "deepseek-coder:latest", desc: "DeepSeek Coder (Calculs)" },
    { name: "qwen2.5-coder:latest", desc: "Qwen 2.5 Coder (Technique)" },
    { name: "llama3.1:latest", desc: "Llama 3.1 (Raisonnement)" }
  ];

  for (const model of models) {
    console.log(`\n🤖 TEST AVEC: ${model.desc}`);
    console.log('─'.repeat(50));
    
    const startTime = Date.now();
    
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model.name,
          prompt: estimationPrompt,
          stream: false,
          options: {
            temperature: 0.2, // Très conservateur pour estimations
            num_predict: 500  // Limite la longueur de réponse
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const responseTime = Date.now() - startTime;
        const responseText = data.response || '';

        console.log(`⏱️  Temps: ${responseTime}ms`);
        console.log(`📏 Longueur: ${responseText.length} caractères`);
        
        // Analyse de la qualité de l'estimation
        const hasPrices = /\d+.*TND|TND.*\d+/i.test(responseText);
        const hasCalculations = (responseText.match(/\d+/g) || []).length;
        const hasMaterials = /béton|acier|carrelage|ciment/i.test(responseText);
        const isFrench = /coût|prix|estimation|construction/i.test(responseText);
        
        console.log(`💰 Contient des prix TND: ${hasPrices ? '✅' : '❌'}`);
        console.log(`🔢 Nombre de calculs: ${hasCalculations}`);
        console.log(`🧱 Mentionne matériaux: ${hasMaterials ? '✅' : '❌'}`);
        console.log(`🇫🇷 Répond en français: ${isFrench ? '✅' : '❌'}`);
        
        // Score simple
        const score = (hasPrices ? 25 : 0) + 
                     (hasCalculations * 2) + 
                     (hasMaterials ? 25 : 0) + 
                     (isFrench ? 25 : 0);
        console.log(`⭐ Score qualité: ${score}/100`);
        
        // Extrait de la réponse
        console.log(`📝 Réponse (200 premiers caractères):`);
        console.log(`"${responseText.substring(0, 200)}..."`);
        
        // Recommandation
        if (score >= 70) {
          console.log(`🏆 EXCELLENT pour estimation`);
        } else if (score >= 40) {
          console.log(`👍 BON pour estimation`);
        } else {
          console.log(`👎 INADÉQUAT pour estimation`);
        }
        
      } else {
        console.log(`❌ Erreur HTTP: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`❌ Erreur: ${error.message}`);
    }
    
    // Pause entre les tests pour éviter la surcharge
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '=' * 60);
  console.log('🎯 RECOMMANDATIONS FINALES:');
  console.log('');
  console.log('📊 Pour l\'ESTIMATION dans Housy:');
  console.log('1️⃣  MEILLEUR: Le modèle avec le score le plus élevé');
  console.log('2️⃣  IMPORTANT: Celui qui inclut des prix en TND');
  console.log('3️⃣  ESSENTIEL: Celui qui fait des calculs détaillés');
  console.log('');
  console.log('🔧 Dans le code Housy:');
  console.log('• estimation-ai-service.ts utilise la sélection automatique');
  console.log('• Les admin peuvent forcer Ollama local');
  console.log('• Les données JSON enrichissent automatiquement le prompt');
}

// Test pour voir l'interaction avec les fichiers JSON
async function checkJSONInteraction() {
  console.log('\n📄 VÉRIFICATION INTERACTION JSON');
  console.log('=' * 60);
  
  // Vérifier la présence des fichiers JSON
  const fs = require('fs');
  const path = require('path');
  
  const files = [
    'server/data/materiaux/catalogue_estimation_materiaux_complet.json',
    'server/data/INDEX_GENERAL.json'
  ];
  
  for (const file of files) {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      console.log(`✅ ${file}`);
      console.log(`   📏 ${(stats.size/1024).toFixed(1)} KB`);
      
      try {
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
        if (data.materiaux) {
          console.log(`   🧱 ${data.materiaux.length} matériaux`);
          
          // Montrer quelques exemples
          const sample = data.materiaux.slice(0, 3);
          sample.forEach(m => {
            console.log(`      • ${m.nom}: ${m.prix?.unitaire_tnd || 'N/A'} TND`);
          });
        }
      } catch (e) {
        console.log(`   ❌ Erreur JSON: ${e.message}`);
      }
    } else {
      console.log(`❌ ${file} - Non trouvé`);
    }
  }
  
  console.log('\n💡 Dans Housy:');
  console.log('• data-service.ts charge ces fichiers JSON');
  console.log('• ai-service.ts enrichit les prompts avec ces données');
  console.log('• estimation-ai-service.ts combine modèle + données JSON');
}

// Exécution des tests
async function runTests() {
  await checkJSONInteraction();
  await testEstimationModelsSimple();
  console.log('\n🏁 TESTS TERMINÉS');
}

runTests().catch(console.error);
