import request from 'supertest';
import { app } from '../index';
import { addCandidate } from '../application/services/candidateService';

jest.mock('../application/services/candidateService');

const mockAddCandidate = jest.mocked(addCandidate);

describe('POST /candidates', () => {
  const validBody = {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 201 with the saved candidate on success', async () => {
    // Arrange
    const savedCandidate = { id: 1, ...validBody, phone: null, address: null };
    mockAddCandidate.mockResolvedValue(savedCandidate);

    // Act
    const res = await request(app).post('/candidates').send(validBody);

    // Assert
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 1, firstName: 'Ada', lastName: 'Lovelace' });
  });

  it('should call addCandidate with the exact request body', async () => {
    mockAddCandidate.mockResolvedValue({ id: 1, ...validBody, phone: null, address: null });

    await request(app).post('/candidates').send(validBody);

    expect(mockAddCandidate).toHaveBeenCalledTimes(1);
    expect(mockAddCandidate).toHaveBeenCalledWith(validBody);
  });

  it('should return 400 with error message when the service throws a known Error', async () => {
    mockAddCandidate.mockRejectedValue(new Error('Invalid name'));

    const res = await request(app).post('/candidates').send({ ...validBody, firstName: '' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ message: 'Invalid name' });
  });

  it('should return 400 when the email already exists in the database', async () => {
    mockAddCandidate.mockRejectedValue(
      new Error('The email already exists in the database')
    );

    const res = await request(app).post('/candidates').send(validBody);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('The email already exists in the database');
  });

  it('should return 500 when the service throws an unexpected non-Error value', async () => {
    mockAddCandidate.mockRejectedValue('unexpected string rejection');

    const res = await request(app).post('/candidates').send(validBody);

    expect(res.status).toBe(500);
    expect(res.body).toMatchObject({ message: 'An unexpected error occurred' });
  });
});
