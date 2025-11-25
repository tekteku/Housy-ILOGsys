const fetch = require('node-fetch');

const baseUrl = 'http://localhost:5000/api';

// Test data
const testEstimationData = {
  name: "Test estimation",
  projectType: "construction_neuve",
  area: 120,
  floors: 2,
  qualityLevel: "PREMIUM",
  includeWastage: true,
  projectDescription: "Maison familiale moderne",
  estimatedBudget: 0
};

async function testEstimationAPIs() {
  try {
    console.log('🧪 Test des APIs d\'estimation...\n');

    // Test 1: Calculer une estimation
    console.log('1️⃣ Test calcul d\'estimation...');
    const calculateResponse = await fetch(`${baseUrl}/estimation/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testEstimationData)
    });

    if (!calculateResponse.ok) {
      throw new Error(`Erreur calcul: ${calculateResponse.status}`);
    }

    const calculationResult = await calculateResponse.json();
    console.log('✅ Calcul d\'estimation réussi');
    console.log(`   Coût total: ${calculationResult.totalCost} TND`);
    console.log(`   Catégories: ${calculationResult.categories?.length || 0}`);

    // Test 2: Sauvegarder l'estimation
    console.log('\n2️⃣ Test sauvegarde d\'estimation...');
    const saveData = {
      ...testEstimationData,
      totalCost: calculationResult.totalCost,
      costBreakdown: calculationResult.categories?.reduce((obj, cat) => {
        obj[cat.category] = cat.totalCost;
        return obj;
      }, {}) || {},
      materialsList: calculationResult.categories || [],
      createdBy: 1
    };

    const saveResponse = await fetch(`${baseUrl}/estimation/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saveData)
    });

    if (!saveResponse.ok) {
      throw new Error(`Erreur sauvegarde: ${saveResponse.status}`);
    }

    const saveResult = await saveResponse.json();
    console.log('✅ Sauvegarde d\'estimation réussie');
    console.log(`   ID estimation: ${saveResult.estimationId || saveResult.data?.id}`);

    // Test 3: Historique des estimations
    console.log('\n3️⃣ Test historique d\'estimations...');
    const historyResponse = await fetch(`${baseUrl}/estimation/history`);

    if (!historyResponse.ok) {
      throw new Error(`Erreur historique: ${historyResponse.status}`);
    }

    const historyResult = await historyResponse.json();
    console.log('✅ Récupération historique réussie');
    console.log(`   Nombre d'estimations: ${historyResult.data?.length || historyResult.count || 0}`);

    // Test 4: Génération de rapport PDF (si estimation sauvegardée)
    if (saveResult.estimationId || saveResult.data?.id) {
      console.log('\n4️⃣ Test génération PDF...');
      const estimationId = saveResult.estimationId || saveResult.data.id;
      
      const pdfResponse = await fetch(`${baseUrl}/reports/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estimationId: estimationId,
          format: 'pdf'
        })
      });

      if (pdfResponse.ok) {
        console.log('✅ Génération PDF réussie');
        console.log(`   Content-Type: ${pdfResponse.headers.get('content-type')}`);
      } else {
        console.log(`⚠️  Erreur génération PDF: ${pdfResponse.status}`);
      }
    }

    // Test 5: Génération PDF directe (sans ID)
    console.log('\n5️⃣ Test génération PDF directe...');
    const directPdfResponse = await fetch(`${baseUrl}/reports/estimation-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: 'pdf',
        estimationData: {
          name: testEstimationData.name,
          projectType: testEstimationData.projectType,
          area: testEstimationData.area,
          floors: testEstimationData.floors,
          qualityLevel: testEstimationData.qualityLevel,
          wastageIncluded: testEstimationData.includeWastage,
          totalCost: calculationResult.totalCost,
          categories: calculationResult.categories
        }
      })
    });

    if (directPdfResponse.ok) {
      console.log('✅ Génération PDF directe réussie');
      console.log(`   Content-Type: ${directPdfResponse.headers.get('content-type')}`);
    } else {
      console.log(`⚠️  Erreur génération PDF directe: ${directPdfResponse.status}`);
    }

    console.log('\n🎉 Tous les tests d\'API d\'estimation ont été exécutés !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    console.log('\n💡 Vérifiez que le serveur backend est démarré sur le port 5000');
  }
}

// Exécuter les tests
testEstimationAPIs();
