const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

app.use(express.json());
app.use(cors());

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
};

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});