# DESCRIPTION DES DIAGRAMMES D'ACTIVITÉ - APPLICATION HOUSY

## Vue d'ensemble

Les diagrammes d'activité modélisent les flux de travail et les processus métier de l'application Housy. Ils montrent les activités, les décisions, les points de synchronisation et les flux parallèles qui composent les processus de gestion de projets de construction.

---

## 1. DIAGRAMME D'ACTIVITÉ : PROCESSUS GLOBAL DE GESTION DES DEMANDES

### **Activité Principale : "De la Demande Client au Projet Livré"**

**Participants :** Client, Admin, Manager, Équipe Projet, Système

### Description du flux d'activités :

#### **🎯 Point de Départ :** Nouveau Client

1. **Activité : Soumission de Demande**
   - **Action :** Client remplit formulaire de demande
   - **Données :** Informations projet, localisation, budget souhaité
   - **Sortie :** Demande créée avec numéro unique

2. **🔀 Point de Décision :** Demande Complète ?
   - **[OUI]** → Continuer vers validation
   - **[NON]** → Retour au client pour informations supplémentaires

3. **Activité : Validation Initiale**
   - **Action :** Admin vérifie la faisabilité
   - **Critères :** Budget, localisation, type de projet
   - **Durée :** 24-48h

4. **🔀 Point de Décision :** Demande Acceptée ?
   - **[OUI]** → Assignation à un manager
   - **[NON]** → Notification de rejet avec raisons

5. **Activité : Assignation et Évaluation**
   - **Action :** Manager évalue les détails techniques
   - **Tâches :** Visite site, calcul matériaux, estimation délais
   - **Sortie :** Données d'estimation complètes

6. **Activité : Génération de Devis**
   - **Action :** Création automatisée + validation manuelle
   - **Composants :** Coûts matériaux, main-d'œuvre, équipements, marge
   - **Révisions :** Possibilité d'ajustements selon négociations

7. **🔀 Point de Décision :** Devis Accepté par Client ?
   - **[OUI]** → Conversion en projet actif
   - **[NON]** → **Fork** : Révision devis OU Archivage demande

8. **⚡ Point de Synchronisation :** Contrat Signé
   - Validation juridique + Signature électronique + Premier paiement

9. **🏗️ Activité Parallèle : Lancement Projet**
   - **Branche A :** Planification détaillée des phases
   - **Branche B :** Allocation des ressources (équipe, matériaux, équipements)
   - **Branche C :** Configuration système de suivi

10. **🔄 Boucle : Exécution des Phases**
    - **Pour chaque phase :**
      - Démarrage phase
      - Exécution travaux
      - Contrôle qualité
      - Validation client
      - Paiement d'étape
    - **Condition de sortie :** Toutes phases complétées

11. **Activité : Finalisation et Livraison**
    - **Actions :** Inspection finale, transfert propriété, solde final
    - **Documents :** Certificats, garanties, manuel d'entretien

#### **🎯 Point d'Arrivée :** Projet Livré et Client Satisfait

---

## 2. DIAGRAMME D'ACTIVITÉ : GESTION DES PHASES DE PROJET

### **Activité : "Cycle de Vie d'une Phase de Construction"**

**Participants :** Project Manager, Team Lead, Team Members, Quality Inspector

### Description du flux :

1. **🎯 Début :** Phase Planifiée

2. **Activité : Préparation de Phase**
   - **Actions parallèles :**
     - Vérification disponibilité ressources
     - Commande matériaux spécifiques
     - Briefing équipe
     - Préparation site

3. **⚡ Point de Synchronisation :** Ressources Prêtes
   - Matériaux livrés + Équipe assignée + Site préparé

4. **🔀 Point de Décision :** Conditions Météo Favorables ?
   - **[OUI]** → Démarrage phase
   - **[NON]** → **Délai** → Nouvelle évaluation météo

5. **Activité : Démarrage Phase**
   - Mise à jour statut "En cours"
   - Notification équipe et client
   - Activation suivi temps réel

6. **🔄 Boucle : Exécution Quotidienne**
   - **Activités journalières :**
     - Suivi avancement travaux
     - Contrôle qualité en continu
     - Mise à jour photos de progression
     - Vérification sécurité
   - **Condition :** Progression < 100%

7. **🔀 Points de Décision Multiples :**
   - **Problème Qualité ?** → Correction + Re-inspection
   - **Incident Sécurité ?** → Arrêt + Investigation + Reprise
   - **Retard Matériaux ?** → Réorganisation planning
   - **Conditions Météo ?** → Adaptation activités

8. **Activité : Contrôle Qualité Final**
   - **Actions :** Inspection complète par expert
   - **Critères :** Conformité plans, normes, spécifications
   - **Sortie :** Rapport d'inspection

9. **🔀 Point de Décision :** Phase Conforme ?
   - **[OUI]** → Validation phase
   - **[NON]** → Retour corrections + Nouvelle inspection

10. **Activité : Validation Phase**
    - Signature Project Manager
    - Notification client avec photos
    - Déclenchement paiement d'étape
    - Préparation phase suivante

#### **🎯 Fin :** Phase Validée et Payée

---

## 3. DIAGRAMME D'ACTIVITÉ : PROCESSUS DE PAIEMENT INTÉGRÉ

### **Activité : "Cycle Complet de Paiement"**

**Participants :** Système, Client, Banque, Admin, Comptabilité

### Description du flux :

1. **🎯 Déclencheur :** Milestone Projet Atteint

2. **Activité : Génération Automatique Facture**
   - Calcul montant selon pourcentage phase
   - Application taxes et réductions
   - Génération PDF facture

3. **⚡ Fork : Envoi Multi-Canal**
   - **Branche A :** Email avec PDF attaché
   - **Branche B :** SMS de notification
   - **Branche C :** Notification in-app
   - **Branche D :** Courrier postal (si requis)

4. **⚡ Point de Synchronisation :** Client Notifié

5. **⏱️ Délai d'Attente :** Période de Paiement (selon termes contrat)

6. **🔀 Point de Décision :** Paiement Reçu dans les Délais ?
   - **[OUI]** → Traitement paiement
   - **[NON]** → Processus rappels escaladés

#### **Branche A : Traitement Paiement Réussi**

7. **Activité : Validation Paiement**
   - Vérification montant + Référence
   - Rapprochement bancaire
   - Mise à jour solde projet

8. **⚡ Fork : Actions Post-Paiement**
   - **Branche 1 :** Envoi reçu de paiement
   - **Branche 2 :** Mise à jour dashboard client
   - **Branche 3 :** Notification équipe projet
   - **Branche 4 :** Comptabilisation automatique

#### **Branche B : Processus Rappels Escaladés**

9. **🔄 Boucle : Rappels Programmés**
   - **J+1 :** Rappel courtois par email
   - **J+7 :** Rappel SMS + Email avec pénalités
   - **J+15 :** Appel téléphonique + Courrier recommandé
   - **J+30 :** Escalade service juridique

10. **🔀 Point de Décision à Chaque Rappel :** Paiement Reçu ?
    - **[OUI]** → Rejoindre Branche A
    - **[NON]** → Continuer escalade

#### **🎯 Points d'Arrivée Multiples :**
- Paiement Réussi et Comptabilisé
- Dossier Transféré au Contentieux

---

## 4. DIAGRAMME D'ACTIVITÉ : GESTION DES APPROVISIONNEMENTS

### **Activité : "De l'Évaluation des Besoins à la Réception"**

**Participants :** Project Manager, Inventory Manager, Supplier, Quality Controller

### Description du flux :

1. **🎯 Déclencheur :** Phase Nécessitant Matériaux

2. **Activité : Évaluation Besoins**
   - Analyse plans et spécifications
   - Calcul quantités précises
   - Identification matériaux critiques

3. **Activité : Vérification Stock Existant**
   - **Actions parallèles :**
     - Consultation inventaire temps réel
     - Vérification qualité stock
     - Évaluation délais disponibilité

4. **🔀 Point de Décision :** Stock Suffisant ?
   - **[OUI]** → Réservation stock + Fin processus
   - **[NON]** → Processus commande

5. **Activité : Sélection Fournisseurs**
   - **Critères :** Prix, qualité, délais, localisation
   - **Actions :** Demandes de devis multiples
   - **Sortie :** Liste fournisseurs classés

6. **⚡ Fork : Demandes de Devis Parallèles**
   - Envoi simultané à 3-5 fournisseurs
   - Délai réponse : 48-72h

7. **⚡ Point de Synchronisation :** Devis Reçus

8. **Activité : Analyse Comparative**
   - **Critères :** Prix total, qualité certifiée, délais, conditions paiement
   - **Outil :** Grille de scoring automatisée
   - **Sortie :** Fournisseur recommandé

9. **🔀 Point de Décision :** Approbation Budget ?
   - **[OUI]** → Commande fournisseur sélectionné
   - **[NON]** → Négociation OU Recherche alternatives

10. **Activité : Passation Commande**
    - Génération bon de commande
    - Envoi fournisseur avec conditions
    - Planification livraison

11. **⏱️ Délai :** Période de Livraison

12. **Activité : Réception et Contrôle**
    - **Actions parallèles :**
      - Vérification quantités
      - Contrôle qualité visuel
      - Test échantillons (si requis)
      - Vérification conformité commande

13. **🔀 Point de Décision :** Livraison Conforme ?
    - **[OUI]** → Acceptation + Mise en stock
    - **[NON]** → Refus partiel/total + Réclamation fournisseur

14. **Activité : Finalisation**
    - Mise à jour inventaire
    - Validation facture fournisseur
    - Libération matériaux pour projet

#### **🎯 Fin :** Matériaux Disponibles pour Production

---

## 5. DIAGRAMME D'ACTIVITÉ : SUIVI QUALITÉ ET SÉCURITÉ

### **Activité : "Processus de Contrôle Qualité Continu"**

**Participants :** Quality Inspector, Safety Officer, Team Members, Project Manager

### Description du flux :

1. **🎯 Déclencheurs Multiples :**
   - Début de phase
   - Fin d'étape critique
   - Incident signalé
   - Inspection programmée

2. **🔀 Point de Décision :** Type d'Inspection ?
   - **[PLANIFIÉE]** → Inspection routine
   - **[URGENTE]** → Inspection immédiate
   - **[SÉCURITÉ]** → Protocole sécurité spécial

#### **Branche A : Inspection Qualité Routine**

3. **Activité : Préparation Inspection**
   - Sélection checklist appropriée
   - Préparation outils mesure
   - Coordination avec équipe

4. **🔄 Boucle : Contrôle par Zone**
   - **Pour chaque zone de travail :**
     - Vérification conformité plans
     - Mesures dimensionnelles
     - Test matériaux
     - Photos documentaires
   - **Condition :** Toutes zones inspectées

5. **Activité : Évaluation Globale**
   - Compilation résultats
   - Calcul score qualité
   - Identification non-conformités

#### **Branche B : Inspection Sécurité**

6. **Activité : Évaluation Risques Sécurité**
   - **Actions parallèles :**
     - Vérification EPI équipe
     - Contrôle équipements sécurité
     - Évaluation conditions météo
     - Vérification procédures urgence

7. **🔀 Point de Décision :** Risque Immédiat ?
   - **[OUI]** → Arrêt immédiat travaux
   - **[NON]** → Continuation avec recommandations

#### **Convergence des Branches**

8. **Activité : Génération Rapport**
   - Compilation toutes observations
   - Classification par criticité
   - Définition actions correctives
   - Estimation délais correction

9. **🔀 Point de Décision :** Actions Correctives Requises ?
   - **[NON]** → Validation + Fin processus
   - **[OUI]** → Plan d'actions correctives

10. **⚡ Fork : Actions Correctives Parallèles**
    - **Branche 1 :** Corrections mineures (équipe)
    - **Branche 2 :** Corrections majeures (spécialistes)
    - **Branche 3 :** Formation complémentaire
    - **Branche 4 :** Mise à jour procédures

11. **⚡ Point de Synchronisation :** Corrections Terminées

12. **Activité : Inspection de Validation**
    - Vérification corrections appliquées
    - Nouveau test si nécessaire
    - Validation finale

#### **🎯 Fin :** Zone/Phase Certifiée Conforme

---

## 6. DIAGRAMME D'ACTIVITÉ : ANALYTICS ET PILOTAGE

### **Activité : "Génération de Tableaux de Bord Décisionnels"**

**Participants :** Admin, Système Analytics, Data Warehouse, Dashboard Engine

### Description du flux :

1. **🎯 Déclencheurs :**
   - Requête manuelle admin
   - Génération programmée (quotidienne/hebdomadaire/mensuelle)
   - Alerte seuil dépassé

2. **⚡ Fork : Collecte de Données Parallèle**
   - **Branche A :** Données projets actifs
   - **Branche B :** Données financières
   - **Branche C :** Données ressources humaines
   - **Branche D :** Données client/satisfaction
   - **Branche E :** Données qualité/sécurité

3. **Activité par Branche :**
   - Extraction base de données
   - Nettoyage et validation
   - Agrégation selon période

4. **⚡ Point de Synchronisation :** Données Collectées

5. **Activité : Calculs KPIs**
   - **KPIs Financiers :** CA, marges, rentabilité
   - **KPIs Opérationnels :** Délais, qualité, productivité
   - **KPIs Client :** Satisfaction, fidélisation, conversion
   - **KPIs Ressources :** Utilisation, efficacité

6. **🔄 Boucle : Analyse Tendances**
   - **Pour chaque KPI :**
     - Comparaison période précédente
     - Calcul tendance
     - Identification écarts
     - Projection future

7. **🔀 Point de Décision :** Seuils d'Alerte Dépassés ?
   - **[OUI]** → Génération alertes automatiques
   - **[NON]** → Continuation reporting normal

8. **Activité : Génération Visualisations**
   - **Actions parallèles :**
     - Graphiques évolution temporelle
     - Tableaux comparatifs
     - Cartes géographiques
     - Indicateurs temps réel

9. **Activité : Compilation Dashboard**
   - Assemblage composants visuels
   - Application thème et branding
   - Optimisation performance affichage

10. **⚡ Fork : Distribution Multi-Canal**
    - **Email :** Rapport PDF automatique
    - **Web :** Dashboard interactif
    - **Mobile :** Notifications push avec KPIs clés
    - **API :** Données pour systèmes tiers

#### **🎯 Fin :** Décideurs Informés en Temps Réel

---

## ÉLÉMENTS TRANSVERSAUX DES DIAGRAMMES D'ACTIVITÉ

### **🔄 Boucles Principales Identifiées :**

1. **Boucle de Révision :** Devis → Négociation → Révision → Nouvelle proposition
2. **Boucle de Phase :** Planification → Exécution → Contrôle → Validation → Phase suivante
3. **Boucle de Correction :** Inspection → Non-conformité → Correction → Re-inspection
4. **Boucle de Rappel :** Facture → Délai → Rappel → Escalade → Nouveau délai

### **🔀 Points de Décision Critiques :**

1. **Faisabilité Technique :** Détermine acceptation/rejet demande
2. **Validation Budget :** Oriente vers différents niveaux de qualité
3. **Conditions Météo :** Impact planning et sécurité chantier
4. **Contrôle Qualité :** Validation ou correction phases
5. **Seuils Paiement :** Déclenchement processus recouvrement

### **⚡ Points de Synchronisation Majeurs :**

1. **Signature Contrat :** Convergence validation juridique + financière + technique
2. **Début Phase :** Synchronisation ressources + matériaux + conditions
3. **Livraison Matériaux :** Coordination commande + transport + réception
4. **Validation Projet :** Convergence contrôle qualité + satisfaction client + paiement final

### **⏱️ Gestion du Temps :**

1. **Délais Fixes :** Validation demande (48h), réponse devis (7 jours)
2. **Délais Variables :** Exécution phases (selon complexité)
3. **Timeouts :** Expiration devis, escalade paiements
4. **Optimisations :** Parallélisation tâches non-dépendantes

### **🚨 Gestion des Exceptions :**

1. **Arrêt d'Urgence :** Incident sécurité → Suspension immédiate
2. **Escalade Automatique :** Retards → Notification hiérarchie
3. **Plans de Contingence :** Indisponibilité ressources → Solutions alternatives
4. **Recovery Procedures :** Échec technique → Procédures de récupération

---

Cette description des diagrammes d'activité fournit une vue complète des processus métier de l'application Housy, en mettant l'accent sur les flux de travail, les points de décision et la gestion des exceptions dans un environnement de construction complexe.
