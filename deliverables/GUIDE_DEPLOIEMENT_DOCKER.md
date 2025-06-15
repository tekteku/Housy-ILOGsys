# GUIDE DE DÉPLOIEMENT HOUSY - DOCKERISATION COMPLÈTE

## 🚀 Vue d'ensemble

Ce guide détaille la procédure complète de dockerisation et de déploiement de l'application Housy, depuis l'environnement de développement jusqu'à la production.

## 📋 Prérequis

### Système requis
- **Docker** version 20.10+ avec Docker Compose v2
- **Git** pour la gestion du code source
- **Node.js** version 18+ (pour le développement local)
- **PostgreSQL** (optionnel, fourni via Docker)

### Vérification des prérequis
```bash
# Vérifier Docker
docker --version
docker-compose --version

# Vérifier l'accès Docker
docker run hello-world
```

## 🏗️ Architecture Docker

### Structure des conteneurs

```
┌─────────────────────────────────────────────────────────┐
│                    HOUSY DOCKER STACK                  │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Nginx     │  │    Housy    │  │ PostgreSQL  │     │
│  │   Proxy     │  │     App     │  │  Database   │     │
│  │   :80/443   │  │    :3000    │  │    :5432    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│         │                 │                 │          │
│         └─────────────────┼─────────────────┘          │
│                           │                            │
│         ┌─────────────────┼─────────────────┐          │
│         │                 │                 │          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │    Redis    │  │ Monitoring  │  │   Backup    │     │
│  │    Cache    │  │   Stack     │  │   Service   │     │
│  │    :6379    │  │             │  │             │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Configuration Docker

### 1. Dockerfile principal (Production)

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Installation des dépendances système
RUN apk add --no-cache \
    libc6-compat \
    postgresql-client \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Étape 1: Installation des dépendances
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Étape 2: Construction de l'application
FROM base AS builder
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Build du client et serveur
RUN npm run build:client
RUN npm run build:server

# Étape 3: Image de production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Création utilisateur non-privilégié
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 housy

# Copie des fichiers construits
COPY --from=builder --chown=housy:nodejs /app/dist ./dist
COPY --from=builder --chown=housy:nodejs /app/client/dist ./client/dist
COPY --from=deps --chown=housy:nodejs /app/node_modules ./node_modules
COPY --chown=housy:nodejs package.json ./

# Copie des données JSON
COPY --chown=housy:nodejs server/data ./server/data

USER housy

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
```

### 2. Docker Compose Development

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  # Application en développement
  housy-dev:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: housy-app-dev
    restart: unless-stopped
    ports:
      - "3000:3000"
      - "5173:5173"  # Vite dev server
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://housy_dev:dev_password@postgres-dev:5432/housy_dev
      REDIS_URL: redis://redis-dev:6379
      OLLAMA_URL: http://host.docker.internal:11434
    volumes:
      - .:/app
      - /app/node_modules
      - /app/client/node_modules
    networks:
      - housy-dev-network
    depends_on:
      postgres-dev:
        condition: service_healthy
      redis-dev:
        condition: service_started

  # PostgreSQL pour développement
  postgres-dev:
    image: postgres:15-alpine
    container_name: housy-postgres-dev
    restart: unless-stopped
    environment:
      POSTGRES_DB: housy_dev
      POSTGRES_USER: housy_dev
      POSTGRES_PASSWORD: dev_password
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --locale=C"
    ports:
      - "5433:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
      - ./server/migrations:/docker-entrypoint-initdb.d:ro
    networks:
      - housy-dev-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U housy_dev"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis pour développement
  redis-dev:
    image: redis:7-alpine
    container_name: housy-redis-dev
    restart: unless-stopped
    ports:
      - "6380:6379"
    volumes:
      - redis_dev_data:/data
    networks:
      - housy-dev-network
    command: redis-server --appendonly yes

  # Adminer pour gestion base de données
  adminer-dev:
    image: adminer:4-standalone
    container_name: housy-adminer-dev
    restart: unless-stopped
    ports:
      - "8080:8080"
    networks:
      - housy-dev-network
    depends_on:
      - postgres-dev

volumes:
  postgres_dev_data:
    driver: local
  redis_dev_data:
    driver: local

networks:
  housy-dev-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### 3. Docker Compose Production

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Reverse Proxy Nginx
  nginx:
    image: nginx:alpine
    container_name: housy-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/ssl:ro
      - nginx_cache:/var/cache/nginx
      - nginx_logs:/var/log/nginx
    networks:
      - housy-network
    depends_on:
      - housy-app

  # Application principale
  housy-app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: housy-production
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://housy:${POSTGRES_PASSWORD}@postgres:5432/housy
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      OLLAMA_URL: ${OLLAMA_URL}
    networks:
      - housy-network
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'

  # Base de données PostgreSQL
  postgres:
    image: postgres:15-alpine
    container_name: housy-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: housy
      POSTGRES_USER: housy
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
      - ./server/migrations:/docker-entrypoint-initdb.d:ro
    networks:
      - housy-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U housy"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'

  # Cache Redis
  redis:
    image: redis:7-alpine
    container_name: housy-redis
    restart: unless-stopped
    volumes:
      - redis_data:/data
    networks:
      - housy-network
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru

  # Service de sauvegarde
  backup:
    image: postgres:15-alpine
    container_name: housy-backup
    restart: "no"
    environment:
      PGPASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - ./backups:/backups
      - ./scripts:/scripts:ro
    networks:
      - housy-network
    depends_on:
      - postgres
    command: |
      sh -c "
        while true; do
          pg_dump -h postgres -U housy -d housy > /backups/housy_backup_$$(date +%Y%m%d_%H%M%S).sql
          find /backups -name '*.sql' -mtime +7 -delete
          sleep 86400
        done
      "

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  nginx_cache:
    driver: local
  nginx_logs:
    driver: local

networks:
  housy-network:
    driver: bridge
```

## 🚀 Procédures de déploiement

### Développement local

```bash
# 1. Cloner le repository
git clone https://github.com/your-org/housy.git
cd housy

# 2. Configuration des variables d'environnement
cp .env.example .env.dev
# Éditer .env.dev avec vos valeurs

# 3. Construction et démarrage
chmod +x scripts/docker-manager.sh
./scripts/docker-manager.sh build
./scripts/docker-manager.sh start

# 4. Vérification
./scripts/docker-manager.sh health
```

### Production

```bash
# 1. Préparation du serveur
sudo apt update && sudo apt install -y docker.io docker-compose

# 2. Configuration sécurisée
cp .env.example .env.prod
# Configurer avec des mots de passe forts

# 3. Certificats SSL (Let's Encrypt)
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com

# 4. Déploiement
docker-compose -f docker-compose.yml up -d

# 5. Monitoring
docker-compose logs -f
```

## 🔍 Monitoring et maintenance

### Health checks automatiques

```bash
# Script de surveillance (monitoring.sh)
#!/bin/bash

check_service() {
    local service=$1
    local url=$2
    
    if curl -f "$url" &>/dev/null; then
        echo "✅ $service: OK"
    else
        echo "❌ $service: ERREUR"
        # Alertes (email, Slack, etc.)
    fi
}

check_service "Application" "http://localhost:3000/health"
check_service "API" "http://localhost:3000/api/health"
```

### Métriques de performance

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: housy-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  grafana:
    image: grafana/grafana:latest
    container_name: housy-grafana
    ports:
      - "3001:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/dashboards:/etc/grafana/provisioning/dashboards

volumes:
  prometheus_data:
  grafana_data:
```

## 🔐 Sécurité

### Configuration Nginx sécurisée

```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    # Sécurité headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Limitation taux
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    upstream housy_app {
        server housy-app:3000;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/ssl/cert.pem;
        ssl_certificate_key /etc/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

        # API endpoints avec limitation
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://housy_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Assets statiques avec cache
        location /static/ {
            proxy_pass http://housy_app;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Application principale
        location / {
            proxy_pass http://housy_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # Redirection HTTP vers HTTPS
    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }
}
```

## 📊 Métriques et KPIs

### Indicateurs de performance

```bash
# Métriques système (collectées automatiquement)
- CPU Usage: < 70%
- Memory Usage: < 80%
- Disk I/O: < 1000 IOPS
- Network: < 100 Mbps

# Métriques application
- Response Time: < 200ms (95e percentile)
- Error Rate: < 1%
- Throughput: > 100 req/s
- Availability: > 99.9%

# Métriques métier
- Estimations/jour: Objectif 1000+
- Taux conversion: Objectif 15%
- Satisfaction: Objectif 4.5/5
- Temps session: Objectif 5min+
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy Housy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm test
      - run: npm run build

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker images
        run: |
          docker build -t housy:${{ github.sha }} .
          docker tag housy:${{ github.sha }} housy:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          # Scripts de déploiement automatique
          ssh production-server 'cd /opt/housy && docker-compose pull && docker-compose up -d'
```

## 🆘 Dépannage

### Problèmes courants et solutions

```bash
# 1. Problème de permissions Docker
sudo usermod -aG docker $USER
newgrp docker

# 2. Port déjà utilisé
sudo lsof -i :3000
sudo kill -9 <PID>

# 3. Volume PostgreSQL corrompu
docker-compose down -v
docker volume rm housy_postgres_data
docker-compose up -d

# 4. Problème de mémoire
docker system prune -a
docker volume prune

# 5. Logs des erreurs
docker-compose logs --tail=100 housy-app
docker-compose logs --tail=100 postgres
```

### Scripts de diagnostic

```bash
# diagnostic.sh
#!/bin/bash

echo "=== DIAGNOSTIC HOUSY ==="
echo "Date: $(date)"
echo

echo "1. État des conteneurs:"
docker-compose ps

echo "2. Utilisation ressources:"
docker stats --no-stream

echo "3. Logs récents:"
docker-compose logs --tail=20 housy-app

echo "4. Connectivité base de données:"
docker exec housy-postgres-dev pg_isready -U housy_dev

echo "5. État Redis:"
docker exec housy-redis-dev redis-cli ping

echo "6. Test application:"
curl -I http://localhost:3000 2>/dev/null | head -1 || echo "❌ App non accessible"
```

## 🎯 Bonnes pratiques

### Optimisations recommandées

1. **Images multi-stage** pour réduire la taille
2. **Health checks** sur tous les services
3. **Limitations de ressources** pour éviter les fuites
4. **Backup automatique** des données critiques
5. **Monitoring** proactif avec alertes
6. **Logs centralisés** avec rotation
7. **Secrets management** sécurisé
8. **Tests d'intégration** automatisés

---

**Ce guide assure un déploiement robuste, scalable et sécurisé de l'application Housy en production.**
