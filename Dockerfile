# Dockerfile pour l'application Housy
# Image de base multi-stage pour optimiser la taille

# Stage 1: Build stage pour le frontend
FROM node:18-alpine AS frontend-builder
LABEL stage=frontend-builder
LABEL maintainer="Housy Development Team <dev@housy.tn>"
LABEL description="Frontend build stage for Housy application"

WORKDIR /app/client

# Copier les fichiers de dépendances
COPY client/package*.json ./

# Installer les dépendances avec cache optimal
RUN npm ci --only=production --silent

# Copier le code source du frontend
COPY client/ ./

# Build du frontend pour la production
RUN npm run build

# Stage 2: Build stage pour le backend
FROM node:18-alpine AS backend-builder
LABEL stage=backend-builder

WORKDIR /app

# Copier les fichiers de dépendances du backend
COPY package*.json ./
COPY server/ ./server/
COPY shared/ ./shared/

# Installer les dépendances
RUN npm ci --only=production --silent

# Build du backend TypeScript
RUN npm run build

# Stage 3: Production stage
FROM node:18-alpine AS production
LABEL maintainer="Housy Development Team <dev@housy.tn>"
LABEL version="1.0.0"
LABEL description="Housy - Construction & Immobilier Platform"
LABEL company="ILOGsys"

# Installer les dépendances système nécessaires
RUN apk add --no-cache \
    ca-certificates \
    tzdata \
    curl \
    && rm -rf /var/cache/apk/*

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S housy -u 1001

WORKDIR /app

# Copier les artefacts de build depuis les stages précédents
COPY --from=backend-builder --chown=housy:nodejs /app/dist ./dist
COPY --from=backend-builder --chown=housy:nodejs /app/node_modules ./node_modules
COPY --from=backend-builder --chown=housy:nodejs /app/package.json ./package.json

# Copier les données JSON
COPY --chown=housy:nodejs server/data ./server/data

# Copier les fichiers statiques du frontend
COPY --from=frontend-builder --chown=housy:nodejs /app/dist ./client/dist

# Créer les répertoires nécessaires
RUN mkdir -p /app/logs /app/uploads && \
    chown -R housy:nodejs /app

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV TZ=Africa/Tunis

# Configuration des limites de mémoire Node.js
ENV NODE_OPTIONS="--max-old-space-size=512"

# Exposer le port
EXPOSE 3000

# Utiliser l'utilisateur non-root
USER housy

# Health check pour Docker
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Point d'entrée optimisé
CMD ["node", "dist/index.js"]
