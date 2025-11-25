# Synthèse du Projet Housy Tunisia

## Objectif du Projet

**Housy Tunisia** est une application web complète et spécialisée pour le marché immobilier tunisien. Son objectif principal est de fournir une plateforme intégrée pour :

*   **L'estimation immobilière assistée par IA :** Offrir des estimations de coûts de construction et de valeur de biens immobiliers, en s'appuyant sur plusieurs modèles d'intelligence artificielle (OpenAI, Anthropic, DeepSeek, et un modèle local Ollama).
*   **La gestion de projets de construction :** Permettre aux utilisateurs de suivre leurs projets, de la planification à la finalisation.
*   **La gestion des matériaux :** Fournir une base de données des matériaux de construction disponibles en Tunisie, avec leurs prix et fournisseurs.
*   **L'analyse financière :** Aider à la gestion des budgets et des transactions financières liées aux projets.

## Structure Technique

Le projet est une application **Full-Stack TypeScript** avec une architecture moderne et découplée :

*   **Frontend :** Une application **React** (avec Vite comme outil de build) qui constitue l'interface utilisateur. Elle utilise des bibliothèques modernes comme TailwindCSS pour le style, Radix UI pour les composants d'interface, et React Query pour la gestion des données provenant du serveur.
*   **Backend :** Un serveur **Node.js** avec le framework **Express.js**. Il expose une API RESTful pour communiquer avec le frontend. La logique métier est organisée en services (ex: `ProjectService`, `MaterialService`, `AIService`).
*   **Base de données :** Une base de données relationnelle **PostgreSQL**, gérée avec l'ORM **Drizzle**, qui assure la cohérence des types entre la base de données et le code TypeScript.
*   **Conteneurisation :** Le projet est entièrement **dockerisé** à l'aide de `docker-compose.yml`. Cela permet de lancer l'ensemble de l'application (frontend, backend, base de données PostgreSQL, et même un cache Redis) avec une seule commande, garantissant un environnement de développement et de production cohérent.
*   **Code Partagé :** Un dossier `shared` contient du code (comme les schémas de validation Zod) qui est utilisé à la fois par le frontend et le backend, évitant ainsi la duplication de code.

## Fonctionnalités Clés

*   **Authentification :** Système d'authentification basé sur les rôles (administrateur, client) avec JWT (JSON Web Tokens).
*   **Gestion des utilisateurs (Admin) :** Les administrateurs peuvent gérer les utilisateurs de la plateforme.
*   **Estimations IA :**
    *   Les utilisateurs peuvent soumettre une description de leur projet pour obtenir une estimation détaillée.
    *   Le système peut utiliser différents modèles d'IA, avec un accès différencié selon le rôle de l'utilisateur (les administrateurs ont accès à des modèles locaux plus sécurisés).
*   **Gestion de Projets :** CRUD (Create, Read, Update, Delete) complet pour les projets de construction.
*   **Base de Données de Matériaux :** Consultation et recherche dans une base de données de matériaux de construction.
*   **API Riche :** Une API bien documentée (`API_DOCUMENTATION.md`) expose de nombreux points d'accès pour interagir avec les différentes fonctionnalités.

## Dépendances Techniques

Le projet utilise un ensemble de technologies modernes et populaires :

*   **Frontend :** `react`, `react-router`, `tailwindcss`, `@tanstack/react-query`, `recharts` (pour les graphiques).
*   **Backend :** `express`, `typescript`, `drizzle-orm`, `pg` (client PostgreSQL), `zod` (validation), `bcrypt` (hachage de mots de passe), `jsonwebtoken`.
*   **IA :** `@anthropic-ai/sdk`, `@langchain/openai`, `@langchain/anthropic`, `@langchain/ollama`.
*   **Développement :** `vite`, `tsx` (pour exécuter du TypeScript directement), `drizzle-kit` (pour les migrations de base de données).

## Conclusion

**Housy Tunisia** est un projet de développement logiciel ambitieux et bien structuré, qui tire parti des technologies les plus récentes pour créer une solution puissante et spécifique au marché de la construction en Tunisie. L'utilisation de TypeScript de bout en bout, de Docker pour le déploiement, et d'une architecture claire en couches en fait un projet robuste et maintenable.
