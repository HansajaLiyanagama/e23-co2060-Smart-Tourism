# Smart Tourism Management System - Server Code Analysis

## Executive Summary

Your server is well-structured with a modular architecture using Express.js and PostgreSQL. It currently implements user authentication and system monitoring. Below is a detailed analysis with recommendations for extending the system.

## Current Architecture

### Technology Stack

- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL (connection pooling with pg package)
- **Authentication**: bcrypt for password hashing
- **Environment**: dotenv for configuration
- **API Style**: RESTful with modular routing

### Current Implementation Status

#### ✅ Implemented

1. **User Authentication Module**
   - Registration endpoint with email validation
   - Password hashing using bcrypt (10 rounds salt)
   - User role support (tourist, guide, admin)
   - Error handling and validation

2. **Database Infrastructure**
   - PostgreSQL connection pool configured
   - Migration system with SQL files
   - User roles as PostgreSQL ENUM
   - Timestamps on all records

3. **System Monitoring**
   - Basic health check endpoint
   - Database connectivity verification
   - Startup logging

#### ⏳ Not Yet Implemented

1. **Login Authentication** - Registration works, but login endpoint missing
2. **JWT Token Generation** - No token authentication system
3. **Place Management APIs** - No endpoints for CRUD operations
4. **Travel Guide APIs** - Portfolio and guide management missing
5. **Itinerary APIs** - No endpoints for trip planning
6. **Review System** - No review endpoints
7. **Authorization Middleware** - No route protection
8. **Error Handling Middleware** - Limited error handling

---

## File-by-File Analysis

### 1. [app.js](server/src/app.js)

**Purpose**: Main application entry point that configures Express and routes

**Current Status**: ✅ Good Foundation

- CORS enabled for frontend (port 5173)
- Body parser configured
- Clean modular routing structure
- Environment-based port configuration

**Recommendations**:

```javascript
// Add Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    status: err.status || 500,
  });
};
app.use(errorHandler);

// Add Request Logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});
```

---

### 2. [db.js](server/src/config/db.js)

**Purpose**: PostgreSQL connection configuration

**Current Status**: ✅ Well Configured

- Connection pooling prevents resource exhaustion
- Error logging on connection issues
- Environment variable configuration

**Recommendations**:

```javascript
// Add connection pooling limits
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

### 3. [authController.js](server/src/controllers/authController.js)

**Purpose**: Authentication logic

**Current Status**: ✅ Good Foundation

- Password hashing implemented correctly
- Duplicate email check
- Error handling
- User creation with defaults

**Missing**: Login functionality

**Implementation Needed**:

```javascript
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Find user
    const user = await userRepo.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};
```

---

### 4. [userRepo.js](server/src/repositories/userRepo.js)

**Purpose**: Database queries for users

**Current Status**: ✅ Good

- Prepared statements prevent SQL injection
- Proper error handling
- RETURNING clause for efficiency

**Enhancement Needed**:

```javascript
// Add these methods
const getUserById = async (id) => {
  const query =
    "SELECT id, email, role, is_verified, created_at FROM users WHERE id = $1";
  const result = await db.query(query, [id]);
  return result.rows[0];
};

const verifyUser = async (id) => {
  const query = "UPDATE users SET is_verified = TRUE WHERE id = $1 RETURNING *";
  const result = await db.query(query, [id]);
  return result.rows[0];
};
```

---

## Required API Endpoints to Implement

### 1. **Authentication**

```
POST /api/auth/login              // Authenticate user
POST /api/auth/logout             // Client-side only
POST /api/auth/verify/:token      // Verify email token
POST /api/auth/refresh            // Refresh JWT token
```

### 2. **Places Management**

```
GET  /api/places                  // Get all places
GET  /api/places/:id              // Get place details
POST /api/places                  // Create place (admin)
PUT  /api/places/:id              // Update place (admin)
DELETE /api/places/:id            // Delete place (admin)
GET  /api/places/search           // Search places
GET  /api/places/nearby           // Location-based search
```

### 3. **Travel Guides**

```
GET  /api/guides                  // List all guides
GET  /api/guides/:id              // Guide details
POST /api/guides                  // Create guide profile
PUT  /api/guides/:id              // Update guide info
GET  /api/guides/:id/portfolio    // Guide portfolio
POST /api/guides/:id/rate         // Rate guide
```

### 4. **Itineraries**

```
GET  /api/itineraries             // User's itineraries
GET  /api/itineraries/:id         // Itinerary details
POST /api/itineraries             // Create itinerary
PUT  /api/itineraries/:id         // Update itinerary
DELETE /api/itineraries/:id       // Delete itinerary
POST /api/itineraries/:id/places  // Add place to itinerary
DELETE /api/itineraries/:id/places/:placeId  // Remove place
PUT  /api/itineraries/:id/reorder // Reorder places
```

### 5. **Reviews**

```
GET  /api/places/:id/reviews      // Get place reviews
POST /api/places/:id/reviews      // Create review
PUT  /api/reviews/:id             // Update review
DELETE /api/reviews/:id           // Delete review
```

### 6. **Profiles**

```
GET  /api/profile                 // Current user's profile
PUT  /api/profile                 // Update profile
GET  /api/profiles/:userId        // Get user profile
```

---

## Middleware Implementation Guide

### 1. **Authentication Middleware**

```javascript
// middleware/auth.js
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
```

### 2. **Authorization Middleware**

```javascript
// middleware/authorize.js
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
};

module.exports = authorizeRole;
```

### 3. **Validation Middleware**

```javascript
// middleware/validators.js
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePassword = (password) => {
  return password.length >= 8;
};

module.exports = { validateEmail, validatePassword };
```

---

## Database Schema Enhancements

### Current Tables

- ✅ users
- ✅ places
- ✅ itineraries
- ✅ itinerary_items
- ✅ reviews (needs creation)

### Additional Tables Needed

#### profiles table

```sql
CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    full_name VARCHAR(255),
    bio TEXT,
    profile_image_url VARCHAR(500),
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### reviews table

```sql
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    place_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### guides_portfolio table

```sql
CREATE TABLE guides_portfolio (
    id SERIAL PRIMARY KEY,
    guide_id INT NOT NULL,
    specialization VARCHAR(255),
    experience_years INT,
    languages VARCHAR(255),
    bio TEXT,
    rating DECIMAL(3,2),
    profile_image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guide_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## Environment Variables Setup

Create `.env` file:

```env
# Database
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tourism_db

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_key_change_this

# Email (optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

---

## Implementation Priority

### Phase 1 (Essential)

1. ✅ Add login endpoint with JWT
2. ✅ Create auth middleware
3. Add Places CRUD endpoints
4. Add Place search functionality

### Phase 2 (Core Features)

5. Implement Itinerary endpoints
6. Add review system
7. Create Travel Guide endpoints
8. Add profile management

### Phase 3 (Polish)

9. Input validation
10. Rate limiting
11. Logging system
12. Email verification
13. API documentation (Swagger)

---

## Security Recommendations

1. **Password Security**
   - Enforce minimum 8 characters ✅ (implement in validator)
   - Force HTTPS in production
   - Implement account lockout after failed attempts

2. **JWT Security**
   - Use strong secret (32+ characters)
   - Implement token refresh mechanism
   - Add token blacklist for logout

3. **API Security**
   - Rate limiting on auth endpoints
   - CORS configuration (restrict origins)
   - Input sanitization
   - SQL injection prevention ✅ (using parameterized queries)

4. **Database Security**
   - Use connection pooling ✅
   - Implement backups
   - Use SSL for DB connections in production

---

## Testing Recommendations

### Unit Tests

```javascript
// Test user authentication
describe("Authentication", () => {
  test("Register user with valid email", async () => {
    // Test implementation
  });

  test("Reject duplicate email", async () => {
    // Test implementation
  });
});
```

### Integration Tests

```javascript
// Test complete auth flow
describe("Auth Flow", () => {
  test("Register and Login", async () => {
    // Register user
    // Login user
    // Verify token
  });
});
```

---

## Performance Optimization

1. **Database**
   - Add indexes on frequently queried columns
   - Use connection pooling ✅
   - Implement query caching

2. **API**
   - Add pagination to list endpoints
   - Implement response compression
   - Cache GET requests
   - Add request rate limiting

3. **Code**
   - Use async/await properly ✅
   - Implement request logging
   - Monitor memory usage

---

## Quick Start for Development

1. **Install dependencies**

   ```bash
   cd server
   npm install
   ```

2. **Setup database**

   ```bash
   psql -U postgres
   CREATE DATABASE tourism_db;
   ```

3. **Run migrations**

   ```bash
   node src/database/runMigrations.js
   ```

4. **Configure environment**

   ```bash
   cp .env.example .env
   ```

5. **Start server**
   ```bash
   npm start
   ```

---

## Next Steps

1. Implement login endpoint (critical)
2. Create JWT authentication middleware
3. Build Places management API
4. Develop search algorithms
5. Implement itinerary endpoints
6. Add review system
7. Create comprehensive API documentation

Your server architecture is solid. Focus on implementing the missing endpoints systematically, starting with login/JWT, then places, then itineraries.
