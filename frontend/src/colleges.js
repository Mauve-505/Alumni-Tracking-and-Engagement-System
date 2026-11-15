// One list of WMSU colleges, used by Register, Profile and the Directory filter,
// so the college saved in the database always matches what the filter offers.
export const COLLEGES = [
  'College of Law',
  'College of Agriculture',
  'College of Liberal Arts',
  'College of Architecture',
  'College of Nursing',
  'College of Asian & Islamic Studies',
  'College of Computing Studies',
  'College of Forestry & Environmental Studies',
  'College of Criminal Justice Education',
  'College of Home Economics',
  'College of Engineering',
  'College of Medicine',
  'College of Public Administration & Development Studies',
  'College of Sports Science & Physical Education',
  'College of Science and Mathematics',
  'College of Social Work & Community Development',
  'College of Teacher Education',
];

export const EMPLOYMENT_STATUSES = [
  { value: 'employed', label: 'Employed' },
  { value: 'self_employed', label: 'Self-employed' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'further_study', label: 'Further study' },
];

export function employmentLabel(value) {
  return EMPLOYMENT_STATUSES.find((s) => s.value === value)?.label || 'Not specified';
}