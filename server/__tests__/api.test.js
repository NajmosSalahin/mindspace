import request from 'supertest';
import express from 'express';

const app = express();
app.use(express.json());
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'EventSphere API is running' });
});

describe('Health Check', () => {
  it('GET /api/health returns 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/EventSphere/i);
  });
});

describe('404 Handler', () => {
  it('GET /api/nonexistent returns 404', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
  });
});
