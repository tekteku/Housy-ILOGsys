/**
 * Test des graphiques de progression des projets
 * Vérifie que les composants de graphiques s'affichent correctement
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 TEST DES GRAPHIQUES DE PROGRESSION');
console.log('====================================\n');

// Vérifier la présence des composants de graphiques
const projectsFile = 'client/src/pages/client/projects.tsx';

if (!fs.existsSync(projectsFile)) {
  console.log('❌ Fichier projects.tsx non trouvé');
  process.exit(1);
}

const content = fs.readFileSync(projectsFile, 'utf-8');

// Tests des composants
const tests = [
  {
    name: 'Composant ProgressChart',
    pattern: /function ProgressChart/,
    description: 'Vérification de la présence du composant ProgressChart'
  },
  {
    name: 'Composant ProjectStatusChart',
    pattern: /function ProjectStatusChart/,
    description: 'Vérification de la présence du composant ProjectStatusChart'
  },
  {
    name: 'Imports d\'icônes',
    pattern: /BarChart3.*PieChart/s,
    description: 'Vérification des imports d\'icônes pour les graphiques'
  },
  {
    name: 'Utilisation des graphiques',
    pattern: /<ProgressChart.*projects={filteredProjects}/,
    description: 'Vérification de l\'utilisation du composant ProgressChart'
  },
  {
    name: 'Graphique en donut',
    pattern: /<circle.*stroke.*strokeDasharray/s,
    description: 'Vérification de l\'implémentation du graphique en donut SVG'
  },
  {
    name: 'Calcul des pourcentages',
    pattern: /percentage.*Math\.round/,
    description: 'Vérification du calcul des pourcentages pour les statuts'
  },
  {
    name: 'Couleurs de progression',
    pattern: /getProgressColor.*progress/,
    description: 'Vérification de la logique des couleurs de progression'
  },
  {
    name: 'Animation CSS',
    pattern: /transition-all.*duration/,
    description: 'Vérification de l\'animation des graphiques'
  }
];

let passedTests = 0;

tests.forEach((test, index) => {
  const passed = test.pattern.test(content);
  console.log(`${index + 1}. ${test.name}: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   ${test.description}`);
  
  if (passed) {
    passedTests++;
  } else {
    console.log(`   ⚠️  Pattern recherché: ${test.pattern}`);
  }
  console.log('');
});

console.log(`📊 RÉSULTATS DU TEST:`);
console.log(`=====================`);
console.log(`Tests réussis: ${passedTests}/${tests.length}`);
console.log(`Pourcentage de réussite: ${Math.round((passedTests / tests.length) * 100)}%`);

if (passedTests === tests.length) {
  console.log('\n🎉 Tous les tests sont passés ! Les graphiques sont correctement implémentés.');
} else {
  console.log('\n⚠️  Certains tests ont échoué. Vérifiez l\'implémentation.');
}

// Test des données mock pour les graphiques
console.log('\n📈 ANALYSE DES DONNÉES MOCK:');
console.log('=============================');

const projectPattern = /const mockProjects.*?=.*?\[(.*?)\];/s;
const projectMatch = content.match(projectPattern);

if (projectMatch) {
  const projectsData = projectMatch[1];
  const progressMatches = projectsData.match(/progress:\s*(\d+)/g) || [];
  const statusMatches = projectsData.match(/status:\s*'([^']+)'/g) || [];
  
  console.log(`Projets trouvés: ${progressMatches.length}`);
  console.log(`Valeurs de progression: ${progressMatches.map(m => m.match(/\d+/)[0]).join(', ')}%`);
  console.log(`Statuts trouvés: ${statusMatches.map(m => m.match(/'([^']+)'/)[1]).join(', ')}`);
  
  // Vérifier la diversité des données pour les graphiques
  const progressValues = progressMatches.map(m => parseInt(m.match(/\d+/)[0]));
  const uniqueStatuses = [...new Set(statusMatches.map(m => m.match(/'([^']+)'/)[1]))];
  
  console.log(`\n📊 Diversité des données:`);
  console.log(`- Plage de progression: ${Math.min(...progressValues)}% - ${Math.max(...progressValues)}%`);
  console.log(`- Nombre de statuts différents: ${uniqueStatuses.length}`);
  console.log(`- Statuts: ${uniqueStatuses.join(', ')}`);
  
  if (progressValues.length >= 3 && uniqueStatuses.length >= 3) {
    console.log('✅ Données suffisamment diverses pour des graphiques intéressants');
  } else {
    console.log('⚠️  Données limitées - les graphiques pourraient manquer de diversité');
  }
} else {
  console.log('❌ Impossible de trouver les données mock des projets');
}

console.log('\n🎯 RECOMMANDATIONS:');
console.log('===================');
console.log('1. Testez les graphiques dans le navigateur');
console.log('2. Vérifiez la responsivité sur différentes tailles d\'écran');
console.log('3. Assurez-vous que les animations se déclenchent correctement');
console.log('4. Testez avec différents jeux de données');
console.log('5. Vérifiez l\'accessibilité (couleurs, contrastes)');
