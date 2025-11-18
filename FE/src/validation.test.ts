import { describe, it, expect } from 'vitest'
import { isValidApiResponse } from './App'

// We need to export the validation function to test it
// This is a workaround - in a real app, you'd extract this to a separate utility file
describe('API Response Validation', () => {
  it('should validate a correct response', () => {
    const validResponse = {
      answer: 'This is an answer',
      sources: [
        { title: 'Source 1', url: 'https://example.com/1' },
        { title: 'Source 2', url: 'https://example.com/2' },
      ],
    }

    expect(isValidApiResponse(validResponse)).toBe(true)
  })

  it('should reject response without answer', () => {
    const invalidResponse = {
      sources: [{ title: 'Source 1', url: 'https://example.com/1' }],
    }

    expect(isValidApiResponse(invalidResponse)).toBe(false)
  })

  it('should reject response with non-string answer', () => {
    const invalidResponse = {
      answer: 123,
      sources: [{ title: 'Source 1', url: 'https://example.com/1' }],
    }

    expect(isValidApiResponse(invalidResponse)).toBe(false)
  })

  it('should reject response without sources', () => {
    const invalidResponse = {
      answer: 'This is an answer',
    }

    expect(isValidApiResponse(invalidResponse)).toBe(false)
  })

  it('should reject response with non-array sources', () => {
    const invalidResponse = {
      answer: 'This is an answer',
      sources: 'not an array',
    }

    expect(isValidApiResponse(invalidResponse)).toBe(false)
  })

  it('should reject response with sources missing title', () => {
    const invalidResponse = {
      answer: 'This is an answer',
      sources: [{ url: 'https://example.com/1' }],
    }

    expect(isValidApiResponse(invalidResponse)).toBe(false)
  })

  it('should reject response with sources missing url', () => {
    const invalidResponse = {
      answer: 'This is an answer',
      sources: [{ title: 'Source 1' }],
    }

    expect(isValidApiResponse(invalidResponse)).toBe(false)
  })

  it('should reject response with non-string source title', () => {
    const invalidResponse = {
      answer: 'This is an answer',
      sources: [{ title: 123, url: 'https://example.com/1' }],
    }

    expect(isValidApiResponse(invalidResponse)).toBe(false)
  })

  it('should reject response with non-string source url', () => {
    const invalidResponse = {
      answer: 'This is an answer',
      sources: [{ title: 'Source 1', url: 123 }],
    }

    expect(isValidApiResponse(invalidResponse)).toBe(false)
  })

  it('should reject null response', () => {
    expect(isValidApiResponse(null)).toBe(false)
  })

  it('should reject non-object response', () => {
    expect(isValidApiResponse('string')).toBe(false)
    expect(isValidApiResponse(123)).toBe(false)
    expect(isValidApiResponse([])).toBe(false)
  })

  it('should accept empty sources array', () => {
    const validResponse = {
      answer: 'This is an answer',
      sources: [],
    }

    expect(isValidApiResponse(validResponse)).toBe(true)
  })
})

