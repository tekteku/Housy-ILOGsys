# API Documentation - Housy Tunisia

This document provides comprehensive documentation for the Housy Tunisia API endpoints.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All API responses follow this standard format:

```json
{
  "success": boolean,
  "message": string,
  "data": object | array | null,
  "error": object | null
}
```

## Error Codes

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication Endpoints

### POST /api/auth/login

Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "client"
    }
  }
}
```

### POST /api/auth/register

Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Compte créé avec succès",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "client"
    }
  }
}
```

### GET /api/auth/me

Get current user information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "client"
  }
}
```

---

## AI Estimation Endpoints

### GET /api/estimation-ai/models

Get available AI models for the current user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "models": [
      {
        "id": "openai",
        "name": "GPT-4 (OpenAI)",
        "description": "Modèle général pour estimation et conseils"
      },
      {
        "id": "claude",
        "name": "Claude 3 (Anthropic)",
        "description": "Analyse approfondie et recommandations détaillées"
      },
      {
        "id": "deepseek",
        "name": "DeepSeek",
        "description": "Prédictions et analyses de marché"
      }
    ]
  }
}
```

**Admin Response (includes Ollama):**
```json
{
  "success": true,
  "data": {
    "models": [
      {
        "id": "ollama",
        "name": "Ollama Local (Admin Only)",
        "description": "Traitement local sécurisé - Réservé aux administrateurs",
        "restricted": true
      },
      // ... other models
    ]
  }
}
```

### POST /api/estimation-ai/generate

Generate AI-powered construction estimation.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "projectDescription": "Construction d'une villa de 200m² avec 2 étages en Tunisie",
  "projectType": "construction_neuve",
  "estimatedBudget": 200000,
  "preferredModel": "openai"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Voici une estimation détaillée pour votre projet...",
    "estimatedCost": 180000,
    "modelUsed": "openai",
    "materials": [
      {
        "category": "gros_oeuvre",
        "items": [
          {
            "name": "Ciment",
            "quantity": "50 sacs",
            "estimatedCost": 2500
          }
        ]
      }
    ],
    "recommendations": [
      "Prévoir une marge de 10% pour les imprévus",
      "Choisir des matériaux locaux pour réduire les coûts"
    ]
  }
}
```

### GET /api/estimation-ai/permissions

Get current user's AI model permissions.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "userRole": "client",
    "permissions": {
      "canUseOllama": false,
      "availableModels": ["openai", "claude", "deepseek"]
    },
    "recommendations": "Utilisez OpenAI ou Claude pour vos estimations"
  }
}
```

### POST /api/estimation-ai/test-ollama

Test Ollama connection (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "connected",
    "model": "llama3.1",
    "response": "Ollama is operational"
  }
}
```

---

## Admin Endpoints

### GET /api/admin/users

Get all users (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "client",
        "createdAt": "2025-01-01T00:00:00Z",
        "lastLogin": "2025-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### POST /api/admin/users

Create a new user (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "email": "newuser@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "client",
  "sendWelcomeEmail": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "data": {
    "user": {
      "id": 2,
      "email": "newuser@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "client"
    },
    "temporaryPassword": "temp_password_123"
  }
}
```

### PUT /api/admin/users/:id

Update user information (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Utilisateur mis à jour avec succès",
  "data": {
    "user": {
      "id": 2,
      "email": "newuser@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "role": "admin"
    }
  }
}
```

### DELETE /api/admin/users/:id

Delete a user (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Utilisateur supprimé avec succès"
}
```

---

## AI Chat Endpoints

### POST /api/ai/chat

Send a message to AI chat assistant.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "message": "Comment calculer la quantité de ciment pour une dalle de 100m²?",
  "conversationId": "session_1234567890",
  "context": {
    "projectType": "construction_neuve",
    "surface": 100
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Pour une dalle de 100m² d'épaisseur 15cm, vous aurez besoin d'environ...",
    "sessionId": "session_1234567890",
    "timestamp": "2025-06-11T10:30:00Z"
  }
}
```

### GET /api/ai/chat/:sessionId

Get chat session history.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session_1234567890",
    "messages": [
      {
        "id": 1,
        "type": "user",
        "content": "Comment calculer la quantité de ciment?",
        "timestamp": "2025-06-11T10:30:00Z"
      },
      {
        "id": 2,
        "type": "assistant",
        "content": "Pour calculer la quantité de ciment...",
        "timestamp": "2025-06-11T10:30:15Z"
      }
    ]
  }
}
```

---

## Project Endpoints

### GET /api/projects

Get user's projects.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Project status filter
- `type` (optional): Project type filter
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": 1,
        "name": "Villa Moderne",
        "type": "construction_neuve",
        "status": "en_cours",
        "surface": 200,
        "budget": 180000,
        "startDate": "2025-01-01",
        "endDate": "2025-12-31",
        "progress": 45
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalProjects": 25
    }
  }
}
```

### POST /api/projects

Create a new project.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "Villa Moderne",
  "type": "construction_neuve",
  "surface": 200,
  "budget": 180000,
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "description": "Construction d'une villa moderne avec piscine"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Projet créé avec succès",
  "data": {
    "project": {
      "id": 1,
      "name": "Villa Moderne",
      "type": "construction_neuve",
      "status": "planification",
      "surface": 200,
      "budget": 180000,
      "progress": 0
    }
  }
}
```

---

## Materials Endpoints

### GET /api/materials

Get construction materials database.

**Query Parameters:**
- `category` (optional): Material category filter
- `search` (optional): Search term
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "materials": [
      {
        "id": 1,
        "name": "Ciment Portland",
        "category": "gros_oeuvre",
        "unit": "sac",
        "price": 50,
        "supplier": "Carthage Cement",
        "availability": "disponible"
      }
    ],
    "categories": [
      "gros_oeuvre",
      "second_oeuvre", 
      "finition"
    ]
  }
}
```

### POST /api/materials

Add new material (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "Carrelage Premium",
  "category": "finition",
  "unit": "m²",
  "price": 25,
  "supplier": "Ceramica Tunisie",
  "description": "Carrelage haut de gamme pour sols"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Matériau ajouté avec succès",
  "data": {
    "material": {
      "id": 2,
      "name": "Carrelage Premium",
      "category": "finition",
      "unit": "m²",
      "price": 25
    }
  }
}
```

---

## Estimation Endpoints

### POST /api/estimation/calculate

Calculate project cost estimation.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "projectType": "construction_neuve",
  "area": 200,
  "floors": 1,
  "qualityLevel": "PREMIUM",
  "includeWastage": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCost": 180000,
    "categories": [
      {
        "category": "gros_oeuvre",
        "totalCost": 80000,
        "materials": [
          {
            "id": 1,
            "name": "Ciment",
            "quantity": 160,
            "unit": "sac",
            "unitPrice": 50,
            "totalPrice": 8000
          }
        ]
      }
    ]
  }
}
```

### POST /api/estimation/save

Save estimation results.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "Estimation Villa Moderne",
  "projectType": "construction_neuve",
  "area": 200,
  "totalCost": 180000,
  "materialsList": [...]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Estimation sauvegardée avec succès",
  "data": {
    "estimationId": 1
  }
}
```

### GET /api/estimation/history

Get user's estimation history.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Estimation Villa Moderne", 
      "totalCost": 180000,
      "createdAt": "2025-06-11T10:30:00Z",
      "projectType": "construction_neuve"
    }
  ]
}
```

---

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Données invalides",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Format d'email invalide"
      }
    ]
  }
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Token d'authentification requis",
  "error": {
    "code": "AUTH_TOKEN_REQUIRED"
  }
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Accès refusé - Privilèges administrateur requis",
  "error": {
    "code": "INSUFFICIENT_PRIVILEGES"
  }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Ressource non trouvée",
  "error": {
    "code": "RESOURCE_NOT_FOUND"
  }
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Erreur interne du serveur",
  "error": {
    "code": "INTERNAL_ERROR"
  }
}
```

---

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **AI endpoints**: 10 requests per minute per user
- **General endpoints**: 100 requests per minute per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Webhooks

Some endpoints support webhook notifications:

### Webhook Events
- `user.created` - New user registered
- `project.completed` - Project marked as completed
- `estimation.generated` - AI estimation completed

### Webhook Payload Example
```json
{
  "event": "user.created",
  "timestamp": "2025-06-11T10:30:00Z",
  "data": {
    "userId": 1,
    "email": "user@example.com"
  }
}
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { HousyAPI } from '@housy/api-client';

const api = new HousyAPI({
  baseURL: 'http://localhost:5000/api',
  token: 'your_jwt_token'
});

// Generate AI estimation
const estimation = await api.estimationAI.generate({
  projectDescription: 'Villa 200m²',
  projectType: 'construction_neuve'
});

// Get available models
const models = await api.estimationAI.getModels();

// Create project
const project = await api.projects.create({
  name: 'Villa Moderne',
  type: 'construction_neuve'
});
```

### cURL Examples

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Generate AI estimation
curl -X POST http://localhost:5000/api/estimation-ai/generate \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{"projectDescription":"Villa 200m²","projectType":"construction_neuve"}'

# Get projects
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer your_token"
```

---

This documentation covers the main API endpoints. For additional endpoints or detailed implementation examples, please refer to the source code or contact the development team.
