import express, { Request, Response } from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 8000

// Middleware
app.use(cors())
app.use(express.json())

interface Source {
  title: string
  url: string
}

interface ChatResponse {
  answer: string
  sources: Source[]
}

// Mock RAG function with 1-second delay
export async function mockRAGService(question: string): Promise<ChatResponse> {
  // Simulate processing delay - here comes the call to an actual RAG service
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Hard-coded response
  return {
    answer: "This is a mocked response to your question. The actual RAG service would process your query and return relevant information based on the knowledge base.",
    sources: [
      {
        title: "Example Source Document 1",
        url: "https://example.com/source1"
      },
      {
        title: "Example Source Document 2",
        url: "https://example.com/source2"
      },
      {
        title: "Example Source Document 3",
        url: "https://example.com/source3"
      }
    ]
  }
}

// Chat endpoint
app.post('/chat', async (req: Request, res: Response) => {
  try {
    const { question } = req.body

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid request. Please provide a question as a string.' 
      })
    }

    const response = await mockRAGService(question)
    res.json(response)
  } catch (error) {
    console.error('Error processing chat request:', error)
    res.status(500).json({ 
      error: 'An error occurred while processing your request.' 
    })
  }
})

// Export app for testing
export { app }

// Start server (only if this file is run directly, not in tests)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
    console.log(`Chat endpoint available at http://localhost:${PORT}/chat`)
  })
}

