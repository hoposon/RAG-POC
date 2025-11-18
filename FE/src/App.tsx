import { useState } from 'react'
import './App.css'
import { logger } from './logger'

interface Source {
  title: string
  url: string
}

interface ApiResponse {
  answer: string
  sources: Source[]
}

export function isValidApiResponse(data: unknown): data is ApiResponse {
  if (typeof data !== 'object' || data === null) {
    return false
  }

  const obj = data as Record<string, unknown>

  // Check if answer exists and is a string
  if (typeof obj.answer !== 'string') {
    return false
  }

  // Check if sources exists and is an array
  if (!Array.isArray(obj.sources)) {
    return false
  }

  // Check if all sources are objects with title and url
  if (!obj.sources.every((source) => {
    return (
      typeof source === 'object' &&
      source !== null &&
      typeof (source as Record<string, unknown>).title === 'string' &&
      typeof (source as Record<string, unknown>).url === 'string'
    )
  })) {
    return false
  }

  return true
}

function App() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!query.trim()) {
      return
    }

    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: query }),
      })

      if (!res.ok) {
        throw new Error(`API error: ${res.statusText}`)
      }

      const data = await res.json()
      
      // Validate response structure
      if (!isValidApiResponse(data)) {
        throw new Error('Invalid response format: expected { answer: string, sources: Array<{ title: string, url: string }> }')
      }

      setResponse(data)
    } catch (err) {
      // Log the actual error for debugging
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      logger.error('Error occurred while processing query', err instanceof Error ? err : new Error(errorMessage))
      
      // Set user-friendly error message
      setError('We are sorry but there was an error on our side. Please try again or try later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="container">
        <h1>RAG POC</h1>
        
        <form onSubmit={handleSubmit} className="query-form">
          <div className="input-group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your question..."
              disabled={loading}
              className="query-input"
            />
            <button 
              type="submit" 
              disabled={loading || !query.trim()}
              className="send-button"
            >
              Send
            </button>
          </div>
        </form>

        {loading && (
          <div className="loading-indicator">
            <p>Loading...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {response && !loading && (
          <div className="results">
            <div className="answer-section">
              <h2>Answer</h2>
              <p className="answer-text">{response.answer}</p>
            </div>
            
            {response.sources && response.sources.length > 0 && (
              <div className="sources-section">
                <h2>Sources</h2>
                <ul className="sources-list">
                  {response.sources.map((source, index) => (
                    <li key={index} className="source-item">
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="source-link"
                      >
                        {source.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App

