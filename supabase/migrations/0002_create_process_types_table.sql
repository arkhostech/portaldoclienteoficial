-- Create process_types table
CREATE TABLE IF NOT EXISTS process_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_process_types_updated_at
  BEFORE UPDATE ON process_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default process types
INSERT INTO process_types (name) VALUES
  ('EB-1 - Extraordinary Ability'),
  ('EB-2 - Advanced Degree'),
  ('EB-3 - Skilled Worker'),
  ('EB-5 - Investor Visa'),
  ('H-1B - Specialty Occupation'),
  ('L-1 - Intracompany Transfer'),
  ('O-1 - Extraordinary Ability'),
  ('Tourist Visa (B-2)'),
  ('Student Visa (F-1)'),
  ('Family Immigration'),
  ('Asylum'),
  ('Naturalization'),
  ('Green Card Renewal'),
  ('Outros')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE process_types ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read
CREATE POLICY "Allow authenticated users to read process types"
  ON process_types FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow service role to manage process types
CREATE POLICY "Allow service role to manage process types"
  ON process_types FOR ALL
  TO service_role
  USING (true); 