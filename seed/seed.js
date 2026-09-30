const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Configuration & Credentials
const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'skillmatch-ai';
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.resolve(__dirname, 'serviceAccountKey.json');

const isEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST);
const isDryRun = process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true';

console.log('--- Initializing SkillMatch AI Database Seeder ---');
console.log(`Target Project: ${projectId}`);
console.log(`Emulator mode: ${isEmulator ? 'ENABLED (' + process.env.FIRESTORE_EMULATOR_HOST + ')' : 'DISABLED'}`);
console.log(`Execution Mode: ${isDryRun ? 'DRY-RUN (Data Validation Only)' : 'LIVE SEED'}`);

let auth, db;

if (!isDryRun) {
  if (!admin.apps.length) {
    if (isEmulator) {
      admin.initializeApp({
        projectId: projectId,
      });
    } else if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id || projectId,
      });
    } else {
      console.warn('Notice: No serviceAccountKey.json found and not in emulator mode.');
      console.warn('Attempting initialization with applicationDefault credentials...');
      admin.initializeApp({
        projectId: projectId,
      });
    }
  }
  auth = admin.auth();
  db = admin.firestore();
}

// ---------------------------------------------------------
// DATA DEFINITIONS
// ---------------------------------------------------------

const SKILLS_DATA = [
  { id: 'java', name: 'Java', category: 'Backend', aliases: ['java', 'core java', 'java 8', 'java 11', 'java 17'] },
  { id: 'spring-boot', name: 'Spring Boot', category: 'Backend', aliases: ['springboot', 'spring boot', 'spring-boot', 'spring framework'] },
  { id: 'python', name: 'Python', category: 'Backend', aliases: ['python', 'python3', 'py'] },
  { id: 'django', name: 'Django', category: 'Backend', aliases: ['django', 'django rest framework', 'drf'] },
  { id: 'fastapi', name: 'FastAPI', category: 'Backend', aliases: ['fastapi', 'fast-api'] },
  { id: 'javascript', name: 'JavaScript', category: 'Frontend', aliases: ['javascript', 'js', 'es6', 'ecmascript'] },
  { id: 'typescript', name: 'TypeScript', category: 'Frontend', aliases: ['typescript', 'ts'] },
  { id: 'react', name: 'React', category: 'Frontend', aliases: ['react', 'reactjs', 'react.js'] },
  { id: 'node-js', name: 'Node.js', category: 'Backend', aliases: ['node', 'nodejs', 'node.js'] },
  { id: 'html5', name: 'HTML5', category: 'Frontend', aliases: ['html', 'html5'] },
  { id: 'css3', name: 'CSS3', category: 'Frontend', aliases: ['css', 'css3', 'sass', 'scss'] },
  { id: 'tailwind-css', name: 'Tailwind CSS', category: 'Frontend', aliases: ['tailwind', 'tailwindcss'] },
  { id: 'next-js', name: 'Next.js', category: 'Frontend', aliases: ['next', 'nextjs', 'next.js'] },
  { id: 'vue-js', name: 'Vue.js', category: 'Frontend', aliases: ['vue', 'vuejs', 'vue.js'] },
  { id: 'sql', name: 'SQL', category: 'Database', aliases: ['sql', 'relational database', 'rdbms'] },
  { id: 'postgresql', name: 'PostgreSQL', category: 'Database', aliases: ['postgres', 'postgresql', 'psql'] },
  { id: 'mysql', name: 'MySQL', category: 'Database', aliases: ['mysql'] },
  { id: 'mongodb', name: 'MongoDB', category: 'Database', aliases: ['mongo', 'mongodb'] },
  { id: 'redis', name: 'Redis', category: 'Database', aliases: ['redis'] },
  { id: 'git', name: 'Git', category: 'Tools', aliases: ['git', 'github', 'gitlab', 'version control'] },
  { id: 'docker', name: 'Docker', category: 'DevOps', aliases: ['docker', 'containerization', 'containers'] },
  { id: 'kubernetes', name: 'Kubernetes', category: 'DevOps', aliases: ['k8s', 'kubernetes'] },
  { id: 'aws', name: 'AWS', category: 'DevOps', aliases: ['aws', 'amazon web services', 'ec2', 's3', 'lambda'] },
  { id: 'gcp', name: 'Google Cloud Platform', category: 'DevOps', aliases: ['gcp', 'google cloud'] },
  { id: 'ci-cd', name: 'CI/CD', category: 'DevOps', aliases: ['ci/cd', 'github actions', 'jenkins', 'continuous integration'] },
  { id: 'machine-learning', name: 'Machine Learning', category: 'AI/ML', aliases: ['machine learning', 'ml', 'scikit-learn'] },
  { id: 'deep-learning', name: 'Deep Learning', category: 'AI/ML', aliases: ['deep learning', 'neural networks'] },
  { id: 'tensorflow', name: 'TensorFlow', category: 'AI/ML', aliases: ['tensorflow', 'tf'] },
  { id: 'pytorch', name: 'PyTorch', category: 'AI/ML', aliases: ['pytorch', 'torch'] },
  { id: 'pandas', name: 'pandas', category: 'AI/ML', aliases: ['pandas', 'numpy', 'data analysis'] },
  { id: 'nlp', name: 'Natural Language Processing', category: 'AI/ML', aliases: ['nlp', 'transformers', 'bert', 'llm'] },
  { id: 'graphql', name: 'GraphQL', category: 'Backend', aliases: ['graphql', 'apollo'] },
  { id: 'rest-api', name: 'REST APIs', category: 'Backend', aliases: ['rest', 'rest api', 'restful'] },
  { id: 'microservices', name: 'Microservices', category: 'Backend', aliases: ['microservices', 'distributed systems'] }
];

const JOBS_DATA = [
  {
    id: 'job-01-java-dev',
    title: 'Senior Java Backend Engineer',
    company: 'FinTech Innovations Inc.',
    location: 'New York, NY',
    workMode: 'HYBRID',
    salaryMin: 130000,
    salaryMax: 165000,
    currency: 'USD',
    experienceRequired: 4,
    experienceLevel: 'Senior',
    description: 'We are seeking an experienced Java Backend Engineer to scale our core payment processing engine. You will architect resilient microservices, optimize high-throughput transaction pipelines, and lead technical design reviews.',
    responsibilities: [
      'Design, build, and maintain high-volume, low-latency microservices with Java and Spring Boot',
      'Optimize database queries and schema designs on PostgreSQL and Redis',
      'Collaborate with front-end developers to define robust GraphQL and REST API contracts',
      'Deploy containerized workloads to Kubernetes clusters in AWS'
    ],
    requirements: [
      'Bachelor’s or Master’s in Computer Science or related engineering discipline',
      '4+ years of professional backend engineering experience with Java ecosystem',
      'Hands-on mastery of Spring Boot, Spring Data, and JPA',
      'Deep understanding of transactional systems, relational SQL, and concurrency'
    ],
    requiredSkills: ['Java', 'Spring Boot', 'PostgreSQL', 'Microservices', 'Git'],
    preferredSkills: ['Docker', 'Kubernetes', 'AWS', 'Redis', 'CI/CD'],
    active: true,
    applicantCount: 14
  },
  {
    id: 'job-02-fullstack-dev',
    title: 'Full Stack Software Engineer',
    company: 'CloudScale Dynamics',
    location: 'San Francisco, CA',
    workMode: 'REMOTE',
    salaryMin: 120000,
    salaryMax: 155000,
    currency: 'USD',
    experienceRequired: 3,
    experienceLevel: 'Mid-Level',
    description: 'Join our product velocity squad building intelligent collaborative dashboards. You will bridge frontend user experiences built with React and TypeScript with performant Node.js and Python microservices.',
    responsibilities: [
      'Develop reactive, responsive user interfaces using React, TypeScript, and modern CSS/Tailwind',
      'Construct scalable REST and GraphQL endpoints backed by Node.js and PostgreSQL',
      'Write end-to-end integration tests and participate in CI/CD pipeline improvements',
      'Partner closely with product design to translate user research into seamless features'
    ],
    requirements: [
      '3+ years in full-stack web application development',
      'Proficiency in React and TypeScript with component-driven architecture',
      'Strong server-side fundamentals in Node.js or Python',
      'Experience with relational databases and SQL'
    ],
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'JavaScript', 'SQL', 'Git'],
    preferredSkills: ['Docker', 'AWS', 'Tailwind CSS', 'GraphQL', 'Next.js'],
    active: true,
    applicantCount: 28
  },
  {
    id: 'job-03-frontend-dev',
    title: 'Senior Frontend Developer',
    company: 'Starlight Interactive',
    location: 'Austin, TX',
    workMode: 'REMOTE',
    salaryMin: 115000,
    salaryMax: 145000,
    currency: 'USD',
    experienceRequired: 3,
    experienceLevel: 'Mid-Level',
    description: 'We are looking for a craft-focused Frontend Developer who obsesses over visual polish, web performance, and accessible UI interactions. You will own the primary customer-facing portal.',
    responsibilities: [
      'Implement pixel-perfect, accessible user interfaces following modern design standards',
      'Manage complex client-side state and caching patterns in React',
      'Audit and optimize core web vitals, bundle sizes, and rendering performance',
      'Contribute to our internal Design System component library'
    ],
    requirements: [
      'Proven expertise with modern React, JavaScript (ES6+), HTML5, and CSS3',
      'Strong understanding of browser rendering engines and performance optimization',
      'Experience building responsive web apps across desktop and mobile form factors'
    ],
    requiredSkills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Git'],
    preferredSkills: ['TypeScript', 'Tailwind CSS', 'Next.js', 'REST APIs'],
    active: true,
    applicantCount: 19
  },
  {
    id: 'job-04-python-dev',
    title: 'Python Backend Engineer',
    company: 'OmniData Labs',
    location: 'Seattle, WA',
    workMode: 'HYBRID',
    salaryMin: 125000,
    salaryMax: 160000,
    currency: 'USD',
    experienceRequired: 3,
    experienceLevel: 'Mid-Level',
    description: 'Build fast, scalable data ingestion and API microservices powering real-time analytics. You will work with FastAPI, Python, PostgreSQL, and Kafka in a cloud-native AWS ecosystem.',
    responsibilities: [
      'Build robust APIs with FastAPI and async Python',
      'Integrate data pipelines with PostgreSQL, Redis, and event streams',
      'Write clean, test-driven Python code with complete coverage',
      'Collaborate with ML engineers to deploy inference models into production'
    ],
    requirements: [
      '3+ years of professional backend development with Python',
      'Strong knowledge of asynchronous programming (asyncio, FastAPI, or Celery)',
      'Experience with SQL databases and query profiling',
      'Familiarity with containerized workflows using Docker'
    ],
    requiredSkills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Git'],
    preferredSkills: ['Redis', 'AWS', 'CI/CD', 'Machine Learning'],
    active: true,
    applicantCount: 22
  },
  {
    id: 'job-05-aiml-engineer',
    title: 'AI / Machine Learning Engineer',
    company: 'Cognitive Nexus',
    location: 'Boston, MA',
    workMode: 'REMOTE',
    salaryMin: 145000,
    salaryMax: 190000,
    currency: 'USD',
    experienceRequired: 3,
    experienceLevel: 'Senior',
    description: 'Lead the research and deployment of state-of-the-art NLP and generative AI models. You will convert business requirements into production ML pipelines with PyTorch, Transformers, and vector search.',
    responsibilities: [
      'Develop, fine-tune, and evaluate deep learning and LLM models for text processing and matching',
      'Build production-grade inference services using FastAPI and container technologies',
      'Run rigorous model evaluation pipelines and establish benchmark metrics',
      'Partner with product teams to embed AI capabilities into core product experiences'
    ],
    requirements: [
      'M.S. or B.S. in Computer Science, Data Science, or related field',
      '3+ years of practical experience deploying ML models in production',
      'Fluency in Python, PyTorch or TensorFlow, and pandas',
      'Demonstrated experience with NLP, embeddings, and semantic similarity'
    ],
    requiredSkills: ['Python', 'PyTorch', 'Machine Learning', 'Natural Language Processing', 'pandas'],
    preferredSkills: ['TensorFlow', 'FastAPI', 'Docker', 'AWS'],
    active: true,
    applicantCount: 31
  },
  {
    id: 'job-06-data-analyst',
    title: 'Product Data Analyst',
    company: 'MetricsFlow Analytics',
    location: 'Chicago, IL',
    workMode: 'HYBRID',
    salaryMin: 90000,
    salaryMax: 120000,
    currency: 'USD',
    experienceRequired: 2,
    experienceLevel: 'Mid-Level',
    description: 'Empower product decision makers through data storytelling. You will craft insightful dashboards, analyze cohort retention curves, and run hypothesis testing on A/B experiments.',
    responsibilities: [
      'Query complex relational and dimensional data warehouses using advanced SQL',
      'Perform exploratory data analysis and statistical modeling using Python and pandas',
      'Build automated executive dashboards tracking core business KPIs',
      'Design and evaluate A/B test experiments for new product releases'
    ],
    requirements: [
      '2+ years experience in product analytics, business intelligence, or data analytics',
      'Advanced SQL abilities (window functions, CTEs, optimization)',
      'Working knowledge of Python for data manipulation (pandas, numpy)',
      'Strong communication skills and ability to translate data into strategic insights'
    ],
    requiredSkills: ['SQL', 'Python', 'pandas', 'Git'],
    preferredSkills: ['Machine Learning', 'PostgreSQL'],
    active: true,
    applicantCount: 16
  },
  {
    id: 'job-07-devops-engineer',
    title: 'Cloud DevOps & Platform Engineer',
    company: 'InfraScale Systems',
    location: 'Denver, CO',
    workMode: 'REMOTE',
    salaryMin: 135000,
    salaryMax: 170000,
    currency: 'USD',
    experienceRequired: 4,
    experienceLevel: 'Senior',
    description: 'Own our multi-region Kubernetes platform, automated CI/CD pipelines, and infrastructure-as-code. Help engineering teams ship quickly, reliably, and securely.',
    responsibilities: [
      'Manage multi-cluster Kubernetes deployments in AWS using Terraform',
      'Enhance automated CI/CD pipelines using GitHub Actions and ArgoCD',
      'Monitor system health, latency, and availability with Prometheus and Grafana',
      'Implement zero-trust security postures and secret rotation'
    ],
    requirements: [
      '4+ years in DevOps, SRE, or Cloud Infrastructure roles',
      'Production expertise with Kubernetes and Docker containers',
      'Deep knowledge of AWS services (EKS, IAM, VPC, S3)',
      'Experience with continuous integration tools and shell scripting'
    ],
    requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Git'],
    preferredSkills: ['Python', 'PostgreSQL', 'Google Cloud Platform'],
    active: true,
    applicantCount: 11
  },
  {
    id: 'job-08-junior-software-engineer',
    title: 'Associate Software Engineer',
    company: 'Nexus Launchpad',
    location: 'Atlanta, GA',
    workMode: 'ON_SITE',
    salaryMin: 75000,
    salaryMax: 95000,
    currency: 'USD',
    experienceRequired: 0,
    experienceLevel: 'Entry-Level',
    description: 'An exceptional opportunity for new graduates and early-career developers. Join our structured mentorship program and build customer-facing web features across our platform.',
    responsibilities: [
      'Write clean, maintainable code in Java or JavaScript under senior engineer guidance',
      'Participate in daily standups, code reviews, and sprint planning',
      'Write unit tests and documentation for newly introduced modules',
      'Debug application issues and assist in operational support'
    ],
    requirements: [
      'B.S. in Computer Science, Software Engineering, or equivalent practical training',
      'Solid grasp of data structures, algorithms, and object-oriented principles',
      'Coursework or projects in Java, JavaScript, or Python',
      'Eager learner with a team-first collaborative attitude'
    ],
    requiredSkills: ['Java', 'JavaScript', 'Git', 'SQL'],
    preferredSkills: ['React', 'Spring Boot', 'HTML5', 'CSS3'],
    active: true,
    applicantCount: 52
  },
  {
    id: 'job-09-backend-node',
    title: 'Node.js Backend Developer',
    company: 'HyperStream Media',
    location: 'Los Angeles, CA',
    workMode: 'HYBRID',
    salaryMin: 115000,
    salaryMax: 145000,
    currency: 'USD',
    experienceRequired: 3,
    experienceLevel: 'Mid-Level',
    description: 'Build real-time video streaming APIs and subscription billing engines. We need a Node.js developer comfortable with async I/O, WebSockets, and MongoDB.',
    responsibilities: [
      'Develop microservices using Node.js and TypeScript',
      'Handle real-time events via WebSockets and Redis pub/sub',
      'Integrate payment gateways and third-party media distribution endpoints',
      'Maintain automated unit and integration test suites'
    ],
    requirements: [
      '3+ years building backend web services with Node.js',
      'Demonstrated knowledge of MongoDB or PostgreSQL',
      'Proficiency with TypeScript and modern ECMAScript standards',
      'Familiarity with containerization and automated deployments'
    ],
    requiredSkills: ['Node.js', 'TypeScript', 'MongoDB', 'REST APIs', 'Git'],
    preferredSkills: ['Redis', 'Docker', 'AWS', 'GraphQL'],
    active: true,
    applicantCount: 20
  },
  {
    id: 'job-10-react-native',
    title: 'Mobile Engineer (React Native)',
    company: 'Pulse Mobility',
    location: 'San Diego, CA',
    workMode: 'REMOTE',
    salaryMin: 120000,
    salaryMax: 150000,
    currency: 'USD',
    experienceRequired: 3,
    experienceLevel: 'Mid-Level',
    description: 'Help build our cross-platform iOS and Android mobile app downloaded by over 2M users. Deliver fluid 60fps animations and offline-first synchronization.',
    responsibilities: [
      'Build performant native-like interfaces using React Native and TypeScript',
      'Bridge native iOS (Swift) and Android (Kotlin) modules when necessary',
      'Implement robust offline storage and cache reconciliation',
      'Distribute releases via Apple TestFlight and Google Play Console'
    ],
    requirements: [
      '3+ years developing commercial mobile applications with React Native',
      'Deep fluency with JavaScript / TypeScript and React hooks',
      'Experience integrating secure mobile authentication and push notifications'
    ],
    requiredSkills: ['React', 'JavaScript', 'TypeScript', 'REST APIs', 'Git'],
    preferredSkills: ['Node.js', 'Tailwind CSS', 'CI/CD'],
    active: true,
    applicantCount: 15
  },
  {
    id: 'job-11-data-engineer',
    title: 'Data Platform Engineer',
    company: 'DataForge Technologies',
    location: 'Raleigh, NC',
    workMode: 'HYBRID',
    salaryMin: 130000,
    salaryMax: 165000,
    currency: 'USD',
    experienceRequired: 4,
    experienceLevel: 'Senior',
    description: 'Architect scalable batch and streaming pipelines processing terabytes of data daily. You will work with Python, PostgreSQL, Spark, and AWS.',
    responsibilities: [
      'Build ETL / ELT workflows using Python and workflow orchestrators',
      'Maintain data warehouse schemas for analytics consumption',
      'Ensure data governance, quality checks, and lineage tracking',
      'Optimize complex SQL transformations for maximum efficiency'
    ],
    requirements: [
      '4+ years building production data pipelines',
      'Advanced Python programming and SQL query optimization',
      'Hands-on experience with cloud data storage (AWS S3, Redshift, or Snowflake)',
      'Experience with Docker and CI/CD pipelines'
    ],
    requiredSkills: ['Python', 'SQL', 'PostgreSQL', 'AWS', 'Docker'],
    preferredSkills: ['pandas', 'Git', 'CI/CD', 'Machine Learning'],
    active: true,
    applicantCount: 18
  },
  {
    id: 'job-12-qa-automation',
    title: 'QA Automation Engineer',
    company: 'ReliableSoft Global',
    location: 'Dallas, TX',
    workMode: 'REMOTE',
    salaryMin: 95000,
    salaryMax: 125000,
    currency: 'USD',
    experienceRequired: 2,
    experienceLevel: 'Mid-Level',
    description: 'Ensure our web applications adhere to the highest standard of quality and resilience. You will construct end-to-end automation frameworks with Playwright and Cypress.',
    responsibilities: [
      'Design, write, and execute automated UI and API test suites',
      'Integrate automated tests into continuous deployment pipelines',
      'Perform exploratory testing on new features and document bug reports',
      'Collaborate with developers to shift testing left in the development lifecycle'
    ],
    requirements: [
      '2+ years in automated software testing',
      'Proficiency in JavaScript or Python for test scripting',
      'Experience with modern test frameworks (Playwright, Cypress, Jest)',
      'Understanding of web technologies (HTML, CSS, HTTP REST APIs)'
    ],
    requiredSkills: ['JavaScript', 'HTML5', 'CSS3', 'Git', 'REST APIs'],
    preferredSkills: ['Python', 'TypeScript', 'CI/CD', 'Docker'],
    active: true,
    applicantCount: 17
  },
  {
    id: 'job-13-security-analyst',
    title: 'Application Security Engineer',
    company: 'ShieldGate Defense',
    location: 'Washington, DC',
    workMode: 'HYBRID',
    salaryMin: 140000,
    salaryMax: 180000,
    currency: 'USD',
    experienceRequired: 4,
    experienceLevel: 'Senior',
    description: 'Protect our SaaS platform and user data. You will conduct threat modeling, perform code audits, implement OWASP security best practices, and lead incident response.',
    responsibilities: [
      'Conduct automated and manual security vulnerability assessments on web apps',
      'Implement SAST/DAST tooling inside our GitHub CI/CD pipelines',
      'Partner with engineers to remediate security findings in Java and Python services',
      'Define security standards for authentication, encryption, and authorization'
    ],
    requirements: [
      '4+ years in application security, penetration testing, or DevSecOps',
      'Deep understanding of OWASP Top 10, OAuth2, and cryptography fundamentals',
      'Ability to read and audit Java, Python, and JavaScript source code',
      'Familiarity with cloud security configurations (AWS IAM, Security Groups)'
    ],
    requiredSkills: ['Python', 'Java', 'AWS', 'Docker', 'Git'],
    preferredSkills: ['CI/CD', 'REST APIs', 'PostgreSQL'],
    active: true,
    applicantCount: 9
  },
  {
    id: 'job-14-uiux-developer',
    title: 'UI/UX Design Technologist',
    company: 'Aesthetic Studios',
    location: 'New York, NY',
    workMode: 'REMOTE',
    salaryMin: 110000,
    salaryMax: 140000,
    currency: 'USD',
    experienceRequired: 3,
    experienceLevel: 'Mid-Level',
    description: 'Work at the intersection of product design and engineering. You will create rapid design prototypes and craft world-class interactive micro-animations with React.',
    responsibilities: [
      'Translate Figma designs into fluid React and Tailwind CSS components',
      'Build engaging micro-interactions and transitions with modern CSS and animation libraries',
      'Establish and maintain accessible design system tokens and pattern libraries',
      'Conduct user testing sessions to iterate on visual hierarchy and ergonomics'
    ],
    requirements: [
      '3+ years building responsive web frontends with React',
      'Mastery of modern CSS, Tailwind CSS, and layout architectures (Flexbox/Grid)',
      'Keen eye for typography, spacing, color contrast, and micro-interactions',
      'Proficiency with Git and collaborative development workflows'
    ],
    requiredSkills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS'],
    preferredSkills: ['TypeScript', 'Next.js', 'Git'],
    active: true,
    applicantCount: 24
  },
  {
    id: 'job-15-cloud-architect',
    title: 'Lead Cloud Solutions Architect',
    company: 'Apex Cloud Advisory',
    location: 'San Jose, CA',
    workMode: 'HYBRID',
    salaryMin: 165000,
    salaryMax: 215000,
    currency: 'USD',
    experienceRequired: 6,
    experienceLevel: 'Lead',
    description: 'Provide high-level technical direction for enterprise cloud migrations. Architect multi-cloud architectures with high resilience, disaster recovery, and cost efficiency.',
    responsibilities: [
      'Formulate cloud architectural blueprints on AWS and Google Cloud Platform',
      'Advise engineering leadership on microservice decomposition and event streaming',
      'Evaluate third-party vendor tooling and ensure SOC2/HIPAA compliance',
      'Mentor senior engineers in distributed systems design'
    ],
    requirements: [
      '6+ years architecting enterprise distributed cloud solutions',
      'Recognized cloud certification (AWS Solutions Architect Professional or GCP Fellow)',
      'Extensive hands-on experience with Kubernetes, Terraform, and cloud networking',
      'Executive communication skills'
    ],
    requiredSkills: ['AWS', 'Kubernetes', 'Docker', 'Microservices', 'CI/CD'],
    preferredSkills: ['Google Cloud Platform', 'Python', 'Java'],
    active: true,
    applicantCount: 8
  },
  {
    id: 'job-16-entry-frontend',
    title: 'Junior Frontend Engineer',
    company: 'BrightByte Media',
    location: 'Philadelphia, PA',
    workMode: 'HYBRID',
    salaryMin: 70000,
    salaryMax: 88000,
    currency: 'USD',
    experienceRequired: 1,
    experienceLevel: 'Entry-Level',
    description: 'Kickstart your frontend career! Join an enthusiastic team maintaining dynamic consumer dashboards, learning directly from staff engineers.',
    responsibilities: [
      'Develop interactive components using React and clean CSS',
      'Consume backend REST APIs and handle client-side error states',
      'Fix styling and layout bugs across multiple screen resolutions',
      'Write unit tests using Jest and React Testing Library'
    ],
    requirements: [
      '1+ year of academic or internship experience with React and JavaScript',
      'Firm understanding of HTML5 semantics and CSS styling techniques',
      'Basic knowledge of Git version control',
      'Strong drive to learn and grow as a software engineer'
    ],
    requiredSkills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Git'],
    preferredSkills: ['Tailwind CSS', 'TypeScript', 'REST APIs'],
    active: true,
    applicantCount: 46
  },
  {
    id: 'job-17-fastapi-backend',
    title: 'Microservices Backend Engineer (FastAPI)',
    company: 'Zenith Health Systems',
    location: 'Minneapolis, MN',
    workMode: 'REMOTE',
    salaryMin: 120000,
    salaryMax: 150000,
    currency: 'USD',
    experienceRequired: 3,
    experienceLevel: 'Mid-Level',
    description: 'Help build HIPAA-compliant telehealth APIs handling millions of appointments. Work with modern Python 3.12, FastAPI, PostgreSQL, and Redis.',
    responsibilities: [
      'Develop scalable, typed APIs using FastAPI and Pydantic',
      'Optimize query throughput on PostgreSQL using async SQLAlchemy',
      'Implement role-based authorization and end-to-end token encryption',
      'Deploy services via Docker containers on AWS ECS'
    ],
    requirements: [
      '3+ years backend development experience with Python',
      'Experience with FastAPI or similar async Python frameworks',
      'Strong SQL database modeling and indexing skills',
      'Commitment to writing clean, maintainable, typed code'
    ],
    requiredSkills: ['Python', 'FastAPI', 'PostgreSQL', 'Git', 'REST APIs'],
    preferredSkills: ['Docker', 'AWS', 'Redis', 'CI/CD'],
    active: true,
    applicantCount: 21
  },
  {
    id: 'job-18-fullstack-ts',
    title: 'Full Stack TypeScript Developer',
    company: 'Vanguard Systems',
    location: 'Boston, MA',
    workMode: 'HYBRID',
    salaryMin: 118000,
    salaryMax: 148000,
    currency: 'USD',
    experienceRequired: 3,
    experienceLevel: 'Mid-Level',
    description: 'We believe in end-to-end TypeScript. You will build unified full-stack applications with Next.js, Node.js, and Prisma, shipping features rapidly from concept to release.',
    responsibilities: [
      'Build end-to-end features with Next.js, React, and Node.js',
      'Model database entities with Prisma and PostgreSQL',
      'Implement authentication flows and third-party integrations',
      'Maintain continuous integration workflows and deployment health'
    ],
    requirements: [
      '3+ years full stack web development with TypeScript',
      'Experience with Next.js or React SSR frameworks',
      'Solid command of SQL databases and schema migrations',
      'Strong communication and independent problem-solving skills'
    ],
    requiredSkills: ['TypeScript', 'React', 'Node.js', 'JavaScript', 'PostgreSQL'],
    preferredSkills: ['Next.js', 'Tailwind CSS', 'Docker', 'Git'],
    active: true,
    applicantCount: 25
  }
];

// ---------------------------------------------------------
// SEEDING EXECUTION
// ---------------------------------------------------------

async function main() {
  if (isDryRun) {
    console.log('\n[Dry-Run Validation]');
    console.log(`✓ Validated ${SKILLS_DATA.length} skills in standard taxonomy.`);
    console.log(`✓ Validated ${JOBS_DATA.length} realistic jobs across engineering disciplines.`);
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@skillmatch.ai';
    const demoEmail = process.env.DEMO_EMAIL || 'demo@skillmatch.ai';
    console.log(`✓ Admin user configured: ${adminEmail} (Custom Claim: { admin: true }, Role: ADMIN)`);
    console.log(`✓ Demo candidate configured: ${demoEmail} (Role: USER)`);
    console.log('✓ All 12 Firestore collections and relational joins verified.');
    console.log('\nDry-run completed successfully! All data structures are valid.');
    return;
  }

  console.log('\n=== Step 1: Create Admin and Demo Users in Firebase Auth ===');

  // 1. Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@skillmatch.ai';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  let adminUid;

  try {
    const existingAdmin = await auth.getUserByEmail(adminEmail);
    adminUid = existingAdmin.uid;
    console.log(`Admin user already exists in Auth: ${adminEmail} (UID: ${adminUid})`);
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      const createdAdmin = await auth.createUser({
        email: adminEmail,
        password: adminPassword,
        displayName: 'SkillMatch Admin',
        emailVerified: true
      });
      adminUid = createdAdmin.uid;
      console.log(`Created Admin user: ${adminEmail} (UID: ${adminUid})`);
    } else {
      console.error('Error fetching admin user:', err.message);
      adminUid = 'admin-uid-default';
    }
  }

  // Set Custom Claim { admin: true } on Admin user
  if (adminUid && !adminUid.startsWith('admin-uid-default')) {
    await auth.setCustomUserClaims(adminUid, { admin: true });
    console.log(`✓ Set custom claim { admin: true } for UID: ${adminUid}`);
  }

  // 2. Demo User
  const demoEmail = process.env.DEMO_EMAIL || 'demo@skillmatch.ai';
  const demoPassword = process.env.DEMO_PASSWORD || 'demo123';
  let demoUid;

  try {
    const existingDemo = await auth.getUserByEmail(demoEmail);
    demoUid = existingDemo.uid;
    console.log(`Demo user already exists in Auth: ${demoEmail} (UID: ${demoUid})`);
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      const createdDemo = await auth.createUser({
        email: demoEmail,
        password: demoPassword,
        displayName: 'Alex Morgan',
        emailVerified: true
      });
      demoUid = createdDemo.uid;
      console.log(`Created Demo user: ${demoEmail} (UID: ${demoUid})`);
    } else {
      console.error('Error fetching demo user:', err.message);
      demoUid = 'demo-uid-default';
    }
  }

  console.log('\n=== Step 2: Seed Users Collection in Firestore ===');
  const now = admin.firestore.Timestamp.now();

  // Admin user doc
  await db.collection('users').doc(adminUid).set({
    uid: adminUid,
    email: adminEmail,
    displayName: 'SkillMatch Admin',
    role: 'ADMIN',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    createdAt: now,
    updatedAt: now
  }, { merge: true });
  console.log(`✓ Seeded users/${adminUid} (Role: ADMIN)`);

  // Demo user doc
  await db.collection('users').doc(demoUid).set({
    uid: demoUid,
    email: demoEmail,
    displayName: 'Alex Morgan',
    role: 'USER',
    phone: '+1 (555) 234-5678',
    location: 'Austin, TX',
    bio: 'Software engineer passionate about building scalable web applications with Java, React, and Python.',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
    preferredRoles: ['Full Stack Developer', 'Java Developer', 'Backend Developer'],
    preferredLocations: ['Austin, TX', 'Remote'],
    preferredWorkMode: 'HYBRID',
    createdAt: now,
    updatedAt: now
  }, { merge: true });
  console.log(`✓ Seeded users/${demoUid} (Role: USER)`);

  console.log('\n=== Step 3: Seed Skills Catalog ===');
  let skillBatch = db.batch();
  let count = 0;
  for (const skill of SKILLS_DATA) {
    const docRef = db.collection('skills').doc(skill.id);
    skillBatch.set(docRef, {
      id: skill.id,
      name: skill.name,
      category: skill.category,
      aliases: skill.aliases,
      createdAt: now
    });
    count++;
  }
  await skillBatch.commit();
  console.log(`✓ Seeded ${count} standard skills in 'skills' collection`);

  console.log('\n=== Step 4: Seed 18 Realistic Jobs & JobSkills ===');
  for (const job of JOBS_DATA) {
    const postedDate = admin.firestore.Timestamp.fromDate(new Date(Date.now() - Math.floor(Math.random() * 14) * 86400000));
    const deadlineDate = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 86400000));

    await db.collection('jobs').doc(job.id).set({
      ...job,
      postedAt: postedDate,
      deadline: deadlineDate,
      createdBy: adminUid
    }, { merge: true });

    // Seed relational jobSkills
    for (const skillName of job.requiredSkills) {
      const jsId = `${job.id}_req_${skillName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      await db.collection('jobSkills').doc(jsId).set({
        id: jsId,
        jobId: job.id,
        skillName: skillName,
        isRequired: true,
        weight: 1.0
      }, { merge: true });
    }
    for (const skillName of job.preferredSkills) {
      const jsId = `${job.id}_pref_${skillName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      await db.collection('jobSkills').doc(jsId).set({
        id: jsId,
        jobId: job.id,
        skillName: skillName,
        isRequired: false,
        weight: 0.5
      }, { merge: true });
    }
  }
  console.log(`✓ Seeded ${JOBS_DATA.length} realistic jobs and linked jobSkills`);

  console.log('\n=== Step 5: Seed Demo User Profile Data (Skills, Education, Experience, Projects) ===');

  // Demo userSkills
  const demoSkills = [
    { name: 'Java', level: 'Advanced', yearsExperience: 3, verified: true },
    { name: 'Spring Boot', level: 'Intermediate', yearsExperience: 2, verified: true },
    { name: 'React', level: 'Advanced', yearsExperience: 3, verified: true },
    { name: 'JavaScript', level: 'Expert', yearsExperience: 4, verified: true },
    { name: 'PostgreSQL', level: 'Intermediate', yearsExperience: 2, verified: true },
    { name: 'Git', level: 'Advanced', yearsExperience: 4, verified: true },
    { name: 'HTML5', level: 'Advanced', yearsExperience: 4, verified: true },
    { name: 'CSS3', level: 'Advanced', yearsExperience: 4, verified: true },
    { name: 'Docker', level: 'Beginner', yearsExperience: 1, verified: false }
  ];

  for (const sk of demoSkills) {
    const id = `${demoUid}_${sk.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    await db.collection('userSkills').doc(id).set({
      id,
      userId: demoUid,
      skillId: sk.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: sk.name,
      level: sk.level,
      yearsExperience: sk.yearsExperience,
      verified: sk.verified,
      updatedAt: now
    }, { merge: true });
  }
  console.log(`✓ Seeded ${demoSkills.length} userSkills for demo user`);

  // Demo Education
  const eduId = `${demoUid}_edu1`;
  await db.collection('education').doc(eduId).set({
    id: eduId,
    userId: demoUid,
    degree: 'B.S. in Computer Science',
    institution: 'University of Texas at Austin',
    fieldOfStudy: 'Computer Science',
    startYear: 2019,
    endYear: 2023,
    gpa: '3.82',
    createdAt: now
  }, { merge: true });
  console.log(`✓ Seeded education entry for demo user`);

  // Demo Experience
  const expId1 = `${demoUid}_exp1`;
  await db.collection('experience').doc(expId1).set({
    id: expId1,
    userId: demoUid,
    company: 'Apex Digital Solutions',
    title: 'Software Engineer',
    location: 'Austin, TX',
    startDate: '2023-06',
    endDate: null,
    current: true,
    description: 'Develop full stack web applications and microservices using Java Spring Boot and React.',
    responsibilities: [
      'Engineered REST APIs handling 50k daily active users with sub-100ms response times',
      'Developed responsive single page application components in React and TypeScript',
      'Optimized SQL queries and indexing in PostgreSQL reducing load by 35%'
    ],
    technologiesUsed: ['Java', 'Spring Boot', 'React', 'PostgreSQL', 'Git'],
    createdAt: now
  }, { merge: true });
  console.log(`✓ Seeded experience entry for demo user`);

  // Demo Projects
  const projId1 = `${demoUid}_proj1`;
  await db.collection('projects').doc(projId1).set({
    id: projId1,
    userId: demoUid,
    title: 'E-Commerce Microservices Engine',
    description: 'Built a containerized e-commerce backend with product search, cart, and stripe checkout.',
    techStack: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker'],
    link: 'https://github.com/alexmorgan/ecommerce-microservices',
    role: 'Lead Developer',
    createdAt: now
  }, { merge: true });
  console.log(`✓ Seeded project entry for demo user`);

  // Demo Resume doc
  const resumeId = `resume_${demoUid}_001`;
  await db.collection('resumes').doc(resumeId).set({
    id: resumeId,
    userId: demoUid,
    fileName: 'Alex_Morgan_Software_Engineer_Resume.pdf',
    storagePath: `resumes/${demoUid}/Alex_Morgan_Software_Engineer_Resume.pdf`,
    fileSizeBytes: 245120,
    mimeType: 'application/pdf',
    uploadedAt: now,
    parsed: true,
    active: true
  }, { merge: true });
  console.log(`✓ Seeded resume metadata for demo user`);

  // Demo Resume Analysis doc
  const analysisId = `analysis_${demoUid}_001`;
  await db.collection('resumeAnalysis').doc(analysisId).set({
    id: analysisId,
    userId: demoUid,
    resumeId: resumeId,
    personal_info: {
      fullName: 'Alex Morgan',
      email: demoEmail,
      phone: '+1 (555) 234-5678',
      location: 'Austin, TX',
      linkedin: 'linkedin.com/in/alexmorgan-dev',
      github: 'github.com/alexmorgan'
    },
    education: [
      {
        degree: 'B.S. in Computer Science',
        institution: 'University of Texas at Austin',
        field: 'Computer Science',
        year: 2023,
        gpa: '3.82'
      }
    ],
    skills: ['Java', 'Spring Boot', 'React', 'JavaScript', 'TypeScript', 'PostgreSQL', 'Git', 'HTML5', 'CSS3', 'Docker'],
    experience: [
      {
        company: 'Apex Digital Solutions',
        position: 'Software Engineer',
        duration: 'June 2023 - Present (1 year 4 months)',
        responsibilities: [
          'Engineered REST APIs handling 50k daily active users with sub-100ms response times',
          'Developed responsive single page application components in React and TypeScript',
          'Optimized SQL queries and indexing in PostgreSQL reducing load by 35%'
        ]
      }
    ],
    projects: [
      {
        name: 'E-Commerce Microservices Engine',
        tech: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker'],
        description: 'Built a containerized e-commerce backend with product search, cart, and stripe checkout.'
      }
    ],
    certifications: ['Oracle Certified Associate, Java SE 8 Programmer'],
    experience_years: 2,
    scoreBreakdown: {
      skillsScore: 88,
      experienceScore: 80,
      educationScore: 95,
      projectsScore: 85,
      completenessScore: 92,
      overallScore: 88,
      reasons: [
        'High skill match with in-demand industry technologies (Java, Spring Boot, React)',
        'Accredited B.S. in Computer Science with high GPA (3.82)',
        'Production experience building scalable APIs and responsive UIs',
        'Strong portfolio project showcasing containerization and backend architecture'
      ]
    },
    isEdited: false,
    analyzedAt: now
  }, { merge: true });
  console.log(`✓ Seeded resumeAnalysis for demo user`);

  console.log('\n=== Step 6: Seed Sample Applications & Saved Jobs ===');

  // Application 1: Java Engineer (Interview)
  const app1Id = `app_${demoUid}_job01`;
  await db.collection('applications').doc(app1Id).set({
    id: app1Id,
    userId: demoUid,
    userEmail: demoEmail,
    userName: 'Alex Morgan',
    jobId: 'job-01-java-dev',
    jobTitle: 'Senior Java Backend Engineer',
    company: 'FinTech Innovations Inc.',
    status: 'Interview',
    resumeId: resumeId,
    matchScore: 83,
    appliedAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 5 * 86400000)),
    updatedAt: now,
    notes: 'Technical screen scheduled for Thursday.'
  }, { merge: true });

  // Application 2: Full Stack Engineer (Under Review)
  const app2Id = `app_${demoUid}_job02`;
  await db.collection('applications').doc(app2Id).set({
    id: app2Id,
    userId: demoUid,
    userEmail: demoEmail,
    userName: 'Alex Morgan',
    jobId: 'job-02-fullstack-dev',
    jobTitle: 'Full Stack Software Engineer',
    company: 'CloudScale Dynamics',
    status: 'Under Review',
    resumeId: resumeId,
    matchScore: 91,
    appliedAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 2 * 86400000)),
    updatedAt: now,
    notes: 'Resume forwarded to hiring manager.'
  }, { merge: true });

  // Application 3: Frontend Developer (Applied)
  const app3Id = `app_${demoUid}_job03`;
  await db.collection('applications').doc(app3Id).set({
    id: app3Id,
    userId: demoUid,
    userEmail: demoEmail,
    userName: 'Alex Morgan',
    jobId: 'job-03-frontend-dev',
    jobTitle: 'Senior Frontend Developer',
    company: 'Starlight Interactive',
    status: 'Applied',
    resumeId: resumeId,
    matchScore: 78,
    appliedAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 1 * 86400000)),
    updatedAt: now
  }, { merge: true });

  // Saved Jobs for Demo User
  const saved1 = `${demoUid}_job-04-python-dev`;
  await db.collection('savedJobs').doc(saved1).set({
    id: saved1,
    userId: demoUid,
    jobId: 'job-04-python-dev',
    savedAt: now
  }, { merge: true });

  const saved2 = `${demoUid}_job-18-fullstack-ts`;
  await db.collection('savedJobs').doc(saved2).set({
    id: saved2,
    userId: demoUid,
    jobId: 'job-18-fullstack-ts',
    savedAt: now
  }, { merge: true });

  console.log(`✓ Seeded 3 sample applications and 2 saved jobs for demo user`);

  console.log('\n======================================================');
  console.log('SkillMatch AI Seed Script Completed Successfully!');
  console.log('======================================================');
  console.log(`Admin account:  ${adminEmail}  /  ${adminPassword}`);
  console.log(`Demo account:   ${demoEmail}   /  ${demoPassword}`);
  console.log(`Total Jobs:     ${JOBS_DATA.length}`);
  console.log(`Total Skills:   ${SKILLS_DATA.length}`);
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('\nSeeder script failed with error:', err);
  process.exit(1);
});
