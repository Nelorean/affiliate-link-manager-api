const request = require('supertest');

const app = require('../src/app');

describe('GET /health', () => {
  it('deve retornar o status da API', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
    });
  });
  it('deve retornar se é json', async () => {
    const response = await request(app).get('/health');
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body).toEqual({
      status: 'ok',
    });
  });
});
