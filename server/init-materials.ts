import { storage } from './storage';

const materialsData = [
  // Gros œuvre
  {
    name: 'Béton C25/30',
    category: 'gros_oeuvre',
    unit: 'm³',
    price: 180.00,
    supplier: 'SOTACIB',
    availability: 'disponible',
    description: 'Béton structurel haute résistance'
  },
  {
    name: 'Ciment CEM II 42.5',
    category: 'gros_oeuvre',
    unit: 'sac 50kg',
    price: 28.50,
    supplier: 'Carthage Cement',
    availability: 'disponible',
    description: 'Ciment Portland composé'
  },
  {
    name: 'Acier à béton HA 10mm',
    category: 'gros_oeuvre',
    unit: 'kg',
    price: 2.45,
    supplier: 'El Fouladh',
    availability: 'disponible',
    description: 'Acier haute adhérence diamètre 10mm'
  },
  {
    name: 'Acier à béton HA 12mm',
    category: 'gros_oeuvre',
    unit: 'kg',
    price: 2.50,
    supplier: 'El Fouladh',
    availability: 'disponible',
    description: 'Acier haute adhérence diamètre 12mm'
  },
  {
    name: 'Brique creuse 20x20x40',
    category: 'gros_oeuvre',
    unit: 'unité',
    price: 1.20,
    supplier: 'SOMOCER',
    availability: 'disponible',
    description: 'Brique de construction creuse'
  },
  {
    name: 'Parpaing 20x20x40',
    category: 'gros_oeuvre',
    unit: 'unité',
    price: 2.80,
    supplier: 'Les Agglomérés de Bizerte',
    availability: 'disponible',
    description: 'Parpaing en béton pour murs porteurs'
  },

  // Second œuvre
  {
    name: 'Plâtre de construction',
    category: 'second_oeuvre',
    unit: 'sac 25kg',
    price: 12.50,
    supplier: 'Knauf Placo Tunisie',
    availability: 'disponible',
    description: 'Plâtre pour enduits intérieurs'
  },
  {
    name: 'Isolation thermique laine de roche',
    category: 'second_oeuvre',
    unit: 'm²',
    price: 18.00,
    supplier: 'ISOVER',
    availability: 'disponible',
    description: 'Panneau isolant 100mm'
  },
  {
    name: 'Tuyau PVC Ø110mm',
    category: 'second_oeuvre',
    unit: 'm',
    price: 15.20,
    supplier: 'NICOLL Tunisie',
    availability: 'disponible',
    description: 'Tuyau évacuation eaux usées'
  },
  {
    name: 'Câble électrique 2.5mm²',
    category: 'second_oeuvre',
    unit: 'm',
    price: 4.80,
    supplier: 'COTREL',
    availability: 'disponible',
    description: 'Câble cuivre pour prises électriques'
  },
  {
    name: 'Gaine ICTA Ø20mm',
    category: 'second_oeuvre',
    unit: 'm',
    price: 1.50,
    supplier: 'Legrand Tunisie',
    availability: 'disponible',
    description: 'Gaine électrique encastrable'
  },

  // Finitions
  {
    name: 'Carrelage sol 60x60 grès cérame',
    category: 'finition',
    unit: 'm²',
    price: 45.00,
    supplier: 'SOMOCER',
    availability: 'disponible',
    description: 'Carrelage imitation marbre'
  },
  {
    name: 'Faïence murale 25x40',
    category: 'finition',
    unit: 'm²',
    price: 28.50,
    supplier: 'SOMOCER',
    availability: 'disponible',
    description: 'Faïence pour salles de bains'
  },
  {
    name: 'Peinture acrylique intérieure',
    category: 'finition',
    unit: 'L',
    price: 35.00,
    supplier: 'Astral Paints',
    availability: 'disponible',
    description: 'Peinture lavable mat velours'
  },
  {
    name: 'Parquet stratifié 8mm',
    category: 'finition',
    unit: 'm²',
    price: 65.00,
    supplier: 'KRONOTEX',
    availability: 'disponible',
    description: 'Parquet stratifié décor chêne'
  },
  {
    name: 'Colle carrelage C2',
    category: 'finition',
    unit: 'sac 25kg',
    price: 22.00,
    supplier: 'MAPEI',
    availability: 'disponible',
    description: 'Colle flexible pour carrelage'
  },
  {
    name: 'Mortier joint',
    category: 'finition',
    unit: 'sac 5kg',
    price: 8.50,
    supplier: 'MAPEI',
    availability: 'disponible',
    description: 'Mortier joint pour carrelage'
  },
  {
    name: 'Sanitaire WC suspendu',
    category: 'finition',
    unit: 'unité',
    price: 280.00,
    supplier: 'IDEAL STANDARD',
    availability: 'disponible',
    description: 'WC suspendu avec mécanisme'
  },
  {
    name: 'Lavabo avec colonne',
    category: 'finition',
    unit: 'unité',
    price: 180.00,
    supplier: 'IDEAL STANDARD',
    availability: 'disponible',
    description: 'Lavabo céramique blanc'
  }
];

async function initializeMaterials() {
  console.log('🏗️ Initialisation de la base de données avec des matériaux...');
  
  try {
    // Vérifier si des matériaux existent déjà
    const existingMaterials = await storage.getMaterials();
    
    if (existingMaterials.length > 0) {
      console.log(`ℹ️  ${existingMaterials.length} matériaux déjà présents dans la base.`);
      console.log('✅ Vous pouvez tester l\'estimation maintenant !');
      return;
    }

    // Insérer les matériaux de test
    console.log('📦 Ajout des matériaux de test...');
    
    for (const material of materialsData) {
      try {
        await storage.createMaterial(material);
        console.log(`✅ Ajouté: ${material.name} - ${material.price} DT/${material.unit}`);
      } catch (error) {
        console.log(`⚠️  Erreur pour ${material.name}:`, error);
      }
    }

    console.log('');
    console.log('🎉 Base de données initialisée avec succès !');
    console.log('📊 Matériaux ajoutés par catégorie:');
    
    const grosOeuvre = materialsData.filter(m => m.category === 'gros_oeuvre').length;
    const secondOeuvre = materialsData.filter(m => m.category === 'second_oeuvre').length;
    const finitions = materialsData.filter(m => m.category === 'finition').length;
    
    console.log(`   • Gros œuvre: ${grosOeuvre} matériaux`);
    console.log(`   • Second œuvre: ${secondOeuvre} matériaux`);
    console.log(`   • Finitions: ${finitions} matériaux`);
    console.log('');
    console.log('🚀 Vous pouvez maintenant tester l\'estimation sur:');
    console.log('   http://localhost:3000/estimation');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  }
}

// Exporter la fonction et l'exécuter si appelée directement
export { initializeMaterials };

// Si le script est exécuté directement
initializeMaterials();
