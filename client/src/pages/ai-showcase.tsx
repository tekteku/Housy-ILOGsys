import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Link } from 'wouter';
import HousyImage from '../components/ui/housy-image';
import { 
  Brain,
  Zap,
  Globe,
  Shield,
  TrendingUp,
  MessageCircle,
  Code,
  BarChart3,
  FileText,
  Lightbulb,
  Star,
  Clock,
  Users,
  MapPin
} from 'lucide-react';

export function AIShowcasePage() {
  const adminModels = [
    {
      name: "Ollama Local",
      description: "Confidentialité maximale et traitement rapide",
      features: ["Traitement local", "Zéro latence", "Données sécurisées"],
      icon: <Shield className="h-8 w-8" />,
      color: "bg-blue-500",
      specialty: "Sécurité & Performance"
    },
    {
      name: "DeepSeek Coder",
      description: "Assistance technique et génération de code pour les projets",
      features: ["Génération de code", "Debug automatique", "Architecture technique"],
      icon: <Code className="h-8 w-8" />,
      color: "bg-green-500",
      specialty: "Développement Technique"
    },
    {
      name: "Qwen Local",
      description: "Analyse avancée des données et prédictions de marché",
      features: ["Analyse prédictive", "Big Data", "Tendances marché"],
      icon: <BarChart3 className="h-8 w-8" />,
      color: "bg-purple-500",
      specialty: "Analyse & Prédictions"
    }
  ];

  const clientModels = [
    {
      name: "DeepSeek Chat",
      description: "Conseils personnalisés sur les projets immobiliers",
      features: ["Conseils experts", "Projets sur mesure", "Support 24/7"],
      icon: <MessageCircle className="h-8 w-8" />,
      color: "bg-orange-500",
      specialty: "Conseil Immobilier"
    },
    {
      name: "Qwen Turbo",
      description: "Réponses rapides et précises aux questions courantes",
      features: ["Réponses instantanées", "FAQ intelligente", "Multi-domaines"],
      icon: <Zap className="h-8 w-8" />,
      color: "bg-yellow-500",
      specialty: "Support Rapide"
    },
    {
      name: "Claude Instant",
      description: "Analyse détaillée des options de construction",
      features: ["Analyse comparative", "Recommandations", "Études détaillées"],
      icon: <FileText className="h-8 w-8" />,
      color: "bg-indigo-500",
      specialty: "Analyse Construction"
    },
    {
      name: "ChatGPT",
      description: "Assistance conversationnelle intelligente, multilingue et polyvalente",
      features: ["Multilingue", "Conversationnel", "Polyvalent"],
      icon: <Globe className="h-8 w-8" />,
      color: "bg-teal-500",
      specialty: "Assistant Universel"
    },
    {
      name: "Kimi",
      description: "Génération de textes créatifs et recommandations personnalisées",
      features: ["Créativité", "Personnalisation", "Innovation"],
      icon: <Lightbulb className="h-8 w-8" />,
      color: "bg-pink-500",
      specialty: "Créativité & Innovation"
    }
  ];

  const professionalFeatures = [
    {
      title: "Analyse prédictive des coûts",
      description: "Précision de 95% pour l'estimation des coûts de construction",
      icon: <TrendingUp className="h-6 w-6" />,
      metric: "95%"
    },
    {
      title: "Optimisation automatique",
      description: "Optimisation automatique des ressources et matériaux",
      icon: <BarChart3 className="h-6 w-6" />,
      metric: "Auto"
    },
    {
      title: "Rapports techniques",
      description: "Génération de rapports techniques détaillés",
      icon: <FileText className="h-6 w-6" />,
      metric: "Complet"
    },
    {
      title: "Visualisation 3D",
      description: "Visualisation 3D des projets à partir de simples descriptions",
      icon: <Brain className="h-6 w-6" />,
      metric: "3D"
    }
  ];

  const clientFeatures = [
    {
      title: "Conseils personnalisés",
      description: "Matériaux et finitions adaptés à vos besoins",
      icon: <Users className="h-6 w-6" />
    },
    {
      title: "Estimation précise",
      description: "Budgets et délais calculés avec précision",
      icon: <Clock className="h-6 w-6" />
    },
    {
      title: "Comparaison intelligente",
      description: "Options de construction comparées automatiquement",
      icon: <BarChart3 className="h-6 w-6" />
    },
    {
      title: "Support 24/7",
      description: "Assistance disponible à tout moment",
      icon: <MessageCircle className="h-6 w-6" />
    }
  ];

  const advantages = [
    {
      title: "Multilingue",
      description: "Français, Arabe, Anglais",
      icon: <Globe className="h-8 w-8" />,
      color: "text-blue-600"
    },
    {
      title: "Contextuel",
      description: "Comprend les spécificités du marché tunisien",
      icon: <MapPin className="h-8 w-8" />,
      color: "text-green-600"
    },
    {
      title: "Évolutif",
      description: "S'améliore continuellement grâce au machine learning",
      icon: <TrendingUp className="h-8 w-8" />,
      color: "text-purple-600"
    },
    {
      title: "Hybride",
      description: "Combine la puissance du cloud et la sécurité du local",
      icon: <Shield className="h-8 w-8" />,
      color: "text-orange-600"
    }
  ];

  const testimonials = [
    {
      text: "Grâce à Housy AI, j'ai économisé 15% sur mon budget de construction tout en améliorant la qualité des matériaux.",
      author: "Ahmed B.",
      role: "Propriétaire",
      image: "/static/images/d1.png"
    },
    {
      text: "L'assistant m'a guidé à chaque étape de mon projet, comme avoir un expert à mes côtés 24h/24.",
      author: "Sophia M.",
      role: "Architecte",
      image: "/static/images/d2.png"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-blue-100 text-blue-800 px-4 py-2">
              Intelligence Artificielle Intégrée
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Housy <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI</span>
            </h1>
            
            {/* Paragraphe descriptif principal */}
            <div className="max-w-5xl mx-auto mb-12 p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
              <p className="text-lg leading-relaxed text-gray-700">
                <strong>Housy AI représente une révolution technologique dans le secteur de la construction et de l'immobilier tunisien, orchestrée par l'utilisateur tekteku depuis le 10 juin 2025.</strong> Cette plateforme intelligente combine harmonieusement des modèles d'IA de pointe - allant d'Ollama Local pour la confidentialité administrative à ChatGPT et Kimi pour l'assistance client - créant un écosystème hybride qui s'adapte parfaitement aux besoins locaux. Grâce à ses capacités d'analyse prédictive atteignant 95% de précision, Housy AI transforme l'expérience utilisateur en proposant des visualisations 3D, des estimations budgétaires précises et des conseils personnalisés disponibles 24h/24 en trois langues. L'interface modernisée, enrichie d'éléments visuels attractifs et d'icônes représentatives, offre une navigation intuitive qui guide aussi bien les professionnels dans leurs analyses de marché que les particuliers dans leurs projets de construction, créant ainsi un pont technologique entre l'expertise traditionnelle et l'innovation IA au service du développement immobilier tunisien.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link href="/chatbot">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Essayer l'Assistant IA
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                <FileText className="mr-2 h-5 w-5" />
                Demander une Démo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Modèles d'IA pour Administrateurs */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Modèles d'IA pour les Administrateurs
            </h2>
            <p className="text-gray-600 text-lg">Traitement local pour une sécurité maximale</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {adminModels.map((model, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 ${model.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    {model.icon}
                  </div>
                  <CardTitle className="text-xl font-bold">{model.name}</CardTitle>
                  <Badge variant="outline" className="mx-auto">
                    {model.specialty}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{model.description}</p>
                  <div className="space-y-2">
                    {model.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Modèles d'IA pour Clients */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Modèles d'IA pour les Clients
            </h2>
            <p className="text-gray-600 text-lg">Assistance intelligente via API cloud</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clientModels.map((model, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className={`w-14 h-14 ${model.color} rounded-xl flex items-center justify-center text-white mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    {model.icon}
                  </div>
                  <CardTitle className="text-lg font-bold">{model.name}</CardTitle>
                  <Badge variant="secondary" className="mx-auto text-xs">
                    {model.specialty}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3 text-sm">{model.description}</p>
                  <div className="space-y-1">
                    {model.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-xs text-gray-500">
                        <Star className="w-3 h-3 text-yellow-500 mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Fonctionnalités Exclusives */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Fonctionnalités Exclusives
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Pour les Professionnels */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Brain className="mr-3 h-7 w-7 text-blue-600" />
                Pour les Professionnels
              </h3>
              <div className="space-y-4">
                {professionalFeatures.map((feature, index) => (
                  <Card key={index} className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-2 rounded-lg mr-4">
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                          <Badge className="bg-blue-100 text-blue-800">{feature.metric}</Badge>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{feature.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Pour les Clients */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="mr-3 h-7 w-7 text-green-600" />
                Pour les Clients
              </h3>
              <div className="space-y-4">
                {clientFeatures.map((feature, index) => (
                  <Card key={index} className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                    <div className="flex items-start">
                      <div className="bg-green-100 p-2 rounded-lg mr-4">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                        <p className="text-gray-600 text-sm mt-1">{feature.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Avantages Concurrentiels */}
      <section className="py-16 px-4 bg-gradient-to-r from-gray-50 to-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Avantages Concurrentiels
            </h2>
            <p className="text-gray-600 text-lg">Ce qui rend Housy AI unique</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advantages.map((advantage, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-xl transition-all duration-300 border-0 bg-white">
                <div className={`w-16 h-16 mx-auto mb-4 ${advantage.color} bg-opacity-10 rounded-2xl flex items-center justify-center`}>
                  <div className={advantage.color}>
                    {advantage.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{advantage.title}</h3>
                <p className="text-gray-600">{advantage.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Témoignages Clients
            </h2>
            <p className="text-gray-600 text-lg">Ce que disent nos utilisateurs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-shadow border-0 bg-gradient-to-br from-white to-blue-50">
                <div className="flex items-start mb-6">
                  <HousyImage
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-16 h-16 rounded-full mr-4"
                    objectFit="cover"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.author}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    <div className="flex mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <blockquote className="text-gray-700 italic">
                  "{testimonial.text}"
                </blockquote>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Démonstration */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Découvrez Housy AI en Action
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Transformez votre expérience de construction avec notre assistant IA avancé
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/chatbot">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                <MessageCircle className="mr-2 h-5 w-5" />
                Essayer Maintenant
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Users className="mr-2 h-5 w-5" />
              Planifier une Démo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
