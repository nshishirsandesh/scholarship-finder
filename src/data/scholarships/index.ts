import { Scholarship } from '../../types/scholarship';
import { CENTRAL_SCHOLARSHIPS } from './centralSchemes';
import { STATE_SCHOLARSHIPS } from './stateSchemes';
import { CSR_SCHOLARSHIPS } from './csrSchemes';

// Combine and deduplicate strictly by ID
const combinedMap = new Map<string, Scholarship>();

// Add Central
CENTRAL_SCHOLARSHIPS.forEach(s => combinedMap.set(s.id, s));
// Add State
STATE_SCHOLARSHIPS.forEach(s => combinedMap.set(s.id, s));
// Add CSR
CSR_SCHOLARSHIPS.forEach(s => combinedMap.set(s.id, s));

export const SCHOLARSHIPS_DATA: Scholarship[] = Array.from(combinedMap.values());

export { CENTRAL_SCHOLARSHIPS, STATE_SCHOLARSHIPS, CSR_SCHOLARSHIPS };
