#!/bin/bash

echo "🧪 Test Final - Validation des Fonctionnalités d'Estimation"
echo "==========================================================="

# Test de l'endpoint de santé
echo ""
echo "1️⃣ Test de connectivité du serveur..."
curl -s http://localhost:3000/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Serveur accessible sur port 3000"
else
    echo "❌ Serveur non accessible - Démarrer avec 'npm run dev'"
    exit 1
fi

# Test de l'endpoint test
echo ""
echo "2️⃣ Test de la structure des routes..."
ROUTES=$(curl -s http://localhost:3000/api/test | grep -o "estimation\|reports" | wc -l)
if [ $ROUTES -gt 0 ]; then
    echo "✅ Routes d'estimation et reports disponibles"
else
    echo "⚠️  Routes possiblement non montées"
fi

echo ""
echo "3️⃣ Instructions pour test manuel:"
echo "   📍 Ouvrir: http://localhost:3000/estimation"
echo "   📋 Remplir le formulaire avec:"
echo "      - Surface: 120m²"
echo "      - Type: Construction neuve"
echo "      - Qualité: Premium"
echo "   🧮 Cliquer 'Calculer l'estimation'"
echo "   💾 Cliquer 'Enregistrer l'estimation'"
echo "   📄 Cliquer 'Exporter en PDF'"

echo ""
echo "🎯 Status: Toutes les modifications sont terminées !"
echo "📱 Application prête pour les tests finaux"
echo "==========================================================="
