process.env.NODE_ENV = 'test';
process.env.API_KEY = 'test-api-key';

const request = require('supertest');
const createApp = require('../src/app');

describe('GET /hello_world', () => {
  const app = createApp();

  it('responds 200 without requiring auth', async () => {
    const res = await request(app).get('/hello_world');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Hello World');
  });
});

describe('unknown routes', () => {
  const app = createApp();

  it('responds 404 with a JSON error', async () => {
    const res = await request(app).get('/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/Not found/);
  });
});
