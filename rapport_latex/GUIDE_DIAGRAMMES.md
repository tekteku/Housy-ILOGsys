# Guide de Placement des Diagrammes UML - Rapport Housy Tunisia

## Diagrammes Créés et Leur Emplacement dans le Rapport

### 1. Diagramme de Cas d'Utilisation Général
**Emplacement recommandé :** Chapitre 2 - Business Understanding
**Section :** Analyse des besoins fonctionnels
**Description :** Vue d'ensemble des interactions entre les acteurs (Administrateur, Chef de Projet, Estimateur, Client, Fournisseur) et le système Housy Tunisia

### 2. Diagramme de Classes Global
**Emplacement recommandé :** Chapitre 5 - Modélisation / Nouveau chapitre "Conception et Diagrammes UML"
**Section :** Architecture orientée objet
**Description :** Structure des principales entités (User, Project, Estimation, Material, Supplier, Task, Client) avec leurs attributs, méthodes et relations

### 3. Architecture de l'Application
**Emplacement recommandé :** Chapitre 5 - Modélisation
**Section :** Architecture technique
**Description :** Architecture en couches (Présentation, API, Métier, Données, Infrastructure) avec les technologies utilisées

### 4. Architecture du Pipeline de Données
**Emplacement recommandé :** Chapitre 4 - Data Preparation
**Section :** Processus de traitement des données
**Description :** Pipeline d'estimation avec validation, enrichissement, calculs parallèles et agrégation

### 5. Diagrammes de Séquence
**Emplacement recommandé :** Chapitre "Conception et Diagrammes UML"
**Trois diagrammes créés :**
- Création d'un projet
- Génération d'estimation
- Authentification utilisateur

### 6. Diagramme d'Architecture de Déploiement
**Emplacement recommandé :** Chapitre 7 - Déploiement
**Section :** Infrastructure de production
**Description :** Architecture haute disponibilité avec load balancer, conteneurs frontend/backend, cluster de base de données

## Captures d'Écran à Ajouter

Pour chaque diagramme, prévoir les captures suivantes :

### Interface Utilisateur
- Dashboard principal de l'application
- Écrans de gestion des projets
- Interface d'estimation
- Pages d'administration

### Code Source
- Extraits de code TypeScript/React
- Structure des modèles de données
- API endpoints principaux
- Configuration Docker

### Monitoring et Production
- Dashboard Grafana avec métriques
- Logs de déploiement Docker
- Interface d'administration système
- Certificats SSL valides

### Tests et Validation
- Rapport de couverture des tests
- Résultats des tests de performance
- Heatmap d'utilisation de l'interface
- Graphiques de comparaison estimations vs réalisations

## Structure du Chapitre "Conception et Diagrammes UML"

Le nouveau chapitre créé (`diagrammes_uml.tex`) contient :

1. **Section 1 :** Diagramme de Cas d'Utilisation Général
   - Description des acteurs
   - Cas d'utilisation détaillés
   - Scénarios nominaux

2. **Section 2 :** Diagramme de Classes Global
   - Architecture orientée objet
   - Description des classes principales
   - Relations et dépendances

3. **Section 3 :** Architecture de l'Application
   - Architecture technique globale
   - Couches et responsabilités
   - Technologies utilisées

4. **Section 4 :** Architecture du Pipeline de Données
   - Pipeline d'estimation
   - Sources de données
   - Processus de traitement

5. **Section 5 :** Diagrammes de Séquence
   - Interactions principales
   - Flux de données
   - Processus métier

6. **Section 6 :** Placement des Diagrammes dans le Rapport
   - Recommandations de positionnement
   - Captures complémentaires

## Compilation du Rapport

Le rapport principal (`main.tex`) a été mis à jour pour inclure :
- Le nouveau chapitre des diagrammes UML
- Le chapitre de déploiement révisé
- La conclusion mise à jour

## Commandes de Compilation

```bash
# Compilation complète du rapport
pdflatex main.tex
bibtex main
pdflatex main.tex
pdflatex main.tex

# Ou avec latexmk pour automatiser
latexmk -pdf main.tex
```

## Conseils pour l'Intégration

1. **Qualité des diagrammes :** S'assurer que tous les diagrammes sont lisibles à l'impression
2. **Cohérence graphique :** Utiliser les mêmes couleurs et styles dans tous les diagrammes
3. **Légendes complètes :** Chaque diagramme doit avoir une légende explicative
4. **Références croisées :** Utiliser `\ref{}` pour référencer les diagrammes dans le texte
5. **Mise à jour continue :** Maintenir la cohérence entre les diagrammes et l'implémentation

## Livrables Finaux

- Rapport LaTeX complet avec tous les diagrammes
- Fichiers sources des diagrammes (TikZ)
- Guide de compilation et maintenance
- Captures d'écran de l'application en fonctionnement
- Documentation technique complète
