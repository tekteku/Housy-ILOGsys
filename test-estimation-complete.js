#!/usr/bin/env node

import pg from 'pg';

const dbConfig = {
  user: 'postgres',
  password: '0000',
  host: 'localhost',
  port: 5432,
  database: 'housy_tunisia',
  ssl: false
};

async function testEstimationAPI() {
  console.log('🧪 Test de l\'API d\'estimation...');
  
  // Test 1: Vérifier les matériaux en base
  const client = new pg.Client(dbConfig);
  
  try {
    await client.connect();
    console.log('\n✅ Connexion à la base réussie');

    // Compter les matériaux par catégorie
    const categories = await client.query(`
      SELECT category, COUNT(*) as count, 
             MIN(price) as min_price, 
             MAX(price) as max_price
      FROM materials 
      GROUP BY category 
      ORDER BY count DESC
    `);

    console.log('\n📊 Matériaux disponibles par catégorie:');
    categories.rows.forEach(row => {
      console.log(`   • ${row.category}: ${row.count} matériaux (${row.min_price}-${row.max_price} TND)`);
    });

    // Quelques exemples de matériaux
    const examples = await client.query(`
      SELECT name, category, price, price_currency, unit 
      FROM materials 
      ORDER BY category, price 
      LIMIT 15
    `);

    console.log('\n📋 Exemples de matériaux:');
    examples.rows.forEach(row => {
      console.log(`   • ${row.name} (${row.category}) - ${row.price} ${row.price_currency}/${row.unit}`);
    });

  } catch (error) {
    console.error('❌ Erreur base de données:', error.message);
  } finally {
    await client.end();
  }

  // Test 2: Simuler un appel à l'API d'estimation
  console.log('\n🔍 Test de l\'API d\'estimation HTTP...');
  
  try {
    const response = await fetch('http://localhost:3001/api/estimation/materials');
    
    if (response.ok) {
      const materials = await response.json();
      console.log(`✅ API matériaux: ${materials.length} matériaux récupérés`);
      
      // Afficher quelques matériaux
      materials.slice(0, 5).forEach(material => {
        console.log(`   • ${material.name} - ${material.price} ${material.price_currency || 'TND'}/${material.unit}`);
      });
    } else {
      console.log(`⚠️  API matériaux: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`⚠️  Serveur non accessible: ${error.message}`);
    console.log('💡 Assurez-vous que le serveur est démarré sur le port 3001');
  }

  // Test 3: Test du calcul d'estimation
  console.log('\n🧮 Test du calcul d\'estimation...');
  
  try {
    const estimationData = {
      projectType: 'villa',
      area: 150,
      rooms: 4,
      bathrooms: 2,
      finishLevel: 'moyen',
      materials: [
        { name: 'Ciment', quantity: 50, unit: 'sac 50kg' },
        { name: 'Brique', quantity: 2000, unit: 'pièce' },
        { name: 'Carrelage', quantity: 100, unit: 'm²' }
      ]
    };

    const response = await fetch('http://localhost:3001/api/estimation/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(estimationData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Calcul d\'estimation réussi:');
      console.log(`   • Total: ${result.total || 'N/A'} TND`);
      console.log(`   • Catégories: ${Object.keys(result.categories || {}).length}`);
    } else {
      console.log(`⚠️  Calcul estimation: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`⚠️  Test calcul: ${error.message}`);
  }

  console.log('\n🎯 Tests terminés !');
  console.log('\n📝 Prochaines étapes:');
  console.log('   1. Vérifier que le serveur est démarré');
  console.log('   2. Tester l\'estimation sur: http://localhost:3000/estimation');
  console.log('   3. Vérifier que les matériaux s\'affichent correctement');
  console.log('   4. Tester l\'export PDF');
}

testEstimationAPI().catch(console.error);
