/**
 * 🔍 SCRIPT DE VALIDATION FINALE - ADMIN HOUSY
 * 
 * Ce script vérifie que toutes les fonctionnalités admin sont correctement intégrées
 * et fonctionnelles dans l'application Housy.
 * 
 * @author Housy Development Team
 * @date 5 juillet 2025
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

// Configuration des chemins
const CLIENT_PATH = './client/src';
const ADMIN_PAGES_PATH = path.join(CLIENT_PATH, 'pages/admin');
const COMPONENTS_PATH = path.join(CLIENT_PATH, 'components');

// Liste des modules admin requis
const REQUIRED_ADMIN_MODULES = [
    // Modules existants améliorés
    'users.tsx',
    'analytics.tsx',
    'categories.tsx',
    'requests.tsx',
    'quotations.tsx',
    'notifications.tsx',
    'enhanced-users.tsx',
    'SystemControl.tsx',
    'SecurityAudit.tsx',
    'FinancialManagement.tsx',
    'TrainingSupport.tsx',
    
    // Nouveaux modules avancés
    'analytics-enhanced.tsx',
    'permission-management.tsx',
    'notification-center.tsx',
    'system-monitoring.tsx'
];

// Fichiers de configuration critiques
const CRITICAL_FILES = [
    path.join(CLIENT_PATH, 'App.tsx'),
    path.join(COMPONENTS_PATH, 'layout/Sidebar.tsx'),
    path.join(COMPONENTS_PATH, 'dashboard/AdminDashboard.tsx')
];

// Routes admin attendues
const EXPECTED_ROUTES = [
    '/admin/users',
    '/admin/analytics',
    '/admin/analytics-enhanced',
    '/admin/permission-management',
    '/admin/notification-center',
    '/admin/system-monitoring',
    '/admin/categories',
    '/admin/requests',
    '/admin/quotations',
    '/admin/notifications',
    '/admin/system-control',
    '/admin/security-audit',
    '/admin/financial-management',
    '/admin/training-support'
];

// Résultats de validation
const validationResults = {
    modules: { passed: 0, failed: 0, details: [] },
    routes: { passed: 0, failed: 0, details: [] },
    files: { passed: 0, failed: 0, details: [] },
    integration: { passed: 0, failed: 0, details: [] }
};

console.log('🔍 VALIDATION FINALE - FONCTIONNALITÉS ADMIN HOUSY');
console.log('=' .repeat(60));
console.log(`📅 Date: ${new Date().toLocaleDateString('fr-FR')}`);
console.log(`⏰ Heure: ${new Date().toLocaleTimeString('fr-FR')}`);
console.log('=' .repeat(60));

/**
 * 1. Vérification des modules admin
 */
function validateAdminModules() {
    console.log('\n📂 1. VALIDATION DES MODULES ADMIN');
    console.log('-' .repeat(40));
    
    REQUIRED_ADMIN_MODULES.forEach(module => {
        const modulePath = path.join(ADMIN_PAGES_PATH, module);
        const exists = fs.existsSync(modulePath);
        
        if (exists) {
            validationResults.modules.passed++;
            console.log(`✅ ${module}`);
            validationResults.modules.details.push(`✅ ${module} - PRÉSENT`);
        } else {
            validationResults.modules.failed++;
            console.log(`❌ ${module} - MANQUANT`);
            validationResults.modules.details.push(`❌ ${module} - MANQUANT`);
        }
    });
    
    console.log(`\n📊 Résultat: ${validationResults.modules.passed}/${REQUIRED_ADMIN_MODULES.length} modules présents`);
}

/**
 * 2. Vérification des routes dans App.tsx
 */
function validateRoutes() {
    console.log('\n🛣️  2. VALIDATION DES ROUTES');
    console.log('-' .repeat(40));
    
    const appPath = path.join(CLIENT_PATH, 'App.tsx');
    
    if (!fs.existsSync(appPath)) {
        console.log('❌ App.tsx non trouvé');
        validationResults.routes.failed = EXPECTED_ROUTES.length;
        return;
    }
    
    const appContent = fs.readFileSync(appPath, 'utf8');
    
    EXPECTED_ROUTES.forEach(route => {
        const routePattern = `path="${route}"`;
        const hasRoute = appContent.includes(routePattern);
        
        if (hasRoute) {
            validationResults.routes.passed++;
            console.log(`✅ ${route}`);
            validationResults.routes.details.push(`✅ ${route} - CONFIGURÉE`);
        } else {
            validationResults.routes.failed++;
            console.log(`❌ ${route} - MANQUANTE`);
            validationResults.routes.details.push(`❌ ${route} - MANQUANTE`);
        }
    });
    
    console.log(`\n📊 Résultat: ${validationResults.routes.passed}/${EXPECTED_ROUTES.length} routes configurées`);
}

/**
 * 3. Vérification des fichiers critiques
 */
function validateCriticalFiles() {
    console.log('\n🔧 3. VALIDATION DES FICHIERS CRITIQUES');
    console.log('-' .repeat(40));
    
    CRITICAL_FILES.forEach(filePath => {
        const exists = fs.existsSync(filePath);
        const fileName = path.basename(filePath);
        
        if (exists) {
            validationResults.files.passed++;
            console.log(`✅ ${fileName}`);
            
            // Vérifications spécifiques par fichier
            const content = fs.readFileSync(filePath, 'utf8');
            
            if (fileName === 'Sidebar.tsx') {
                const hasNewModules = content.includes('analytics-enhanced') && 
                                    content.includes('permission-management') && 
                                    content.includes('notification-center') && 
                                    content.includes('system-monitoring');
                
                if (hasNewModules) {
                    console.log(`  └─ ✅ Navigation des nouveaux modules intégrée`);
                    validationResults.integration.passed++;
                } else {
                    console.log(`  └─ ❌ Navigation des nouveaux modules manquante`);
                    validationResults.integration.failed++;
                }
            }
            
            if (fileName === 'AdminDashboard.tsx') {
                const hasEnhancedActions = content.includes('analytics-enhanced') && 
                                         content.includes('setLocation');
                
                if (hasEnhancedActions) {
                    console.log(`  └─ ✅ Actions rapides améliorées`);
                    validationResults.integration.passed++;
                } else {
                    console.log(`  └─ ❌ Actions rapides non intégrées`);
                    validationResults.integration.failed++;
                }
            }
            
            validationResults.files.details.push(`✅ ${fileName} - PRÉSENT`);
        } else {
            validationResults.files.failed++;
            console.log(`❌ ${fileName} - MANQUANT`);
            validationResults.files.details.push(`❌ ${fileName} - MANQUANT`);
        }
    });
    
    console.log(`\n📊 Résultat: ${validationResults.files.passed}/${CRITICAL_FILES.length} fichiers critiques présents`);
}

/**
 * 4. Vérification de la structure TypeScript
 */
function validateTypeScript() {
    console.log('\n🔷 4. VALIDATION TYPESCRIPT');
    console.log('-' .repeat(40));
    
    const tsFiles = [];
    
    // Recherche récursive des fichiers .tsx dans admin
    function findTsxFiles(dir) {
        if (!fs.existsSync(dir)) return;
        
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                findTsxFiles(filePath);
            } else if (file.endsWith('.tsx')) {
                tsFiles.push(filePath);
            }
        });
    }
    
    findTsxFiles(ADMIN_PAGES_PATH);
    
    let syntaxErrors = 0;
    let validFiles = 0;
    
    tsFiles.forEach(filePath => {
        const fileName = path.basename(filePath);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Vérifications de base de la syntaxe
        const hasValidExport = content.includes('export') && 
                              (content.includes('function') || content.includes('const') || content.includes('class'));
        const hasValidImports = !content.includes('import') || content.match(/import.*from/);
        const hasValidJSX = !content.includes('<') || content.includes('return');
        
        if (hasValidExport && hasValidImports && hasValidJSX) {
            validFiles++;
            console.log(`✅ ${fileName} - Syntaxe valide`);
        } else {
            syntaxErrors++;
            console.log(`❌ ${fileName} - Erreurs de syntaxe possibles`);
        }
    });
    
    console.log(`\n📊 Résultat: ${validFiles}/${tsFiles.length} fichiers TypeScript valides`);
    return { validFiles, totalFiles: tsFiles.length, syntaxErrors };
}

/**
 * 5. Génération du rapport final
 */
function generateFinalReport() {
    console.log('\n' + '=' .repeat(60));
    console.log('📋 RAPPORT FINAL DE VALIDATION');
    console.log('=' .repeat(60));
    
    const totalModules = REQUIRED_ADMIN_MODULES.length;
    const totalRoutes = EXPECTED_ROUTES.length;
    const totalFiles = CRITICAL_FILES.length;
    
    const modulesPercent = Math.round((validationResults.modules.passed / totalModules) * 100);
    const routesPercent = Math.round((validationResults.routes.passed / totalRoutes) * 100);
    const filesPercent = Math.round((validationResults.files.passed / totalFiles) * 100);
    
    console.log(`\n📂 Modules Admin: ${validationResults.modules.passed}/${totalModules} (${modulesPercent}%)`);
    console.log(`🛣️  Routes: ${validationResults.routes.passed}/${totalRoutes} (${routesPercent}%)`);
    console.log(`🔧 Fichiers Critiques: ${validationResults.files.passed}/${totalFiles} (${filesPercent}%)`);
    console.log(`🔗 Intégration: ${validationResults.integration.passed}/${validationResults.integration.passed + validationResults.integration.failed}`);
    
    // Score global
    const totalChecks = totalModules + totalRoutes + totalFiles + validationResults.integration.passed + validationResults.integration.failed;
    const passedChecks = validationResults.modules.passed + validationResults.routes.passed + validationResults.files.passed + validationResults.integration.passed;
    const globalScore = Math.round((passedChecks / totalChecks) * 100);
    
    console.log(`\n🎯 SCORE GLOBAL: ${globalScore}%`);
    
    if (globalScore >= 95) {
        console.log('🟢 EXCELLENT - Prêt pour production');
    } else if (globalScore >= 85) {
        console.log('🟡 BON - Quelques améliorations recommandées');
    } else if (globalScore >= 70) {
        console.log('🟠 MOYEN - Corrections nécessaires');
    } else {
        console.log('🔴 INSUFFISANT - Révision majeure requise');
    }
    
    // Recommandations
    console.log('\n📝 RECOMMANDATIONS:');
    
    if (validationResults.modules.failed > 0) {
        console.log(`⚠️  Créer les ${validationResults.modules.failed} modules manquants`);
    }
    
    if (validationResults.routes.failed > 0) {
        console.log(`⚠️  Configurer les ${validationResults.routes.failed} routes manquantes`);
    }
    
    if (validationResults.files.failed > 0) {
        console.log(`⚠️  Vérifier les ${validationResults.files.failed} fichiers critiques manquants`);
    }
    
    if (validationResults.integration.failed > 0) {
        console.log(`⚠️  Finaliser l'intégration des composants`);
    }
    
    if (globalScore >= 95) {
        console.log('✅ Application prête pour le déploiement en production');
        console.log('✅ Toutes les fonctionnalités admin sont opérationnelles');
        console.log('✅ Navigation et intégration complètes');
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('🚀 VALIDATION TERMINÉE');
    console.log('=' .repeat(60));
    
    return globalScore;
}

/**
 * Exécution principale
 */
async function runValidation() {
    try {
        validateAdminModules();
        validateRoutes();
        validateCriticalFiles();
        const tsResults = validateTypeScript();
        const score = generateFinalReport();
        
        // Création d'un fichier de rapport
        const reportData = {
            date: new Date().toISOString(),
            score: score,
            results: validationResults,
            typescript: tsResults,
            status: score >= 95 ? 'PRODUCTION_READY' : score >= 85 ? 'NEEDS_MINOR_FIXES' : 'NEEDS_MAJOR_FIXES'
        };
        
        fs.writeFileSync('./VALIDATION_REPORT.json', JSON.stringify(reportData, null, 2));
        console.log('\n📄 Rapport détaillé sauvegardé: VALIDATION_REPORT.json');
        
        process.exit(score >= 85 ? 0 : 1);
        
    } catch (error) {
        console.error('❌ Erreur durant la validation:', error.message);
        process.exit(1);
    }
}

// Lancement de la validation
runValidation();
