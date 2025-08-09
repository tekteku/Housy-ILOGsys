-- Run this script manually in your database client to add Tunisian construction project types
-- Migration: Add Tunisian Construction Project Types
-- Created: 2025-06-04

-- First, let's add the new columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_categories' AND column_name = 'project_type') THEN
        ALTER TABLE project_categories ADD COLUMN project_type TEXT DEFAULT 'construction_neuve';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_categories' AND column_name = 'tunisian_specifics') THEN
        ALTER TABLE project_categories ADD COLUMN tunisian_specifics JSONB;
    END IF;
END $$;

-- Insert main construction project categories for Tunisia
INSERT INTO project_categories (name, description, base_price, unit, complexity, duration, materials, labor_cost, project_type, tunisian_specifics, is_active) VALUES

-- 1. Construction neuve (New Construction)
('Maison individuelle - Villa', 'Construction d''une maison individuelle de style villa avec finitions standard', 800.00, 'm²', 'medium', 120, '{"gros_oeuvre": 40, "second_oeuvre": 35, "finitions": 25}', 250.00, 'construction_neuve', '{"climate_considerations": ["hot_summers", "mild_winters"], "local_regulations": ["building_permits"], "traditional_materials": ["local_stone", "ceramic_tiles"]}', true),
('Maison individuelle - Étage villa', 'Construction d''un étage de villa avec escalier et aménagements', 750.00, 'm²', 'medium', 90, '{"gros_oeuvre": 45, "second_oeuvre": 35, "finitions": 20}', 230.00, 'construction_neuve', '{"climate_considerations": ["hot_summers", "mild_winters"], "local_regulations": ["building_permits"], "traditional_materials": ["local_stone", "ceramic_tiles"]}', true),
('Immeuble résidentiel collectif', 'Construction d''immeuble collectif avec appartements multiples', 650.00, 'm²', 'high', 180, '{"gros_oeuvre": 50, "second_oeuvre": 30, "finitions": 20}', 200.00, 'construction_neuve', '{"climate_considerations": ["hot_summers", "coastal_humidity"], "local_regulations": ["building_permits", "environmental_compliance"], "traditional_materials": ["reinforced_concrete", "ceramic_tiles"]}', true),
('Maison jumelée', 'Construction de maison jumelée ou mitoyenne', 700.00, 'm²', 'medium', 100, '{"gros_oeuvre": 42, "second_oeuvre": 33, "finitions": 25}', 220.00, 'construction_neuve', '{"climate_considerations": ["hot_summers", "mild_winters"], "local_regulations": ["building_permits"], "traditional_materials": ["local_stone", "ceramic_tiles"]}', true),
('Bâtiment commercial', 'Construction de boutiques, bureaux et espaces commerciaux', 550.00, 'm²', 'medium', 90, '{"gros_oeuvre": 45, "second_oeuvre": 40, "finitions": 15}', 180.00, 'construction_neuve', '{"climate_considerations": ["hot_summers", "air_conditioning_needs"], "local_regulations": ["commercial_permits"], "traditional_materials": ["modern_facades", "ceramic_tiles"]}', true),
('Bâtiment industriel', 'Construction d''entrepôts, ateliers et bâtiments industriels', 350.00, 'm²', 'low', 60, '{"gros_oeuvre": 60, "second_oeuvre": 30, "finitions": 10}', 120.00, 'construction_neuve', '{"climate_considerations": ["industrial_ventilation", "desert_winds"], "local_regulations": ["industrial_permits"], "traditional_materials": ["steel_structure", "industrial_concrete"]}', true),
('Résidence de vacances', 'Construction de maisons secondaires et bungalows', 600.00, 'm²', 'medium', 80, '{"gros_oeuvre": 40, "second_oeuvre": 35, "finitions": 25}', 200.00, 'construction_neuve', '{"climate_considerations": ["coastal_humidity", "salt_protection"], "local_regulations": ["tourism_permits"], "traditional_materials": ["local_stone", "traditional_lime_mortar"]}', true),

-- 2. Rénovation / Amélioration (Renovation / Improvement)
('Rénovation complète', 'Rénovation complète d''une maison ancienne avec restructuration', 450.00, 'm²', 'high', 90, '{"demolition": 10, "gros_oeuvre": 30, "second_oeuvre": 35, "finitions": 25}', 180.00, 'renovation', '{"climate_considerations": ["preservation_needs"], "local_regulations": ["heritage_restrictions"], "traditional_materials": ["traditional_lime_mortar", "local_stone"]}', true),
('Rénovation partielle', 'Rénovation partielle (cuisine, salle de bains, pièces spécifiques)', 300.00, 'm²', 'medium', 45, '{"gros_oeuvre": 20, "second_oeuvre": 40, "finitions": 40}', 120.00, 'renovation', '{"climate_considerations": ["humidity_control"], "local_regulations": ["building_permits"], "traditional_materials": ["ceramic_tiles", "local_materials"]}', true),
('Rafraîchissement', 'Rafraîchissement avec peinture, revêtements et menuiserie', 150.00, 'm²', 'low', 30, '{"peinture": 40, "revetements": 35, "menuiserie": 25}', 80.00, 'renovation', '{"climate_considerations": ["sun_protection"], "local_regulations": ["minimal_permits"], "traditional_materials": ["local_paint", "ceramic_tiles"]}', true),
('Remise aux normes', 'Remise aux normes électricité, plomberie et isolation', 200.00, 'm²', 'medium', 40, '{"electricite": 35, "plomberie": 30, "isolation": 35}', 100.00, 'renovation', '{"climate_considerations": ["thermal_insulation"], "local_regulations": ["electrical_standards"], "traditional_materials": ["local_insulation"]}', true),
('Modernisation', 'Modernisation avec changement de style et domotique', 350.00, 'm²', 'medium', 60, '{"decoration": 30, "domotique": 25, "amenagements": 45}', 140.00, 'renovation', '{"climate_considerations": ["smart_climate_control"], "local_regulations": ["modern_standards"], "traditional_materials": ["modern_finishes"]}', true),
('Restauration patrimoine', 'Restauration de maisons traditionnelles, dar et médina', 500.00, 'm²', 'high', 120, '{"materiaux_traditionnels": 40, "artisanat": 35, "conservation": 25}', 200.00, 'renovation', '{"climate_considerations": ["heritage_preservation"], "local_regulations": ["heritage_restrictions", "cultural_preservation"], "traditional_materials": ["traditional_lime_mortar", "local_stone", "zellige_tiles"]}', true),

-- 3. Extension / Agrandissement (Extension / Expansion)
('Surélévation', 'Ajout d''un étage avec renforcement de structure', 650.00, 'm²', 'high', 80, '{"renforcement": 20, "gros_oeuvre": 45, "second_oeuvre": 35}', 220.00, 'extension', '{"climate_considerations": ["structural_reinforcement"], "local_regulations": ["structural_permits"], "traditional_materials": ["reinforced_concrete", "local_stone"]}', true),
('Extension latérale', 'Ajout de pièces sur le côté de la construction existante', 550.00, 'm²', 'medium', 60, '{"fondations": 25, "gros_oeuvre": 40, "second_oeuvre": 35}', 200.00, 'extension', '{"climate_considerations": ["foundation_stability"], "local_regulations": ["extension_permits"], "traditional_materials": ["local_stone", "ceramic_tiles"]}', true),
('Aménagement combles', 'Aménagement et transformation de combles en espace habitable', 400.00, 'm²', 'medium', 45, '{"isolation": 30, "cloisons": 25, "finitions": 45}', 150.00, 'extension', '{"climate_considerations": ["thermal_insulation", "ventilation"], "local_regulations": ["habitation_permits"], "traditional_materials": ["local_insulation", "wood_structure"]}', true),
('Véranda et terrasse', 'Construction de véranda, terrasse couverte et garage', 300.00, 'm²', 'low', 30, '{"structure": 40, "couverture": 35, "finitions": 25}', 120.00, 'extension', '{"climate_considerations": ["sun_protection", "rain_protection"], "local_regulations": ["simple_permits"], "traditional_materials": ["local_materials", "traditional_tiles"]}', true),

-- 4. Achat clé en main / Acquisition (Turnkey Purchase)
('Maison neuve clé en main', 'Achat de maison neuve déjà construite avec finitions complètes', 900.00, 'm²', 'medium', 1, '{"tout_inclus": 100}', 0.00, 'achat_cle_en_main', '{"climate_considerations": ["ready_to_move"], "local_regulations": ["purchase_permits"], "traditional_materials": ["all_included"]}', true),
('Appartement neuf', 'Achat d''appartement neuf ou ancien avec éventuelle rénovation', 700.00, 'm²', 'low', 1, '{"tout_inclus": 100}', 0.00, 'achat_cle_en_main', '{"climate_considerations": ["apartment_ready"], "local_regulations": ["apartment_permits"], "traditional_materials": ["all_included"]}', true),
('Immeuble complet', 'Achat d''immeuble complet à usage d''investissement', 600.00, 'm²', 'low', 1, '{"tout_inclus": 100}', 0.00, 'achat_cle_en_main', '{"climate_considerations": ["investment_ready"], "local_regulations": ["commercial_permits"], "traditional_materials": ["all_included"]}', true),

-- 5. Aménagement intérieur / extérieur (Interior / Exterior Design)
('Aménagement jardin piscine', 'Aménagement de jardin, construction de piscine et terrasse', 150.00, 'm²', 'medium', 45, '{"terrassement": 30, "piscine": 40, "amenagement": 30}', 80.00, 'amenagement', '{"climate_considerations": ["water_management", "sun_exposure"], "local_regulations": ["pool_permits"], "traditional_materials": ["local_stone", "pool_tiles"]}', true),
('Construction clôtures portails', 'Construction de clôtures, portails et garages', 200.00, 'm lineaire', 'low', 20, '{"maconnerie": 50, "metallerie": 30, "finitions": 20}', 70.00, 'amenagement', '{"climate_considerations": ["weather_resistance"], "local_regulations": ["boundary_permits"], "traditional_materials": ["local_stone", "traditional_metalwork"]}', true),
('Aménagement sous-sol grenier', 'Aménagement de sous-sol, grenier et espaces non habitables', 250.00, 'm²', 'medium', 40, '{"isolation": 35, "cloisons": 30, "finitions": 35}', 100.00, 'amenagement', '{"climate_considerations": ["humidity_control", "ventilation"], "local_regulations": ["conversion_permits"], "traditional_materials": ["local_insulation", "traditional_finishes"]}', true),

-- 6. Transformation/Fusion (Transformation/Merger)
('Transformation local commercial', 'Transformation d''un local commercial en habitation', 400.00, 'm²', 'high', 80, '{"restructuration": 40, "amenagements": 35, "finitions": 25}', 160.00, 'transformation', '{"climate_considerations": ["residential_adaptation"], "local_regulations": ["change_of_use_permits"], "traditional_materials": ["residential_materials"]}', true),
('Division fusion appartements', 'Division ou fusion d''appartements avec modification de cloisons', 300.00, 'm²', 'medium', 50, '{"demolition": 25, "cloisons": 40, "finitions": 35}', 120.00, 'transformation', '{"climate_considerations": ["space_optimization"], "local_regulations": ["apartment_modification_permits"], "traditional_materials": ["modern_partitions"]}', true),

-- 7. Réhabilitation énergétique (Energy Rehabilitation)
('Isolation thermique', 'Isolation thermique et changement de fenêtres pour efficacité énergétique', 180.00, 'm²', 'medium', 35, '{"isolation": 60, "fenetres": 30, "etancheite": 10}', 90.00, 'rehabilitation_energetique', '{"climate_considerations": ["thermal_efficiency", "energy_savings"], "local_regulations": ["energy_standards"], "traditional_materials": ["modern_insulation", "efficient_windows"]}', true),
('Panneaux solaires', 'Installation de panneaux solaires et système d''énergie renouvelable', 250.00, 'm²', 'medium', 20, '{"panneaux": 70, "installation": 20, "raccordement": 10}', 80.00, 'rehabilitation_energetique', '{"climate_considerations": ["solar_exposure", "energy_independence"], "local_regulations": ["solar_permits"], "traditional_materials": ["solar_panels", "modern_wiring"]}', true),
('Amélioration énergétique', 'Amélioration globale de l''efficacité énergétique du bâtiment', 220.00, 'm²', 'medium', 40, '{"isolation": 40, "chauffage": 30, "ventilation": 30}', 100.00, 'rehabilitation_energetique', '{"climate_considerations": ["comprehensive_efficiency"], "local_regulations": ["energy_compliance"], "traditional_materials": ["efficient_systems"]}', true)

ON CONFLICT (name) DO NOTHING;

-- Update existing records with project types if they don't have them
UPDATE project_categories 
SET project_type = CASE 
  WHEN LOWER(name) LIKE '%renovation%' OR LOWER(name) LIKE '%refurbishment%' THEN 'renovation'
  WHEN LOWER(name) LIKE '%extension%' OR LOWER(name) LIKE '%addition%' THEN 'extension'
  WHEN LOWER(name) LIKE '%residential%' OR LOWER(name) LIKE '%house%' OR LOWER(name) LIKE '%villa%' THEN 'construction_neuve'
  WHEN LOWER(name) LIKE '%commercial%' OR LOWER(name) LIKE '%office%' THEN 'construction_neuve'
  ELSE 'construction_neuve'
END
WHERE project_type IS NULL;

-- Add default Tunisian specifics for existing records without them
UPDATE project_categories 
SET tunisian_specifics = '{"climate_considerations": ["hot_summers", "mild_winters"], "local_regulations": ["building_permits"], "traditional_materials": ["local_stone", "ceramic_tiles"]}'
WHERE tunisian_specifics IS NULL;

-- Display summary
SELECT 
  project_type,
  COUNT(*) as count,
  AVG(base_price::numeric) as avg_price
FROM project_categories 
WHERE is_active = true 
GROUP BY project_type 
ORDER BY project_type;
