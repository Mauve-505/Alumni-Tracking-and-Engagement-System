/**
 * WMSU ACADEMIC & REFERENCE DATA
 * ============================================================================
 * Official Western Mindanao State University (WMSU) academic structure,
 * colleges, academic programs/degrees, departments, and reference options.
 *
 * NOTE ON OFFICIAL STATUS:
 * Academic offerings and college structures below reflect the verified academic
 * programs of Western Mindanao State University (Normal Road, Baliwasan, Zamboanga City).
 * If official department splits or future curriculum changes occur, update this file.
 *
 * BACKEND CONNECTION POINT:
 * Groupmates: When connecting the backend in the future:
 * 1. Query these lists dynamically via GET /api/reference/academic-programs
 *    or GET /api/colleges to keep the frontend synchronized with database records.
 * 2. Ensure course and college codes match the primary keys in your PostgreSQL
 *    alumni, courses, and colleges tables.
 * ============================================================================
 */

export const WMSU_ACADEMIC_DATA = [
  {
    collegeId: 'ccs',
    collegeName: 'College of Computing Studies',
    departments: [
      'Department of Computer Science',
      'Department of Information Technology',
    ],
    courses: [
      { id: 'bscs', name: 'Bachelor of Science in Computer Science', department: 'Department of Computer Science' },
      { id: 'bsit', name: 'Bachelor of Science in Information Technology', department: 'Department of Information Technology' },
      { id: 'bsis', name: 'Bachelor of Science in Information Systems', department: 'Department of Information Technology' },
      { id: 'act', name: 'Associate in Computer Technology', department: 'Department of Information Technology' },
      { id: 'mit', name: 'Master in Information Technology', department: 'Department of Information Technology' },
    ],
  },
  {
    collegeId: 'coe',
    collegeName: 'College of Engineering',
    departments: [
      'Department of Civil Engineering',
      'Department of Electrical Engineering',
      'Department of Mechanical Engineering',
      'Department of Computer Engineering',
      'Department of Agricultural & Biosystems Engineering',
      'Department of Electronics Engineering',
      'Department of Industrial Engineering',
      'Department of Sanitary Engineering',
    ],
    courses: [
      { id: 'bsce', name: 'Bachelor of Science in Civil Engineering', department: 'Department of Civil Engineering' },
      { id: 'bsee', name: 'Bachelor of Science in Electrical Engineering', department: 'Department of Electrical Engineering' },
      { id: 'bsme', name: 'Bachelor of Science in Mechanical Engineering', department: 'Department of Mechanical Engineering' },
      { id: 'bscpe', name: 'Bachelor of Science in Computer Engineering', department: 'Department of Computer Engineering' },
      { id: 'bsabe', name: 'Bachelor of Science in Agricultural & Biosystems Engineering', department: 'Department of Agricultural & Biosystems Engineering' },
      { id: 'bsece', name: 'Bachelor of Science in Electronics Engineering', department: 'Department of Electronics Engineering' },
      { id: 'bsie', name: 'Bachelor of Science in Industrial Engineering', department: 'Department of Industrial Engineering' },
      { id: 'bsse', name: 'Bachelor of Science in Sanitary Engineering', department: 'Department of Sanitary Engineering' },
    ],
  },
  {
    collegeId: 'cn',
    collegeName: 'College of Nursing',
    departments: ['Department of Nursing'],
    courses: [
      { id: 'bsn', name: 'Bachelor of Science in Nursing', department: 'Department of Nursing' },
      { id: 'mn', name: 'Master of Arts in Nursing', department: 'Department of Nursing' },
    ],
  },
  {
    collegeId: 'cte',
    collegeName: 'College of Teacher Education',
    departments: [
      'Department of Elementary Education',
      'Department of Secondary Education',
      'Department of Early Childhood Education',
      'Department of Special Needs Education',
    ],
    courses: [
      { id: 'beed', name: 'Bachelor of Elementary Education', department: 'Department of Elementary Education' },
      { id: 'bsed_eng', name: 'Bachelor of Secondary Education - Major in English', department: 'Department of Secondary Education' },
      { id: 'bsed_math', name: 'Bachelor of Secondary Education - Major in Mathematics', department: 'Department of Secondary Education' },
      { id: 'bsed_sci', name: 'Bachelor of Secondary Education - Major in Science', department: 'Department of Secondary Education' },
      { id: 'bsed_soc', name: 'Bachelor of Secondary Education - Major in Social Studies', department: 'Department of Secondary Education' },
      { id: 'bsed_fil', name: 'Bachelor of Secondary Education - Major in Filipino', department: 'Department of Secondary Education' },
      { id: 'beced', name: 'Bachelor of Early Childhood Education', department: 'Department of Early Childhood Education' },
      { id: 'bsned', name: 'Bachelor of Special Needs Education', department: 'Department of Special Needs Education' },
    ],
  },
  {
    collegeId: 'csm',
    collegeName: 'College of Science and Mathematics',
    departments: [
      'Department of Biological Sciences',
      'Department of Chemistry',
      'Department of Mathematics & Statistics',
      'Department of Physics',
    ],
    courses: [
      { id: 'bs_bio', name: 'Bachelor of Science in Biology', department: 'Department of Biological Sciences' },
      { id: 'bs_chem', name: 'Bachelor of Science in Chemistry', department: 'Department of Chemistry' },
      { id: 'bs_math', name: 'Bachelor of Science in Mathematics', department: 'Department of Mathematics & Statistics' },
      { id: 'bs_stat', name: 'Bachelor of Science in Statistics', department: 'Department of Mathematics & Statistics' },
      { id: 'bs_phys', name: 'Bachelor of Science in Physics', department: 'Department of Physics' },
    ],
  },
  {
    collegeId: 'cla',
    collegeName: 'College of Liberal Arts',
    departments: [
      'Department of Languages and Literature',
      'Department of Social Sciences',
      'Department of Mass Communication',
    ],
    courses: [
      { id: 'ba_comm', name: 'Bachelor of Arts in Communication', department: 'Department of Mass Communication' },
      { id: 'ba_eng', name: 'Bachelor of Arts in English Language Studies', department: 'Department of Languages and Literature' },
      { id: 'ba_polsci', name: 'Bachelor of Arts in Political Science', department: 'Department of Social Sciences' },
      { id: 'ba_hist', name: 'Bachelor of Arts in History', department: 'Department of Social Sciences' },
      { id: 'bs_psych', name: 'Bachelor of Science in Psychology', department: 'Department of Social Sciences' },
      { id: 'ba_journ', name: 'Bachelor of Arts in Journalism', department: 'Department of Mass Communication' },
    ],
  },
  {
    collegeId: 'che',
    collegeName: 'College of Home Economics',
    departments: [
      'Department of Hospitality Management',
      'Department of Tourism Management',
      'Department of Nutrition and Dietetics',
    ],
    courses: [
      { id: 'bshm', name: 'Bachelor of Science in Hospitality Management', department: 'Department of Hospitality Management' },
      { id: 'bstm', name: 'Bachelor of Science in Tourism Management', department: 'Department of Tourism Management' },
      { id: 'bsnd', name: 'Bachelor of Science in Nutrition and Dietetics', department: 'Department of Nutrition and Dietetics' },
      { id: 'bshe', name: 'Bachelor of Science in Home Economics', department: 'Department of Hospitality Management' },
    ],
  },
  {
    collegeId: 'ca',
    collegeName: 'College of Agriculture',
    departments: [
      'Department of Agronomy & Plant Breeding',
      'Department of Animal Science',
      'Department of Agribusiness Management',
    ],
    courses: [
      { id: 'bsa', name: 'Bachelor of Science in Agriculture', department: 'Department of Agronomy & Plant Breeding' },
      { id: 'bsab', name: 'Bachelor of Science in Agribusiness', department: 'Department of Agribusiness Management' },
      { id: 'bat', name: 'Bachelor of Agricultural Technology', department: 'Department of Agronomy & Plant Breeding' },
    ],
  },
  {
    collegeId: 'arch',
    collegeName: 'College of Architecture',
    departments: ['Department of Architecture'],
    courses: [
      { id: 'bsarch', name: 'Bachelor of Science in Architecture', department: 'Department of Architecture' },
    ],
  },
  {
    collegeId: 'ccje',
    collegeName: 'College of Criminal Justice Education',
    departments: ['Department of Criminology', 'Department of Law Enforcement Administration'],
    courses: [
      { id: 'bscrim', name: 'Bachelor of Science in Criminology', department: 'Department of Criminology' },
      { id: 'bsifs', name: 'Bachelor of Science in Industrial Security Management', department: 'Department of Law Enforcement Administration' },
    ],
  },
  {
    collegeId: 'cfes',
    collegeName: 'College of Forestry & Environmental Studies',
    departments: ['Department of Forestry', 'Department of Environmental Science'],
    courses: [
      { id: 'bsf', name: 'Bachelor of Science in Forestry', department: 'Department of Forestry' },
      { id: 'bses', name: 'Bachelor of Science in Environmental Science', department: 'Department of Environmental Science' },
      { id: 'bsaf', name: 'Bachelor of Science in Agroforestry', department: 'Department of Forestry' },
    ],
  },
  {
    collegeId: 'cpads',
    collegeName: 'College of Public Administration & Development Studies',
    departments: ['Department of Public Administration', 'Department of Development Studies'],
    courses: [
      { id: 'bpa', name: 'Bachelor of Public Administration', department: 'Department of Public Administration' },
      { id: 'bds', name: 'Bachelor of Arts in Development Studies', department: 'Department of Development Studies' },
    ],
  },
  {
    collegeId: 'cswcd',
    collegeName: 'College of Social Work & Community Development',
    departments: ['Department of Social Work', 'Department of Community Development'],
    courses: [
      { id: 'bssw', name: 'Bachelor of Science in Social Work', department: 'Department of Social Work' },
      { id: 'bscd', name: 'Bachelor of Science in Community Development', department: 'Department of Community Development' },
    ],
  },
  {
    collegeId: 'csspe',
    collegeName: 'College of Sports Science & Physical Education',
    departments: ['Department of Physical Education', 'Department of Sports Science'],
    courses: [
      { id: 'bped', name: 'Bachelor of Physical Education', department: 'Department of Physical Education' },
      { id: 'bsess', name: 'Bachelor of Science in Exercise and Sports Sciences', department: 'Department of Sports Science' },
    ],
  },
  {
    collegeId: 'cais',
    collegeName: 'College of Asian & Islamic Studies',
    departments: ['Department of Islamic Studies', 'Department of Asian Studies'],
    courses: [
      { id: 'ba_is', name: 'Bachelor of Arts in Islamic Studies', department: 'Department of Islamic Studies' },
      { id: 'ba_as', name: 'Bachelor of Arts in Asian Studies', department: 'Department of Asian Studies' },
    ],
  },
  {
    collegeId: 'law',
    collegeName: 'College of Law',
    departments: ['Department of Law'],
    courses: [
      { id: 'jd', name: 'Juris Doctor (Law)', department: 'Department of Law' },
    ],
  },
  {
    collegeId: 'med',
    collegeName: 'College of Medicine',
    departments: ['Department of Medicine'],
    courses: [
      { id: 'md', name: 'Doctor of Medicine', department: 'Department of Medicine' },
    ],
  },
];

// Flat list of all WMSU colleges for general dropdowns
export const WMSU_COLLEGES = WMSU_ACADEMIC_DATA.map((c) => c.collegeName);

// Flat list of all courses with college information
export const ALL_COURSES = WMSU_ACADEMIC_DATA.flatMap((college) =>
  college.courses.map((course) => ({
    ...course,
    college: college.collegeName,
    collegeId: college.collegeId,
  }))
);

// All unique departments organized by college
export const ALL_DEPARTMENTS_BY_COLLEGE = WMSU_ACADEMIC_DATA.reduce((acc, curr) => {
  acc[curr.collegeName] = curr.departments;
  return acc;
}, {});

// Generate graduation years from current year back to 1970
const CURRENT_YEAR = new Date().getFullYear();
export const GRADUATION_YEARS = Array.from(
  { length: CURRENT_YEAR - 1970 + 1 },
  (_, index) => String(CURRENT_YEAR - index)
);

// Standard employment statuses
export const EMPLOYMENT_STATUSES = [
  { value: 'employed', label: 'Employed Full-Time' },
  { value: 'employed_part', label: 'Employed Part-Time' },
  { value: 'self_employed', label: 'Self-Employed / Freelancer / Entrepreneur' },
  { value: 'unemployed', label: 'Unemployed / Seeking Employment' },
  { value: 'further_study', label: 'Pursuing Further Study (Graduate / Post-Grad)' },
  { value: 'retired', label: 'Retired' },
  { value: 'other', label: 'Other / Prefer not to say' },
];

/**
 * Helper to find college and department given a course name
 */
export function findAcademicInfoByCourse(courseName) {
  if (!courseName) return null;
  for (const college of WMSU_ACADEMIC_DATA) {
    const course = college.courses.find((c) => c.name === courseName || c.id === courseName);
    if (course) {
      return {
        courseName: course.name,
        courseId: course.id,
        collegeName: college.collegeName,
        departmentName: course.department,
        availableDepartments: college.departments,
      };
    }
  }
  return null;
}

/**
 * Helper to get available courses given a college name
 */
export function getCoursesByCollege(collegeName) {
  if (!collegeName) return ALL_COURSES;
  const college = WMSU_ACADEMIC_DATA.find((c) => c.collegeName === collegeName);
  return college ? college.courses.map((course) => ({
    ...course,
    college: college.collegeName,
  })) : [];
}

/**
 * Helper to get departments for a college
 */
export function getDepartmentsByCollege(collegeName) {
  if (!collegeName) return [];
  const college = WMSU_ACADEMIC_DATA.find((c) => c.collegeName === collegeName);
  return college ? college.departments : [];
}

export function employmentLabel(value) {
  return EMPLOYMENT_STATUSES.find((s) => s.value === value)?.label || 'Not specified';
}
