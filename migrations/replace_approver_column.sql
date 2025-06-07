-- First, add the new column
ALTER TABLE applications 
ADD COLUMN round1_approved_by VARCHAR(255) AFTER is_approved;

-- Copy data from approved_by_fullname to round1_approved_by
UPDATE applications 
SET round1_approved_by = approved_by_fullname
WHERE approved_by_fullname IS NOT NULL;

-- Drop the old column
ALTER TABLE applications
DROP COLUMN approved_by_fullname; 