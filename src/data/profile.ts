// Single source of truth for all personal content.
// The terminal, the welcome screen, the CV viewer and the SEO metadata all read from here.
// Do not add dates, metrics or claims here that are not true — everything is published.

export interface Link {
  label: string;
  url: string;
  /** Text shown in the terminal, e.g. "linkedin.com/in/…" */
  display?: string;
  note?: string;
}

export interface Experience {
  id: string; // used as the argument: `experience <id>`
  company: string;
  role: string;
  domain: string;
  current?: boolean;
  /** e.g. "2021 — 2022 · 13 months". Leave undefined rather than guessing. */
  period?: string;
  summary: string;
  location?: string;
  products?: { name: string; description: string }[];
  work: string[];
  url?: string;
}

export interface Education {
  id: string; // `education <id>`
  degree: string;
  institution?: string;
  short: string;
  score: string;
  period?: string;
  note?: string;
}

export interface Expertise {
  id: string; // `expertise <id>`
  aliases: string[];
  title: string;
  summary: string;
  areas: string[];
}

export interface Video {
  /** YouTube video id */
  id: string;
  title: string;
}

export interface Project {
  id: string;
  title: string;
  context: string;
  description: string;
  contributions: string[];
  links?: Link[];
  videos?: Video[];
}

export interface Media {
  /** Path under /public, e.g. "media/techfest.jpg" (no leading slash) */
  src: string;
  alt: string;
  caption: string;
}

export interface Award {
  place: 'Champion' | 'Runner-up';
  event: string;
  year: number;
  host: string;
  note?: string;
  media: Media[];
  video?: Video;
}

const agvVideos: Video[] = [
  { id: '20r8YGHeb3s', title: 'Line-following AGV for the garments industry — 1' },
  { id: 'SLYWBGv3YfI', title: 'Line-following AGV for the garments industry — 2' },
];

export const profile = {
  name: 'Md. Shafikul Islam',
  shortName: 'Shafikul Islam',
  alias: 'MSI Shafik',
  handle: 'shafik',
  role: 'Lead Software Engineer',
  title: 'Lead Software Engineer / Agentic AI Developer',
  identity: ['Software Engineer', 'AI Agent Developer', 'Agentic AI Solutions Developer'],
  company: { name: 'Mevrik', url: undefined as string | undefined },
  location: 'Dhaka, Bangladesh',
  tagline: 'Currently building intelligent agents and AI-powered communication systems at Mevrik.',
  focus: ['AI agents & RAG', 'Backend & DevOps', 'Real-time messaging', 'Voice & telephony'],

  summary:
    'Lead Software Engineer at Mevrik, specialising in AI agent development and Retrieval-Augmented ' +
    'Generation (RAG), backed by deep backend and DevOps experience. Builds intelligent customer ' +
    'service systems across omnichannel messaging, real-time communication and telephony.',
  stack:
    'Backend-focused by training; with AI-assisted engineering, now delivering end-to-end across the full stack.',

  story: [
    'My original academic discipline was Textile Engineering.',
    'At DUET I discovered programming through robotics. As team leader of DUET Rising Stars I competed in ' +
      'national inter-university autonomous robotics competitions, and our team built line-following ' +
      'Automated Guided Vehicles for the garments industry.',
    'That work pulled me into professional software engineering in 2019. In 2024 I completed a master’s ' +
      'degree in Computer Science at Jahangirnagar University.',
    'Since then my work has spanned renewable energy, digital commerce, healthcare technology, ' +
      'customer service systems and, now, artificial intelligence.',
  ],

  experience: [
    {
      id: 'mevrik',
      company: 'Mevrik',
      role: 'Lead Software Engineer',
      domain: 'Intelligent Communication & Agentic AI',
      current: true,
      period: 'Oct 2022 — Present',
      summary:
        'Leading engineering of customer service and communication technology — from omnichannel ' +
        'messaging infrastructure to AI agents that work across chat and voice.',
      work: [
        'Developing AI agents and Agentic AI solutions',
        'Building Retrieval-Augmented Generation (RAG) and conversational AI systems',
        'Integrating Voice AI with telephony systems',
        'Developing real-time messaging and communication infrastructure',
        'Building omnichannel customer experience systems',
        'Developing customer service solutions across digital platforms',
        'Backend software engineering and distributed system architecture',
        'Cloud infrastructure and DevOps',
      ],
    },
    {
      id: 'strativ',
      company: 'Strativ',
      role: 'Backend Software Engineer',
      domain: 'Healthcare Technology',
      period: '2021 — 2022 · 13 months',
      location: 'Sweden-based software company',
      summary: 'Backend engineering for healthcare technology products.',
      products: [
        { name: 'Vaccina', description: 'COVID-19 vaccination-related healthcare services' },
        { name: 'Dermly', description: 'Skin diagnosis-related healthcare technology' },
      ],
      work: ['Backend engineering for healthcare technology projects'],
    },
    {
      id: 'evaly',
      company: 'Evaly',
      role: 'Backend Software Engineer',
      domain: 'Digital Commerce',
      period: '2021 · 9 months',
      summary: 'Engineering team of one of Bangladesh’s major e-commerce companies.',
      products: [
        { name: 'eFood', description: 'Food delivery application' },
        { name: 'eJob', description: 'Job search platform' },
      ],
      work: ['Backend engineering for e-commerce products'],
    },
    {
      id: 'solshare',
      company: 'SOLshare',
      role: 'Backend Software Engineer',
      domain: 'Renewable Energy & IoT',
      period: '2019',
      location: 'German-Bangladeshi joint venture',
      summary: 'IoT-based solar energy solutions.',
      work: ['Backend software engineering for renewable energy technology and connected devices'],
    },
  ] as Experience[],

  education: [
    {
      id: 'masters',
      degree: 'Master of Science in Computer Science',
      short: 'M.Sc. Computer Science',
      institution: 'Jahangirnagar University',
      score: '3.85 / 4.00',
      period: '2024',
    },
    {
      id: 'bachelors',
      degree: 'Bachelor of Science in Textile Engineering',
      short: 'B.Sc. Textile Engineering',
      institution: 'Dhaka University of Engineering & Technology (DUET)',
      score: '3.38 / 4.00',
      period: '2019',
      note: 'Where programming and robotics started.',
    },
    {
      id: 'diploma',
      degree: 'Diploma in Textile Engineering',
      short: 'Diploma, Textile Engineering',
      institution: 'Tangail Textile Institute',
      score: '3.77 / 4.00',
    },
    {
      id: 'ssc',
      degree: 'Secondary School Certificate — Science',
      short: 'SSC, Science',
      score: '5.00 / 5.00',
    },
  ] as Education[],

  expertise: [
    {
      id: 'ai',
      aliases: ['agentic', 'agents', 'llm', 'rag'],
      title: 'Agentic AI & RAG',
      summary: 'AI agents that retrieve, reason and act inside real products.',
      areas: [
        'AI agent development',
        'Retrieval-Augmented Generation (RAG)',
        'Agentic AI architectures',
        'Knowledge retrieval',
        'Intelligent conversational systems',
        'Practical AI applications',
      ],
    },
    {
      id: 'infrastructure',
      aliases: ['backend', 'infra', 'devops', 'cloud', 'fullstack'],
      title: 'Backend, DevOps & Full Stack',
      summary: 'Backend-first; AI-assisted engineering now makes end-to-end delivery practical.',
      areas: [
        'Backend engineering',
        'Distributed systems',
        'Software architecture',
        'Cloud infrastructure',
        'DevOps',
        'Full-stack delivery',
      ],
    },
    {
      id: 'customer-service',
      aliases: ['cx', 'support', 'omnichannel'],
      title: 'Customer Service Engineering',
      summary: 'The systems behind how businesses talk to their customers.',
      areas: [
        'Omnichannel customer experience platforms',
        'Digital customer service solutions',
        'AI-powered customer support',
      ],
    },
    {
      id: 'messaging',
      aliases: ['realtime', 'real-time', 'chat'],
      title: 'Real-Time Communication',
      summary: 'Conversations that have to arrive, in order, right now.',
      areas: ['Real-time messaging', 'Event-driven communication', 'Reliable conversational infrastructure'],
    },
    {
      id: 'telephony',
      aliases: ['voice', 'voice-ai'],
      title: 'Voice AI & Telephony',
      summary: 'Connecting traditional phone infrastructure to intelligent agents.',
      areas: [
        'Voice-enabled AI agents',
        'Telephony systems',
        'Integration between communication infrastructure and intelligent agents',
      ],
    },
    {
      id: 'robotics',
      aliases: ['iot', 'hardware'],
      title: 'Robotics & IoT',
      summary: 'Where it started — software that moves and measures things in the physical world.',
      areas: ['Autonomous robotics', 'Industrial IoT and energy monitoring', 'Connected devices'],
    },
  ] as Expertise[],

  robotics: {
    team: 'DUET Rising Stars',
    intro:
      'During my undergraduate studies at DUET I became deeply involved in programming and robotics. ' +
      'As team leader of DUET Rising Stars I competed in national inter-university autonomous robotics competitions.',
    awards: [
      {
        place: 'Champion',
        event: 'DUET TechFest',
        year: 2017,
        host: 'Dhaka University of Engineering & Technology',
        note: 'Race of Victory — champion among 70+ teams from 40+ universities, as team leader.',
        media: [
          { src: 'media/DUET-TECHFEST-2017-1.jpeg', alt: 'DUET Rising Stars holding the DUET TechFest 2017 champion cheque and trophy for Race of Victory', caption: 'Champion — Race of Victory, DUET TechFest 2017' },
          { src: 'media/DUET-TECHFEST-2017.jpeg', alt: 'The team receiving the DUET TechFest 2017 trophy from the organisers', caption: 'Receiving the trophy, DUET TechFest 2017' },
        ],
        video: { id: 'Rb9oIEXdq3M', title: 'DUET TechFest 2017 — championship run' },
      },
      {
        place: 'Runner-up',
        event: 'DUSS Science Festival',
        year: 2017,
        host: 'University of Dhaka',
        media: [
          { src: 'media/DUSS-2017.jpeg', alt: 'Team members celebrating with their robot in front of the DUSS Science Festival banner at night', caption: 'Runner-up — DUSS Science Festival 2017' },
        ],
      },
      {
        place: 'Champion',
        event: 'Robolution',
        year: 2018,
        host: 'Military Institute of Science and Technology (MIST)',
        note: 'SeeGuider competition.',
        media: [
          { src: 'media/Robolution-2018-2.jpg', alt: 'Five team members with their robots holding the MIST Robotics Club champion cheque for the SeeGuider competition at Robolution 2018', caption: 'Champion — SeeGuider, Robolution 2018' },
          { src: 'media/robolution-2018.jpg', alt: 'Award presentation on stage at the Robolution 2018 closing ceremony', caption: 'Robolution 2018 closing ceremony' },
        ],
      },
      {
        place: 'Runner-up',
        event: 'Makers’ Mania',
        year: 2018,
        host: 'Fab Lab IUB, Independent University, Bangladesh',
        media: [
          { src: 'media/IUB-Makers-Mania-2018.jpg', alt: 'Team on stage at Makers’ Mania 2018, Fab Lab IUB, receiving a certificate', caption: 'Runner-up — Makers’ Mania 2018, Fab Lab IUB' },
        ],
      },
    ] as Award[],
    agv:
      'Our team also developed and supplied line-following Automated Guided Vehicles (AGVs) to a reputed ' +
      'garments manufacturing company in Bangladesh — robots for material transportation across the production floor.',
    agvVideos,
    closing: 'This was the beginning of my practical engineering and programming journey.',
  },

  projects: [
    {
      id: 'agentic-cx',
      title: 'Agentic AI customer service',
      context: 'Mevrik',
      description: 'AI agents, RAG and conversational AI for customer service across digital channels.',
      contributions: ['AI agent and Agentic AI solution development', 'Retrieval-Augmented Generation', 'Conversational AI systems'],
    },
    {
      id: 'realtime-platform',
      title: 'Omnichannel real-time communication',
      context: 'Mevrik',
      description: 'Omnichannel customer experience systems and real-time messaging infrastructure.',
      contributions: ['Real-time messaging and communication infrastructure', 'Distributed system architecture'],
    },
    {
      id: 'voice-ai',
      title: 'Voice AI & telephony integration',
      context: 'Mevrik',
      description: 'Integrating Voice AI with telephony systems.',
      contributions: ['Voice-enabled AI agents', 'Telephony integration'],
    },
    {
      id: 'technurah',
      title: 'Technurah — industrial energy monitoring',
      context: 'Industrial IoT',
      description: 'IoT-powered, real-time energy and production monitoring for factories.',
      contributions: ['Industrial IoT energy monitoring system'],
      links: [{ label: 'technurah.com', url: 'https://technurah.com/' }],
    },
    {
      id: 'solar-iot',
      title: 'Renewable energy & IoT backend',
      context: 'SOLshare',
      description: 'Backend software for IoT-based solar energy solutions.',
      contributions: ['Backend engineering for renewable energy technology and connected devices'],
    },
    {
      id: 'agv',
      title: 'Line-following industrial AGVs',
      context: 'DUET Rising Stars',
      description:
        'Automated Guided Vehicles developed and supplied to a garments manufacturer for material transport across the production floor.',
      contributions: ['Development of line-following AGVs as part of the team'],
      videos: agvVideos,
    },
    {
      id: 'autonomous-robots',
      title: 'Autonomous competition robots',
      context: 'DUET Rising Stars',
      description: 'Autonomous robots for national inter-university robotics competitions.',
      contributions: ['Team leader; programming and robot development'],
      videos: [{ id: 'Rb9oIEXdq3M', title: 'DUET TechFest 2017 — championship run' }],
    },
    {
      id: 'kidslab',
      title: 'Kids Lab Center',
      context: 'Founder',
      description: 'A science learning centre for children — “Big Discoveries for Little Scientists”.',
      contributions: ['Founder'],
      links: [{ label: 'kidslab.center', url: 'https://kidslab.center/' }],
    },
  ] as Project[],

  /** Leave a field undefined to hide it. Never put a placeholder address here. */
  contact: {
    email: undefined as string | undefined,
    phone: undefined as string | undefined,
  },
  links: [
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/shafikdotdev/', display: 'linkedin.com/in/shafikdotdev' },
    { label: 'Blog', url: 'https://eshafik.wordpress.com/', display: 'eshafik.wordpress.com', note: 'earlier writing' },
    { label: 'Technurah', url: 'https://technurah.com/', display: 'technurah.com', note: 'industrial energy monitoring' },
    { label: 'Kids Lab', url: 'https://kidslab.center/', display: 'kidslab.center', note: 'founder' },
  ] as Link[],
  blog: { label: 'eshafik.wordpress.com', url: 'https://eshafik.wordpress.com/' },

};

export type Profile = typeof profile;

// ---- Engineering journey (git-graph) --------------------------------------------------------
// Lanes: 0 = main line, 1 = side branch. `cmd` runs when the node is clicked.
export type JourneyRow =
  | { kind: 'node'; lane: number; lanes: number[]; title: string; meta: string; when?: string; cmd: string; head?: boolean; tag?: string; sub?: { label: string; cmd: string }[]; first?: boolean; last?: boolean }
  | { kind: 'fork' | 'merge'; from: number; to: number; lanes: number[] };

export const journey: JourneyRow[] = [
  { kind: 'node', lane: 0, lanes: [0], title: 'B.Sc. Textile Engineering', meta: 'DUET', when: '2019', cmd: 'education bachelors', tag: 'origin', first: true },
  { kind: 'fork', from: 0, to: 1, lanes: [0] },
  { kind: 'node', lane: 1, lanes: [0, 1], title: 'Programming & Robotics', meta: 'Team leader, DUET Rising Stars', cmd: 'robotics', tag: 'robotics' },
  { kind: 'node', lane: 1, lanes: [0, 1], title: 'National championships', meta: 'TechFest · DUSS · Robolution · Makers’ Mania', when: '2017–18', cmd: 'achievements' },
  { kind: 'node', lane: 1, lanes: [0, 1], title: 'Industrial AGVs', meta: 'Line-following robots for garments', cmd: 'projects agv' },
  { kind: 'merge', from: 1, to: 0, lanes: [0] },
  { kind: 'node', lane: 0, lanes: [0], title: 'SOLshare', meta: 'Renewable Energy & IoT', when: '2019', cmd: 'experience solshare' },
  { kind: 'node', lane: 0, lanes: [0], title: 'Evaly', meta: 'Digital Commerce', when: '2021', cmd: 'experience evaly' },
  { kind: 'node', lane: 0, lanes: [0], title: 'Strativ', meta: 'Healthcare Technology', when: '2021–22', cmd: 'experience strativ' },
  { kind: 'node', lane: 0, lanes: [0], title: 'Mevrik', meta: 'Lead Software Engineer · Intelligent Communication', when: 'Oct 2022', cmd: 'experience mevrik' },
  { kind: 'fork', from: 0, to: 1, lanes: [0] },
  { kind: 'node', lane: 1, lanes: [0, 1], title: 'M.Sc. Computer Science', meta: 'Jahangirnagar University', when: '2024', cmd: 'education masters', tag: 'cs' },
  { kind: 'merge', from: 1, to: 0, lanes: [0] },
  {
    kind: 'node', lane: 0, lanes: [0], title: 'Agentic AI', meta: 'AI agents · RAG · Voice — at Mevrik', cmd: 'expertise ai', head: true, last: true,
    sub: [
      { label: 'AI agents & RAG', cmd: 'expertise ai' },
      { label: 'Real-time messaging', cmd: 'expertise messaging' },
      { label: 'Voice & telephony', cmd: 'expertise telephony' },
    ],
  },
];
