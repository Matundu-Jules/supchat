# AGENTS.md - Configuration IA pour SUPCHAT Server

## Scope et Contexte du Projet

Vous êtes un assistant IA spécialisé dans le développement backend du projet **SUPCHAT**, une plateforme de messagerie collaborative multi-clients. Votre rôle est d'assister le développement du **serveur Node.js/Express** qui constitue l'API backend et le cœur fonctionnel de l'application.

### Architecture du Composant
- **Runtime**: Node.js avec Express.js ^4.21.2
- **Base de données**: MongoDB 6.0 avec Mongoose ^8.10.0
- **Authentification**: JWT ^9.0.2 et Passport ^0.7.0 pour OAuth
- **Sécurité**: Helmet ^8.0.0, CORS, et validation Joi ^17.13.3
- **Documentation**: Swagger ^6.2.8
- **Temps réel**: WebSocket/Socket.IO (à implémenter)
- **Validation**: Joi pour schémas de données et validations
- **Tests**: Jest ^29.7.0 pour les tests unitaires et d'intégration

## Architecture MVC et Organisation du Code

### Structure de Dossiers
```
supchat-server/
├── src/
│   ├── app.js             # Point d'entrée Express
│   ├── config/            # Configuration environnement
│   ├── controllers/       # Logique métier
│   ├── middlewares/       # Intercepteurs de requêtes
│   ├── models/            # Schémas Mongoose
│   ├── routes/            # Définition des endpoints
│   ├── services/          # Logique métier réutilisable
│   ├── utils/             # Fonctions utilitaires
│   └── tests/             # Tests unitaires et d'intégration
├── docs/                  # Documentation technique
├── public/                # Fichiers statiques
└── uploads/               # Stockage fichiers temporaires
```

### Pattern MVC et Conventions
```javascript
// Respecter le pattern MVC
// 1. Routes définissent les endpoints
// 2. Controllers implémentent la logique
// 3. Models définissent les schémas de données

// routes/workspaceRoutes.js - Définition des endpoints
const express = require("express");
const { authMiddleware } = require("../middlewares/auth");
const workspaceController = require("../controllers/workspaceController");

const router = express.Router();

router.get("/", authMiddleware, workspaceController.getAllWorkspaces);
router.post("/", authMiddleware, workspaceController.createWorkspace);
router.get("/:id", authMiddleware, workspaceController.getWorkspaceById);
router.put("/:id", authMiddleware, workspaceController.updateWorkspace);
router.delete("/:id", authMiddleware, workspaceController.deleteWorkspace);

module.exports = router;

// controllers/workspaceController.js - Logique métier
const Workspace = require("../models/Workspace");
const { workspaceService } = require("../services/workspaceService");

exports.getAllWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await workspaceService.findByUserId(req.user.id);
    return res.status(200).json(workspaces);
  } catch (error) {
    next(error);
  }
};

exports.createWorkspace = async (req, res, next) => {
  try {
    // Validation traitée par middleware
    const workspace = await workspaceService.create({
      ...req.body,
      owner: req.user.id
    });
    return res.status(201).json(workspace);
  } catch (error) {
    next(error);
  }
};

// models/Workspace.js - Schéma de données
const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    role: {
      type: String,
      enum: ["admin", "member", "guest"],
      default: "member"
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Workspace", workspaceSchema);
```

## Validation et Sécurité

### Validation avec Joi
```javascript
// middlewares/validation.js
const Joi = require("joi");

const createWorkspaceSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  description: Joi.string().max(500),
  isPublic: Joi.boolean()
});

exports.validateWorkspaceCreation = (req, res, next) => {
  const { error } = createWorkspaceSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

// Application dans les routes
router.post(
  "/", 
  authMiddleware, 
  validateWorkspaceCreation, 
  workspaceController.createWorkspace
);
```

### Sécurité et Middlewares
```javascript
// middlewares/security.js
const helmet = require("helmet");
const cors = require("cors");
const { csrfProtection } = require("csrf-csrf");
const rateLimit = require("express-rate-limit");

// Configuration CORS
const corsOptions = {
  origin: process.env.CLIENT_URLS.split(","),
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-TOKEN"],
  credentials: true
};

// Configuration CSRF
const csrfOptions = {
  getSecret: () => process.env.CSRF_SECRET,
  cookieName: "csrf-token",
  cookieOptions: {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production"
  },
  getTokenFromRequest: (req) => req.headers["x-csrf-token"]
};

// Limitation de requêtes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  setupSecurity: (app) => {
    app.use(helmet());
    app.use(cors(corsOptions));
    app.use(csrfProtection(csrfOptions).doubleCsrfProtection);
    app.use("/api/", apiLimiter);
  }
};
```

## Authentification et JWT

### Configuration JWT
```javascript
// middlewares/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.authMiddleware = async (req, res, next) => {
  try {
    // Récupérer le token du header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized - No token provided" });
    }
    
    const token = authHeader.split(" ")[1];
    
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Trouver l'utilisateur
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ error: "Unauthorized - Invalid user" });
    }
    
    // Attacher l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Unauthorized - Token expired" });
    }
    return res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
};

// Génération de token dans le controller auth
exports.generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email }, 
    process.env.JWT_SECRET, 
    { expiresIn: "24h" }
  );
};
```

### OAuth avec Passport
```javascript
// config/passport.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/User");

module.exports = () => {
  // Google Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    scope: ["profile", "email"]
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Vérifier si l'utilisateur existe déjà
      let user = await User.findOne({ 
        $or: [
          { googleId: profile.id },
          { email: profile.emails[0].value }
        ]
      });
      
      if (user) {
        // Mettre à jour les infos si nécessaire
        if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }
        return done(null, user);
      }
      
      // Créer un nouvel utilisateur
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        username: profile.displayName,
        avatar: profile.photos[0].value
      });
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
  
  // Facebook Strategy (similaire)
  
  // Serialization
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};
```

## Gestion des Erreurs

### Middleware de Gestion d'Erreurs
```javascript
// middlewares/errorHandler.js
const mongoose = require("mongoose");

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Erreurs MongoDB/Mongoose
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      error: "Validation Error",
      details: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      error: "Invalid ID format",
      details: err.message
    });
  }
  
  if (err.code === 11000) { // Duplicate key error
    return res.status(409).json({
      error: "Duplicate Error",
      details: "A resource with that unique field already exists"
    });
  }
  
  // Erreurs JWT
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Invalid token",
      details: err.message
    });
  }
  
  // Erreurs d'application
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.name || "Application Error",
      details: err.message
    });
  }
  
  // Erreurs serveur non gérées
  return res.status(500).json({
    error: "Internal Server Error",
    details: process.env.NODE_ENV === "production" 
      ? "Something went wrong" 
      : err.message
  });
};

module.exports = errorHandler;
```

### Erreurs Personnalisées
```javascript
// utils/appError.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access") {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Forbidden access") {
    super(message, 403);
  }
}

class ValidationError extends AppError {
  constructor(message = "Validation error") {
    super(message, 400);
  }
}

module.exports = {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError
};
```

## Communication Temps Réel avec Socket.io

### Configuration Socket.IO
```javascript
// services/socketService.js
const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

// Modèles nécessaires pour les opérations en temps réel
const Message = require("../models/Message");
const User = require("../models/User");

const setupSocketIO = (server) => {
  // Initialiser Socket.IO
  const io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URLS.split(","),
      methods: ["GET", "POST"],
      credentials: true
    }
  });
  
  // Configuration Redis pour la mise à l'échelle
  if (process.env.REDIS_URL) {
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();
    
    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
      io.adapter(createAdapter(pubClient, subClient));
      console.log("Socket.IO Redis adapter configured");
    });
  }
  
  // Middleware d'authentification
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error("User not found"));
      }
      
      // Attacher l'utilisateur au socket
      socket.user = {
        id: user._id,
        username: user.username,
        avatar: user.avatar
      };
      
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });
  
  // Gestion des connexions
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.id})`);
    
    // Rejoindre les salles des workspaces
    socket.on("join-workspace", (workspaceId) => {
      socket.join(`workspace:${workspaceId}`);
    });
    
    // Rejoindre un canal spécifique
    socket.on("join-channel", (channelId) => {
      socket.join(`channel:${channelId}`);
    });
    
    // Écouter les nouveaux messages
    socket.on("send-message", async (data) => {
      try {
        const { channelId, content, attachments } = data;
        
        // Créer le message en base de données
        const message = await Message.create({
          sender: socket.user.id,
          channel: channelId,
          content,
          attachments: attachments || []
        });
        
        // Récupérer le message avec les infos de l'expéditeur
        const populatedMessage = await Message.findById(message._id)
          .populate("sender", "username avatar");
        
        // Émettre l'événement à tous les membres du canal
        io.to(`channel:${channelId}`).emit("new-message", populatedMessage);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });
    
    // Gestion des notifications de frappe
    socket.on("typing", ({ channelId, isTyping }) => {
      // Émettre aux autres utilisateurs du canal
      socket.to(`channel:${channelId}`).emit("user-typing", {
        user: socket.user,
        isTyping
      });
    });
    
    // Gestion de la déconnexion
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.username}`);
    });
  });
  
  return io;
};

module.exports = { setupSocketIO };
```

## Tests et Qualité

### Configuration Jest
```javascript
// jest.config.js
module.exports = {
  testEnvironment: "node",
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/tests/**",
    "!**/node_modules/**"
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  setupFiles: ["./src/tests/setup.js"]
};

// src/tests/setup.js
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";
process.env.MONGODB_URI = "mongodb://localhost:27017/supchat-test";
```

### Tests d'API avec Supertest
```javascript
// src/tests/api/workspace.test.js
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");
const Workspace = require("../../models/Workspace");
const User = require("../../models/User");
const { generateTestToken } = require("../helpers");

describe("Workspace API", () => {
  let token;
  let testUser;
  
  beforeAll(async () => {
    // Connexion à la DB de test
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Créer un utilisateur de test
    testUser = await User.create({
      email: "test@example.com",
      username: "testuser",
      password: "TestPassword123!"
    });
    
    // Générer un token JWT
    token = generateTestToken(testUser);
  });
  
  afterAll(async () => {
    // Nettoyer la DB
    await User.deleteMany({});
    await Workspace.deleteMany({});
    await mongoose.connection.close();
  });
  
  beforeEach(async () => {
    // Réinitialiser les workspaces avant chaque test
    await Workspace.deleteMany({});
  });
  
  describe("GET /api/workspaces", () => {
    it("should get all workspaces for authenticated user", async () => {
      // Créer des workspaces de test
      await Workspace.create([
        { name: "Workspace 1", owner: testUser._id, isPublic: true },
        { name: "Workspace 2", owner: testUser._id, isPublic: false }
      ]);
      
      // Exécuter la requête avec authentification
      const response = await request(app)
        .get("/api/workspaces")
        .set("Authorization", `Bearer ${token}`);
      
      // Vérifier la réponse
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe("Workspace 1");
    });
    
    it("should return 401 if not authenticated", async () => {
      const response = await request(app).get("/api/workspaces");
      expect(response.status).toBe(401);
    });
  });
  
  describe("POST /api/workspaces", () => {
    it("should create a new workspace", async () => {
      const workspaceData = {
        name: "New Workspace",
        description: "Test description",
        isPublic: true
      };
      
      const response = await request(app)
        .post("/api/workspaces")
        .set("Authorization", `Bearer ${token}`)
        .send(workspaceData);
      
      expect(response.status).toBe(201);
      expect(response.body.name).toBe(workspaceData.name);
      expect(response.body.owner.toString()).toBe(testUser._id.toString());
      
      // Vérifier en base
      const workspace = await Workspace.findById(response.body._id);
      expect(workspace).not.toBeNull();
    });
    
    it("should return 400 for invalid input", async () => {
      const response = await request(app)
        .post("/api/workspaces")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "" }); // Nom invalide
      
      expect(response.status).toBe(400);
    });
  });
});
```

## Configuration et Environnement

### Variables d'Environnement
```javascript
// config/config.js
const dotenv = require("dotenv");
const path = require("path");

// Charger les variables d'environnement
dotenv.config({
  path: path.resolve(__dirname, `../.env.${process.env.NODE_ENV || "development"}`)
});

module.exports = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3000,
  mongoURI: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
  clientURLs: process.env.CLIENT_URLS ? process.env.CLIENT_URLS.split(",") : ["http://localhost:5173"],
  corsOptions: {
    origin: function (origin, callback) {
      const allowedOrigins = process.env.CLIENT_URLS ? process.env.CLIENT_URLS.split(",") : ["http://localhost:5173"];
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  },
  oauth: {
    google: {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    },
    facebook: {
      appID: process.env.FACEBOOK_APP_ID,
      appSecret: process.env.FACEBOOK_APP_SECRET
    }
  },
  redis: {
    url: process.env.REDIS_URL
  },
  uploadLimits: {
    fileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB par défaut
    fileTypes: process.env.ALLOWED_FILE_TYPES || "image/jpeg,image/png,application/pdf"
  }
};
```

### Configuration de la Base de Données
```javascript
// config/db.js
const mongoose = require("mongoose");
const config = require("./config");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoURI, {
      // Note: ces options sont implicites dans les versions récentes
      // de Mongoose, mais on peut les définir explicitement
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Configurer les événements de connexion
    mongoose.connection.on("error", (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });
    
    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected, trying to reconnect...");
    });
    
    // Gestion propre de la fermeture
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination");
      process.exit(0);
    });
    
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB };
```

## Déploiement et Infrastructure

### Docker Configuration
```javascript
// Dockerfile
FROM node:18-alpine

WORKDIR /usr/src/app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"]

// docker-compose.yml
version: '3.8'

services:
  api:
    build: ./supchat-server
    container_name: supchat-api
    restart: always
    ports:
      - "${PORT:-3000}:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/supchat
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis
    volumes:
      - ./supchat-server/uploads:/usr/src/app/uploads
    networks:
      - supchat-network

  mongo:
    image: mongo:6.0
    container_name: supchat-mongo
    restart: always
    volumes:
      - mongo-data:/data/db
    ports:
      - "27017:27017"
    networks:
      - supchat-network

  redis:
    image: redis:alpine
    container_name: supchat-redis
    restart: always
    networks:
      - supchat-network

networks:
  supchat-network:
    driver: bridge

volumes:
  mongo-data:
```

## Instructions Spéciales

### Génération de Code
- **Toujours** utiliser le pattern MVC (routes > controllers > services > models)
- **Implémenter** une gestion d'erreurs centralisée
- **Valider** toutes les entrées utilisateur avec Joi
- **Respecter** le principe de responsabilité unique dans les contrôleurs
- **Implémenter** Socket.IO pour les fonctionnalités temps réel

### Patterns à Éviter
- **Ne jamais** stocker des secrets en dur dans le code
- **Éviter** les callbacks imbriqués, préférer async/await
- **Ne pas** oublier de gérer les erreurs dans les promesses
- **Éviter** les mélanges de styles (promesses et callbacks)
- **Ne pas** exposer les erreurs internes aux clients

### Standards de Qualité
- **Tests unitaires** pour tous les contrôleurs et services
- **Validation** des schémas MongoDB pour toutes les collections
- **Documentation API** complète avec Swagger/OpenAPI
- **Gestion sécurisée** des fichiers uploadés
- **Sanitization** des entrées pour prévenir les injections

Cette configuration optimise votre assistance pour le développement backend Node.js/Express du projet SUPCHAT, en respectant les architectures modernes et les meilleures pratiques de l'écosystème.