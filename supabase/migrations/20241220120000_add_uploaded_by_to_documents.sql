-- Add uploaded_by field to documents table
ALTER TABLE documents ADD COLUMN uploaded_by TEXT DEFAULT 'admin' CHECK (uploaded_by IN ('admin', 'client'));

-- Create an index for better performance
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);

-- Update existing documents to have 'admin' as uploaded_by (since they were uploaded by admin before this change)
UPDATE documents SET uploaded_by = 'admin' WHERE uploaded_by IS NULL; 