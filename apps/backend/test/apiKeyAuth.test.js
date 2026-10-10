process.env.NODE_ENV = 'test';
process.env.API_KEY = 'test-api-key';

const request = require('supertest');

jest.mock('../src/services/mongoService', () => ({
  findImageAnalysisByName: jest.fn().mockResolvedValue({ ImgName: 'a.png', ImgContent: 'hi' }),
}));

const createApp = require('../src/app');

describe('apiKeyAuth middleware', () => {
  const app = createApp();

  it('rejects requests with no API key', async () => {
    const res = await request(app).get('/analysis/image').query({ name: 'a.png' });
    expect(res.status).toBe(401);
  });

  it('rejects requests with the wrong API key', async () => {
    const res = await request(app)
      .get('/analysis/image')
      .set('x-api-key', 'wrong-key')
      .query({ name: 'a.png' });
    expect(res.status).toBe(401);
  });

  it('allows requests with the correct API key', async () => {
    const res = await request(app)
      .get('/analysis/image')
      .set('x-api-key', 'test-api-key')
      .query({ name: 'a.png' });
    expect(res.status).toBe(200);
  });
});
