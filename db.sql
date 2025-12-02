-- Enable the pgcrypto extension to use gen_random_uuid() for UUID generation.
CREATE EXTENSION
IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- ENUM TYPES
-- -----------------------------------------------------------------------------
-- Define custom ENUM types to ensure data consistency for specific fields.

CREATE TYPE user_role AS ENUM
('STUDENT', 'TEACHER', 'ADMIN');
CREATE TYPE question_type AS ENUM
('MULTIPLE_CHOICE', 'SHORT_ANSWER', 'MULTIPLE_ANSWER', 'TRUE_FALSE');
CREATE TYPE submission_status AS ENUM
('IN_PROGRESS', 'COMPLETED', 'GRADED');
CREATE TYPE exam_status AS ENUM
('DRAFT', 'PUBLISHED', 'COMPLETED');

-- Table to store user information and roles.
CREATE TABLE users
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE users IS 'Stores user accounts and their roles within the platform.';

-- Table to store exam metadata.
CREATE TABLE exams
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL,
    status exam_status NOT NULL DEFAULT 'DRAFT',
    created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE exams IS 'Contains the core information about each exam.';

-- Table for the questions within each exam.
CREATE TABLE questions
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type question_type NOT NULL,
    "order" INTEGER NOT NULL,
    -- A unique constraint on exam_id and order ensures question order is unique per exam.
    UNIQUE(exam_id, "order")
);
COMMENT ON TABLE questions IS 'Stores individual questions linked to an exam.';

-- Table for the options available for multiple-choice questions.
CREATE TABLE options
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE
);
COMMENT ON TABLE options IS 'Stores the answer choices for multiple-choice or multiple-answer questions.';

-- Table to track each student''s submission for an exam.
CREATE TABLE exam_submissions
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status submission_status NOT NULL DEFAULT 'IN_PROGRESS',
    score REAL,
    -- Can be NULL until grading is complete.
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    -- A student can only have one submission per exam.
    UNIQUE(exam_id, student_id)
);
COMMENT ON TABLE exam_submissions IS 'Tracks the state and result of a student''s attempt at an exam.';

-- Table to store a student''s specific answers for each question in a submission.
CREATE TABLE student_answers
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES exam_submissions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    chosen_option_id UUID REFERENCES options(id) ON DELETE SET NULL,
    -- For single-choice questions
    short_answer_text TEXT,
    -- For short-answer questions
    -- A student can only provide one answer per question in a single submission.
    UNIQUE(submission_id, question_id)
);
COMMENT ON TABLE student_answers IS 'Records the actual answers given by a student for each question.';

-- Junction table for multiple-answer questions, if a student selects more than one option.
CREATE TABLE student_multi_answers
(
    student_answer_id UUID NOT NULL REFERENCES student_answers(id) ON DELETE CASCADE,
    chosen_option_id UUID NOT NULL REFERENCES options(id) ON DELETE CASCADE,
    PRIMARY KEY (student_answer_id, chosen_option_id)
);
COMMENT ON TABLE student_multi_answers IS 'A junction table to support multiple selected options for a single question.';

-- -----------------------------------------------------------------------------
-- INDEXES
-- -----------------------------------------------------------------------------
-- Create indexes on frequently queried columns (foreign keys) to improve performance.

CREATE INDEX idx_exams_created_by ON exams(created_by_id);
CREATE INDEX idx_questions_exam_id ON questions(exam_id);
CREATE INDEX idx_options_question_id ON options(question_id);
CREATE INDEX idx_exam_submissions_student_id ON exam_submissions(student_id);
CREATE INDEX idx_student_answers_submission_id ON student_answers(submission_id);
CREATE INDEX idx_student_answers_question_id ON student_answers(question_id);