#!/usr/bin/env node

/**
 * VÉRIFICATION STRUCTURE DES TABLES
 * =================================
 * Ce script vérifie la structure des tables dans pgAdmin
 */

import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:0000@localhost:5432/housy_tunisia';
const pool = new Pool({ connectionString });

console.log('🔍 VÉRIFICATION STRUCTURE TABLES');
console.log('=================================');

async function checkTableStructure() {
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Connexion réussie !');
    
    // Vérifier la structure de la table materials
    console.log('\n🔨 STRUCTURE TABLE MATERIALS:');
    const materialsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'materials' 
      ORDER BY ordinal_position;
    `);
    
    materialsColumns.rows.forEach(col => {
      console.log(`   ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Vérifier la structure de la table real_estate_market
    console.log('\n🏠 STRUCTURE TABLE REAL_ESTATE_MARKET:');
    const propertiesColumns = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'real_estate_market' 
      ORDER BY ordinal_position;
    `);
    
    propertiesColumns.rows.forEach(col => {
      console.log(`   ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Vérifier la structure de la table projects
    console.log('\n📋 STRUCTURE TABLE PROJECTS:');
    const projectsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'projects' 
      ORDER BY ordinal_position;
    `);
    
    projectsColumns.rows.forEach(col => {
      console.log(`   ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Quelques échantillons avec les vraies colonnes
    console.log('\n📊 ÉCHANTILLONS DE DONNÉES:');
    console.log('============================');
    
    // Matériaux - utilisons les vraies colonnes
    console.log('🔨 Matériaux (5 premiers):');
    const sampleMaterials = await client.query('SELECT * FROM materials LIMIT 5;');
    sampleMaterials.rows.forEach((mat, i) => {
      console.log(`   ${i+1}. ${JSON.stringify(mat, null, 2)}`);
    });
    
    console.log('\n🏠 Propriétés (5 premières):');
    const sampleProperties = await client.query('SELECT * FROM real_estate_market LIMIT 5;');
    sampleProperties.rows.forEach((prop, i) => {
      console.log(`   ${i+1}. ${JSON.stringify(prop, null, 2)}`);
    });
    
    console.log('\n📋 Projets (5 premiers):');
    const sampleProjects = await client.query('SELECT * FROM projects LIMIT 5;');
    sampleProjects.rows.forEach((proj, i) => {
      console.log(`   ${i+1}. ${JSON.stringify(proj, null, 2)}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

checkTableStructure().catch(console.error);
