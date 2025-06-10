/**
 * Script pour créer un utilisateur administrateur de test
 * Permet d'accéder aux fonctionnalités d'administration
 */

import pkg from 'pg';
import bcrypt from 'bcryptjs';
const { Client } = pkg;

console.log('🔐 Création d\'un utilisateur administrateur pour les tests');
console.log('=======================================================');

async function createAdminUser() {
  // Configuration de connexion à la base de données
  const client = new Client({
    user: 'postgres',
    password: 'postgres', // Ajustez selon votre configuration
    host: 'localhost',
    port: 5432,
    database: 'Housy',
    ssl: false
  });

  try {
    await client.connect();
    console.log('✅ Connexion à la base de données réussie');

    // Vérifier si la table users existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ Table users n\'existe pas. Création de la table...');
      
      // Créer la table users si elle n'existe pas
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'client',
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Table users créée');
    }

    // Créer un mot de passe haché
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Vérifier si l'utilisateur admin existe déjà
    const existingAdmin = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@housy.tn']
    );

    if (existingAdmin.rows.length > 0) {
      // Mettre à jour l'utilisateur existant
      await client.query(`
        UPDATE users 
        SET password = $1, role = 'admin', first_name = 'Admin', last_name = 'Housy'
        WHERE email = $2
      `, [hashedPassword, 'admin@housy.tn']);
      console.log('✅ Utilisateur administrateur mis à jour');
    } else {
      // Créer un nouvel utilisateur administrateur
      await client.query(`
        INSERT INTO users (email, password, role, first_name, last_name)
        VALUES ($1, $2, 'admin', 'Admin', 'Housy')
      `, ['admin@housy.tn', hashedPassword]);
      console.log('✅ Nouvel utilisateur administrateur créé');
    }

    // Créer également un utilisateur client pour comparer
    const clientExists = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['client@housy.tn']
    );

    if (clientExists.rows.length === 0) {
      const clientPassword = await bcrypt.hash('client123', 10);
      await client.query(`
        INSERT INTO users (email, password, role, first_name, last_name)
        VALUES ($1, $2, 'client', 'Test', 'Client')
      `, ['client@housy.tn', clientPassword]);
      console.log('✅ Utilisateur client de test créé');
    }

    // Afficher les utilisateurs créés
    const users = await client.query('SELECT id, email, role, first_name, last_name FROM users ORDER BY role DESC');
    
    console.log('\n📋 Utilisateurs disponibles :');
    console.log('============================');
    users.rows.forEach(user => {
      console.log(`👤 ${user.first_name} ${user.last_name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🏷️  Rôle: ${user.role.toUpperCase()}`);
      console.log(`   🆔 ID: ${user.id}`);
      console.log('');
    });

    console.log('🎯 INFORMATIONS DE CONNEXION POUR LES TESTS :');
    console.log('=============================================');
    console.log('👑 ADMINISTRATEUR :');
    console.log('   📧 Email: admin@housy.tn');
    console.log('   🔑 Mot de passe: admin123');
    console.log('');
    console.log('👤 CLIENT :');
    console.log('   📧 Email: client@housy.tn');
    console.log('   🔑 Mot de passe: client123');
    console.log('');

    await client.end();
    console.log('✅ Script terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de la création des utilisateurs:', error.message);
    
    // Essayer avec différentes configurations
    console.log('\n🔄 Tentative avec des configurations alternatives...');
    
    const alternativeConfigs = [
      { user: 'TaherCh', password: '' },
      { user: 'postgres', password: '' },
      { user: 'postgres', password: 'admin' }
    ];

    for (const config of alternativeConfigs) {
      try {
        const altClient = new Client({
          ...config,
          host: 'localhost',
          port: 5432,
          database: 'Housy',
          ssl: false
        });

        await altClient.connect();
        console.log(`✅ Connexion réussie avec ${config.user}`);
        await altClient.end();
        break;
      } catch (altError) {
        console.log(`❌ Échec avec ${config.user}: ${altError.message}`);
      }
    }
  }
}

createAdminUser();
