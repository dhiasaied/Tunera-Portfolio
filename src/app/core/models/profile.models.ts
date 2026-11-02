import { IconName } from '../../shared/icon.component';

export type SectionId =
  | 'about'
  | 'services'
  | 'featured'
  | 'activity'
  | 'experience'
  | 'education'
  | 'certifications'
  | 'skills'
  | 'languages'
  | 'contact';

export interface SectionMeta {
  id: SectionId;
  label: string;
  icon: IconName;
}

export interface Identity {
  name: string;
  firstName: string;
  lastName: string;
  headline: string;
  availability: string;
  city: string;
  country: string;
  coordinates: string;
  email: string;
  linkedin: string;
  linkedinActivity: string;
  github: string;
  photo: string;
  summary: string;
  about: string[];
}

export interface Service {
  icon: IconName;
  title: string;
  description: string;
  stack: string[];
}

export interface FeaturedItem {
  kind: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  stack: string[];
}

export interface ActivityItem {
  kind: 'post' | 'certification' | 'milestone';
  date: string;
  title: string;
  body: string;
  tags: string[];
}

export interface Experience {
  role: string;
  company: string;
  location: string;
  period: string;
  type: string;
  highlights: string[];
  stack: string[];
}

export interface Education {
  degree: string;
  school: string;
  period: string;
  description: string;
  skills: string[];
}

export interface Certification {
  title: string;
  issuer: string;
  date: string;
  year: number;
}

export interface SkillGroup {
  id: string;
  label: string;
  icon: IconName;
  items: string[];
}

export interface Language {
  name: string;
  native: string;
  level: string;
  score: number;
}
