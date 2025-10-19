-- Make birthdate nullable to allow pregnancies without birthdate
ALTER TABLE babies ALTER COLUMN birthdate DROP NOT NULL;

-- Add constraint: if not pregnancy, birthdate is required
ALTER TABLE babies ADD CONSTRAINT birthdate_required_for_born_babies 
  CHECK (is_pregnancy = true OR birthdate IS NOT NULL);