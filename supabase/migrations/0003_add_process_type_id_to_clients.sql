-- Add process_type_id column to clients table if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'process_type_id'
  ) THEN
    ALTER TABLE clients ADD COLUMN process_type_id UUID REFERENCES process_types(id);
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_clients_process_type_id ON clients(process_type_id); 