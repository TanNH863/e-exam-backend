import { Test, TestingModule } from '@nestjs/testing';
import { QuestionService } from './question.service';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('QuestionService', () => {
  let service: QuestionService;
  let poolMock: any;

  beforeEach(async () => {
    poolMock = {
      connect: jest.fn(),
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionService,
        {
          provide: 'PG_POOL',
          useValue: poolMock,
        },
      ],
    }).compile();

    service = module.get<QuestionService>(QuestionService);
  });

  it('create should insert question and options and return question with options', async () => {
    const createdQuestion = {
      id: 'qid',
      exam_id: 'exam1',
      question_text: 'Q? ',
      question_type: 'MULTIPLE_CHOICE',
      order: 1,
    };

    const createDto: any = {
      exam_id: 'exam1',
      question_text: 'Q? ',
      question_type: 'MULTIPLE_CHOICE',
      order: 1,
      options: [
        { option_text: 'A', is_correct: true },
        { option_text: 'B', is_correct: false },
      ],
    };

    const client = {
      query: jest.fn(),
      release: jest.fn(),
    };

    // Mock sequence: BEGIN, insert question, insert option x2, COMMIT
    client.query.mockImplementation(async (text: string, params?: any[]) => {
      if (text === 'BEGIN') return {};
      if (text.includes('INSERT INTO questions'))
        return { rows: [createdQuestion] };
      if (text.includes('INSERT INTO options')) {
        return {
          rows: [
            {
              id: 'oid',
              question_id: params?.[1],
              option_text: params?.[2],
              is_correct: params?.[3],
            },
          ],
        };
      }
      if (text === 'COMMIT') return {};
      return {};
    });

    poolMock.connect.mockResolvedValue(client);

    const res = await service.create(createDto);
    expect(res.id).toBe(createdQuestion.id);
    expect(res.options).toHaveLength(2);

    // Ensure option inserts used the created question id
    const optionCalls = client.query.mock.calls.filter((c: any[]) =>
      c[0].includes('INSERT INTO options'),
    );
    expect(optionCalls.length).toBe(2);
    optionCalls.forEach((call: any[]) => {
      expect(call[1]?.[1]).toBe(createdQuestion.id);
    });

    expect(client.release).toHaveBeenCalled();
  });

  it('create should rollback on option insert failure', async () => {
    const createdQuestion = {
      id: 'qid',
      exam_id: 'exam1',
      question_text: 'Q? ',
      question_type: 'MULTIPLE_CHOICE',
      order: 1,
    };

    const createDto: any = {
      exam_id: 'exam1',
      question_text: 'Q? ',
      question_type: 'MULTIPLE_CHOICE',
      order: 1,
      options: [{ option_text: 'A', is_correct: true }],
    };

    const client = {
      query: jest.fn(),
      release: jest.fn(),
    };

    client.query.mockImplementation(async (text: string, params?: any[]) => {
      if (text === 'BEGIN') return {};
      if (text.includes('INSERT INTO questions'))
        return { rows: [createdQuestion] };
      if (text.includes('INSERT INTO options'))
        throw new Error('option insert failed');
      if (text === 'ROLLBACK') return {};
      return {};
    });

    poolMock.connect.mockResolvedValue(client);

    await expect(service.create(createDto)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );

    // Ensure rollback was called
    const rollbackCall = client.query.mock.calls.find(
      (c: any[]) => c[0] === 'ROLLBACK',
    );
    expect(rollbackCall).toBeDefined();
    expect(client.release).toHaveBeenCalled();
  });

  it('findOne should attach options', async () => {
    const question = {
      id: 'qid',
      exam_id: 'exam1',
      question_text: 'Q?',
      question_type: 'MULTIPLE_CHOICE',
      order: 1,
    };
    const option = {
      id: 'oid',
      question_id: 'qid',
      option_text: 'A',
      is_correct: true,
    };

    poolMock.query.mockImplementation(async (text: string, params?: any[]) => {
      if (text.includes('SELECT * FROM questions WHERE id'))
        return { rows: [question] };
      if (text.includes('SELECT * FROM options WHERE question_id'))
        return { rows: [option], rowCount: 1 };
      return { rows: [] };
    });

    const res = await service.findOne('qid');
    expect(res).toBeDefined();
    expect((res as any).options).toBeDefined();
    expect((res as any).options[0].question_id).toBe('qid');
  });

  it('findAll should attach options for each question', async () => {
    const question = {
      id: 'qid',
      exam_id: 'exam1',
      question_text: 'Q?',
      question_type: 'MULTIPLE_CHOICE',
      order: 1,
    };
    const option = {
      id: 'oid',
      question_id: 'qid',
      option_text: 'A',
      is_correct: true,
    };

    poolMock.query.mockImplementation(async (text: string, params?: any[]) => {
      if (text.includes('SELECT * FROM questions')) return { rows: [question] };
      if (text.includes('SELECT * FROM options WHERE question_id'))
        return { rows: [option], rowCount: 1 };
      return { rows: [] };
    });

    const res = await service.findAllByExam('exam1');
    expect(res).toHaveLength(1);
    expect((res[0] as any).options).toBeDefined();
    expect((res[0] as any).options[0].question_id).toBe('qid');
  });

  it('findOne should throw NotFoundException when question missing', async () => {
    poolMock.query.mockResolvedValue({ rows: [] });
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
