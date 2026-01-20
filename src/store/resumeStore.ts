import { create } from 'zustand';

export interface Resume {
  _id?: string;
  title: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    linkedin: string;
    website: string;
  };
  summary: string;
  experience: any[];
  education: any[];
  skills: string[];
}

interface ResumeState {
  currentResume: Resume;
  setResume: (resume: Resume) => void;
  updateField: (field: keyof Resume, value: any) => void;
  updatePersonalInfo: (field: string, value: string) => void;
  addExperience: (exp: any) => void;
  addEducation: (edu: any) => void;
  resetResume: () => void;
}

const initialResume: Resume = {
  title: 'Untitled Resume',
  personalInfo: { fullName: '', email: '', phone: '', address: '', linkedin: '', website: '' },
  summary: '',
  experience: [],
  education: [],
  skills: [],
};

export const useResumeStore = create<ResumeState>((set) => ({
  currentResume: initialResume,
  setResume: (resume) => set({ currentResume: resume }),
  updateField: (field, value) => set((state) => ({
    currentResume: { ...state.currentResume, [field]: value }
  })),
  updatePersonalInfo: (field, value) => set((state) => ({
    currentResume: {
      ...state.currentResume,
      personalInfo: { ...state.currentResume.personalInfo, [field]: value }
    }
  })),
  addExperience: (exp) => set((state) => ({
    currentResume: { ...state.currentResume, experience: [...state.currentResume.experience, exp] }
  })),
  addEducation: (edu) => set((state) => ({
    currentResume: { ...state.currentResume, education: [...state.currentResume.education, edu] }
  })),
  resetResume: () => set({ currentResume: initialResume }),
}));
