# Ollama API Documentation

## Authentication

All API endpoints (except `/api/health`) require authentication using an API key. The API key should be included in the `X-API-Key` header with each request.

### Request Headers

| Header      | Value         |
|-------------|---------------|
| X-API-Key   | Your API key  |

## Endpoints

### Health Check

#### `GET /api/health`

Checks the health status of the API server.

### Generate Text

#### `POST /api/generate`

Generates text using the specified model.

##### Examples

**cURL**
```bash
curl -X POST https://your-api-server/api/generate \
  -H "X-API-Key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama2",
    "prompt": "What is artificial intelligence?",
    "stream": false
  }'
```

**JavaScript**
```javascript
const response = await fetch('https://your-api-server/api/generate', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your-api-key-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'llama2',
    prompt: 'What is artificial intelligence?',
    stream: false
  })
});

const data = await response.json();
```

### List Models

#### `GET /api/tags`

Retrieves a list of available models.

##### Examples

**cURL**
```bash
curl https://your-api-server/api/tags \
  -H "X-API-Key: your-api-key-here"
```

**JavaScript**
```javascript
const response = await fetch('https://your-api-server/api/tags', {
  headers: {
    'X-API-Key': 'your-api-key-here'
  }
});

const models = await response.json();
```

### Delete Model

#### `DELETE /api/tags/{model}`

Deletes a specific model.

##### Examples

**cURL**
```bash
curl -X DELETE https://your-api-server/api/tags/llama2 \
  -H "X-API-Key: your-api-key-here"
```

**JavaScript**
```javascript
const response = await fetch('https://your-api-server/api/tags/llama2', {
  method: 'DELETE',
  headers: {
    'X-API-Key': 'your-api-key-here'
  }
});
```

### Generate Embeddings

#### `POST /api/embeddings`

Generates embeddings for the provided text.

##### Examples

**cURL**
```bash
curl -X POST https://your-api-server/api/embeddings \
  -H "X-API-Key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama2",
    "prompt": "Convert this text to embeddings"
  }'
```

**JavaScript**
```javascript
const response = await fetch('https://your-api-server/api/embeddings', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your-api-key-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'llama2',
    prompt: 'Convert this text to embeddings'
  })
});

const embeddings = await response.json();
```

## Response Formats

### Generate Response
```json
{
  "model": "llama2",
  "created_at": "2024-01-20T12:34:56.789Z",
  "response": "Artificial intelligence (AI) is...",
  "done": true
}
```

### Models List Response
```json
{
  "models": [
    {
      "name": "llama2",
      "size": 12345678,
      "modified_at": "2024-01-20T12:34:56.789Z"
    }
  ]
}
```

### Embeddings Response
```json
{
  "embeddings": [0.123, 0.456, ...],
  "model": "llama2"
}
```

### Error Response
```json
{
  "error": "Error message description"
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 400  | Bad Request |
| 401  | Unauthorized (Missing API key) |
| 403  | Forbidden (Invalid API key) |
| 500  | Internal Server Error |
