#!/usr/bin/env node

/**
 * TEST DES MODIFICATIONS DASHBOARD - BOUTON NOUVELLE DEMANDE
 * ==========================================================
 * Ce script teste que les boutons "Nouveau projet" dans le dashboard
 * ont été correctement modifiés pour devenir "Nouvelle demande"
 */

import fs from 'fs';
import path from 'path';

const COLORS = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  CYAN: '\x1b[36m',
  WHITE: '\x1b[37m',
  RESET: '\x1b[0m'
};

function log(color, message) {
  console.log(`${color}${message}${COLORS.RESET}`);
}

console.log(`${COLORS.CYAN}🧪 TEST DES MODIFICATIONS DASHBOARD - BOUTON NOUVELLE DEMANDE${COLORS.RESET}`);
console.log(`${COLORS.CYAN}===========================================================${COLORS.RESET}`);

// Fonction pour vérifier un fichier
function checkFile(filePath, expectedContent, description) {
  try {
    if (!fs.existsSync(filePath)) {
      log(COLORS.RED, `   ❌ Fichier non trouvé: ${filePath}`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const hasExpectedContent = expectedContent.every(check => 
      typeof check === 'string' ? content.includes(check) : check.test(content)
    );

    if (hasExpectedContent) {
      log(COLORS.GREEN, `   ✅ ${description}`);
      return true;
    } else {
      log(COLORS.RED, `   ❌ ${description} - Contenu non trouvé`);
      return false;
    }
  } catch (error) {
    log(COLORS.RED, `   ❌ Erreur lecture ${filePath}: ${error.message}`);
    return false;
  }
}

let totalTests = 0;
let passedTests = 0;

console.log(`\n${COLORS.YELLOW}🔍 Vérification des fichiers modifiés...${COLORS.RESET}`);

// Test 1: Dashboard principal
log(COLORS.WHITE, '📁 Dashboard principal (dashboard.tsx)');
totalTests++;
if (checkFile(
  'client/src/pages/dashboard.tsx',
  [
    'handleNewProjectRequest',
    'Nouvelle demande',
    "navigate('/client/request')",
    'useLocation',
    'useNotification'
  ],
  'Fonction et bouton "Nouvelle demande" ajoutés'
)) {
  passedTests++;
}

// Test 2: ClientDashboard
log(COLORS.WHITE, '📁 ClientDashboard (ClientDashboard.tsx)');
totalTests++;
if (checkFile(
  'client/src/components/dashboard/ClientDashboard.tsx',
  [
    'handleNewProjectRequest',
    'Nouvelle Demande',
    "setLocation('/client/request')",
    'useNotification'
  ],
  'Fonction et bouton "Nouvelle Demande" ajoutés'
)) {
  passedTests++;
}

// Test 3: Vérifier que l'ancienne référence '/projects/new' a été supprimée
log(COLORS.WHITE, '🔍 Vérification suppression ancienne route');
totalTests++;
try {
  const clientDashboardContent = fs.readFileSync('client/src/components/dashboard/ClientDashboard.tsx', 'utf8');
  if (!clientDashboardContent.includes('/projects/new')) {
    log(COLORS.GREEN, '   ✅ Ancienne route /projects/new supprimée');
    passedTests++;
  } else {
    log(COLORS.RED, '   ❌ Ancienne route /projects/new encore présente');
  }
} catch (error) {
  log(COLORS.RED, '   ❌ Erreur vérification route');
}

// Test 4: Vérifier les imports nécessaires
log(COLORS.WHITE, '📦 Imports et dépendances');
totalTests++;
const importsCheck = [
  {
    file: 'client/src/pages/dashboard.tsx',
    imports: ['useLocation', 'useNotification']
  },
  {
    file: 'client/src/components/dashboard/ClientDashboard.tsx',
    imports: ['useNotification']
  }
];

let importsOk = true;
for (const check of importsCheck) {
  try {
    const content = fs.readFileSync(check.file, 'utf8');
    for (const imp of check.imports) {
      if (!content.includes(imp)) {
        log(COLORS.RED, `   ❌ Import ${imp} manquant dans ${check.file}`);
        importsOk = false;
      }
    }
  } catch (error) {
    log(COLORS.RED, `   ❌ Erreur vérification imports ${check.file}`);
    importsOk = false;
  }
}

if (importsOk) {
  log(COLORS.GREEN, '   ✅ Tous les imports nécessaires présents');
  passedTests++;
}

// Résultats des tests
console.log(`\n${COLORS.CYAN}🎯 RÉSULTATS DES TESTS:${COLORS.RESET}`);
console.log(`${COLORS.CYAN}======================${COLORS.RESET}`);
log(COLORS.WHITE, `Tests réussis: ${passedTests}/${totalTests}`);

if (passedTests === totalTests) {
  log(COLORS.GREEN, '🎉 TOUS LES TESTS RÉUSSIS !');
  log(COLORS.GREEN, '✅ Modifications du dashboard terminées avec succès');
} else {
  log(COLORS.YELLOW, '⚠️  Certains tests ont échoué');
  log(COLORS.YELLOW, 'Vérifiez les erreurs ci-dessus');
}

console.log(`\n${COLORS.CYAN}🚀 FONCTIONNALITÉS MODIFIÉES:${COLORS.RESET}`);
console.log(`${COLORS.CYAN}=============================${COLORS.RESET}`);
log(COLORS.WHITE, '1. Dashboard principal: Bouton "Nouveau projet" → "Nouvelle demande"');
log(COLORS.WHITE, '2. ClientDashboard: Bouton "Nouveau Projet" → "Nouvelle Demande"');
log(COLORS.WHITE, '3. Navigation vers /client/request au lieu de /projects/new');
log(COLORS.WHITE, '4. Notifications utilisateur ajoutées');
log(COLORS.WHITE, '5. Fonctions handleNewProjectRequest implémentées');

console.log(`\n${COLORS.CYAN}🧪 POUR TESTER MANUELLEMENT:${COLORS.RESET}`);
console.log(`${COLORS.CYAN}=============================${COLORS.RESET}`);
log(COLORS.WHITE, '1. Démarrez l\'application: npm run dev');
log(COLORS.WHITE, '2. Connectez-vous en tant que client');
log(COLORS.WHITE, '3. Allez sur le dashboard');
log(COLORS.WHITE, '4. Cliquez sur "Nouvelle demande" (HeroHeader)');
log(COLORS.WHITE, '5. Vérifiez la redirection vers /client/request');
log(COLORS.WHITE, '6. Testez également avec un utilisateur admin/super_admin');

console.log(`\n${COLORS.GREEN}🎯 MODIFICATIONS TERMINÉES !${COLORS.RESET}`);
console.log(`${COLORS.GREEN}=============================${COLORS.RESET}`);
log(COLORS.WHITE, '✨ Les boutons du dashboard redirigent maintenant vers le formulaire de demande client');
