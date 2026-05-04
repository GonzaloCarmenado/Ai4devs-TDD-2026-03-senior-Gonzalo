import request from 'supertest';
import { app } from '../index';
import { validateCandidateData } from '../application/validator';
import { addCandidate } from '../application/services/candidateService';
import { Candidate } from '../domain/models/Candidate';
import { Education } from '../domain/models/Education';
import { WorkExperience } from '../domain/models/WorkExperience';
import { Resume } from '../domain/models/Resume';

// El servicio se mockea para los tests HTTP del endpoint.
// Para los tests del servicio en sí usamos jest.requireActual (ver abajo).
jest.mock('../application/services/candidateService');
jest.mock('../domain/models/Candidate');
jest.mock('../domain/models/Education');
jest.mock('../domain/models/WorkExperience');
jest.mock('../domain/models/Resume');

// Implementación real del servicio (con los modelos ya mockeados)
const { addCandidate: realAddCandidate } = jest.requireActual(
  '../application/services/candidateService'
);

const MockCandidate = Candidate as jest.MockedClass<typeof Candidate>;
const MockEducation = Education as jest.MockedClass<typeof Education>;
const MockWorkExperience = WorkExperience as jest.MockedClass<typeof WorkExperience>;
const MockResume = Resume as jest.MockedClass<typeof Resume>;

const mockCandidateSave = jest.fn();
const mockEducationSave = jest.fn();
const mockWorkExperienceSave = jest.fn();
const mockResumeSave = jest.fn();

const savedCandidate = {
  id: 1,
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: null,
  address: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// FAMILIA 1: Recepción y validación de datos del formulario
// ─────────────────────────────────────────────────────────────────────────────

describe('Familia 1 — Validación de datos del candidato', () => {
  const validCandidate = {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
  };

  describe('Campos obligatorios', () => {
    it('should accept a candidate with valid required fields', () => {
      expect(() => validateCandidateData(validCandidate)).not.toThrow();
    });

    it('should reject when firstName is empty', () => {
      expect(() =>
        validateCandidateData({ ...validCandidate, firstName: '' })
      ).toThrow('Invalid name');
    });

    it('should reject when lastName is empty', () => {
      expect(() =>
        validateCandidateData({ ...validCandidate, lastName: '' })
      ).toThrow('Invalid name');
    });

    it('should reject when email has invalid format', () => {
      expect(() =>
        validateCandidateData({ ...validCandidate, email: 'not-an-email' })
      ).toThrow('Invalid email');
    });

    it('should skip validation when id is present (edit mode)', () => {
      expect(() => validateCandidateData({ id: 1 })).not.toThrow();
    });
  });

  describe('Campos opcionales', () => {
    it('should accept a valid Spanish mobile number', () => {
      expect(() =>
        validateCandidateData({ ...validCandidate, phone: '612345678' })
      ).not.toThrow();
    });

    it('should reject a phone number that does not start with 6, 7 or 9', () => {
      expect(() =>
        validateCandidateData({ ...validCandidate, phone: '512345678' })
      ).toThrow('Invalid phone');
    });

    it('should reject an address longer than 100 characters', () => {
      expect(() =>
        validateCandidateData({ ...validCandidate, address: 'A'.repeat(101) })
      ).toThrow('Invalid address');
    });
  });

  describe('Educación', () => {
    const validEducation = {
      institution: 'MIT',
      title: 'Computer Science',
      startDate: '2020-01-01',
    };

    it('should accept a valid education entry', () => {
      expect(() =>
        validateCandidateData({ ...validCandidate, educations: [validEducation] })
      ).not.toThrow();
    });

    it('should reject education with missing institution', () => {
      expect(() =>
        validateCandidateData({
          ...validCandidate,
          educations: [{ ...validEducation, institution: '' }],
        })
      ).toThrow('Invalid institution');
    });

    it('should reject education with invalid startDate format', () => {
      expect(() =>
        validateCandidateData({
          ...validCandidate,
          educations: [{ ...validEducation, startDate: '01-01-2020' }],
        })
      ).toThrow('Invalid date');
    });
  });

  describe('Experiencia laboral', () => {
    const validExperience = {
      company: 'Acme Corp',
      position: 'Engineer',
      startDate: '2021-06-01',
    };

    it('should accept a valid work experience entry', () => {
      expect(() =>
        validateCandidateData({ ...validCandidate, workExperiences: [validExperience] })
      ).not.toThrow();
    });

    it('should reject work experience with missing company', () => {
      expect(() =>
        validateCandidateData({
          ...validCandidate,
          workExperiences: [{ ...validExperience, company: '' }],
        })
      ).toThrow('Invalid company');
    });

    it('should reject a description longer than 200 characters', () => {
      expect(() =>
        validateCandidateData({
          ...validCandidate,
          workExperiences: [{ ...validExperience, description: 'D'.repeat(201) }],
        })
      ).toThrow('Invalid description');
    });
  });

  describe('CV', () => {
    it('should accept a valid cv object', () => {
      expect(() =>
        validateCandidateData({
          ...validCandidate,
          cv: { filePath: '/uploads/cv.pdf', fileType: 'application/pdf' },
        })
      ).not.toThrow();
    });

    it('should reject a cv without filePath', () => {
      expect(() =>
        validateCandidateData({
          ...validCandidate,
          cv: { fileType: 'application/pdf' },
        })
      ).toThrow('Invalid CV data');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FAMILIA 2: Guardado en base de datos
// ─────────────────────────────────────────────────────────────────────────────

describe('Familia 2 — Guardado en base de datos', () => {
  const validData = {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockCandidateSave.mockResolvedValue(savedCandidate);
    mockEducationSave.mockResolvedValue({});
    mockWorkExperienceSave.mockResolvedValue({});
    mockResumeSave.mockResolvedValue({});

    MockCandidate.mockImplementation(() => ({
      save: mockCandidateSave,
      education: [],
      workExperience: [],
      resumes: [],
    } as unknown as Candidate));

    MockEducation.mockImplementation((data: any) => ({
      save: mockEducationSave,
      candidateId: data.candidateId,
    } as unknown as Education));

    MockWorkExperience.mockImplementation((data: any) => ({
      save: mockWorkExperienceSave,
      candidateId: data.candidateId,
    } as unknown as WorkExperience));

    MockResume.mockImplementation((data: any) => ({
      save: mockResumeSave,
      candidateId: data.candidateId,
    } as unknown as Resume));
  });

  describe('Candidato', () => {
    it('should save the candidate and return the persisted record', async () => {
      const result = await realAddCandidate(validData);

      expect(mockCandidateSave).toHaveBeenCalledTimes(1);
      expect(result).toEqual(savedCandidate);
    });

    it('should throw "The email already exists" on duplicate email (P2002)', async () => {
      mockCandidateSave.mockRejectedValue({ code: 'P2002' });

      await expect(realAddCandidate(validData)).rejects.toThrow(
        'The email already exists in the database'
      );
    });

    it('should propagate unexpected database errors', async () => {
      mockCandidateSave.mockRejectedValue(new Error('Connection timeout'));

      await expect(realAddCandidate(validData)).rejects.toThrow('Connection timeout');
    });
  });

  describe('Educación asociada al candidato', () => {
    const educationData = { institution: 'MIT', title: 'CS', startDate: '2020-01-01' };

    it('should save education and link it to the candidate', async () => {
      await realAddCandidate({ ...validData, educations: [educationData] });

      expect(MockEducation).toHaveBeenCalledWith(educationData);
      expect(mockEducationSave).toHaveBeenCalledTimes(1);
      expect(MockEducation.mock.results[0].value.candidateId).toBe(savedCandidate.id);
    });

    it('should save all entries when multiple educations are provided', async () => {
      const educations = [
        { institution: 'MIT', title: 'CS', startDate: '2020-01-01' },
        { institution: 'Harvard', title: 'MBA', startDate: '2022-01-01' },
      ];

      await realAddCandidate({ ...validData, educations });

      expect(mockEducationSave).toHaveBeenCalledTimes(2);
    });
  });

  describe('Experiencia laboral asociada al candidato', () => {
    const experienceData = { company: 'Acme', position: 'Engineer', startDate: '2021-01-01' };

    it('should save work experience and link it to the candidate', async () => {
      await realAddCandidate({ ...validData, workExperiences: [experienceData] });

      expect(MockWorkExperience).toHaveBeenCalledWith(experienceData);
      expect(mockWorkExperienceSave).toHaveBeenCalledTimes(1);
      expect(MockWorkExperience.mock.results[0].value.candidateId).toBe(savedCandidate.id);
    });
  });

  describe('CV asociado al candidato', () => {
    const cvData = { filePath: '/uploads/cv.pdf', fileType: 'application/pdf' };

    it('should save the cv and link it to the candidate', async () => {
      await realAddCandidate({ ...validData, cv: cvData });

      expect(MockResume).toHaveBeenCalledWith(cvData);
      expect(mockResumeSave).toHaveBeenCalledTimes(1);
      expect(MockResume.mock.results[0].value.candidateId).toBe(savedCandidate.id);
    });

    it('should not save cv when the cv object is empty', async () => {
      await realAddCandidate({ ...validData, cv: {} });

      expect(MockResume).not.toHaveBeenCalled();
    });
  });

  describe('Endpoint POST /candidates', () => {
    const mockAddCandidate = jest.mocked(addCandidate);

    it('should return 201 with the candidate on success', async () => {
      mockAddCandidate.mockResolvedValue(savedCandidate);

      const res = await request(app).post('/candidates').send(validData);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ id: 1, firstName: 'Ada' });
    });

    it('should return 400 when the service throws a known error', async () => {
      mockAddCandidate.mockRejectedValue(new Error('Invalid name'));

      const res = await request(app).post('/candidates').send({ ...validData, firstName: '' });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ message: 'Invalid name' });
    });
  });
});
