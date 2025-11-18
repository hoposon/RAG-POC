import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

// Mock the logger
vi.mock('./logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}))

describe('App Component', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render the app with input and send button', () => {
    render(<App />)

    expect(screen.getByText('RAG POC')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your question...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
  })

  it('should disable send button when input is empty', () => {
    render(<App />)

    const sendButton = screen.getByRole('button', { name: /send/i })
    expect(sendButton).toBeDisabled()
  })

  it('should enable send button when input has text', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('Enter your question...')
    const sendButton = screen.getByRole('button', { name: /send/i })

    await user.type(input, 'test question')
    expect(sendButton).not.toBeDisabled()
  })

  it('should show loading indicator when submitting', async () => {
    const user = userEvent.setup()
    
    // Mock a delayed fetch response
    global.fetch = vi.fn((): Promise<Response> =>
      new Promise((resolve) =>
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({
            answer: 'Test answer',
            sources: [{ title: 'Test Source', url: 'https://example.com' }],
          }),
        } as Response), 100)
      )
    ) as typeof fetch

    render(<App />)

    const input = screen.getByPlaceholderText('Enter your question...')
    const sendButton = screen.getByRole('button', { name: /send/i })

    await user.type(input, 'test question')
    await user.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
    
    expect(sendButton).toBeDisabled()
    expect(input).toBeDisabled()
  })

  it('should display answer and sources after successful response', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      answer: 'This is a test answer',
      sources: [
        { title: 'Source 1', url: 'https://example.com/1' },
        { title: 'Source 2', url: 'https://example.com/2' },
      ],
    }

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => mockResponse,
      } as Response)
    )

    render(<App />)

    const input = screen.getByPlaceholderText('Enter your question...')
    const sendButton = screen.getByRole('button', { name: /send/i })

    await user.type(input, 'test question')
    await user.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText('Answer')).toBeInTheDocument()
      expect(screen.getByText('This is a test answer')).toBeInTheDocument()
      expect(screen.getByText('Sources')).toBeInTheDocument()
      expect(screen.getByText('Source 1')).toBeInTheDocument()
      expect(screen.getByText('Source 2')).toBeInTheDocument()
    })

    // Check that sources are links
    const sourceLinks = screen.getAllByRole('link')
    expect(sourceLinks[0]).toHaveAttribute('href', 'https://example.com/1')
    expect(sourceLinks[1]).toHaveAttribute('href', 'https://example.com/2')
  })

  it('should display error message on API error', async () => {
    const user = userEvent.setup()

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        statusText: 'Internal Server Error',
      } as Response)
    )

    render(<App />)

    const input = screen.getByPlaceholderText('Enter your question...')
    const sendButton = screen.getByRole('button', { name: /send/i })

    await user.type(input, 'test question')
    await user.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText(/We are sorry but there was an error on our side/i)).toBeInTheDocument()
    })
  })

  it('should display error message on network error', async () => {
    const user = userEvent.setup()

    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')))

    render(<App />)

    const input = screen.getByPlaceholderText('Enter your question...')
    const sendButton = screen.getByRole('button', { name: /send/i })

    await user.type(input, 'test question')
    await user.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText(/We are sorry but there was an error on our side/i)).toBeInTheDocument()
    })
  })

  it('should display error message on invalid response format', async () => {
    const user = userEvent.setup()

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ invalid: 'response' }),
      } as Response)
    )

    render(<App />)

    const input = screen.getByPlaceholderText('Enter your question...')
    const sendButton = screen.getByRole('button', { name: /send/i })

    await user.type(input, 'test question')
    await user.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText(/We are sorry but there was an error on our side/i)).toBeInTheDocument()
    })
  })

  it('should clear previous response when submitting new query', async () => {
    const user = userEvent.setup()
    const mockResponse1 = {
      answer: 'First answer',
      sources: [{ title: 'Source 1', url: 'https://example.com/1' }],
    }

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => mockResponse1,
      } as Response)
    )

    render(<App />)

    const input = screen.getByPlaceholderText('Enter your question...')
    const sendButton = screen.getByRole('button', { name: /send/i })

    // Submit first query
    await user.type(input, 'first question')
    await user.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText('First answer')).toBeInTheDocument()
    })

    // Clear input and submit second query
    await user.clear(input)
    
    const mockResponse2 = {
      answer: 'Second answer',
      sources: [{ title: 'Source 2', url: 'https://example.com/2' }],
    }

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => mockResponse2,
      } as Response)
    )

    await user.type(input, 'second question')
    await user.click(sendButton)

    await waitFor(() => {
      expect(screen.queryByText('First answer')).not.toBeInTheDocument()
      expect(screen.getByText('Second answer')).toBeInTheDocument()
    })
  })
})
