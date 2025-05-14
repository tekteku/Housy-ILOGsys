# Static File Structure for HousyTunisia

Ce document explique la structure des fichiers statiques pour l'application HousyTunisia et comment les utiliser correctement.

## Structure des dossiers

```
/static                # Dossier principal pour les fichiers statiques du projet
  /images              # Images utilisées dans l'application
    /profiles          # Photos de profil des utilisateurs
    /projects          # Images liées aux projets
  /icons               # Icônes de l'application
  /fonts               # Polices personnalisées
  /css                 # Feuilles de style CSS supplémentaires
  /js                  # Scripts JavaScript supplémentaires
```

## Utilisation des fichiers statiques

### Images de profil utilisateur

Pour afficher les images de profil utilisateur, utilisez le composant `UserAvatar` :

```tsx
import UserAvatar from "@/components/ui/user-avatar";

<UserAvatar 
  src="/static/images/profiles/user_123.jpg" 
  alt="Nom de l'utilisateur"
  size="md"
/>
```

Le composant `UserAvatar` gère automatiquement les erreurs de chargement d'image et affiche les initiales de l'utilisateur en cas d'erreur.

### Images de projet

Pour afficher les images de projet, utilisez le composant `ProjectImage` :

```tsx
import ProjectImage from "@/components/ui/project-image";

<ProjectImage 
  src="/static/images/projects/project_123.jpg" 
  alt="Nom du projet"
  size="md"
/>
```

Le composant `ProjectImage` gère automatiquement les erreurs de chargement d'image et affiche une image par défaut en cas d'erreur.

### Téléchargement d'images

Pour permettre aux utilisateurs de télécharger des images de profil, utilisez le composant `ImageUploadForm` :

```tsx
import { ImageUploadForm } from "@/components/ui/image-upload-form";

<ImageUploadForm 
  userId={123} 
  currentAvatarUrl="/static/images/profiles/user_123.jpg"
  onUploadSuccess={(newImagePath) => {
    // Mettre à jour l'URL de l'image dans votre état ou base de données
    console.log("Nouvelle image:", newImagePath);
  }}
/>
```

### API du serveur pour les images

Le serveur fournit les endpoints suivants pour gérer les images :

- `POST /api/images/upload/:userId` - Télécharger une image de profil
- `GET /api/images/default` - Obtenir l'image de profil par défaut
- `DELETE /api/images/:userId` - Supprimer l'image de profil d'un utilisateur

## Gestion des chemins d'accès

Tous les fichiers statiques sont accessibles via le préfixe `/static` dans vos URLs. Par exemple :

- `/static/images/profiles/default.png` - Image de profil par défaut
- `/static/images/projects/project_123.jpg` - Image d'un projet
- `/static/icons/favicon.ico` - Favicon du site

## Bonnes pratiques

1. Utilisez toujours le composant `UserAvatar` pour afficher les avatars des utilisateurs.
2. Vérifiez toujours que les images existent avant de les afficher.
3. Optimisez les images avant de les télécharger (taille, compression).
4. Limitez la taille des fichiers téléchargés (actuellement 5 Mo maximum).

## Génération d'avatars par défaut

Un script est disponible pour générer l'avatar par défaut :

```bash
npx tsx scripts/create-static-avatars.ts
```

Ce script crée une image d'avatar par défaut qui sera utilisée lorsqu'aucune image de profil n'est disponible.
