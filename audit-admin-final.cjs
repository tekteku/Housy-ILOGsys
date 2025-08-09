/**
 * Script de validation complète des fonctionnalités admin
 * Vérifie l'état de toutes les pages admin et génère un rapport final
 */

const fs = require('fs');
const path = require('path');

// Configuration des modules admin
const adminModules = [
    {
        name: 'Dashboard Admin',
        path: 'client/src/components/dashboard/AdminDashboard.tsx',
        route: '/dashboard',
        status: 'ENHANCED',
        features: ['KPIs étendus', 'Actions rapides avancées', 'Navigation intégrée', 'Statistiques temps réel']
    },
    {
        name: 'Gestion Utilisateurs',
        path: 'client/src/pages/admin/users.tsx',
        route: '/admin/users',
        status: 'ENHANCED',
        features: ['CRUD complet', 'Actions en lot', 'Export', 'Analytics', 'Permissions avancées']
    },
    {
        name: 'Analytics de Base',
        path: 'client/src/pages/admin/analytics.tsx',
        route: '/admin/analytics',
        status: 'EXISTING',
        features: ['Dashboard basique', 'Graphiques simples']
    },
    {
        name: 'Analytics Avancés',
        path: 'client/src/pages/admin/analytics-enhanced.tsx',
        route: '/admin/analytics-enhanced',
        status: 'NEW',
        features: ['Dashboard temps réel', 'Prédictions IA', 'KPIs avancés', 'Export multi-format', 'Monitoring performances']
    },
    {
        name: 'Gestion Permissions',
        path: 'client/src/pages/admin/permission-management.tsx',
        route: '/admin/permission-management',
        status: 'NEW',
        features: ['Rôles/Permissions CRUD', 'Audit trail', 'Affectation utilisateurs', 'Permissions granulaires']
    },
    {
        name: 'Centre Notifications',
        path: 'client/src/pages/admin/notification-center.tsx',
        route: '/admin/notification-center',
        status: 'NEW',
        features: ['Multi-canal', 'Templates', 'Programmation', 'Analytics', 'Actions en lot']
    },
    {
        name: 'Monitoring Système',
        path: 'client/src/pages/admin/system-monitoring.tsx',
        route: '/admin/system-monitoring',
        status: 'NEW',
        features: ['Surveillance temps réel', 'Alertes', 'Logs système', 'Santé services', 'Métriques performance']
    },
    {
        name: 'Demandes Clients',
        path: 'client/src/pages/admin/requests.tsx',
        route: '/admin/requests',
        status: 'EXISTING',
        features: ['Gestion demandes', 'Approbation', 'Filtres avancés']
    },
    {
        name: 'Gestion Devis',
        path: 'client/src/pages/admin/quotations.tsx',
        route: '/admin/quotations',
        status: 'EXISTING',
        features: ['CRUD devis', 'Génération PDF', 'Suivi statuts']
    },
    {
        name: 'Gestion Catégories',
        path: 'client/src/pages/admin/categories.tsx',
        route: '/admin/categories',
        status: 'EXISTING',
        features: ['CRUD catégories', 'Organisation hiérarchique']
    },
    {
        name: 'Gestion Financière',
        path: 'client/src/pages/admin/FinancialManagement.tsx',
        route: '/admin/financial-management',
        status: 'EXISTING',
        features: ['Tableau de bord financier', 'Rapports comptables']
    },
    {
        name: 'Contrôle Système',
        path: 'client/src/pages/admin/SystemControl.tsx',
        route: '/admin/system-control',
        status: 'EXISTING',
        features: ['Configuration système', 'Maintenance']
    },
    {
        name: 'Audit Sécurité',
        path: 'client/src/pages/admin/SecurityAudit.tsx',
        route: '/admin/security-audit',
        status: 'EXISTING',
        features: ['Logs sécurité', 'Audit accès']
    },
    {
        name: 'Support Formation',
        path: 'client/src/pages/admin/TrainingSupport.tsx',
        route: '/admin/training-support',
        status: 'EXISTING',
        features: ['Documentation', 'Aide utilisateurs']
    },
    {
        name: 'Notifications',
        path: 'client/src/pages/admin/notifications.tsx',
        route: '/admin/notifications',
        status: 'EXISTING',
        features: ['Gestion notifications simples']
    }
];

// Configuration des fonctionnalités CRUD
const crudOperations = ['Create', 'Read', 'Update', 'Delete', 'List', 'Search', 'Filter', 'Export'];

// Fonctions utilitaires
const fileExists = (filePath) => {
    const fullPath = path.resolve(filePath);
    return fs.existsSync(fullPath);
};

const checkFileContent = (filePath, patterns) => {
    if (!fileExists(filePath)) return { exists: false };
    
    try {
        const content = fs.readFileSync(path.resolve(filePath), 'utf8');
        const foundPatterns = patterns.filter(pattern => content.includes(pattern));
        return {
            exists: true,
            fileSize: content.length,
            patterns: foundPatterns,
            completeness: (foundPatterns.length / patterns.length) * 100
        };
    } catch (error) {
        return { exists: false, error: error.message };
    }
};

// Validation des modules
function validateAdminModules() {
    console.log('\\n🔍 VALIDATION DES MODULES ADMIN\\n');
    console.log('='.repeat(60));
    
    const results = {
        total: adminModules.length,
        existing: 0,
        enhanced: 0,
        new: 0,
        missing: 0,
        details: []
    };
    
    adminModules.forEach(module => {
        const validation = checkFileContent(module.path, [
            'export', 'function', 'const', 'interface', 'useState', 'useQuery'
        ]);
        
        const status = validation.exists ? '✅ EXISTS' : '❌ MISSING';
        const size = validation.fileSize ? `(${Math.round(validation.fileSize / 1024)}KB)` : '';
        
        console.log(`\\n📁 ${module.name}`);
        console.log(`   Route: ${module.route}`);
        console.log(`   Status: ${status} ${size}`);
        console.log(`   Type: ${module.status}`);
        console.log(`   Features: ${module.features.join(', ')}`);
        
        if (validation.exists) {
            if (module.status === 'EXISTING') results.existing++;
            else if (module.status === 'ENHANCED') results.enhanced++;
            else if (module.status === 'NEW') results.new++;
        } else {
            results.missing++;
        }
        
        results.details.push({
            ...module,
            exists: validation.exists,
            fileSize: validation.fileSize || 0,
            completeness: validation.completeness || 0
        });
    });
    
    return results;
}

// Validation de la navigation
function validateNavigation() {
    console.log('\\n🧭 VALIDATION DE LA NAVIGATION\\n');
    console.log('='.repeat(60));
    
    // Vérifier App.tsx pour les routes
    const appRoutes = checkFileContent('client/src/App.tsx', [
        '/admin/analytics-enhanced',
        '/admin/permission-management', 
        '/admin/notification-center',
        '/admin/system-monitoring'
    ]);
    
    console.log('Routes dans App.tsx:');
    console.log(`   ✅ Fichier existe: ${appRoutes.exists}`);
    console.log(`   ✅ Nouvelles routes: ${appRoutes.patterns?.length || 0}/4`);
    
    // Vérifier Sidebar.tsx pour la navigation
    const sidebarNav = checkFileContent('client/src/components/layout/Sidebar.tsx', [
        'Analytics Advanced',
        'System Monitoring',
        'Permission Management',
        'Notification Center'
    ]);
    
    console.log('\\nNavigation dans Sidebar.tsx:');
    console.log(`   ✅ Fichier existe: ${sidebarNav.exists}`);
    console.log(`   ✅ Nouveaux items: ${sidebarNav.patterns?.length || 0}/4`);
    
    return {
        routes: appRoutes,
        navigation: sidebarNav
    };
}

// Validation du dashboard
function validateDashboard() {
    console.log('\\n📊 VALIDATION DU DASHBOARD ADMIN\\n');
    console.log('='.repeat(60));
    
    const dashboard = checkFileContent('client/src/components/dashboard/AdminDashboard.tsx', [
        'Analytics Avancés',
        'Monitoring Système', 
        'Gestion Permissions',
        'Centre Notifications',
        'setLocation'
    ]);
    
    console.log('Dashboard AdminDashboard.tsx:');
    console.log(`   ✅ Fichier existe: ${dashboard.exists}`);
    console.log(`   ✅ Nouvelles actions: ${dashboard.patterns?.length || 0}/5`);
    console.log(`   ✅ Taille: ${Math.round((dashboard.fileSize || 0) / 1024)}KB`);
    
    return dashboard;
}

// Génération du rapport final
function generateFinalReport(moduleResults, navResults, dashboardResults) {
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            totalModules: moduleResults.total,
            existingModules: moduleResults.existing,
            enhancedModules: moduleResults.enhanced,
            newModules: moduleResults.new,
            missingModules: moduleResults.missing,
            completionRate: Math.round(((moduleResults.total - moduleResults.missing) / moduleResults.total) * 100)
        },
        navigation: {
            routesIntegrated: navResults.routes.patterns?.length || 0,
            navigationIntegrated: navResults.navigation.patterns?.length || 0
        },
        dashboard: {
            enhanced: dashboardResults.exists,
            newActionsCount: dashboardResults.patterns?.length || 0
        },
        modules: moduleResults.details,
        recommendations: []
    };
    
    // Génération des recommandations
    if (report.summary.missingModules > 0) {
        report.recommendations.push('❗ Certains modules sont manquants - vérifier les chemins de fichiers');
    }
    
    if (report.navigation.routesIntegrated < 4) {
        report.recommendations.push('⚠️ Toutes les nouvelles routes ne sont pas intégrées dans App.tsx');
    }
    
    if (report.navigation.navigationIntegrated < 4) {
        report.recommendations.push('⚠️ Tous les nouveaux items ne sont pas dans la navigation Sidebar.tsx');
    }
    
    if (report.summary.completionRate >= 90) {
        report.recommendations.push('✅ Excellente intégration des fonctionnalités admin');
    }
    
    return report;
}

// Exécution principale
function main() {
    console.log('🚀 AUDIT COMPLET DES FONCTIONNALITÉS ADMIN - HOUSY');
    console.log('='.repeat(80));
    console.log(`📅 Date: ${new Date().toLocaleString()}`);
    
    try {
        // Validation des modules
        const moduleResults = validateAdminModules();
        
        // Validation de la navigation
        const navResults = validateNavigation();
        
        // Validation du dashboard
        const dashboardResults = validateDashboard();
        
        // Génération du rapport final
        const finalReport = generateFinalReport(moduleResults, navResults, dashboardResults);
        
        // Affichage du résumé
        console.log('\\n🎯 RÉSUMÉ FINAL\\n');
        console.log('='.repeat(60));
        console.log(`📊 Modules totaux: ${finalReport.summary.totalModules}`);
        console.log(`✅ Modules existants: ${finalReport.summary.existingModules}`);
        console.log(`🔧 Modules améliorés: ${finalReport.summary.enhancedModules}`);
        console.log(`🆕 Nouveaux modules: ${finalReport.summary.newModules}`);
        console.log(`❌ Modules manquants: ${finalReport.summary.missingModules}`);
        console.log(`📈 Taux de completion: ${finalReport.summary.completionRate}%`);
        console.log(`🧭 Routes intégrées: ${finalReport.navigation.routesIntegrated}/4`);
        console.log(`📱 Navigation intégrée: ${finalReport.navigation.navigationIntegrated}/4`);
        
        // Recommandations
        if (finalReport.recommendations.length > 0) {
            console.log('\\n💡 RECOMMANDATIONS\\n');
            console.log('='.repeat(60));
            finalReport.recommendations.forEach(rec => console.log(`   ${rec}`));
        }
        
        // Sauvegarde du rapport
        const reportPath = `AUDIT_ADMIN_FINAL_${new Date().toISOString().slice(0, 10)}.json`;
        fs.writeFileSync(reportPath, JSON.stringify(finalReport, null, 2));
        console.log(`\\n📄 Rapport détaillé sauvegardé: ${reportPath}`);
        
        // Status final
        if (finalReport.summary.completionRate >= 95 && finalReport.navigation.routesIntegrated >= 3) {
            console.log('\\n🎉 INTÉGRATION ADMIN RÉUSSIE ! \\n');
            return 0;
        } else {
            console.log('\\n⚠️ INTÉGRATION ADMIN PARTIELLE - ACTIONS REQUISES \\n');
            return 1;
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'audit:', error.message);
        return 1;
    }
}

// Exécution si appelé directement
if (require.main === module) {
    process.exit(main());
}

module.exports = { main, validateAdminModules, validateNavigation, validateDashboard };
