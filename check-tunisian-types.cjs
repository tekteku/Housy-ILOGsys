const { db, projectCategories } = require('./server/storage');

async function checkTunisianTypes() {
  try {
    console.log('🔍 Checking Tunisian Construction Project Types...\n');
    
    const categories = await db.select().from(projectCategories);
    console.log(`📊 Total project categories: ${categories.length}\n`);
    
    const tunisianTypes = [
      'Construction neuve',
      'Rénovation complète', 
      'Rénovation partielle',
      'Extension / agrandissement',
      'Achat clé en main',
      'Aménagement intérieur/extérieur',
      'Transformation de bâtiment',
      'Réhabilitation énergétique',
      'Achat/vente d\'immeuble/appartement'
    ];
    
    console.log('🏗️ Checking for Tunisian Construction Types:');
    let foundCount = 0;
    
    tunisianTypes.forEach(type => {
      const found = categories.find(cat => cat.name === type);
      if (found) {
        console.log(`✅ ${type} - Found (ID: ${found.id})`);
        foundCount++;
      } else {
        console.log(`❌ ${type} - NOT FOUND`);
      }
    });
    
    console.log(`\n📈 Summary: ${foundCount}/${tunisianTypes.length} Tunisian types found`);
    
    if (foundCount === tunisianTypes.length) {
      console.log('🎉 All Tunisian construction project types are properly configured!');
    } else {
      console.log('⚠️  Some Tunisian construction project types are missing.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  }
}

checkTunisianTypes();
