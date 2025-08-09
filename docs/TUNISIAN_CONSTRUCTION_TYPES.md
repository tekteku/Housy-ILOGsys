# Tunisian Construction Project Types Integration

## Overview

This document outlines the integration of comprehensive Tunisian construction and real estate project types into the Housy Tunisia application. The integration includes 28 specific project categories tailored to the Tunisian construction market.

## Project Categories

### 1. Construction Neuve (New Construction) - 7 Types
- **Maison individuelle - Villa**: Individual villa construction with standard finishes (800€/m²)
- **Maison individuelle - Étage villa**: Villa floor construction with stairs and amenities (750€/m²)
- **Immeuble résidentiel collectif**: Multi-apartment residential building construction (650€/m²)
- **Maison jumelée**: Semi-detached or adjoining house construction (700€/m²)
- **Bâtiment commercial**: Commercial buildings, shops, offices (550€/m²)
- **Bâtiment industriel**: Industrial buildings, warehouses, workshops (350€/m²)
- **Résidence de vacances**: Holiday homes and bungalows (600€/m²)

### 2. Rénovation / Amélioration (Renovation / Improvement) - 6 Types
- **Rénovation complète**: Complete renovation with restructuring (450€/m²)
- **Rénovation partielle**: Partial renovation (kitchens, bathrooms, specific rooms) (300€/m²)
- **Rafraîchissement**: Refreshing with paint, coverings, and carpentry (150€/m²)
- **Remise aux normes**: Bringing up to standards (electricity, plumbing, insulation) (200€/m²)
- **Modernisation**: Modernization with style changes and home automation (350€/m²)
- **Restauration patrimoine**: Restoration of traditional houses, dar, and medina (500€/m²)

### 3. Extension / Agrandissement (Extension / Expansion) - 4 Types
- **Surélévation**: Adding a floor with structural reinforcement (650€/m²)
- **Extension latérale**: Adding rooms to the side of existing construction (550€/m²)
- **Aménagement combles**: Attic conversion to living space (400€/m²)
- **Véranda et terrasse**: Veranda, covered terrace, and garage construction (300€/m²)

### 4. Achat Clé en Main / Acquisition (Turnkey Purchase) - 3 Types
- **Maison neuve clé en main**: New turnkey house purchase (900€/m²)
- **Appartement neuf**: New or old apartment purchase with possible renovation (700€/m²)
- **Immeuble complet**: Complete building purchase for investment (600€/m²)

### 5. Aménagement Intérieur / Extérieur (Interior / Exterior Design) - 3 Types
- **Aménagement jardin piscine**: Garden landscaping, pool, and terrace construction (150€/m²)
- **Construction clôtures portails**: Fences, gates, and garages construction (200€/m linear)
- **Aménagement sous-sol grenier**: Basement, attic, and non-habitable spaces (250€/m²)

### 6. Transformation/Fusion (Transformation/Merger) - 2 Types
- **Transformation local commercial**: Commercial to residential conversion (400€/m²)
- **Division fusion appartements**: Apartment division or fusion with partition modifications (300€/m²)

### 7. Réhabilitation Énergétique (Energy Rehabilitation) - 3 Types
- **Isolation thermique**: Thermal insulation and energy-efficient windows (180€/m²)
- **Panneaux solaires**: Solar panels and renewable energy systems (250€/m²)
- **Amélioration énergétique**: Comprehensive energy efficiency improvements (220€/m²)

## Tunisian-Specific Features

### Climate Considerations
- **Hot Summers**: Protection from extreme heat
- **Mild Winters**: Appropriate insulation needs
- **Coastal Humidity**: Salt protection and humidity control
- **Desert Winds**: Sand protection and thermal insulation

### Local Regulations
- **Building Permits**: Standard construction permits
- **Environmental Compliance**: Environmental regulations compliance
- **Heritage Restrictions**: Traditional and cultural preservation requirements
- **Commercial/Industrial Permits**: Specific permits for different building types

### Traditional Materials
- **Local Stone**: Traditional Tunisian stone materials
- **Ceramic Tiles**: Traditional ceramic and zellige tiles
- **Traditional Lime Mortar**: Heritage-appropriate mortar
- **Reinforced Concrete**: Modern construction materials
- **Modern Finishes**: Contemporary finishing materials

## Database Schema Updates

### New Fields Added to `project_categories` Table:
1. **`project_type`** (TEXT): Categories projects by type
   - `construction_neuve`
   - `renovation`
   - `extension`
   - `achat_cle_en_main`
   - `amenagement`
   - `transformation`
   - `rehabilitation_energetique`

2. **`tunisian_specifics`** (JSONB): Stores Tunisian-specific information
   ```json
   {
     "climate_considerations": ["hot_summers", "mild_winters", "coastal_humidity"],
     "local_regulations": ["building_permits", "environmental_compliance"],
     "traditional_materials": ["local_stone", "ceramic_tiles", "traditional_lime_mortar"],
     "regional_factors": {"salt_protection": true, "humidity_control": true}
   }
   ```

3. **Enhanced `unit` field** to support:
   - `m²` (square meters)
   - `m lineaire` (linear meters)
   - `forfait` (fixed price)

## Pricing Structure

All prices are in Euros (€) and represent base prices per unit:
- **Low Complexity**: 150€-350€/m²
- **Medium Complexity**: 300€-800€/m²
- **High Complexity**: 450€-900€/m²

Duration estimates range from 1 day (turnkey purchases) to 180 days (complex construction projects).

## Material Breakdown

Each project category includes material breakdown percentages:
- **Gros Œuvre** (Structural work): 20-60%
- **Second Œuvre** (Secondary work): 20-40%
- **Finitions** (Finishes): 10-45%
- **Specialized categories**: Demolition, installation, equipment, etc.

## Implementation

### Migration Files
1. **`0003_tunisian_construction_types.sql`**: Inserts all 28 project categories
2. **`0004_add_tunisian_project_fields.sql`**: Adds new schema fields and updates existing records
3. **`tunisian-construction-types-migration.sql`**: Complete migration script for manual execution

### Verification
- **`verify-tunisian-types.js`**: Script to verify successful integration
- Provides statistics on project types distribution
- Shows sample projects with their specifications

## Usage in Application

The integrated project types can be used for:
1. **Project Planning**: Select appropriate project type for accurate estimation
2. **Cost Calculation**: Automatic pricing based on Tunisian market rates
3. **Material Planning**: Pre-defined material breakdowns for each project type
4. **Regulatory Compliance**: Built-in awareness of local regulations
5. **Climate Adaptation**: Automatic consideration of Tunisian climate factors

## Next Steps

1. Run the migration script in your database
2. Update frontend components to utilize new project types
3. Implement filtering and search by project type
4. Add region-specific pricing adjustments
5. Integrate with material database for accurate cost calculations

## Support

For questions or issues with the Tunisian construction types integration, refer to the migration files and verification scripts provided.
