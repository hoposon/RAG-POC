# RAG POC

A Proof of Concept (POC) application demonstrating a Retrieval-Augmented Generation (RAG) system with a React frontend and Node.js/Express backend.

## Project Structure

```
RAG-POC/
├── FE/          # Frontend (React + Vite + TypeScript)
├── BE/          # Backend (Express + TypeScript)
└── package.json # Root workspace configuration
```

## Prerequisites

- Node.js (v20 or higher)
- npm

## Installation

Install all dependencies for both frontend and backend:

```bash
npm install
```

Or use the convenience script:

```bash
npm run install-all
```

## Development

### Run Both Frontend and Backend

Start both development servers simultaneously:

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000

### Run Frontend Only

```bash
npm run dev:fe
```

### Run Backend Only

```bash
npm run dev:be
```

## Testing

### Run All Tests

Run tests for both frontend and backend:

```bash
npm test
```

### Run Frontend Tests Only

```bash
npm run test:fe
```

### Run Backend Tests Only

```bash
npm run test:be
```

## API Endpoints

### POST /chat

Send a question to the RAG service.

**Request:**
```json
{
  "question": "Your question here"
}
```

**Response:**
```json
{
  "answer": "Response answer",
  "sources": [
    {
      "title": "Source Title",
      "url": "https://example.com/source"
    }
  ]
}
```

## Available Scripts

### Root Level
- `npm install` / `npm run install-all` - Install all dependencies
- `npm run dev` - Start both FE and BE in development mode
- `npm run dev:fe` - Start only frontend
- `npm run dev:be` - Start only backend
- `npm test` - Run all tests
- `npm run test:fe` - Run frontend tests only
- `npm run test:be` - Run backend tests only

### Frontend (FE/)
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Open Vitest UI
- `npm run test:coverage` - Generate coverage report

### Backend (BE/)
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript
- `npm start` - Start production server
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report

## Notes

- The backend includes a mocked RAG service with a 1-second delay to simulate real API behavior
- Frontend includes response validation and error handling
- All tests use Vitest as the test runner

