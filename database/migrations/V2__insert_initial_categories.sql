INSERT INTO categories (name) VALUES 
    ('Food'),
    ('Transport'),
    ('Shopping'),
    ('Bills'),
    ('Health'),
    ('Entertainment'),
    ('Other')
ON CONFLICT (name) DO NOTHING;
