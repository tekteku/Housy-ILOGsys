require('dotenv').config();
const { Pool } = require('pg');

async function checkTunisianTypes() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔍 Checking Tunisian Construction Project Types...\n');
    
    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM project_categories');
    const totalCount = parseInt(countResult.rows[0].count);
    console.log(`📊 Total project categories: ${totalCount}\n`);
    
    // Get all categories
    const categoriesResult = await pool.query('SELECT * FROM project_categories');
    const categories = categoriesResult.rows;
    
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
        console.log(`✅ ${type} - Found (ID: ${found.id}, Price: ${found.base_price} DT/${found.unit})`);
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
    
    // Show additional statistics
    const projectTypeGroups = {};
    categories.forEach(cat => {
      const type = cat.project_type || 'unknown';
      if (!projectTypeGroups[type]) {
        projectTypeGroups[type] = 0;
      }
      projectTypeGroups[type]++;
    });
    
    console.log('\n📋 Categories by project type:');
    Object.entries(projectTypeGroups).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} categories`);
    });
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await pool.end();
  }
}

checkTunisianTypes();
