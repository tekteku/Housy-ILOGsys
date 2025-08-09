-- Migration: Additional Project Types
-- Generated on: 2025-05-28
-- Description: Adding the new project types requested by the user

-- Add new project categories
INSERT INTO "project_categories" ("name", "description", "base_price", "unit", "complexity", "duration", "labor_cost", "materials") VALUES
('Construction neuve', 'Construction complète de bâtiment neuf', 750.00, 'm²', 'complex', 150, 180.00, '{"concrete": 160, "steel": 90, "brick": 40, "insulation": 30, "roofing": 50}'),
('Rénovation complète', 'Rénovation complète avec restructuration', 520.00, 'm²', 'complex', 90, 140.00, '{"demolition": 20, "concrete": 80, "ceramic": 35, "electrical": 50, "plumbing": 45}'),
('Rénovation partielle', 'Rénovation partielle de certaines zones', 280.00, 'm²', 'medium', 35, 90.00, '{"paint": 25, "ceramic": 30, "electrical": 20, "plumbing": 25}'),
('Extension / agrandissement', 'Agrandissement et extension de bâtiment existant', 680.00, 'm²', 'complex', 75, 160.00, '{"concrete": 120, "steel": 70, "brick": 35, "roofing": 55}'),
('Achat clé en main', 'Projet clé en main complet avec finitions', 850.00, 'm²', 'complex', 180, 220.00, '{"concrete": 180, "steel": 100, "ceramic": 45, "paint": 20, "fixtures": 80}'),
('Aménagement intérieur/extérieur', 'Aménagement complet intérieur et extérieur', 320.00, 'm²', 'medium', 50, 110.00, '{"flooring": 50, "paint": 20, "lighting": 30, "landscaping": 40}'),
('Transformation de bâtiment', 'Transformation et changement d''usage de bâtiment', 600.00, 'm²', 'complex', 120, 170.00, '{"demolition": 30, "concrete": 100, "steel": 60, "insulation": 40}'),
('Réhabilitation énergétique', 'Réhabilitation pour amélioration énergétique', 380.00, 'm²', 'medium', 60, 100.00, '{"insulation": 80, "windows": 60, "hvac": 70, "electrical": 40}'),
('Achat/vente d''immeuble/appartement', 'Service d''achat/vente immobilière avec accompagnement', 50.00, 'unité', 'simple', 45, 30.00, '{"legal": 20, "inspection": 15, "documentation": 10}')
ON CONFLICT (name) DO NOTHING;

-- Update system settings to include new notification preferences
INSERT INTO "system_settings" ("category", "setting_key", "setting_name", "description", "data_type", "value", "default_value") VALUES
('ui', 'dark_mode_enabled', 'Mode sombre activé', 'Activer le mode sombre par défaut', 'boolean', 'false', 'false'),
('ui', 'default_language', 'Langue par défaut', 'Langue par défaut de l''interface', 'string', 'fr', 'fr'),
('ui', 'items_per_page', 'Éléments par page', 'Nombre d''éléments par page dans les listes', 'number', '10', '10'),
('files', 'max_file_size', 'Taille maximale de fichier', 'Taille maximale de fichier en MB', 'number', '50', '50'),
('files', 'allowed_extensions', 'Extensions autorisées', 'Extensions de fichiers autorisées', 'string', 'pdf,doc,docx,jpg,jpeg,png,dwg,xlsx', 'pdf,doc,docx,jpg,jpeg,png,dwg,xlsx'),
('notifications', 'progress_notifications', 'Notifications de progression', 'Activer les notifications de progression de projet', 'boolean', 'true', 'true'),
('dashboard', 'refresh_interval', 'Intervalle de rafraîchissement', 'Intervalle de rafraîchissement du dashboard en secondes', 'number', '300', '300')
ON CONFLICT (setting_key) DO NOTHING;
