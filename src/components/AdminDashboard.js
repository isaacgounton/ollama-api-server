const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const { writeFile } = require('fs/promises');
const path = require('path');

class AdminDashboard {
  constructor(app, adminKey, apiKeysFile) {
    this.app = app;
    this.adminKey = adminKey;
    this.apiKeysFile = apiKeysFile;
    this.setupRoutes();
  }

  validateAdminKey(req, res, next) {
    const providedKey = req.header('X-Admin-Key');
    if (providedKey !== this.adminKey) {
      return res.status(403).json({ error: 'Invalid admin key' });
    }
    next();
  }

  async saveApiKeys(keys) {
    await writeFile(this.apiKeysFile, JSON.stringify(keys, null, 2));
  }

  setupRoutes() {
    // Admin routes
    this.app.get('/admin/api-keys', this.validateAdminKey.bind(this), async (req, res) => {
      try {
        const apiKeys = require(this.apiKeysFile);
        // Hide full key values in response
        const safeKeys = apiKeys.keys.map(key => ({
          ...key,
          key: `${key.key.substr(0, 8)}...${key.key.substr(-8)}`
        }));
        res.json({ keys: safeKeys });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch API keys' });
      }
    });

    this.app.post('/admin/api-keys', this.validateAdminKey.bind(this), async (req, res) => {
      try {
        const { rateLimit } = req.body;
        const newKey = require('crypto').randomBytes(32).toString('hex');
        const apiKeys = require(this.apiKeysFile);
        
        apiKeys.keys.push({
          key: newKey,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          rateLimit: rateLimit || { requests: 100, duration: 60 }
        });

        await this.saveApiKeys(apiKeys);
        res.json({ key: newKey });
      } catch (error) {
        res.status(500).json({ error: 'Failed to create API key' });
      }
    });

    this.app.delete('/admin/api-keys/:key', this.validateAdminKey.bind(this), async (req, res) => {
      try {
        const keyToDelete = req.params.key;
        const apiKeys = require(this.apiKeysFile);
        
        const keyIndex = apiKeys.keys.findIndex(k => k.key === keyToDelete);
        if (keyIndex === -1) {
          return res.status(404).json({ error: 'API key not found' });
        }

        apiKeys.keys.splice(keyIndex, 1);
        await this.saveApiKeys(apiKeys);
        
        res.json({ message: 'API key deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete API key' });
      }
    });

    // Serve admin dashboard
    this.app.get('/admin', (req, res) => {
      res.sendFile(path.join(__dirname, '../../public/admin.html'));
    });
  }
}

module.exports = AdminDashboard;