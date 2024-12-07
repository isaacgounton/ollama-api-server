const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const AdminDashboard = require('./components/AdminDashboard');
const fs = require('fs').promises;

dotenv.config();

const app = express();
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

app.use(express.json());
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Initialize admin dashboard
const adminKey = process.env.ADMIN_KEY || 'change-me-in-production';
const apiKeysFile = path.join(__dirname, '../config/api-keys.json');
new AdminDashboard(app, adminKey, apiKeysFile);

// Serve API documentation
app.get('/docs', (req, res) => {
  res.sendFile(path.join(__dirname, '../docs/API.md'));
});

// Ensure config directory and api-keys.json exist
const ensureConfigFiles = async () => {
  const configDir = path.join(__dirname, '../config');
  const apiKeysPath = path.join(configDir, 'api-keys.json');
  
  try {
    await fs.mkdir(configDir, { recursive: true });
    try {
      await fs.access(apiKeysPath);
    } catch {
      await fs.writeFile(apiKeysPath, JSON.stringify({ keys: [] }, null, 2));
    }
  } catch (error) {
    console.error('Failed to initialize config files:', error);
    process.exit(1);
  }
};

// API Key validation middleware
const validateApiKey = async (req, res, next) => {
  const apiKey = req.header('X-API-Key');
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'API key is required. Please provide it in the X-API-Key header.'
    });
  }

  try {
    const apiKeysFile = path.join(__dirname, '../config/api-keys.json');
    const data = await fs.readFile(apiKeysFile, 'utf8');
    const { keys } = JSON.parse(data);
    const keyData = keys.find(k => k.key === apiKey);

    if (!keyData) {
      return res.status(403).json({
        error: 'Invalid API key.'
      });
    }

    if (new Date(keyData.expiresAt) < new Date()) {
      return res.status(403).json({
        error: 'API key has expired.'
      });
    }

    next();
  } catch (error) {
    console.error('Error validating API key:', error);
    res.status(500).json({
      error: 'Internal Server Error'
    });
  }
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
};

// Apply API key validation to all routes except health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Protected routes
app.use('/api', validateApiKey);

// Generate endpoint
app.post('/api/generate', async (req, res, next) => {
  try {
    const { model, prompt, stream = false, ...options } = req.body;

    if (!model || !prompt) {
      return res.status(400).json({
        error: 'Missing required parameters: model and prompt are required'
      });
    }

    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model,
      prompt,
      stream,
      ...options
    });

    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

// Tags (Model Management) endpoint
app.get('/api/tags', async (req, res, next) => {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

// Delete model endpoint
app.delete('/api/tags/:model', async (req, res, next) => {
  try {
    const { model } = req.params;
    const response = await axios.delete(`${OLLAMA_BASE_URL}/api/tags/${model}`);
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

// Embeddings endpoint
app.post('/api/embeddings', async (req, res, next) => {
  try {
    const { model, prompt, ...options } = req.body;

    if (!model || !prompt) {
      return res.status(400).json({
        error: 'Missing required parameters: model and prompt are required'
      });
    }

    const response = await axios.post(`${OLLAMA_BASE_URL}/api/embeddings`, {
      model,
      prompt,
      ...options
    });

    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

const PORT = process.env.PORT || 3004;

// Initialize config files before starting server
ensureConfigFiles().then(() => {
  app.listen(PORT, () => {
    // Log allowed API keys (only in development)
    if (process.env.NODE_ENV !== 'production') {
      console.log('Allowed API Keys:', API_KEYS);
    }
    console.log(`Server running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});