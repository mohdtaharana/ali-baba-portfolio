export type ProjectCategory = 'all' | 'ai-ml' | 'software-db' | 'hardware-iot';

export interface ProjectItem {
  id: string;
  index: string;
  title: string;
  category: Exclude<ProjectCategory, 'all'>;
  categoryLabel: string;
  technologies: string[];
  summary: string;
  highlights: string[];
  outcome: string;
}

export interface SkillGroup {
  title: string;
  items: string[];
}

export const CV_PROFILE = {
  name: 'Ali Baba',
  initials: 'AB',
  headlineTop: 'Ali Baba',
  headlineBottom: 'AI & Data Science.',
  role: 'BS Computer Science Student · AI & Data Science',
  subline:
    'Motivated Computer Science student in Karachi building machine learning models, data pipelines, and real-world software.',
  phone: '03151021497',
  email: 'ab3669736@gmail.com',
  location: 'Karachi, Pakistan',
  pdfPath: '/assets/aistudio/ali-baba_4da651d0.pdf',
  summary:
    'Motivated Computer Science student with a strong interest in Artificial Intelligence, Data Science, and Machine Learning. Skilled in Python, Java, and data analysis with hands-on experience in academic projects and data preprocessing. Currently enhancing technical expertise through the Saylani Mass IT Training Program and eager to apply analytical and problem-solving skills to real-world data-driven challenges.',
  education: [
    {
      program: 'BS Computer Science',
      institution: 'Sindh Madressatul Islam University (SMIU)',
      period: 'Expected Graduation: 2026',
      location: 'Karachi, Pakistan',
      note: 'Core coursework in Data Structures, Algorithms, Database Systems, Artificial Intelligence, and Software Engineering.',
    },
    {
      program: 'Technical Training Program',
      institution: 'Saylani Mass IT Training Program',
      period: 'Ongoing',
      location: 'Karachi, Pakistan',
      note: 'Hands-on training in Python programming, data preprocessing, machine learning workflows, and applied problem solving.',
    },
  ],
  skills: [
    {
      title: 'Programming Languages',
      items: ['Python', 'Java', 'C'],
    },
    {
      title: 'Data Science & Libraries',
      items: ['Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Scikit-learn'],
    },
    {
      title: 'Core Domains & Systems',
      items: [
        'Machine Learning',
        'Deep Learning',
        'Data Analysis',
        'Data Visualization',
        'Data Preprocessing',
        'MySQL Database',
        'Arduino & Sensors',
      ],
    },
  ] as SkillGroup[],
  projects: [
    {
      id: 'medical-image-analysis',
      index: '01',
      title: 'AI-Powered Medical Image Analysis System',
      category: 'ai-ml',
      categoryLabel: 'Deep Learning · Healthcare AI',
      technologies: ['Python', 'Deep Learning', 'Computer Vision', 'Data Preprocessing'],
      summary:
        'Developed an AI-based diagnostic system to analyze medical images and detect multiple diseases across diverse clinical imaging modalities.',
      highlights: [
        'Built and trained a deep learning classification pipeline capable of detecting 15+ distinct diseases.',
        'Processed and normalized 7 different types of medical images for multi-class inference.',
        'Applied structured preprocessing and evaluation to handle varied image resolutions and modalities.',
      ],
      outcome: '15+ diseases detected across 7 medical imaging types.',
    },
    {
      id: 'hospital-management',
      index: '02',
      title: 'Hospital Management System',
      category: 'software-db',
      categoryLabel: 'Enterprise Software · Relational DB',
      technologies: ['Java', 'MySQL Database', 'JDBC'],
      summary:
        'End-to-end desktop management software engineered to centralize clinical operations, patient intake, and appointment scheduling.',
      highlights: [
        'Designed a normalized MySQL relational schema for patient profiles, doctor rosters, and visit logs.',
        'Implemented Java application logic for creating, searching, and updating appointment records reliably.',
        'Eliminated manual ledger lookup overhead with structured query access.',
      ],
      outcome: 'Digital management of patient records and appointments.',
    },
    {
      id: 'library-management',
      index: '03',
      title: 'Library Management System',
      category: 'software-db',
      categoryLabel: 'Database System · Java',
      technologies: ['Java', 'MySQL Database', 'SQL'],
      summary:
        'Relational cataloging and circulation system built to streamline book inventory tracking, member lending, and return cycles.',
      highlights: [
        'Structured MySQL tables to track catalog availability, borrower history, and due dates.',
        'Built fast search and issue/return workflows in Java for everyday library desk operations.',
        'Reduced book checkout friction through real-time stock status updates.',
      ],
      outcome: 'Faster book management and borrowing system.',
    },
    {
      id: 'automatic-door-locking',
      index: '04',
      title: 'Automatic Door Locking System',
      category: 'hardware-iot',
      categoryLabel: 'Embedded Hardware · IoT',
      technologies: ['Arduino', 'Sensors', 'C / Embedded Logic'],
      summary:
        'Sensor-driven physical security prototype engineered to automate door access control without manual key intervention.',
      highlights: [
        'Interfaced proximity and detection sensors with an Arduino microcontroller for real-time trigger response.',
        'Programmed deterministic actuator control states to lock and unlock securely based on sensor input.',
        'Tested hardware timing and reliability under repeated access cycles.',
      ],
      outcome: 'Automated security system for controlling door access.',
    },
  ] as ProjectItem[],
  languages: [
    { name: 'Urdu', level: 'Native' },
    { name: 'English', level: 'Proficient' },
  ],
  interests: [
    'Badminton (Occasionally)',
    'Tinkering with Electronics',
    'Video Games',
    'Puzzle Solving',
  ],
};
