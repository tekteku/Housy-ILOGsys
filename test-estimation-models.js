/**
 * Test d'estimation IA avec tracking des modèles et interaction JSON
 * Date: 17 juin 2025
 */

async function testEstimationWithModelTracking() {
  console.log('🏗️ TEST D\'ESTIMATION IA AVEC TRACKING DES MODÈLES');
  console.log('=' * 80);
  
  // Configuration du test
  const testCases = [
    {
      name: "Estimation Maison Standard - Utilisateur Normal",
      userRole: "client",
      preferredModel: undefined, // Auto-sélection
      request: {
        prompt: "Estime le coût d'une maison de 120m² à Tunis",
        context: {
          projectType: "residential",
          area: 120,
          floors: 1,
          qualityLevel: "STANDARD",
          includeWastage: true
        }
      }
    },
    {
      name: "Estimation Villa Premium - Admin",
      userRole: "admin", 
      preferredModel: "ollama", // Demande explicite d'Ollama
      request: {
        prompt: "Calcule le budget pour une villa de 250m² haut de gamme",
        context: {
          projectType: "residential",
          area: 250,
          floors: 2,
          qualityLevel: "LUXE",
          includeWastage: true
        }
      }
    },
    {
      name: "Estimation Commercial - Client avec Ollama (RESTREINT)",
      userRole: "client",
      preferredModel: "ollama", // Doit être refusé
      request: {
        prompt: "Estime un bâtiment commercial de 500m²",
        context: {
          projectType: "commercial",
          area: 500,
          floors: 1,
          qualityLevel: "PREMIUM",
          includeWastage: false
        }
      }
    },
    {
      name: "Estimation avec DeepSeek - Admin",
      userRole: "admin",
      preferredModel: "deepseek",
      request: {
        prompt: "Analyse détaillée pour complexe résidentiel 800m²",
        context: {
          projectType: "residential",
          area: 800,
          floors: 3,
          qualityLevel: "PREMIUM",
          includeWastage: true
        }
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log(`👤 Rôle: ${testCase.userRole}`);
    console.log(`🤖 Modèle demandé: ${testCase.preferredModel || 'auto'}`);
    console.log('-'.repeat(60));
    
    try {
      // Simulation d'appel API d'estimation
      const response = await fetch('http://localhost:5000/api/estimation-ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Simulation du token d'authentification
          'Authorization': `Bearer fake-token-${testCase.userRole}`
        },
        body: JSON.stringify({
          ...testCase.request,
          preferredModel: testCase.preferredModel
        })
      });

      if (!response.ok) {
        console.log(`❌ Erreur HTTP ${response.status}: ${response.statusText}`);
        continue;
      }

      const result = await response.json();
      
      // Afficher les informations de tracking (si disponibles)
      console.log(`✅ Estimation générée avec succès`);
      
      if (result.metadata) {
        console.log(`🔍 Modèle utilisé: ${result.metadata.modelUsed || 'Non spécifié'}`);
        console.log(`⚡ Temps d'exécution: ${result.metadata.executionTime || 'N/A'}ms`);
        console.log(`📊 Type de tâche: ${result.metadata.taskType || 'estimation'}`);
        
        if (result.metadata.modelSelection) {
          console.log(`🎯 Raison sélection: ${result.metadata.modelSelection.reason}`);
          console.log(`🔒 Restriction appliquée: ${result.metadata.modelSelection.restricted ? 'Oui' : 'Non'}`);
        }
      }
      
      // Afficher un extrait de la réponse
      const responseText = result.response || result.estimation || "Réponse non disponible";
      console.log(`📝 Réponse (extrait): ${responseText.substring(0, 200)}...`);

    } catch (error) {
      console.log(`❌ Erreur de test: ${error.message}`);
    }
  }
}

// Test spécifique de l'interaction avec les fichiers JSON
async function testJSONDataInteraction() {
  console.log('\n\n📄 TEST D\'INTERACTION AVEC LES DONNÉES JSON');
  console.log('=' * 80);
  
  try {
    // Test d'accès direct aux données JSON via l'API
    const dataResponse = await fetch('http://localhost:5000/api/data/summary');
    
    if (dataResponse.ok) {
      const dataSummary = await dataResponse.json();
      
      console.log('✅ Accès aux données JSON réussi:');
      console.log(`  📦 Matériaux disponibles: ${dataSummary.nb_materiaux || 'N/A'}`);
      console.log(`  🏠 Propriétés immobilières: ${dataSummary.nb_proprietes || 'N/A'}`);
      console.log(`  💰 Prix moyen matériaux: ${dataSummary.prix_moyen_materiaux_tnd || 'N/A'} TND`);
      console.log(`  📍 Villes couvertes: ${dataSummary.villes_disponibles?.slice(0, 5).join(', ') || 'N/A'}...`);
      
      // Test d'une estimation avec enrichissement de données
      console.log('\n🔄 Test d\'estimation avec enrichissement JSON...');
      
      const enrichedEstimation = await fetch('http://localhost:5000/api/estimation-ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fake-token-admin'
        },
        body: JSON.stringify({
          prompt: "Utilise les données JSON réelles pour estimer une maison de 150m² à Sousse",
          context: {
            projectType: "residential",
            area: 150,
            floors: 2,
            qualityLevel: "PREMIUM",
            includeWastage: true
          },
          preferredModel: "deepseek-coder" // Modèle spécialisé calculs
        })
      });

      if (enrichedEstimation.ok) {
        const enrichedResult = await enrichedEstimation.json();
        console.log('✅ Estimation enrichie générée:');
        console.log(`🤖 Modèle: ${enrichedResult.metadata?.modelUsed || 'Non spécifié'}`);
        console.log(`📊 Données JSON utilisées: ${enrichedResult.metadata?.jsonDataUsed ? 'Oui' : 'Non'}`);
        console.log(`📝 Réponse: ${(enrichedResult.response || '').substring(0, 300)}...`);
      } else {
        console.log('❌ Échec de l\'estimation enrichie');
      }
      
    } else {
      console.log('❌ Impossible d\'accéder aux données JSON');
    }
    
  } catch (error) {
    console.log(`❌ Erreur d'interaction JSON: ${error.message}`);
  }
}

// Test de monitoring des modèles Ollama
async function testOllamaModelMonitoring() {
  console.log('\n\n👁️ MONITORING DES MODÈLES OLLAMA UTILISÉS');
  console.log('=' * 80);
  
  try {
    // Vérifier les modèles disponibles
    const ollamaResponse = await fetch('http://localhost:11434/api/tags');
    
    if (ollamaResponse.ok) {
      const ollamaData = await ollamaResponse.json();
      const models = ollamaData.models || [];
      
      console.log('📋 Modèles Ollama disponibles pour estimation:');
      
      const estimationModels = models.filter(m => 
        m.name.includes('deepseek-coder') || 
        m.name.includes('qwen') || 
        m.name.includes('llama3.1')
      );
      
      estimationModels.forEach(model => {
        console.log(`  🤖 ${model.name} (${(model.size/1e9).toFixed(1)}GB)`);
      });
      
      // Test de performance par modèle
      console.log('\n⚡ Test de performance des modèles d\'estimation:');
      
      for (const model of estimationModels.slice(0, 2)) { // Limite à 2 pour le test
        const startTime = Date.now();
        
        try {
          const testResponse = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: model.name,
              prompt: "Calcule rapidement: prix béton pour 100m² en Tunisie",
              stream: false
            })
          });
          
          if (testResponse.ok) {
            const testData = await testResponse.json();
            const responseTime = Date.now() - startTime;
            
            console.log(`  ✅ ${model.name}: ${responseTime}ms`);
            console.log(`     Réponse: ${(testData.response || '').substring(0, 100)}...`);
          } else {
            console.log(`  ❌ ${model.name}: Échec`);
          }
        } catch (error) {
          console.log(`  ❌ ${model.name}: Erreur - ${error.message}`);
        }
      }
      
    } else {
      console.log('❌ Ollama non accessible');
    }
    
  } catch (error) {
    console.log(`❌ Erreur monitoring Ollama: ${error.message}`);
  }
}

// Exécution des tests
async function runAllTests() {
  console.log('🚀 DÉBUT DES TESTS D\'ESTIMATION IA');
  console.log(`📅 Date: ${new Date().toLocaleString()}`);
  console.log(''.padEnd(80, '='));
  
  await testEstimationWithModelTracking();
  await testJSONDataInteraction();
  await testOllamaModelMonitoring();
  
  console.log('\n' + ''.padEnd(80, '='));
  console.log('🏁 TESTS TERMINÉS');
  console.log('\n💡 Note: Pour des tests complets, démarrez le serveur Housy sur le port 5000');
}

// Exécuter les tests
runAllTests().catch(console.error);
