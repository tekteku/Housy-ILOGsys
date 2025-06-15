#!/bin/bash

# Script de gestion Docker pour Housy
# Usage: ./docker-manager.sh [start|stop|build|logs|status]

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="housy"
COMPOSE_FILE="docker-compose.dev.yml"

# Fonctions utilitaires
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification de Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé ou non accessible"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker daemon n'est pas démarré"
        log_info "Veuillez démarrer Docker Desktop ou Docker service"
        exit 1
    fi
}

# Construction des images
build_images() {
    log_info "Construction des images Docker..."
    
    # Build de l'image de développement
    docker build -f Dockerfile.dev -t ${PROJECT_NAME}-dev . || {
        log_error "Échec de la construction de l'image de développement"
        exit 1
    }
    
    # Build de l'image de production
    docker build -f Dockerfile -t ${PROJECT_NAME}-prod . || {
        log_error "Échec de la construction de l'image de production"
        exit 1
    }
    
    log_info "Images construites avec succès !"
    docker images | grep ${PROJECT_NAME}
}

# Démarrage des services
start_services() {
    log_info "Démarrage des services Housy..."
    
    # Créer le réseau s'il n'existe pas
    docker network create housy-dev-network 2>/dev/null || true
    
    # Démarrer avec docker-compose
    docker-compose -f ${COMPOSE_FILE} up -d
    
    log_info "Services démarrés !"
    log_info "Application disponible sur: http://localhost:3000"
    log_info "Base de données: localhost:5433"
    log_info "Redis: localhost:6380"
}

# Arrêt des services
stop_services() {
    log_info "Arrêt des services Housy..."
    docker-compose -f ${COMPOSE_FILE} down
    log_info "Services arrêtés !"
}

# Affichage des logs
show_logs() {
    log_info "Logs des services Housy:"
    docker-compose -f ${COMPOSE_FILE} logs -f
}

# Statut des services
show_status() {
    log_info "Statut des services Housy:"
    docker-compose -f ${COMPOSE_FILE} ps
    
    echo
    log_info "Utilisation des ressources:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" $(docker-compose -f ${COMPOSE_FILE} ps -q) 2>/dev/null || true
}

# Nettoyage complet
cleanup() {
    log_warn "Nettoyage complet (suppression des volumes) ?"
    read -p "Continuer ? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose -f ${COMPOSE_FILE} down -v --remove-orphans
        docker system prune -f
        log_info "Nettoyage terminé !"
    fi
}

# Tests de santé
health_check() {
    log_info "Vérification de la santé des services..."
    
    # Test de l'application
    if curl -f http://localhost:3000/health 2>/dev/null; then
        log_info "✅ Application: OK"
    else
        log_error "❌ Application: ERREUR"
    fi
    
    # Test de la base de données
    if docker exec housy-postgres-dev pg_isready -U housy_dev 2>/dev/null; then
        log_info "✅ PostgreSQL: OK"
    else
        log_error "❌ PostgreSQL: ERREUR"
    fi
    
    # Test de Redis
    if docker exec housy-redis-dev redis-cli ping 2>/dev/null | grep -q PONG; then
        log_info "✅ Redis: OK"
    else
        log_error "❌ Redis: ERREUR"
    fi
}

# Menu principal
case "$1" in
    "build")
        check_docker
        build_images
        ;;
    "start")
        check_docker
        start_services
        ;;
    "stop")
        check_docker
        stop_services
        ;;
    "restart")
        check_docker
        stop_services
        start_services
        ;;
    "logs")
        check_docker
        show_logs
        ;;
    "status")
        check_docker
        show_status
        ;;
    "health")
        check_docker
        health_check
        ;;
    "cleanup")
        check_docker
        cleanup
        ;;
    *)
        echo "Usage: $0 {build|start|stop|restart|logs|status|health|cleanup}"
        echo
        echo "Commandes disponibles:"
        echo "  build    - Construire les images Docker"
        echo "  start    - Démarrer tous les services"
        echo "  stop     - Arrêter tous les services"
        echo "  restart  - Redémarrer tous les services"
        echo "  logs     - Afficher les logs en temps réel"
        echo "  status   - Afficher le statut des services"
        echo "  health   - Vérifier la santé des services"
        echo "  cleanup  - Nettoyage complet (ATTENTION: supprime les données)"
        exit 1
        ;;
esac
