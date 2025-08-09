# 🐳 Guide de Dockerisation - Application Housy

## Vue d'Ensemble

Cette documentation explique comment dockeriser et déployer l'application Housy en utilisant Docker et Docker Compose.

## 📋 Prérequis

- Docker Desktop installé et fonctionnel
- Docker Compose v2.0+
- 8GB de RAM minimum
- 20GB d'espace disque libre

## 🏗️ Architecture Docker

L'application Housy utilise une architecture multi-conteneurs :

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   PostgreSQL    │
│   (React +      │    │   (Node.js +    │    │   Database      │
│    Vite)        │    │   Express)      │    │                 │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │     Redis       │
                    │    Cache        │
                    │   Port: 6379    │
                    └─────────────────┘
```

## 🔧 Configuration des Environnements

### Développement (`docker-compose.dev.yml`)

**Services inclus :**
- `postgres-dev` : Base de données PostgreSQL 15
- `redis-dev` : Cache Redis 7
- `housy-dev` : Application avec hot-reload

**Ports exposés :**
- Application : `3000` (Frontend) + `3001` (Backend)
- PostgreSQL : `5433` (pour éviter les conflits)
- Redis : `6380`

### Production (`docker-compose.yml`)

**Services inclus :**
- `postgres` : Base de données PostgreSQL optimisée
- `redis` : Cache Redis avec persistance
- `housy-app` : Application compilée et optimisée
- `nginx` : Reverse proxy et serveur statique

## 🚀 Commandes de Déploiement

### Développement

```bash
# Construction des images
docker-compose -f docker-compose.dev.yml build

# Lancement de l'environnement de développement
docker-compose -f docker-compose.dev.yml up -d

# Suivi des logs
docker-compose -f docker-compose.dev.yml logs -f

# Arrêt de l'environnement
docker-compose -f docker-compose.dev.yml down
```

### Production

```bash
# Construction des images de production
docker-compose build

# Lancement de la production
docker-compose up -d

# Mise à jour de l'application
docker-compose down
docker-compose build
docker-compose up -d
```

## 🔍 Monitoring et Debugging

### Vérification de l'état des conteneurs

```bash
# Statut des conteneurs
docker-compose ps

# Logs de l'application
docker-compose logs housy-app

# Logs de la base de données
docker-compose logs postgres

# Accès shell au conteneur de l'app
docker-compose exec housy-app sh
```

### Vérification de la santé de l'application

```bash
# Test de l'API
curl http://localhost:3000/api/health

# Test de la base de données
docker-compose exec postgres psql -U housy_user -d housy_db -c "SELECT version();"

# Test du cache Redis
docker-compose exec redis redis-cli ping
```

## 💾 Gestion des Données

### Sauvegarde de la base de données

```bash
# Sauvegarde complète
docker-compose exec postgres pg_dump -U housy_user housy_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Sauvegarde automatique (à programmer)
docker-compose exec postgres pg_dump -U housy_user housy_db | gzip > /backups/housy_backup_$(date +%Y%m%d).sql.gz
```

### Restauration de la base de données

```bash
# Restauration depuis un fichier
docker-compose exec -T postgres psql -U housy_user -d housy_db < backup_file.sql
```

## 🔧 Variables d'Environnement

### Variables requises pour la production

```env
# Base de données
DATABASE_URL=postgresql://username:password@postgres:5432/housy_db
POSTGRES_DB=housy_db
POSTGRES_USER=housy_user
POSTGRES_PASSWORD=secure_password

# Cache
REDIS_URL=redis://redis:6379

# Application
NODE_ENV=production
PORT=3000
JWT_SECRET=your_jwt_secret_here

# APIs externes
OPENAI_API_KEY=your_openai_key
DEEPSEEK_API_KEY=your_deepseek_key
ANTHROPIC_API_KEY=your_anthropic_key

# Ollama (optionnel)
OLLAMA_BASE_URL=http://ollama:11434
```

## 🐛 Résolution des Problèmes Courants

### Problème : Docker Desktop ne démarre pas
**Solution :**
1. Redémarrer Docker Desktop
2. Vérifier les ressources système (RAM/CPU)
3. Redémarrer Windows si nécessaire

### Problème : Port déjà utilisé
**Solution :**
```bash
# Identifier le processus utilisant le port
netstat -ano | findstr :3000

# Arrêter le processus
taskkill /PID <process_id> /F
```

### Problème : Base de données inaccessible
**Solution :**
```bash
# Recréer le volume de données
docker-compose down -v
docker-compose up -d
```

### Problème : Mémoire insuffisante
**Solution :**
1. Augmenter la RAM allouée à Docker Desktop
2. Nettoyer les images inutilisées :
```bash
docker system prune -a
```

## 📊 Optimisation des Performances

### Configuration Docker Desktop
- RAM : 6-8GB minimum
- CPU : 4 cores minimum
- Swap : 2GB
- Disk image size : 64GB minimum

### Optimisation des images
```bash
# Construction avec cache optimisé
docker-compose build --build-arg BUILDKIT_INLINE_CACHE=1

# Nettoyage régulier
docker system prune -f
docker volume prune -f
```

## 🔒 Sécurité

### Recommandations de sécurité
1. **Mots de passe forts** : Utiliser des mots de passe complexes
2. **Secrets management** : Utiliser Docker secrets en production
3. **Network isolation** : Séparer les réseaux frontend/backend
4. **Image scanning** : Scanner les vulnerabilités régulièrement

### Configuration des secrets (production)
```yaml
secrets:
  db_password:
    external: true
  jwt_secret:
    external: true
```

## 📈 Scaling et Haute Disponibilité

### Scaling horizontal
```bash
# Plusieurs instances de l'application
docker-compose up --scale housy-app=3

# Load balancer automatique avec nginx
# Configuration dans nginx.conf
```

### Monitoring avancé
- Prometheus + Grafana pour les métriques
- ELK Stack pour les logs centralisés
- Health checks automatiques

## 🚢 Déploiement en Production

### Checklist avant déploiement
- [ ] Variables d'environnement configurées
- [ ] Secrets sécurisés
- [ ] Sauvegarde de données
- [ ] Tests d'intégration passés
- [ ] Monitoring configuré
- [ ] SSL/TLS activé

### Commandes de déploiement
```bash
# Production deployment
docker-compose -f docker-compose.yml up -d

# Vérification post-déploiement
./scripts/health-check.sh
```

## 📞 Support et Maintenance

### Logs importants à surveiller
- Application errors dans `housy-app`
- Connexions base de données dans `postgres`
- Performance cache dans `redis`
- Reverse proxy dans `nginx`

### Maintenance régulière
- Sauvegarde quotidienne de la DB
- Nettoyage des logs (rotation)
- Mise à jour des images de base
- Monitoring de l'espace disque

---

## 📚 Ressources Additionnelles

- [Documentation Docker officielle](https://docs.docker.com/)
- [Guide Docker Compose](https://docs.docker.com/compose/)
- [Best practices de production](https://docs.docker.com/develop/dev-best-practices/)

---

*Documentation générée pour le projet Housy - ILOGsys*
*Date : 13 Juin 2025*
