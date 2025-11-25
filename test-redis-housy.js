#!/usr/bin/env node
/**
 * Script de test Redis avec données Housy Tunisia
 * Ce script teste l'intégration Redis avec les données réelles du projet
 */

import redis from 'redis';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration Redis
const REDIS_CONFIG = {
  url: 'redis://localhost:6379',
  socket: {
    connectTimeout: 60000,
    lazyConnect: true,
  }
};

// Chemins des données Housy
const DATA_PATHS = {
  materiaux: './server/data/materiaux/catalogue_estimation_materiaux_complet.json',
  proprietes: './server/data/immobilier/proprietes_consolidees_resume.json',
  index: './server/data/INDEX_GENERAL.json'
};

class HousyRedisTest {
  constructor() {
    this.client = null;
    this.data = {};
  }

  async connect() {
    try {
      console.log('🔗 Connexion à Redis...');
      this.client = redis.createClient(REDIS_CONFIG);
      
      this.client.on('error', (err) => {
        console.error('❌ Erreur Redis:', err);
      });

      this.client.on('connect', () => {
        console.log('✅ Connexion Redis établie');
      });

      await this.client.connect();
      console.log('🎉 Redis connecté avec succès!');
      
      // Test ping
      const pong = await this.client.ping();
      console.log(`📡 Test Ping: ${pong}`);
      
    } catch (error) {
      console.error('❌ Erreur de connexion Redis:', error);
      throw error;
    }
  }

  async loadHousyData() {
    try {
      console.log('\n📊 Chargement des données Housy...');
      
      // Chargement des matériaux
      console.log('📦 Chargement des matériaux...');
      const materiauxRaw = await fs.readFile(DATA_PATHS.materiaux, 'utf8');
      this.data.materiaux = JSON.parse(materiauxRaw);
      console.log(`✅ ${this.data.materiaux.materiaux?.length || 0} matériaux chargés`);

      // Chargement des propriétés
      console.log('🏠 Chargement des propriétés immobilières...');
      const proprietesRaw = await fs.readFile(DATA_PATHS.proprietes, 'utf8');
      // Nettoyage des valeurs NaN comme dans le vrai code Housy
      const cleanedProprietesRaw = proprietesRaw.replace(/:\s*NaN\s*([,}])/g, ': null$1');
      this.data.proprietes = JSON.parse(cleanedProprietesRaw);
      console.log(`✅ ${this.data.proprietes.proprietes?.length || 0} propriétés chargées`);

      // Chargement de l'index général
      console.log('📋 Chargement de l\'index général...');
      const indexRaw = await fs.readFile(DATA_PATHS.index, 'utf8');
      this.data.index = JSON.parse(indexRaw);
      console.log('✅ Index général chargé');

    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
      throw error;
    }
  }

  async cacheHousyData() {
    try {
      console.log('\n💾 Mise en cache des données Housy dans Redis...');

      // Cache des matériaux avec TTL de 1 heure
      console.log('📦 Cache des matériaux...');
      await this.client.setEx(
        'housy:materiaux:all',
        3600, // 1 heure
        JSON.stringify(this.data.materiaux)
      );

      // Cache des propriétés avec TTL de 1 heure
      console.log('🏠 Cache des propriétés...');
      await this.client.setEx(
        'housy:proprietes:all',
        3600,
        JSON.stringify(this.data.proprietes)
      );

      // Cache de l'index avec TTL de 24 heures
      console.log('📋 Cache de l\'index...');
      await this.client.setEx(
        'housy:index:general',
        86400, // 24 heures
        JSON.stringify(this.data.index)
      );

      // Cache des statistiques rapides
      const stats = {
        nb_materiaux: this.data.materiaux.materiaux?.length || 0,
        nb_proprietes: this.data.proprietes.proprietes?.length || 0,
        villes_disponibles: [...new Set(
          this.data.proprietes.proprietes?.map(p => p.ville).filter(Boolean) || []
        )],
        derniere_mise_a_jour: new Date().toISOString()
      };

      await this.client.setEx(
        'housy:stats:summary',
        3600,
        JSON.stringify(stats)
      );

      console.log('✅ Toutes les données Housy sont en cache Redis!');

    } catch (error) {
      console.error('❌ Erreur lors de la mise en cache:', error);
      throw error;
    }
  }

  async testRedisOperations() {
    try {
      console.log('\n🧪 Tests des opérations Redis avec données Housy...');

      // Test 1: Récupération des statistiques
      console.log('\n📊 Test 1: Récupération des statistiques');
      const stats = await this.client.get('housy:stats:summary');
      if (stats) {
        const parsedStats = JSON.parse(stats);
        console.log('✅ Statistiques récupérées:', {
          materiaux: parsedStats.nb_materiaux,
          proprietes: parsedStats.nb_proprietes,
          villes: parsedStats.villes_disponibles.length
        });
      }

      // Test 2: Recherche de matériaux par pattern
      console.log('\n🔍 Test 2: Recherche de matériaux');
      const materiaux = await this.client.get('housy:materiaux:all');
      if (materiaux) {
        const materiauxData = JSON.parse(materiaux);
        const ciment = materiauxData.materiaux?.filter(m => 
          m.nom?.toLowerCase().includes('ciment')
        ) || [];
        console.log(`✅ Trouvé ${ciment.length} matériaux contenant "ciment"`);
        if (ciment.length > 0) {
          console.log(`   Exemple: ${ciment[0].nom} - ${ciment[0].prix_unitaire} TND`);
        }
      }

      // Test 3: Analyse par ville
      console.log('\n🏘️ Test 3: Analyse par ville');
      const proprietes = await this.client.get('housy:proprietes:all');
      if (proprietes) {
        const proprietesData = JSON.parse(proprietes);
        const tunis = proprietesData.proprietes?.filter(p => 
          p.ville?.toLowerCase().includes('tunis')
        ) || [];
        console.log(`✅ Trouvé ${tunis.length} propriétés à Tunis`);
        
        if (tunis.length > 0) {
          const prixMoyen = tunis.reduce((sum, p) => sum + (p.prix_m2 || 0), 0) / tunis.length;
          console.log(`   Prix moyen à Tunis: ${prixMoyen.toFixed(2)} TND/m²`);
        }
      }

      // Test 4: Cache d'estimation simulée
      console.log('\n💰 Test 4: Cache d\'estimation simulée');
      const estimationSimulee = {
        surface: 150,
        ville: 'tunis',
        type: 'villa',
        cout_total: 180000,
        materiaux_recommandes: ['ciment', 'brique', 'carrelage'],
        timestamp: new Date().toISOString()
      };

      await this.client.setEx(
        'housy:estimation:villa_150m2_tunis',
        1800, // 30 minutes
        JSON.stringify(estimationSimulee)
      );

      const estimationCachee = await this.client.get('housy:estimation:villa_150m2_tunis');
      if (estimationCachee) {
        const estimation = JSON.parse(estimationCachee);
        console.log('✅ Estimation mise en cache et récupérée:', {
          surface: estimation.surface,
          cout: estimation.cout_total,
          ville: estimation.ville
        });
      }

      // Test 5: Performance Redis
      console.log('\n⚡ Test 5: Performance Redis');
      const start = Date.now();
      await Promise.all([
        this.client.get('housy:stats:summary'),
        this.client.get('housy:materiaux:all'),
        this.client.get('housy:proprietes:all'),
        this.client.get('housy:index:general')
      ]);
      const end = Date.now();
      console.log(`✅ 4 requêtes Redis simultanées en ${end - start}ms`);

    } catch (error) {
      console.error('❌ Erreur lors des tests:', error);
      throw error;
    }
  }

  async showRedisInfo() {
    try {
      console.log('\n📈 Informations Redis:');
      
      // Info mémoire
      const info = await this.client.info('memory');
      const lines = info.split('\r\n');
      const memoryUsed = lines.find(line => line.startsWith('used_memory_human:'));
      if (memoryUsed) {
        console.log(`💾 ${memoryUsed}`);
      }

      // Nombre de clés
      const dbSize = await this.client.dbSize();
      console.log(`🔑 Nombre de clés en base: ${dbSize}`);

      // Liste des clés Housy
      const housyKeys = await this.client.keys('housy:*');
      console.log(`🏠 Clés Housy en cache: ${housyKeys.length}`);
      housyKeys.forEach(key => console.log(`   - ${key}`));

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des infos Redis:', error);
    }
  }

  async cleanup() {
    try {
      console.log('\n🧹 Nettoyage optionnel (décommentez si nécessaire)...');
      
      // Décommentez ces lignes pour nettoyer le cache
      // const housyKeys = await this.client.keys('housy:*');
      // if (housyKeys.length > 0) {
      //   await this.client.del(housyKeys);
      //   console.log(`🗑️ ${housyKeys.length} clés Housy supprimées`);
      // }
      
      console.log('✅ Nettoyage terminé (aucune suppression effectuée)');
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
    }
  }

  async disconnect() {
    try {
      if (this.client) {
        await this.client.quit();
        console.log('\n👋 Déconnexion Redis effectuée');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
    }
  }

  async runFullTest() {
    try {
      console.log('🚀 === TEST COMPLET REDIS + HOUSY TUNISIA ===\n');
      
      await this.connect();
      await this.loadHousyData();
      await this.cacheHousyData();
      await this.testRedisOperations();
      await this.showRedisInfo();
      await this.cleanup();
      
      console.log('\n🎉 === TEST TERMINÉ AVEC SUCCÈS ===');
      
    } catch (error) {
      console.error('\n💥 === ÉCHEC DU TEST ===');
      console.error('Erreur:', error.message);
    } finally {
      await this.disconnect();
    }
  }
}

// Lancement du test
const test = new HousyRedisTest();
test.runFullTest();
