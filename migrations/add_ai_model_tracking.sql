-- Migration pour ajouter la table de tracking des modèles IA
-- Date: 2025-06-16
-- Auteur: tekteku
-- IMPORTANT: Cette table est UNIQUEMENT pour le développement et le debugging

CREATE TABLE IF NOT EXISTS ai_model_tracking (
    id SERIAL PRIMARY KEY,
    responsible_estimation VARCHAR(255), -- Nom du modèle responsable estimation
    responsible_generation VARCHAR(255), -- Nom du modèle responsable génération
    model_used VARCHAR(255) NOT NULL, -- Modèle actif
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Horodatage
    user_id VARCHAR(255), -- ID utilisateur
    session_id VARCHAR(255) NOT NULL, -- ID session
    task_type VARCHAR(255) NOT NULL, -- 'estimation' | 'generation' | 'chat'
    input_data JSONB, -- Données d'entrée pour debug
    output_data JSONB, -- Données de sortie pour debug
    execution_time_ms INTEGER, -- Temps d'exécution en ms
    model_capabilities JSONB, -- Capacités du modèle utilisé
    performance_metrics JSONB, -- Métriques de performance
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index pour améliorer les performances des requêtes de développement
CREATE INDEX IF NOT EXISTS idx_ai_tracking_model_used ON ai_model_tracking(model_used);
CREATE INDEX IF NOT EXISTS idx_ai_tracking_task_type ON ai_model_tracking(task_type);
CREATE INDEX IF NOT EXISTS idx_ai_tracking_timestamp ON ai_model_tracking(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_tracking_session_id ON ai_model_tracking(session_id);

-- Commentaires pour documentation
COMMENT ON TABLE ai_model_tracking IS 'Table de tracking des modèles IA - DÉVELOPPEMENT UNIQUEMENT';
COMMENT ON COLUMN ai_model_tracking.responsible_estimation IS 'Modèle responsable de l''estimation (invisible à l''utilisateur)';
COMMENT ON COLUMN ai_model_tracking.responsible_generation IS 'Modèle responsable de la génération (invisible à l''utilisateur)';
COMMENT ON COLUMN ai_model_tracking.model_used IS 'Modèle actuellement utilisé (invisible à l''utilisateur)';
COMMENT ON COLUMN ai_model_tracking.task_type IS 'Type de tâche: estimation, generation, ou chat';
COMMENT ON COLUMN ai_model_tracking.execution_time_ms IS 'Temps d''exécution en millisecondes pour analyse performance';
