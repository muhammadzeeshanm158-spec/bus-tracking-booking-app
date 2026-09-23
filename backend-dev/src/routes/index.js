/**
 * @file routes/index.js
 * @description Central Router Entry Point (ES6)
 * Manages API versioning by mounting route modules under specific version prefixes (e.g., /v1).
 */

// Import Express framework
import express from "express";

// Ek naya master router instance bana rahe hain taaki saari API versions ke routes ko ek jagah group kiya ja sakay
const router = express.Router();

// Import all API Version 1 (v1) route definitions (API v1 ke saare routes import kar rahe hain)
import v1Routes from "./v1/index.js";

// Mount Version 1 routes under the "/v1" URL prefix (API v1 ke routes ko `/v1` prefix ke tehat mount kar rahe hain, jese /api/v1/...)
router.use("/v1", v1Routes);

// Master router ko export kar rahe hain taaki isay main `app.js` file mein mount kiya ja sakay
export default router;