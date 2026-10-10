process.env.NODE_ENV = 'test';
process.env.API_KEY = 'test-api-key';

const request = require('supertest');

jest.mock('../src/services/mongoService');
jest.mock('../src/services/kafkaProducerService');

const mongoService = require('../src/services/mongoService');
const kafkaProducerService = require('../src/services/kafkaProducerService');
const createApp = require('../src/app');

describe('GET /analysis/image', () => {
  const app = createApp();

  beforeEach(() => jest.clearAllMocks());

  it('400s when "name" query param is missing', async () => {
    const res = await request(app).get('/analysis/image').set('x-api-key', 'test-api-key');
    expect(res.status).toBe(400);
  });

  it('404s when no analysis is found', async () => {
    mongoService.findImageAnalysisByName.mockResolvedValue(null);
    const res = await request(app)
      .get('/analysis/image')
      .set('x-api-key', 'test-api-key')
      .query({ name: 'missing.png' });
    expect(res.status).toBe(404);
  });

  it('returns the stored analysis for a known image', async () => {
    mongoService.findImageAnalysisByName.mockResolvedValue({ ImgName: 'a.png', ImgContent: 'hello' });
    const res = await request(app)
      .get('/analysis/image')
      .set('x-api-key', 'test-api-key')
      .query({ name: 'a.png' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ImgName: 'a.png', ImgContent: 'hello' });
  });

  it('500s and hides internal details when the lookup throws', async () => {
    mongoService.findImageAnalysisByName.mockRejectedValue(new Error('connection refused'));
    const res = await request(app)
      .get('/analysis/image')
      .set('x-api-key', 'test-api-key')
      .query({ name: 'a.png' });
    expect(res.status).toBe(500);
    expect(res.body.error).not.toMatch(/connection refused/);
  });
});

describe('POST /analysis/image', () => {
  const app = createApp();

  beforeEach(() => jest.clearAllMocks());

  it('400s when imgName or imgBase64 is missing', async () => {
    const res = await request(app)
      .post('/analysis/image')
      .set('x-api-key', 'test-api-key')
      .send({ imgName: 'a.png' });
    expect(res.status).toBe(400);
  });

  it('publishes the image and returns the producer response', async () => {
    kafkaProducerService.publishImageForAnalysis.mockResolvedValue({ offset: 1 });
    const res = await request(app)
      .post('/analysis/image')
      .set('x-api-key', 'test-api-key')
      .send({ imgName: 'a.png', imgBase64: 'YWJj' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ offset: 1 });
    expect(kafkaProducerService.publishImageForAnalysis).toHaveBeenCalledWith('a.png', 'YWJj');
  });
});
