import {
  ActivityItem,
  Certification,
  Education,
  Experience,
  FeaturedItem,
  Identity,
  Language,
  SectionMeta,
  Service,
  SkillGroup,
} from '../models/profile.models';

/**
 * Single source of truth for every piece of portfolio content.
 * Sourced from Dhia Eddine Saied's professional profile (LinkedIn: /in/saied-dhia)
 * and his own English CV. Nothing here is invented when LinkedIn content was not
 * publicly accessible, only information verified in his own documents is used.
 */

export const SECTIONS: SectionMeta[] = [
  { id: 'about', label: 'About', icon: 'user' },
  { id: 'services', label: 'Services', icon: 'layers' },
  { id: 'featured', label: 'Featured', icon: 'star' },
  { id: 'activity', label: 'Activity', icon: 'activity' },
  { id: 'experience', label: 'Experience', icon: 'briefcase' },
  { id: 'education', label: 'Education', icon: 'graduation' },
  { id: 'certifications', label: 'Licenses & Certifications', icon: 'award' },
  { id: 'skills', label: 'Skills', icon: 'code' },
  { id: 'languages', label: 'Languages', icon: 'languages' },
  { id: 'contact', label: 'Contact', icon: 'mail' },
];

export const IDENTITY: Identity = {
  name: 'Dhia Eddine Saied',
  firstName: 'Dhia Eddine',
  lastName: 'Saied',
  headline: 'Full Stack Developer',
  availability: 'Available for remote work',
  city: 'Nabeul',
  country: 'Tunisia',
  coordinates: '36.45° N · 10.73° E',
  email: 'Dhiasaied733@gmail.com',
  linkedin: 'https://www.linkedin.com/in/saied-dhia/',
  linkedinActivity: 'https://www.linkedin.com/in/saied-dhia/recent-activity/all/',
  github: 'https://github.com/dhiasaied',
  photo: 'assets/dhia-eddine-saied.jpg',
  summary:
    'Designing, developing and maintaining scalable web applications with Angular, React, Symfony and Node.js.',
  about: [
    'Full Stack Developer with solid experience designing, developing, and maintaining scalable web applications using agile methodologies and industry best practices. Proficient in frontend and backend technologies Angular, React, Symfony, Node.js, Express.js and in relational and non-relational databases.',
    'Committed to clean, maintainable code, RESTful API architecture, performance optimization, and delivering user-centered solutions. My path runs from technical support and networking to software development, giving me a complete view of systems from infrastructure to user experience.',
    'Experienced working autonomously in distributed teams with Git/GitHub, Scrum/Kanban and asynchronous communication, I integrate quickly into remote environments and keep learning continuously in artificial intelligence and productivity.',
  ],
};

export const SERVICES: Service[] = [
  {
    icon: 'layout',
    title: 'Frontend',
    description:
      'Single-page applications with component architecture and state management, mobile-first responsive design and reusable interface systems.',
    stack: ['Angular', 'React.js', 'TypeScript', 'Tailwind CSS'],
  },
  {
    icon: 'server',
    title: 'Backend & REST APIs',
    description:
      'RESTful API design on MVC architecture, object-oriented programming and SOLID principles, authentication, authorization and business logic.',
    stack: ['Node.js', 'Express.js', 'Symfony', 'Spring Boot'],
  },
  {
    icon: 'database',
    title: 'Data Modeling',
    description:
      'Design and administration of relational and NoSQL structures, normalization, efficient modeling and query performance optimization.',
    stack: ['MySQL', 'SQL Server', 'SQLite', 'Firebase'],
  },
  {
    icon: 'shield',
    title: 'Secure Web Applications',
    description:
      'Role-based access control, client- and server-side validation and prevention of web vulnerabilities such as SQL injection and CSRF.',
    stack: ['RBAC', 'Doctrine ORM', 'Validation', 'CSRF'],
  },
  {
    icon: 'smartphone',
    title: 'Mobile Development',
    description:
      'Cross-platform mobile applications consuming the same RESTful backends that power the web experience.',
    stack: ['Flutter', 'Dart', 'Firebase'],
  },
  {
    icon: 'pen',
    title: 'UI/UX & CMS',
    description:
      'Interface design and prototyping in Figma, plus WordPress development with themes and plugin administration.',
    stack: ['Figma', 'Photoshop', 'WordPress', 'Shopify'],
  },
];

export const FEATURED: FeaturedItem[] = [
  {
    kind: 'Project',
    title: 'VelaBelleza',
    subtitle: 'Beauty salon e-commerce',
    description:
      'A React.js 19 web application with a product catalog, shopping cart, authentication, appointment booking and payment through modal components.',
    highlights: [
      'Shopping cart state managed with the Context API',
      'Multilingual interface with react-i18next',
      'Dark mode with contrast and accessibility adjustments',
    ],
    stack: ['React.js', 'React Router', 'Context API', 'i18n'],
  },
  {
    kind: 'Project',
    title: 'ReelEscape',
    subtitle: 'Movies & series application',
    description:
      'A React.js 19 web application with pages for movies, series, new releases and notifications, plus a personal watch list.',
    highlights: [
      'Personal list managed with the Context API',
      'Route-based navigation with React Router',
      'Responsive interface built with Bootstrap',
    ],
    stack: ['React.js', 'React Router', 'Context API', 'Bootstrap'],
  },
  {
    kind: 'Product design',
    title: 'ServiMatch',
    subtitle: 'On-demand services platform',
    description:
      'A web platform connecting clients and service providers: publish a request, receive tailored offers, explore professionals on an interactive map and book with integrated messaging.',
    highlights: [
      'Recommendations based on needs and location',
      'Automatic price estimation and verified reviews',
      'UI/UX design phase completed in Figma',
    ],
    stack: ['Figma', 'UI/UX', 'Marketplace'],
  },
  {
    kind: 'Platform',
    title: 'Student Guidance Platform',
    subtitle: 'Capstone projects & internships',
    description:
      'An Angular and Node.js platform supporting capstone projects and professional internships, backed by a reusable RESTful API.',
    highlights: [
      'Three modules: resources, planning and mentorship',
      'Node.js / Express.js API consumed asynchronously',
      'API designed for reuse by native mobile clients',
    ],
    stack: ['Angular', 'Node.js', 'Express.js', 'REST'],
  },
];

export const ACTIVITY: ActivityItem[] = [
  {
    kind: 'certification',
    date: 'Aug 2026',
    title: 'Completed: Volunteering strategies for Alzheimer’s disease and other dementias',
    body: 'Certificate of completion added to Licenses & Certifications.',
    tags: ['Volunteering', 'Learning'],
  },
  {
    kind: 'certification',
    date: 'Jul 2026',
    title: 'Earned MathWorks Machine Learning Onramp and MATLAB Onramp',
    body: 'Two MathWorks credentials extending my continuous learning in artificial intelligence.',
    tags: ['Machine Learning', 'MATLAB'],
  },
  {
    kind: 'certification',
    date: 'Jun 2026',
    title: 'Earned Introduction to GitHub Copilot Microsoft',
    body: 'AI-assisted development and productivity in everyday work.',
    tags: ['GitHub Copilot', 'AI'],
  },
  {
    kind: 'post',
    date: 'Post',
    title: 'ServiMatch a smart on-demand services platform',
    body:
      'Shared the concept and UI/UX design of ServiMatch: recommendations, price estimation, real-time provider tracking, verified reviews, secure payment and urgent service options designed in Figma.',
    tags: ['UX Design', 'Figma', 'Web Platform'],
  },
  {
    kind: 'certification',
    date: 'Oct 2025',
    title: 'Became a Gemini Certified Educator Google for Education',
    body: 'Certified on using Gemini for teaching, learning and productivity.',
    tags: ['Google', 'AI'],
  },
];

export const EXPERIENCE: Experience[] = [
  {
    role: 'Full Stack Developer',
    company: 'IT Services Company',
    location: 'Hammamet, Tunisia',
    period: 'Jul 2025',
    type: 'Internship project',
    highlights: [
      'Designed and developed a student guidance platform with Angular and Node.js, supporting capstone projects and professional internships.',
      'Implemented three functional modules resource management, planning and mentorship to facilitate collaboration and learning.',
      'Architected a RESTful API with Node.js/Express.js, consumed asynchronously (AJAX/Fetch) and reusable as a backend for mobile clients.',
    ],
    stack: ['Angular', 'Node.js', 'Express.js', 'REST API'],
  },
  {
    role: 'Full Stack Developer',
    company: 'IT Services Company',
    location: 'Hammamet, Tunisia',
    period: 'Jan 2025 May 2025',
    type: '5 months',
    highlights: [
      'Developed a dynamic web platform with Symfony (PHP, OOP) and MySQL for the online purchase, sale and maintenance of automotive parts.',
      'Implemented real-time inventory control, secure transaction processing and an improved user experience.',
      'Applied the MVC pattern and Doctrine ORM with web security best practices data validation and prevention of SQL injection and CSRF.',
    ],
    stack: ['Symfony', 'PHP', 'MySQL', 'Doctrine ORM'],
  },
  {
    role: 'Full Stack Developer',
    company: 'IT Services Company',
    location: 'Hammamet, Tunisia',
    period: 'Jun 2024 Jul 2024',
    type: '2 months',
    highlights: [
      'Built an airport transportation booking platform using HTML5, CSS3, Bootstrap, AJAX, PHP and MySQL.',
      'Developed a responsive and secure interface for smooth booking management, with client- and server-side form validation.',
    ],
    stack: ['PHP', 'MySQL', 'AJAX', 'Bootstrap'],
  },
  {
    role: 'Full Stack Developer',
    company: 'Tunisie Telecom',
    location: 'Tunisia',
    period: 'Jun 2023 Jul 2023',
    type: '2 months',
    highlights: [
      'Developed a mailroom and correspondence management system using HTML, CSS, Bootstrap, AJAX, PHP and MySQL.',
      'Implemented role-based access control, complete CRUD operations, secure form handling and input validation.',
    ],
    stack: ['PHP', 'MySQL', 'RBAC', 'AJAX'],
  },
  {
    role: 'IT Maintenance Technician',
    company: 'Hi-Tech',
    location: 'Tunisia',
    period: 'Jul 2022 Aug 2022',
    type: '2 months',
    highlights: [
      'Purchase, sale and repair of computer equipment; hardware diagnostics, system and network configuration.',
      'Installed and maintained video surveillance systems and implemented secure, high-performance IT solutions.',
    ],
    stack: ['Hardware', 'Networking', 'Surveillance systems'],
  },
];

export const EDUCATION: Education[] = [
  {
    degree: 'Higher Technician Diploma in Web Development',
    school: 'Elite Formation',
    period: 'Oct 2023 Jun 2025',
    description:
      'Designed and developed complete, high-performance web and mobile solutions in line with modern standards.',
    skills: [
      'Python', 'HTML', 'CSS', 'JavaScript', 'Bootstrap', 'PHP', 'Angular', 'Symfony',
      'Flutter', 'Dart', 'Express.js', 'LoopBack', 'Firebase', 'WordPress', 'Digital Marketing',
    ],
  },
  {
    degree: 'Professional Technician Diploma in Business Computing',
    school: 'Elite Formation',
    period: 'Oct 2021 Jun 2023',
    description:
      'Developed reliable desktop applications and maintained high-performance computer networks.',
    skills: ['Python', 'Cisco Packet Tracer', 'VB.NET'],
  },
];

export const CERTIFICATIONS: Certification[] = [
  { title: 'Volunteering Strategies for Alzheimer’s Disease and Other Dementias', issuer: 'Certificate of completion', date: 'Aug 2026', year: 2026 },
  { title: 'Machine Learning Onramp', issuer: 'MathWorks', date: 'Jul 2026', year: 2026 },
  { title: 'MATLAB Onramp', issuer: 'MathWorks', date: 'Jul 2026', year: 2026 },
  { title: 'Introduction to GitHub Copilot', issuer: 'Microsoft', date: 'Jun 2026', year: 2026 },
  { title: 'Child Protection Training', issuer: 'UNICEF', date: 'Jun 2026', year: 2026 },
  { title: 'Safe Online Shopping for Informed and Responsible Digital Consumers', issuer: 'Spanish Red Cross', date: 'Jan 2026', year: 2026 },
  { title: 'Gemini Certified Educator', issuer: 'Google for Education', date: 'Oct 2025', year: 2025 },
  { title: 'Professional Certificate in Software Development', issuer: 'Paris College, Tunis Campus', date: 'Jul 2025', year: 2025 },
  { title: 'Artificial Intelligence and Productivity', issuer: 'Santander Open Academy', date: 'Jun 2025', year: 2025 },
  { title: 'Introduction to Generative AI Concepts', issuer: 'Microsoft', date: 'May 2025', year: 2025 },
  { title: 'Explore the Fundamentals of AI', issuer: 'Microsoft', date: 'May 2025', year: 2025 },
  { title: 'Design Your TCP/IP Network', issuer: 'OpenClassrooms', date: 'Dec 2023', year: 2023 },
  { title: 'Learn the Basics of the Python Language', issuer: 'OpenClassrooms', date: 'Dec 2023', year: 2023 },
  { title: 'Build Your Website with HTML5 and CSS3', issuer: 'OpenClassrooms', date: 'Dec 2023', year: 2023 },
  { title: 'Digital Marketing Fundamentals', issuer: 'Google Digital Workshops', date: 'May 2023', year: 2023 },
];

export const SKILL_GROUPS: SkillGroup[] = [
  { id: 'frontend', label: 'Frontend', icon: 'layout', items: ['Angular', 'React.js', 'TypeScript', 'JavaScript (ES6+)', 'HTML5', 'CSS3', 'Tailwind CSS', 'Bootstrap', 'jQuery'] },
  { id: 'backend', label: 'Backend', icon: 'server', items: ['Node.js', 'Express.js', 'Symfony', 'PHP', 'Spring Boot', 'Java', 'LoopBack', 'REST APIs'] },
  { id: 'data', label: 'Databases', icon: 'database', items: ['MySQL', 'SQL Server', 'SQLite', 'SQL', 'Firebase (NoSQL)', 'JSON'] },
  { id: 'mobile', label: 'Mobile', icon: 'smartphone', items: ['Flutter', 'Dart'] },
  { id: 'languages', label: 'Languages', icon: 'code', items: ['TypeScript', 'JavaScript', 'PHP', 'Java', 'Python', 'Dart', 'SQL', 'VB.NET', 'Pascal'] },
  { id: 'tools', label: 'Tools & Workflow', icon: 'git', items: ['Git', 'GitHub', 'VS Code', 'Visual Studio', 'Command Line (CLI)', 'Scrum', 'Kanban', 'Code review'] },
  { id: 'design', label: 'UI/UX & CMS', icon: 'pen', items: ['Figma', 'Adobe Photoshop', 'Canva', 'WordPress', 'Wix', 'Shopify', 'Strikingly'] },
  { id: 'practices', label: 'Practices', icon: 'shield', items: ['MVC architecture', 'SOLID principles', 'Clean code', 'RBAC', 'SQL injection prevention', 'CSRF prevention', 'Performance tuning', 'Microservices-oriented design'] },
];

export const SOFT_SKILLS: string[] = [
  'Analytical, solution-oriented thinking',
  'Creativity, reliability and attention to detail',
  'Self-management and proactivity',
  'Effective communication in remote environments',
  'Collaboration on distributed teams',
  'Fast adaptation to new teams and environments',
];

export const LANGUAGES: Language[] = [
  { name: 'Arabic', native: 'العربية', level: 'Native', score: 5 },
  { name: 'Spanish', native: 'Español', level: 'Professional working proficiency', score: 4 },
  { name: 'French', native: 'Français', level: 'Intermediate', score: 3 },
  { name: 'English', native: 'English', level: 'Intermediate', score: 3 },
  { name: 'Portuguese', native: 'Português', level: 'Intermediate', score: 3 },
];
