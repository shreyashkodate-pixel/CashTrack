-- V1: Initial Schema
-- Creates the categories and expenses tables with triggers for updated_at

CREATE TABLE categories (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name          VARCHAR(100) NOT NULL UNIQUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE expenses (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title         VARCHAR(120) NOT NULL,
    amount        NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    category_id   BIGINT NOT NULL REFERENCES categories(id),
    expense_date  DATE NOT NULL,
    description   TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger function to auto-update updated_at column
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_expenses_updated_at
BEFORE UPDATE ON expenses
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
