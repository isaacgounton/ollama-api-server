# Ollama API Server

A Node.js server that provides API endpoints for Ollama integration.

## Features

- Text generation endpoint (`/api/generate`)
- Model management (`/api/tags`)
- Embeddings generation (`/api/embeddings`)
- Error handling and logging
- CORS support
- Docker support

## Installation

1. Clone the repository:
\```bash
git clone https://github.com/yourusername/ollama-api-server.git
cd ollama-api-server
\```

2. Install dependencies:
\```bash
npm install
\```

3. Create environment file:
\```bash
cp .env.example .env
\```

4. Update the `.env` file with your configuration:
\```
PORT=3000
OLLAMA_BASE_URL=your_ollama_url
NODE_ENV=production
\```

## Running the Server

### Local Development
\```bash
npm run dev
\```

### Production
\```bash
npm start
\```

### Using Docker

1. Build the image:
\```bash
docker build -t ollama-api-server .
\```

2. Run the container:
\```bash
docker run -p 3000:3000 --env-file .env ollama-api-server
\```

## API Endpoints

### Generate Text
\```http
POST /api/generate
Content-Type: application/json

{
  "model": "llama2",
  "prompt": "Hello, how are you?",
  "stream": false
}
\```

### List Models
\```http
GET /api/tags
\```

### Create Embeddings
\```http
POST /api/embeddings
Content-Type: application/json

{
  "model": "llama2",
  "prompt": "Generate embeddings for this text"
}
\```

## License

MIT#   o l l a m a - a p i - s e r v e r  
 