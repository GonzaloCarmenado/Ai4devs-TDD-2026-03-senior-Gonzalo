import { validateCandidateData } from './validator';

const validCandidate = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
};

describe('validateCandidateData', () => {
  it('should not throw for valid candidate data', () => {
    expect(() => validateCandidateData(validCandidate)).not.toThrow();
  });

  it('should skip all validation when id is provided (edit mode)', () => {
    expect(() => validateCandidateData({ id: 1 })).not.toThrow();
  });
});

describe('validateCandidateData — firstName', () => {
  test.each([
    ['', 'empty string'],
    ['A', 'single character'],
    ['A'.repeat(101), 'over 100 characters'],
    ['Ada123', 'contains numbers'],
    ['Ada!', 'contains special characters'],
  ])('should throw "Invalid name" when firstName is "%s" (%s)', (firstName) => {
    expect(() =>
      validateCandidateData({ ...validCandidate, firstName })
    ).toThrow('Invalid name');
  });

  test.each([
    ['Ada', 'minimum valid length'],
    ['María José', 'contains space and accent'],
    ['Ñoño', 'contains ñ'],
  ])('should not throw when firstName is "%s" (%s)', (firstName) => {
    expect(() =>
      validateCandidateData({ ...validCandidate, firstName })
    ).not.toThrow();
  });
});

describe('validateCandidateData — lastName', () => {
  test.each([
    ['', 'empty string'],
    ['L', 'single character'],
    ['L'.repeat(101), 'over 100 characters'],
    ['Love1ace', 'contains numbers'],
  ])('should throw "Invalid name" when lastName is "%s" (%s)', (lastName) => {
    expect(() =>
      validateCandidateData({ ...validCandidate, lastName })
    ).toThrow('Invalid name');
  });
});

describe('validateCandidateData — email', () => {
  test.each([
    ['not-an-email', 'missing @ and domain'],
    ['missing@domain', 'domain without TLD'],
    ['@nodomain.com', 'missing local part'],
    ['', 'empty string'],
  ])('should throw "Invalid email" when email is "%s" (%s)', (email) => {
    expect(() =>
      validateCandidateData({ ...validCandidate, email })
    ).toThrow('Invalid email');
  });

  test.each([
    ['ada@example.com', 'standard email'],
    ['ada.lovelace+tag@sub.domain.org', 'email with plus and subdomain'],
  ])('should not throw when email is "%s" (%s)', (email) => {
    expect(() =>
      validateCandidateData({ ...validCandidate, email })
    ).not.toThrow();
  });
});

describe('validateCandidateData — phone (optional)', () => {
  it('should not throw when phone is undefined', () => {
    const { ...withoutPhone } = validCandidate;
    expect(() => validateCandidateData(withoutPhone)).not.toThrow();
  });

  test.each([
    ['600000000', 'starts with 6'],
    ['700000000', 'starts with 7'],
    ['900000000', 'starts with 9'],
  ])('should not throw when phone is "%s" (%s)', (phone) => {
    expect(() =>
      validateCandidateData({ ...validCandidate, phone })
    ).not.toThrow();
  });

  test.each([
    ['100000000', 'starts with 1'],
    ['500000000', 'starts with 5'],
    ['60000000', 'only 8 digits'],
    ['6000000000', '10 digits'],
    ['6abcdefgh', 'contains letters'],
  ])('should throw "Invalid phone" when phone is "%s" (%s)', (phone) => {
    expect(() =>
      validateCandidateData({ ...validCandidate, phone })
    ).toThrow('Invalid phone');
  });
});

describe('validateCandidateData — address (optional)', () => {
  it('should not throw when address is undefined', () => {
    expect(() => validateCandidateData(validCandidate)).not.toThrow();
  });

  it('should not throw when address is exactly 100 characters', () => {
    expect(() =>
      validateCandidateData({ ...validCandidate, address: 'A'.repeat(100) })
    ).not.toThrow();
  });

  it('should throw "Invalid address" when address exceeds 100 characters', () => {
    expect(() =>
      validateCandidateData({ ...validCandidate, address: 'A'.repeat(101) })
    ).toThrow('Invalid address');
  });
});

describe('validateCandidateData — educations', () => {
  const validEducation = {
    institution: 'MIT',
    title: 'Computer Science',
    startDate: '2020-01-01',
  };

  it('should not throw for a valid education entry', () => {
    expect(() =>
      validateCandidateData({ ...validCandidate, educations: [validEducation] })
    ).not.toThrow();
  });

  it('should not throw when endDate is a valid date', () => {
    expect(() =>
      validateCandidateData({
        ...validCandidate,
        educations: [{ ...validEducation, endDate: '2024-06-30' }],
      })
    ).not.toThrow();
  });

  test.each([
    [{ ...validEducation, institution: '' }, 'empty institution'],
    [{ ...validEducation, institution: 'I'.repeat(101) }, 'institution over 100 chars'],
    [{ ...validEducation, title: '' }, 'empty title'],
    [{ ...validEducation, title: 'T'.repeat(101) }, 'title over 100 chars'],
    [{ ...validEducation, startDate: '' }, 'missing startDate'],
    [{ ...validEducation, startDate: '01-01-2020' }, 'startDate wrong format'],
    [{ ...validEducation, endDate: '01-01-2024' }, 'endDate wrong format'],
  ])('should throw for invalid education: %s', (education, _label) => {
    expect(() =>
      validateCandidateData({ ...validCandidate, educations: [education] })
    ).toThrow();
  });
});

describe('validateCandidateData — workExperiences', () => {
  const validExperience = {
    company: 'Acme Corp',
    position: 'Engineer',
    startDate: '2020-01-01',
  };

  it('should not throw for a valid work experience entry', () => {
    expect(() =>
      validateCandidateData({ ...validCandidate, workExperiences: [validExperience] })
    ).not.toThrow();
  });

  test.each([
    [{ ...validExperience, company: '' }, 'empty company'],
    [{ ...validExperience, company: 'C'.repeat(101) }, 'company over 100 chars'],
    [{ ...validExperience, position: '' }, 'empty position'],
    [{ ...validExperience, position: 'P'.repeat(101) }, 'position over 100 chars'],
    [{ ...validExperience, description: 'D'.repeat(201) }, 'description over 200 chars'],
    [{ ...validExperience, startDate: '' }, 'missing startDate'],
    [{ ...validExperience, startDate: '01/01/2020' }, 'startDate wrong format'],
    [{ ...validExperience, endDate: '01/01/2024' }, 'endDate wrong format'],
  ])('should throw for invalid work experience: %s', (experience, _label) => {
    expect(() =>
      validateCandidateData({ ...validCandidate, workExperiences: [experience] })
    ).toThrow();
  });
});

describe('validateCandidateData — cv', () => {
  const validCv = { filePath: '/uploads/cv.pdf', fileType: 'application/pdf' };

  it('should not throw for a valid cv object', () => {
    expect(() =>
      validateCandidateData({ ...validCandidate, cv: validCv })
    ).not.toThrow();
  });

  it('should not throw when cv is an empty object', () => {
    expect(() =>
      validateCandidateData({ ...validCandidate, cv: {} })
    ).not.toThrow();
  });

  test.each([
    [{ fileType: 'application/pdf' }, 'missing filePath'],
    [{ filePath: '/cv.pdf' }, 'missing fileType'],
    [{ filePath: 123, fileType: 'pdf' }, 'filePath is not a string'],
    ['not-an-object', 'cv is a string'],
  ])('should throw "Invalid CV data" when cv is %s (%s)', (cv, _label) => {
    expect(() =>
      validateCandidateData({ ...validCandidate, cv })
    ).toThrow('Invalid CV data');
  });
});
