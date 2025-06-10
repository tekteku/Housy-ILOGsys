import { db } from './server/db.js';
import { projectCategories } from './shared/schema.js';
import { sql } from 'drizzle-orm';

async function verifyTunisianProjectTypes() {
  try {
    console.log('🔍 Verifying Tunisian Construction Project Types...\n');
    
    // Count total project categories
    const totalCount = await db.select({ count: sql`count(*)` }).from(projectCategories);
    console.log(`📊 Total Project Categories: ${totalCount[0].count}`);
    
    // Count by project type
    const typeCount = await db.select({
      projectType: projectCategories.projectType,
      count: sql`count(*)`
    }).from(projectCategories)
      .where(sql`${projectCategories.isActive} = true`)
      .groupBy(projectCategories.projectType)
      .orderBy(projectCategories.projectType);
    
    console.log('\n📋 Project Types Distribution:');
    typeCount.forEach(row => {
      console.log(`  • ${row.projectType || 'undefined'}: ${row.count} projects`);
    });
    
    // Show sample Tunisian projects
    const sampleProjects = await db.select({
      name: projectCategories.name,
      projectType: projectCategories.projectType,
      basePrice: projectCategories.basePrice,
      complexity: projectCategories.complexity,
      duration: projectCategories.duration,
      unit: projectCategories.unit
    }).from(projectCategories)
      .where(sql`${projectCategories.isActive} = true AND ${projectCategories.projectType} IS NOT NULL`)
      .orderBy(projectCategories.projectType, projectCategories.name)
      .limit(15);
    
    console.log('\n🏗️ Sample Tunisian Construction Projects:');
    let currentType = '';
    sampleProjects.forEach(project => {
      if (project.projectType !== currentType) {
        currentType = project.projectType;
        console.log(`\n  ${currentType.toUpperCase()}:`);
      }
      console.log(`    • ${project.name}`);
      console.log(`      Price: ${project.basePrice}€/${project.unit} | Complexity: ${project.complexity} | Duration: ${project.duration} days`);
    });
    
    // Check for Tunisian specifics
    const withSpecifics = await db.select({ count: sql`count(*)` })
      .from(projectCategories)
      .where(sql`${projectCategories.tunisianSpecifics} IS NOT NULL`);
    
    console.log(`\n🇹🇳 Projects with Tunisian Specifics: ${withSpecifics[0].count}`);
    
    console.log('\n✅ Verification completed successfully!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

// Only run verification if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyTunisianProjectTypes()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { verifyTunisianProjectTypes };
