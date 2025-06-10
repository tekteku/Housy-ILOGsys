-- Migration: Add Tunisian Construction Project Types
-- Created: 2025-06-04

-- Insert main construction project categories for Tunisia
INSERT INTO project_categories (name, description, base_price, unit, complexity, duration, materials, labor_cost, is_active) VALUES

-- 1. Construction neuve (New Construction)
('Maison individuelle - Villa', 'Construction d''une maison individuelle de style villa avec finitions standard', 800.00, 'm²', 'medium', 120, '{"gros_oeuvre": 40, "second_oeuvre": 35, "finitions": 25}', 250.00, true),
('Maison individuelle - Étage villa', 'Construction d''un étage de villa avec escalier et aménagements', 750.00, 'm²', 'medium', 90, '{"gros_oeuvre": 45, "second_oeuvre": 35, "finitions": 20}', 230.00, true),
('Immeuble résidentiel collectif', 'Construction d''immeuble collectif avec appartements multiples', 650.00, 'm²', 'high', 180, '{"gros_oeuvre": 50, "second_oeuvre": 30, "finitions": 20}', 200.00, true),
('Maison jumelée', 'Construction de maison jumelée ou mitoyenne', 700.00, 'm²', 'medium', 100, '{"gros_oeuvre": 42, "second_oeuvre": 33, "finitions": 25}', 220.00, true),
('Bâtiment commercial', 'Construction de boutiques, bureaux et espaces commerciaux', 550.00, 'm²', 'medium', 90, '{"gros_oeuvre": 45, "second_oeuvre": 40, "finitions": 15}', 180.00, true),
('Bâtiment industriel', 'Construction d''entrepôts, ateliers et bâtiments industriels', 350.00, 'm²', 'low', 60, '{"gros_oeuvre": 60, "second_oeuvre": 30, "finitions": 10}', 120.00, true),
('Résidence de vacances', 'Construction de maisons secondaires et bungalows', 600.00, 'm²', 'medium', 80, '{"gros_oeuvre": 40, "second_oeuvre": 35, "finitions": 25}', 200.00, true),

-- 2. Rénovation / Amélioration (Renovation / Improvement)
('Rénovation complète', 'Rénovation complète d''une maison ancienne avec restructuration', 450.00, 'm²', 'high', 90, '{"demolition": 10, "gros_oeuvre": 30, "second_oeuvre": 35, "finitions": 25}', 180.00, true),
('Rénovation partielle', 'Rénovation partielle (cuisine, salle de bains, pièces spécifiques)', 300.00, 'm²', 'medium', 45, '{"gros_oeuvre": 20, "second_oeuvre": 40, "finitions": 40}', 120.00, true),
('Rafraîchissement', 'Rafraîchissement avec peinture, revêtements et menuiserie', 150.00, 'm²', 'low', 30, '{"peinture": 40, "revetements": 35, "menuiserie": 25}', 80.00, true),
('Remise aux normes', 'Remise aux normes électricité, plomberie et isolation', 200.00, 'm²', 'medium', 40, '{"electricite": 35, "plomberie": 30, "isolation": 35}', 100.00, true),
('Modernisation', 'Modernisation avec changement de style et domotique', 350.00, 'm²', 'medium', 60, '{"decoration": 30, "domotique": 25, "amenagements": 45}', 140.00, true),
('Restauration patrimoine', 'Restauration de maisons traditionnelles, dar et médina', 500.00, 'm²', 'high', 120, '{"materiaux_traditionnels": 40, "artisanat": 35, "conservation": 25}', 200.00, true),

-- 3. Extension / Agrandissement (Extension / Expansion)
('Surélévation', 'Ajout d''un étage avec renforcement de structure', 650.00, 'm²', 'high', 80, '{"renforcement": 20, "gros_oeuvre": 45, "second_oeuvre": 35}', 220.00, true),
('Extension latérale', 'Ajout de pièces sur le côté de la construction existante', 550.00, 'm²', 'medium', 60, '{"fondations": 25, "gros_oeuvre": 40, "second_oeuvre": 35}', 200.00, true),
('Aménagement combles', 'Aménagement et transformation de combles en espace habitable', 400.00, 'm²', 'medium', 45, '{"isolation": 30, "cloisons": 25, "finitions": 45}', 150.00, true),
('Véranda et terrasse', 'Construction de véranda, terrasse couverte et garage', 300.00, 'm²', 'low', 30, '{"structure": 40, "couverture": 35, "finitions": 25}', 120.00, true),

-- 4. Achat clé en main / Acquisition (Turnkey Purchase)
('Maison neuve clé en main', 'Achat de maison neuve déjà construite avec finitions complètes', 900.00, 'm²', 'medium', 1, '{"tout_inclus": 100}', 0.00, true),
('Appartement neuf', 'Achat d''appartement neuf ou ancien avec éventuelle rénovation', 700.00, 'm²', 'low', 1, '{"tout_inclus": 100}', 0.00, true),
('Immeuble complet', 'Achat d''immeuble complet à usage d''investissement', 600.00, 'm²', 'low', 1, '{"tout_inclus": 100}', 0.00, true),

-- 5. Aménagement intérieur / extérieur (Interior / Exterior Design)
('Aménagement jardin piscine', 'Aménagement de jardin, construction de piscine et terrasse', 150.00, 'm²', 'medium', 45, '{"terrassement": 30, "piscine": 40, "amenagement": 30}', 80.00, true),
('Construction clôtures portails', 'Construction de clôtures, portails et garages', 200.00, 'm lineaire', 'low', 20, '{"maconnerie": 50, "metallerie": 30, "finitions": 20}', 70.00, true),
('Aménagement sous-sol grenier', 'Aménagement de sous-sol, grenier et espaces non habitables', 250.00, 'm²', 'medium', 40, '{"isolation": 35, "cloisons": 30, "finitions": 35}', 100.00, true),

-- 6. Transformation/Fusion (Transformation/Merger)
('Transformation local commercial', 'Transformation d''un local commercial en habitation', 400.00, 'm²', 'high', 80, '{"restructuration": 40, "amenagements": 35, "finitions": 25}', 160.00, true),
('Division fusion appartements', 'Division ou fusion d''appartements avec modification de cloisons', 300.00, 'm²', 'medium', 50, '{"demolition": 25, "cloisons": 40, "finitions": 35}', 120.00, true),

-- 7. Réhabilitation énergétique (Energy Rehabilitation)
('Isolation thermique', 'Isolation thermique et changement de fenêtres pour efficacité énergétique', 180.00, 'm²', 'medium', 35, '{"isolation": 60, "fenetres": 30, "etancheite": 10}', 90.00, true),
('Panneaux solaires', 'Installation de panneaux solaires et système d''énergie renouvelable', 250.00, 'm²', 'medium', 20, '{"panneaux": 70, "installation": 20, "raccordement": 10}', 80.00, true),
('Amélioration énergétique', 'Amélioration globale de l''efficacité énergétique du bâtiment', 220.00, 'm²', 'medium', 40, '{"isolation": 40, "chauffage": 30, "ventilation": 30}', 100.00, true);

-- Update existing project categories if they exist (optional)
-- This ensures compatibility with existing data
UPDATE project_categories SET 
  description = 'Construction de maison individuelle standard en Tunisie',
  materials = '{"gros_oeuvre": 40, "second_oeuvre": 35, "finitions": 25}',
  is_active = true
WHERE name = 'Residential' AND description IS NULL;

UPDATE project_categories SET 
  description = 'Construction de bâtiments commerciaux et bureaux',
  materials = '{"gros_oeuvre": 45, "second_oeuvre": 40, "finitions": 15}',
  is_active = true
WHERE name = 'Commercial' AND description IS NULL;
