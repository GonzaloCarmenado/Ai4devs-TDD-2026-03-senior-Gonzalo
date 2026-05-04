import { addCandidate } from './candidateService';
import { Candidate } from '../../domain/models/Candidate';
import { Education } from '../../domain/models/Education';
import { WorkExperience } from '../../domain/models/WorkExperience';
import { Resume } from '../../domain/models/Resume';

jest.mock('../../domain/models/Candidate');
jest.mock('../../domain/models/Education');
jest.mock('../../domain/models/WorkExperience');
jest.mock('../../domain/models/Resume');

const MockCandidate = Candidate as jest.MockedClass<typeof Candidate>;
const MockEducation = Education as jest.MockedClass<typeof Education>;
const MockWorkExperience = WorkExperience as jest.MockedClass<typeof WorkExperience>;
const MockResume = Resume as jest.MockedClass<typeof Resume>;

const mockCandidateSave = jest.fn();
const mockEducationSave = jest.fn();
const mockWorkExperienceSave = jest.fn();
const mockResumeSave = jest.fn();

const savedCandidate = {
  id: 42,
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: null,
  address: null,
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

describe('addCandidate — happy path', () => {
  const validData = {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
  };

  it('should save the candidate and return the result', async () => {
    const result = await addCandidate(validData);

    expect(mockCandidateSave).toHaveBeenCalledTimes(1);
    expect(result).toEqual(savedCandidate);
  });

  it('should not save educations when none are provided', async () => {
    await addCandidate(validData);

    expect(MockEducation).not.toHaveBeenCalled();
  });

  it('should not save work experiences when none are provided', async () => {
    await addCandidate(validData);

    expect(MockWorkExperience).not.toHaveBeenCalled();
  });

  it('should not save cv when it is an empty object', async () => {
    await addCandidate({ ...validData, cv: {} });

    expect(MockResume).not.toHaveBeenCalled();
  });
});

describe('addCandidate — educations', () => {
  const validData = {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
  };

  const educationData = { institution: 'MIT', title: 'CS', startDate: '2020-01-01' };

  it('should create and save each education entry', async () => {
    await addCandidate({ ...validData, educations: [educationData] });

    expect(MockEducation).toHaveBeenCalledWith(educationData);
    expect(mockEducationSave).toHaveBeenCalledTimes(1);
  });

  it('should assign the saved candidate id to each education', async () => {
    await addCandidate({ ...validData, educations: [educationData] });

    const educationInstance = MockEducation.mock.results[0].value;
    expect(educationInstance.candidateId).toBe(savedCandidate.id);
  });

  it('should save all educations when multiple are provided', async () => {
    const educations = [
      { institution: 'MIT', title: 'CS', startDate: '2020-01-01' },
      { institution: 'Harvard', title: 'MBA', startDate: '2022-01-01' },
    ];

    await addCandidate({ ...validData, educations });

    expect(MockEducation).toHaveBeenCalledTimes(2);
    expect(mockEducationSave).toHaveBeenCalledTimes(2);
  });
});

describe('addCandidate — workExperiences', () => {
  const validData = {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
  };

  const experienceData = { company: 'Acme', position: 'Engineer', startDate: '2021-01-01' };

  it('should create and save each work experience entry', async () => {
    await addCandidate({ ...validData, workExperiences: [experienceData] });

    expect(MockWorkExperience).toHaveBeenCalledWith(experienceData);
    expect(mockWorkExperienceSave).toHaveBeenCalledTimes(1);
  });

  it('should assign the saved candidate id to each work experience', async () => {
    await addCandidate({ ...validData, workExperiences: [experienceData] });

    const expInstance = MockWorkExperience.mock.results[0].value;
    expect(expInstance.candidateId).toBe(savedCandidate.id);
  });
});

describe('addCandidate — cv', () => {
  const validData = {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
  };

  const cvData = { filePath: '/uploads/cv.pdf', fileType: 'application/pdf' };

  it('should create and save the cv when provided', async () => {
    await addCandidate({ ...validData, cv: cvData });

    expect(MockResume).toHaveBeenCalledWith(cvData);
    expect(mockResumeSave).toHaveBeenCalledTimes(1);
  });

  it('should assign the saved candidate id to the cv', async () => {
    await addCandidate({ ...validData, cv: cvData });

    const resumeInstance = MockResume.mock.results[0].value;
    expect(resumeInstance.candidateId).toBe(savedCandidate.id);
  });
});

describe('addCandidate — error handling', () => {
  const validData = {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
  };

  it('should throw when candidate data fails validation', async () => {
    await expect(
      addCandidate({ ...validData, firstName: '' })
    ).rejects.toThrow('Invalid name');
  });

  it('should throw a descriptive error when email already exists (P2002)', async () => {
    mockCandidateSave.mockRejectedValue({ code: 'P2002' });

    await expect(addCandidate(validData)).rejects.toThrow(
      'The email already exists in the database'
    );
  });

  it('should rethrow unexpected errors from save as-is', async () => {
    const dbError = new Error('Connection timeout');
    mockCandidateSave.mockRejectedValue(dbError);

    await expect(addCandidate(validData)).rejects.toThrow('Connection timeout');
  });
});
