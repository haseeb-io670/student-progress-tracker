// Data validation utilities
export const isValidProgressData = (data) => {
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data)) return false;
  
  // Check each progress entry has required fields
  return data.every(entry => (
    entry && 
    entry.topicId && 
    typeof entry.status === 'string' && 
    ['not_studied', 'started', 'difficult', 'ok', 'confident'].includes(entry.status)
  ));
};

export const isValidSubjectData = (data) => {
  if (!data || typeof data !== 'object') return false;
  if (!data.data || typeof data.data !== 'object') return false;
  if (!data.data.units || !Array.isArray(data.data.units)) return false;
  
  return true;
};