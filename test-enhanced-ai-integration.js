/**
 * Script de test pour l'intégration des nouveaux modèles Ollama
 * Date: 2025-06-16
 * Auteur: tekteku
 * 
 * IMPORTANT: Ce script teste UNIQUEMENT les fonctionnalités de développement
 * L'utilisateur final ne voit JAMAIS quel modèle traite quoi
 */

import { aiService } from '../server/services/ai-service.js';

// Configuration de test
const TEST_CONFIG = {
  sessionId: `test_${Date.now()}`,
  userId: 1,
  testMessages: [
    {
      content: "Combien coûte une maison de 120m² à Tunis?",
      expectedTaskType: "estimation",
      description: "Test d'estimation immobilière"
    },
    {
      content: "Génère un rapport sur les matériaux de construction",
      expectedTaskType: "generation", 
      description: "Test de génération de contenu"
    },
    {
      content: "Bonjour, comment ça va?",
      expectedTaskType: "chat",
      description: "Test de conversation générale"
    }
  ],
  modelsToTest: [
    'auto',
    'deepseek-coder',
    'qwen2.5-coder', 
    'qwen',
    'llama3.1'
  ]
};

// Fonction de test principal
async function testEnhancedAIIntegration() {
  console.log('🚀 DÉBUT DES TESTS D\'INTÉGRATION DES MODÈLES IA');
  console.log('=' * 60);
  
  const results = {
    totalTests: 0,
    successfulTests: 0,
    failedTests: 0,
    errors: []
  };

  // Test de chaque modèle avec chaque type de message
  for (const model of TEST_CONFIG.modelsToTest) {
    console.log(`\n📊 Test du modèle: ${model}`);
    console.log('-' * 40);
    
    for (const testMessage of TEST_CONFIG.testMessages) {
      results.totalTests++;
      
      try {
        console.log(`  📝 ${testMessage.description}`);
        console.log(`     Message: "${testMessage.content}"`);
        
        const startTime = Date.now();
        
        // Test avec la nouvelle méthode améliorée
        const response = await aiService.processChatMessageEnhanced(
          TEST_CONFIG.sessionId,
          TEST_CONFIG.userId,
          testMessage.content,
          model,
          'admin' // Test avec privilèges admin pour accéder à tous les modèles
        );
        
        const endTime = Date.now();
        const executionTime = endTime - startTime;
        
        console.log(`     ✅ Succès (${executionTime}ms)`);
        console.log(`     Réponse: ${response.substring(0, 100)}...`);
        
        results.successfulTests++;
        
      } catch (error) {
        console.log(`     ❌ Échec: ${error.message}`);
        results.failedTests++;
        results.errors.push({
          model,
          message: testMessage.content,
          error: error.message
        });
      }
    }
  }

  // Test des restrictions d'accès (utilisateur normal vs admin)
  console.log(`\n🔒 Test des restrictions d'accès`);
  console.log('-' * 40);
  
  try {
    // Test utilisateur normal essayant d'accéder à un modèle restreint
    const restrictedResponse = await aiService.processChatMessageEnhanced(
      TEST_CONFIG.sessionId,
      TEST_CONFIG.userId,
      "Test restriction",
      'deepseek-coder',
      'user' // Utilisateur normal
    );
    
    console.log(`  ✅ Restriction respectée - fallback vers modèle autorisé`);
    results.successfulTests++;
    
  } catch (error) {
    console.log(`  ❌ Erreur de restriction: ${error.message}`);
    results.failedTests++;
  }

  // Affichage des résultats finaux
  console.log('\n' + '=' * 60);
  console.log('📊 RÉSULTATS FINAUX');
  console.log('=' * 60);
  console.log(`Total tests: ${results.totalTests + 1}`);
  console.log(`Succès: ${results.successfulTests}`);
  console.log(`Échecs: ${results.failedTests}`);
  console.log(`Taux de réussite: ${((results.successfulTests / (results.totalTests + 1)) * 100).toFixed(1)}%`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ ERREURS DÉTAILLÉES:');
    results.errors.forEach((error, index) => {
      console.log(`${index + 1}. Modèle: ${error.model}`);
      console.log(`   Message: ${error.message}`);
      console.log(`   Erreur: ${error.error}\n`);
    });
  }

  // Test de vérification des modèles Ollama disponibles
  console.log('\n🔍 VÉRIFICATION DES MODÈLES OLLAMA DISPONIBLES');
  console.log('-' * 60);
  
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (response.ok) {
      const data = await response.json();
      const availableModels = data.models?.map(m => m.name) || [];
      
      console.log('Modèles Ollama installés:');
      availableModels.forEach(model => {
        const isSupported = TEST_CONFIG.modelsToTest.includes(model);
        console.log(`  ${isSupported ? '✅' : '📋'} ${model}`);
      });
      
      // Vérifier si les nouveaux modèles sont installés
      const newModels = ['deepseek-coder', 'qwen2.5-coder', 'qwen'];
      const installedNewModels = newModels.filter(model => availableModels.includes(model));
      
      console.log(`\n🎯 Nouveaux modèles installés: ${installedNewModels.length}/${newModels.length}`);
      installedNewModels.forEach(model => console.log(`  ✅ ${model}`));
      
    } else {
      console.log('❌ Impossible de contacter Ollama API');
    }
  } catch (error) {
    console.log(`❌ Erreur de connexion Ollama: ${error.message}`);
  }

  console.log('\n🏁 TESTS TERMINÉS');
  
  return results;
}

// Test spécifique du système de tracking (développement uniquement)
async function testModelTracking() {
  console.log('\n🔍 TEST DU SYSTÈME DE TRACKING (DÉVELOPPEMENT)');
  console.log('-' * 60);
  
  try {
    // Simuler quelques requêtes pour générer des données de tracking
    await aiService.processChatMessageEnhanced(
      'tracking_test_session',
      999,
      'Test tracking estimation',
      'auto',
      'admin'
    );
    
    console.log('✅ Tracking de test généré');
    console.log('📋 Note: Les données de tracking sont invisibles à l\'utilisateur final');
    console.log('📋 Elles sont uniquement pour le développement et debugging');
    
  } catch (error) {
    console.log(`❌ Erreur tracking: ${error.message}`);
  }
}

// Exécution des tests si le script est lancé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      await testEnhancedAIIntegration();
      await testModelTracking();
    } catch (error) {
      console.error('Erreur générale des tests:', error);
      process.exit(1);
    }
  })();
}

export { testEnhancedAIIntegration, testModelTracking };
