# Diagramme de Cas d'Utilisation Simplifié - Housy

## Améliorations Apportées

### Problèmes Identifiés dans le Diagramme Original
- **Trop d'acteurs** : Le diagramme original contenait de nombreux acteurs rendant la lecture difficile
- **Complexité excessive** : Trop de flèches et de relations entre les éléments
- **Manque de hiérarchisation** : Les acteurs primaires et secondaires n'étaient pas clairement distingués

### Solutions Implémentées

#### 1. Réduction du Nombre d'Acteurs
**Avant** : Nombreux acteurs spécialisés
**Après** : 3 acteurs essentiels (acteurs humains uniquement)
- **Visiteur** : Utilisateurs non authentifiés
- **Utilisateur Authentifié** : Clients connectés
- **Administrateur** : Personnel de gestion

*Note : L'acteur "Système IA" a été supprimé pour se concentrer sur les interactions humain-système*

#### 2. Reorganisation Acteurs Primaires/Secondaires
**Acteurs Primaires** (à gauche) :
- Visiteur
- Utilisateur Authentifié  
- Administrateur

**Acteurs Secondaires** : Aucun (suppression du Système IA)

Cette approche met l'accent sur les interactions directes utilisateur-système sans représenter explicitement les composants internes comme l'IA.
- **Acteurs Primaires** (à gauche) : Visiteur, Utilisateur Authentifié, Administrateur
- **Acteur Secondaire** (à droite) : Système IA

#### 3. Simplification des Cas d'Utilisation
**Regroupement par domaines fonctionnels** :
- **Services Publics** : Fonctionnalités accessibles sans inscription
- **Services Utilisateur** : Fonctionnalités pour utilisateurs connectés
- **Administration** : Fonctionnalités de gestion système

#### 4. Rationalisation des Relations
**Relations conservées (essentielles uniquement)** :
- Relations directes acteur → cas d'utilisation
- Relations d'inclusion (`<<includes>>`) pour l'authentification
- Relation d'extension (`<<extends>>`) pour l'estimation avancée
- Relations avec le système IA

**Relations supprimées** :
- Relations redondantes ou peu importantes
- Flèches multiples entre mêmes éléments
- Relations de dépendance complexes

### Résultat Final

Le nouveau diagramme présente :
- **Clarté** : Lecture immédiate de la structure
- **Simplicité** : Moins d'éléments à traiter visuellement
- **Hiérarchisation** : Distinction claire des niveaux d'acteurs
- **Fonctionnalité** : Conservation de toutes les fonctions essentielles

### Fichiers Générés
- `usecase_diagram_simple.puml` : Source PlantUML simplifié
- `usecase_diagram_simple.png` : Diagramme généré
- `usecase_diagram_simple_clean.puml` : Version alternative encore plus épurée

### Utilisation
Le diagramme peut être intégré dans le rapport LaTeX en remplaçant l'ancien diagramme par :
```latex
\includegraphics[width=0.8\textwidth]{usecase_diagram_simple.png}
```

### Scripts de Génération
- `generate_usecase_diagram_simple.bat` : Script Windows batch
- `generate_usecase_diagram_simple.ps1` : Script PowerShell (recommandé)

## Conformité aux Exigences

✅ **Acteurs primaires à gauche** : Visiteur, Utilisateur, Administrateur
✅ **Acteurs secondaires à droite** : Système IA
✅ **Nombre d'acteurs réduit** : De nombreux acteurs à 4 acteurs essentiels
✅ **Relations rationalisées** : Seules les interactions essentielles
✅ **Cas d'utilisation regroupés** : Organisation par domaines fonctionnels
✅ **Lisibilité améliorée** : Diagramme plus concis et compréhensible
