-- Migration: Add project_type and tunisian_specifics to project_categories
-- Created: 2025-06-04

-- Add new columns to project_categories table
ALTER TABLE project_categories 
ADD COLUMN project_type TEXT DEFAULT 'construction_neuve',
ADD COLUMN tunisian_specifics JSONB;

-- Update existing records with default values and appropriate project types
UPDATE project_categories 
SET project_type = CASE 
  WHEN LOWER(name) LIKE '%renovation%' OR LOWER(name) LIKE '%refurbishment%' THEN 'renovation'
  WHEN LOWER(name) LIKE '%extension%' OR LOWER(name) LIKE '%addition%' THEN 'extension'
  WHEN LOWER(name) LIKE '%residential%' OR LOWER(name) LIKE '%house%' OR LOWER(name) LIKE '%villa%' THEN 'construction_neuve'
  WHEN LOWER(name) LIKE '%commercial%' OR LOWER(name) LIKE '%office%' THEN 'construction_neuve'
  ELSE 'construction_neuve'
END;

-- Add Tunisian-specific considerations for existing records
UPDATE project_categories 
SET tunisian_specifics = jsonb_build_object(
  'climate_considerations', ARRAY['hot_summers', 'mild_winters', 'coastal_humidity', 'desert_winds'],
  'local_regulations', ARRAY['building_permits', 'environmental_compliance', 'heritage_restrictions'],
  'traditional_materials', ARRAY['local_stone', 'ceramic_tiles', 'traditional_lime_mortar'],
  'regional_factors', CASE 
    WHEN LOWER(name) LIKE '%coastal%' THEN jsonb_build_object('salt_protection', true, 'humidity_control', true)
    WHEN LOWER(name) LIKE '%desert%' THEN jsonb_build_object('sand_protection', true, 'thermal_insulation', true)
    ELSE jsonb_build_object('standard_protection', true)
  END
);

-- Update unit field to support Tunisian construction measurements
UPDATE project_categories 
SET unit = CASE 
  WHEN LOWER(name) LIKE '%fence%' OR LOWER(name) LIKE '%wall%' OR LOWER(name) LIKE '%boundary%' THEN 'm lineaire'
  WHEN LOWER(name) LIKE '%installation%' OR LOWER(name) LIKE '%setup%' THEN 'forfait'
  ELSE 'm²'
END;

-- Add comments for better documentation
COMMENT ON COLUMN project_categories.project_type IS 'Type de projet: construction_neuve, renovation, extension, achat_cle_en_main, amenagement, transformation, rehabilitation_energetique';
COMMENT ON COLUMN project_categories.tunisian_specifics IS 'Spécificités tunisiennes: climat, réglementations locales, matériaux traditionnels';
COMMENT ON COLUMN project_categories.unit IS 'Unité de mesure: m² (mètre carré), m lineaire (mètre linéaire), forfait (prix fixe)';
COMMENT ON COLUMN project_categories.complexity IS 'Complexité: low (faible), medium (moyenne), high (élevée)';
