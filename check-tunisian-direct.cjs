require('dotenv').config();
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { pgTable, text, serial, decimal, integer, jsonb, boolean, timestamp } = require('drizzle-orm/pg-core');

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

const sql = postgres(connectionString);
const db = drizzle(sql);

// Project categories table definition
const projectCategories = pgTable('project_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }),
  unit: text('unit'),
  complexity: text('complexity'),
  duration: integer('duration'),
  laborCost: decimal('labor_cost', { precision: 10, scale: 2 }),
  materials: jsonb('materials'),
  projectType: text('project_type'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

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
        console.log(`✅ ${type} - Found (ID: ${found.id}, Price: ${found.basePrice} DT/${found.unit})`);
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
    
    // Show some additional statistics
    const projectTypeGroups = {};
    categories.forEach(cat => {
      const type = cat.projectType || 'unknown';
      if (!projectTypeGroups[type]) {
        projectTypeGroups[type] = 0;
      }
      projectTypeGroups[type]++;
    });
    
    console.log('\n📋 Categories by project type:');
    Object.entries(projectTypeGroups).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} categories`);
    });
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking database:', error);
    await sql.end();
    process.exit(1);
  }
}

checkTunisianTypes();
