/**
 * Test simple pour vérifier l'intégration des nouveaux modèles Ollama
 * Date: 2025-06-16
 */

async function testOllamaModels() {
  console.log('🚀 VÉRIFICATION DES MODÈLES OLLAMA INTÉGRÉS');
  console.log('=' * 60);
  
  const expectedModels = [
    'deepseek-coder',
    'qwen2.5-coder', 
    'qwen',
    'llama3.1',
    'phi'
  ];
  
  try {
    console.log('📡 Connexion à l\'API Ollama...');
    const response = await fetch('http://localhost:11434/api/tags');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const installedModels = data.models?.map(m => m.name) || [];
    
    console.log(`✅ Connexion réussie ! ${installedModels.length} modèles trouvés\n`);
    
    console.log('📋 MODÈLES INSTALLÉS:');
    installedModels.forEach(model => {
      const isExpected = expectedModels.some(expected => model.includes(expected.split(':')[0]));
      console.log(`  ${isExpected ? '✅' : '📋'} ${model}`);
    });
    
    console.log('\n🎯 NOUVEAUX MODÈLES INTÉGRÉS:');
    expectedModels.forEach(expected => {
      const isInstalled = installedModels.some(installed => installed.includes(expected));
      console.log(`  ${isInstalled ? '✅' : '❌'} ${expected}`);
    });
    
    // Test d'une requête simple avec DeepSeek si disponible
    const deepseekModel = installedModels.find(m => m.includes('deepseek-coder'));
    if (deepseekModel) {
      console.log('\n🧪 TEST RAPIDE AVEC DEEPSEEK-CODER:');
      
      const testResponse = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: deepseekModel,
          prompt: 'Bonjour, peux-tu confirmer que tu fonctionnes pour Housy?',
          stream: false
        })
      });
      
      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log(`  ✅ Test réussi!`);
        console.log(`  📝 Réponse: ${testData.response?.substring(0, 100)}...`);
      } else {
        console.log(`  ❌ Test échoué: ${testResponse.statusText}`);
      }
    }
    
    // Test avec Qwen si disponible
    const qwenModel = installedModels.find(m => m.includes('qwen'));
    if (qwenModel) {
      console.log('\n🧪 TEST RAPIDE AVEC QWEN:');
      
      const testResponse = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: qwenModel,
          prompt: 'Test de fonctionnement pour l\'application Housy',
          stream: false
        })
      });
      
      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log(`  ✅ Test réussi!`);
        console.log(`  📝 Réponse: ${testData.response?.substring(0, 100)}...`);
      } else {
        console.log(`  ❌ Test échoué: ${testResponse.statusText}`);
      }
    }
    
    console.log('\n📊 RÉSUMÉ:');
    const installedExpected = expectedModels.filter(expected => 
      installedModels.some(installed => installed.includes(expected))
    );
    
    console.log(`  • Modèles attendus: ${expectedModels.length}`);
    console.log(`  • Modèles installés: ${installedExpected.length}`);
    console.log(`  • Taux d'installation: ${((installedExpected.length / expectedModels.length) * 100).toFixed(1)}%`);
    
    if (installedExpected.length === expectedModels.length) {
      console.log('\n🎉 INTÉGRATION COMPLÈTE RÉUSSIE!');
      console.log('✅ Tous les nouveaux modèles sont prêts pour Housy');
    } else {
      console.log('\n⚠️  INTÉGRATION PARTIELLE');
      console.log('📋 Certains modèles peuvent être installés avec: ollama pull <nom-modèle>');
    }
    
  } catch (error) {
    console.error('❌ ERREUR:', error.message);
    console.log('\n🔧 VÉRIFICATIONS:');
    console.log('  1. Ollama est-il installé? (ollama --version)');
    console.log('  2. Ollama est-il démarré? (port 11434)');
    console.log('  3. Les modèles sont-ils téléchargés? (ollama list)');
  }
}

// Exécution du test
testOllamaModels().then(() => {
  console.log('\n🏁 Test terminé');
}).catch(error => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
