import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { app, mockRAGService } from './index'

describe('Backend API Tests', () => {
  describe('POST /chat', () => {
    it('should return a valid response with answer and sources', async () => {
      const response = await request(app)
        .post('/chat')
        .send({ question: 'What is RAG?' })
        .expect(200)

      expect(response.body).toHaveProperty('answer')
      expect(response.body).toHaveProperty('sources')
      expect(typeof response.body.answer).toBe('string')
      expect(Array.isArray(response.body.sources)).toBe(true)
      expect(response.body.sources.length).toBeGreaterThan(0)
      
      // Validate source structure
      response.body.sources.forEach((source: { title: string; url: string }) => {
        expect(source).toHaveProperty('title')
        expect(source).toHaveProperty('url')
        expect(typeof source.title).toBe('string')
        expect(typeof source.url).toBe('string')
      })
    })

    it('should return 400 if question is missing', async () => {
      const response = await request(app)
        .post('/chat')
        .send({})
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Invalid request')
    })

    it('should return 400 if question is not a string', async () => {
      const response = await request(app)
        .post('/chat')
        .send({ question: 123 })
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Invalid request')
    })

    it('should return 400 if question is an empty string', async () => {
      const response = await request(app)
        .post('/chat')
        .send({ question: '' })
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should handle different question inputs', async () => {
      const questions = [
        'election results latest',
        'stock market news',
        'celebrity news today'
      ]

      for (const question of questions) {
        const response = await request(app)
          .post('/chat')
          .send({ question })
          .expect(200)

        expect(response.body).toHaveProperty('answer')
        expect(response.body).toHaveProperty('sources')
      }
    })
  })

  describe('mockRAGService', () => {
    it('should return a response with the correct structure', async () => {
      const result = await mockRAGService('test question')

      expect(result).toHaveProperty('answer')
      expect(result).toHaveProperty('sources')
      expect(typeof result.answer).toBe('string')
      expect(Array.isArray(result.sources)).toBe(true)
    })

    it('should return sources with title and url', async () => {
      const result = await mockRAGService('test question')

      result.sources.forEach((source) => {
        expect(source).toHaveProperty('title')
        expect(source).toHaveProperty('url')
        expect(typeof source.title).toBe('string')
        expect(typeof source.url).toBe('string')
      })
    })

    it('should return the same response structure regardless of question', async () => {
      const result1 = await mockRAGService('question 1')
      const result2 = await mockRAGService('question 2')

      expect(result1.sources.length).toBe(result2.sources.length)
      expect(result1.sources[0].title).toBe(result2.sources[0].title)
    })
  })
})

