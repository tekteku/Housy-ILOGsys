/**
 * Script pour implémenter les fonctionnalités CRUD logiques manquantes
 * Activation uniquement des actions nécessaires et logiques pour le client
 */

const fs = require('fs');
const path = require('path');

// Configuration des pages et fonctionnalités à activer
const crudFeatures = {
  payments: {
    file: 'client/src/pages/client/payments.tsx',
    actions: [
      {
        name: 'Confirmer le paiement',
        status: 'MISSING',
        description: 'Bouton pour marquer un paiement comme confirmé/effectué',
        condition: 'payment.status === "pending"',
        implementation: 'Ajouter bouton "Confirmer le paiement" avec dialogue de confirmation'
      },
      {
        name: 'Demander un échéancier',
        status: 'MISSING',
        description: 'Option pour demander un rééchelonnement des paiements',
        condition: 'payment.status === "pending" && payment.amount > 10000',
        implementation: 'Bouton "Demander échéancier" avec formulaire'
      },
      {
        name: 'Signaler un problème de paiement',
        status: 'MISSING',
        description: 'Possibilité de signaler un problème sur une facture',
        condition: 'payment.status === "pending" || payment.status === "overdue"',
        implementation: 'Bouton "Signaler un problème" avec formulaire de contact'
      }
    ]
  },
  
  quotations: {
    file: 'client/src/pages/client/quotations.tsx',
    actions: [
      {
        name: 'Accepter le devis',
        status: 'IMPLEMENTED',
        description: 'Bouton pour accepter un devis',
        condition: 'quotation.status === "sent"',
        implementation: 'Déjà implémenté avec handleAcceptQuotation'
      },
      {
        name: 'Refuser le devis',
        status: 'IMPLEMENTED',
        description: 'Bouton pour refuser un devis',
        condition: 'quotation.status === "sent"',
        implementation: 'Déjà implémenté avec handleRejectQuotation'
      },
      {
        name: 'Demander une révision',
        status: 'PARTIAL',
        description: 'Demander une modification du devis',
        condition: 'quotation.status === "sent" || quotation.status === "revised"',
        implementation: 'Besoin d\'améliorer le formulaire de révision'
      }
    ]
  },

  projects: {
    file: 'client/src/pages/client/projects.tsx',
    actions: [
      {
        name: 'Suspendre le projet',
        status: 'MISSING',
        description: 'Possibilité de mettre en pause un projet',
        condition: 'project.status === "in_progress"',
        implementation: 'Bouton "Suspendre" avec dialogue de confirmation'
      },
      {
        name: 'Reprendre le projet',
        status: 'MISSING',
        description: 'Reprendre un projet suspendu',
        condition: 'project.status === "suspended"',
        implementation: 'Bouton "Reprendre" avec dialogue de confirmation'
      },
      {
        name: 'Approuver une étape',
        status: 'MISSING',
        description: 'Valider une étape terminée',
        condition: 'milestone.status === "completed" && !milestone.clientApproved',
        implementation: 'Bouton "Approuver cette étape" sur chaque milestone'
      }
    ]
  },

  requests: {
    file: 'client/src/pages/client/request.tsx',
    actions: [
      {
        name: 'Annuler la demande',
        status: 'MISSING',
        description: 'Annuler une demande en attente',
        condition: 'request.status === "pending" || request.status === "in_review"',
        implementation: 'Bouton "Annuler" avec dialogue de confirmation'
      },
      {
        name: 'Modifier la demande',
        status: 'MISSING',
        description: 'Modifier une demande pas encore traitée',
        condition: 'request.status === "pending"',
        implementation: 'Bouton "Modifier" qui ouvre le formulaire en mode édition'
      },
      {
        name: 'Fournir des informations complémentaires',
        status: 'MISSING',
        description: 'Ajouter des détails à une demande',
        condition: 'request.status === "needs_info"',
        implementation: 'Bouton "Compléter" avec formulaire d\'ajout d\'infos'
      }
    ]
  },

  documents: {
    file: 'client/src/pages/client/documents.tsx',
    actions: [
      {
        name: 'Valider un document',
        status: 'MISSING',
        description: 'Approuver un document soumis par l\'équipe',
        condition: 'document.status === "pending_approval"',
        implementation: 'Boutons "Approuver/Demander modification" sur chaque document'
      },
      {
        name: 'Télécharger le document',
        status: 'PARTIAL',
        description: 'Télécharger les documents disponibles',
        condition: 'document.status === "approved"',
        implementation: 'Vérifier que tous les boutons de téléchargement fonctionnent'
      }
    ]
  },

  estimation: {
    file: 'client/src/pages/estimation.tsx',
    actions: [
      {
        name: 'Sauvegarder l\'estimation',
        status: 'MISSING',
        description: 'Sauvegarder une estimation en cours',
        condition: 'estimation.isModified',
        implementation: 'Bouton "Sauvegarder" pour les estimations non finalisées'
      },
      {
        name: 'Transformer en demande',
        status: 'MISSING',
        description: 'Convertir une estimation en demande officielle',
        condition: 'estimation.isComplete',
        implementation: 'Bouton "Créer une demande" à partir de l\'estimation'
      }
    ]
  }
};

// Fonction pour analyser un fichier et détecter les fonctionnalités existantes
function analyzeFile(filePath) {
  const fullPath = path.resolve(filePath);
  
  if (!fs.existsSync(fullPath)) {
    return { exists: false, content: null, analysis: null };
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  
  return {
    exists: true,
    content,
    analysis: {
      hasButtons: content.includes('<Button'),
      hasDialogs: content.includes('<Dialog'),
      hasMutations: content.includes('useMutation'),
      hasHandlers: content.includes('const handle') || content.includes('function handle'),
      hasConfirmations: content.includes('confirm') || content.includes('Confirmer'),
      hasValidation: content.includes('validate') || content.includes('schema'),
      buttonCount: (content.match(/<Button/g) || []).length,
      dialogCount: (content.match(/<Dialog/g) || []).length
    }
  };
}

// Fonction principale d'analyse
function analyzeCrudFeatures() {
  console.log('🔍 Analyse des fonctionnalités CRUD à implémenter...\n');
  
  const results = {
    implemented: [],
    missing: [],
    partial: [],
    fileAnalysis: {}
  };

  Object.entries(crudFeatures).forEach(([pageName, config]) => {
    console.log(`📄 Analyse de la page: ${pageName}`);
    console.log(`   Fichier: ${config.file}`);
    
    const fileAnalysis = analyzeFile(config.file);
    results.fileAnalysis[pageName] = fileAnalysis;
    
    if (!fileAnalysis.exists) {
      console.log(`   ❌ Fichier non trouvé!`);
      return;
    }

    console.log(`   ✅ Fichier trouvé`);
    console.log(`   📊 Boutons: ${fileAnalysis.analysis.buttonCount}, Dialogues: ${fileAnalysis.analysis.dialogCount}`);
    
    config.actions.forEach(action => {
      console.log(`   🔧 ${action.name}: ${action.status}`);
      
      switch(action.status) {
        case 'IMPLEMENTED':
          results.implemented.push({ page: pageName, ...action });
          break;
        case 'MISSING':
          results.missing.push({ page: pageName, ...action });
          break;
        case 'PARTIAL':
          results.partial.push({ page: pageName, ...action });
          break;
      }
    });
    
    console.log('');
  });

  return results;
}

// Fonction pour générer le code d'implémentation
function generateImplementationCode(action, pageName) {
  const baseComponents = `
// Imports nécessaires (à ajouter en haut du fichier si manquants)
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';`;

  switch(action.name) {
    case 'Confirmer le paiement':
      return `${baseComponents}

// Fonction de mutation pour confirmer un paiement
const confirmPaymentMutation = useMutation({
  mutationFn: async (paymentId: string) => {
    const response = await fetch(\`/api/payments/\${paymentId}/confirm\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Erreur lors de la confirmation');
    return response.json();
  },
  onSuccess: () => {
    toast.success('Paiement confirmé avec succès');
    queryClient.invalidateQueries({ queryKey: ['payments'] });
  },
  onError: () => {
    toast.error('Erreur lors de la confirmation du paiement');
  }
});

const handleConfirmPayment = (paymentId: string) => {
  confirmPaymentMutation.mutate(paymentId);
};

// Bouton à ajouter dans la liste des paiements (condition: payment.status === 'pending')
{payment.status === 'pending' && (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button size="sm" className="bg-green-600 hover:bg-green-700">
        <CheckCircle className="w-4 h-4 mr-2" />
        Confirmer le paiement
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Confirmer le paiement</AlertDialogTitle>
        <AlertDialogDescription>
          Confirmez-vous avoir effectué le paiement de {payment.amount.toLocaleString()} TND
          pour la facture {payment.invoiceNumber} ?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Annuler</AlertDialogCancel>
        <AlertDialogAction 
          onClick={() => handleConfirmPayment(payment.id)}
          disabled={confirmPaymentMutation.isPending}
        >
          {confirmPaymentMutation.isPending ? 'Confirmation...' : 'Confirmer'}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)}`;

    case 'Suspendre le projet':
      return `${baseComponents}

// Fonction de mutation pour suspendre un projet
const suspendProjectMutation = useMutation({
  mutationFn: async ({ projectId, reason }: { projectId: string; reason: string }) => {
    const response = await fetch(\`/api/projects/\${projectId}/suspend\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    if (!response.ok) throw new Error('Erreur lors de la suspension');
    return response.json();
  },
  onSuccess: () => {
    toast.success('Projet suspendu avec succès');
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  }
});

const [suspendReason, setSuspendReason] = useState('');

const handleSuspendProject = (projectId: string) => {
  if (!suspendReason.trim()) {
    toast.error('Veuillez indiquer la raison de la suspension');
    return;
  }
  suspendProjectMutation.mutate({ projectId, reason: suspendReason });
};

// Bouton à ajouter (condition: project.status === 'in_progress')
{project.status === 'in_progress' && (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="outline" size="sm" className="text-orange-600">
        <Pause className="w-4 h-4 mr-2" />
        Suspendre
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Suspendre le projet</AlertDialogTitle>
        <AlertDialogDescription>
          Indiquez la raison de la suspension de ce projet.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div className="py-4">
        <textarea
          value={suspendReason}
          onChange={(e) => setSuspendReason(e.target.value)}
          placeholder="Raison de la suspension..."
          className="w-full p-3 border rounded-lg"
          rows={3}
        />
      </div>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={() => setSuspendReason('')}>Annuler</AlertDialogCancel>
        <AlertDialogAction 
          onClick={() => handleSuspendProject(project.id)}
          disabled={suspendProjectMutation.isPending || !suspendReason.trim()}
        >
          Suspendre
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)}`;

    default:
      return `// Code d'implémentation à définir pour: ${action.name}`;
  }
}

// Fonction pour créer un plan d'implémentation
function createImplementationPlan(results) {
  console.log('\n📋 PLAN D\'IMPLÉMENTATION DES FONCTIONNALITÉS CRUD\n');
  console.log('=' .repeat(60));
  
  // Priorités d'implémentation
  const priorities = {
    HIGH: [],
    MEDIUM: [],
    LOW: []
  };

  // Classer par priorité
  results.missing.forEach(action => {
    if (action.page === 'payments' && action.name === 'Confirmer le paiement') {
      priorities.HIGH.push(action);
    } else if (action.page === 'projects' || action.page === 'quotations') {
      priorities.MEDIUM.push(action);
    } else {
      priorities.LOW.push(action);
    }
  });

  // Afficher le plan par priorité
  Object.entries(priorities).forEach(([priority, actions]) => {
    if (actions.length === 0) return;
    
    console.log(`\n🔴 PRIORITÉ ${priority} (${actions.length} actions)`);
    console.log('-'.repeat(40));
    
    actions.forEach((action, index) => {
      console.log(`${index + 1}. ${action.page.toUpperCase()}: ${action.name}`);
      console.log(`   📝 ${action.description}`);
      console.log(`   🎯 Condition: ${action.condition}`);
      console.log(`   ⚙️  ${action.implementation}`);
      console.log('');
    });
  });

  // Résumé des fonctionnalités existantes
  console.log('\n✅ FONCTIONNALITÉS DÉJÀ IMPLÉMENTÉES');
  console.log('-'.repeat(40));
  results.implemented.forEach(action => {
    console.log(`• ${action.page}: ${action.name}`);
  });

  // Fonctionnalités partielles
  if (results.partial.length > 0) {
    console.log('\n🔶 FONCTIONNALITÉS PARTIELLES (À AMÉLIORER)');
    console.log('-'.repeat(40));
    results.partial.forEach(action => {
      console.log(`• ${action.page}: ${action.name}`);
      console.log(`  ${action.implementation}`);
    });
  }

  console.log('\n📊 STATISTIQUES');
  console.log('-'.repeat(20));
  console.log(`Implémentées: ${results.implemented.length}`);
  console.log(`Manquantes: ${results.missing.length}`);
  console.log(`Partielles: ${results.partial.length}`);
  console.log(`Total: ${results.implemented.length + results.missing.length + results.partial.length}`);
}

// Exécution du script
function main() {
  console.log('🚀 ACTIVATION DES FONCTIONNALITÉS CRUD LOGIQUES\n');
  console.log('Analyse des pages client pour identifier les actions nécessaires...\n');
  
  const results = analyzeCrudFeatures();
  createImplementationPlan(results);
  
  // Sauvegarder le plan détaillé
  const planData = {
    timestamp: new Date().toISOString(),
    summary: {
      implemented: results.implemented.length,
      missing: results.missing.length,
      partial: results.partial.length
    },
    details: results,
    nextSteps: [
      'Implémenter les fonctionnalités prioritaires (payments)',
      'Ajouter les mutations backend nécessaires',
      'Tester les nouvelles fonctionnalités',
      'Mettre à jour la documentation'
    ]
  };
  
  fs.writeFileSync(
    'CRUD_IMPLEMENTATION_PLAN.json',
    JSON.stringify(planData, null, 2)
  );
  
  console.log('\n💾 Plan sauvegardé dans CRUD_IMPLEMENTATION_PLAN.json');
  
  // Générer des exemples de code pour les actions prioritaires
  console.log('\n🔧 GÉNÉRATION DU CODE D\'EXEMPLE...');
  
  const priorityActions = results.missing.filter(action => 
    action.page === 'payments' && action.name === 'Confirmer le paiement'
  );
  
  priorityActions.forEach(action => {
    const code = generateImplementationCode(action, action.page);
    const filename = `${action.page}_${action.name.replace(/\s+/g, '_').toLowerCase()}_implementation.tsx`;
    
    fs.writeFileSync(filename, code);
    console.log(`✅ Code généré: ${filename}`);
  });
}

if (require.main === module) {
  main();
}

module.exports = {
  analyzeCrudFeatures,
  generateImplementationCode,
  createImplementationPlan,
  crudFeatures
};
