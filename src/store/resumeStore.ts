import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// --- Interfaces ---
export interface IExperience {
  id: string;
  _id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

// QUAN TRỌNG: Phải export cái này
export interface IEducation {
  id: string;
  _id?: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface IPersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  website: string;
}

export interface IResume {
  _id?: string;
  title: string;
  personalInfo: IPersonalInfo;
  summary: string;
  experience: IExperience[];
  education: IEducation[];
  skills: string[];
}

interface ResumeState {
  currentResume: IResume;
  
  // Actions
  setResume: (resume: IResume) => void;
  updatePersonalInfo: (field: keyof IPersonalInfo, value: string) => void;
  
  // Experience
  addExperience: (exp: IExperience) => void;
  updateExperience: (index: number, exp: IExperience) => void;
  removeExperience: (index: number) => void;

  // Education (Phải có các hàm này)
  addEducation: (edu: IEducation) => void;
  updateEducation: (index: number, edu: IEducation) => void;
  removeEducation: (index: number) => void;

  resetResume: () => void;
}

const initialResume: IResume = {
  title: 'Untitled Resume',
  personalInfo: {
    fullName: '', email: '', phone: '', address: '', linkedin: '', website: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
};

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      currentResume: initialResume,

      setResume: (resume) => set({ currentResume: resume }),

      updatePersonalInfo: (field, value) =>
        set((state) => ({
          currentResume: {
            ...state.currentResume,
            personalInfo: { ...state.currentResume.personalInfo, [field]: value },
          },
        })),

      // Experience Logic
      addExperience: (exp) =>
        set((state) => ({
          currentResume: {
            ...state.currentResume,
            experience: [...state.currentResume.experience, exp],
          },
        })),
      updateExperience: (index, exp) =>
        set((state) => {
          const newExp = [...state.currentResume.experience];
          newExp[index] = exp;
          return { currentResume: { ...state.currentResume, experience: newExp } };
        }),
      removeExperience: (index) =>
        set((state) => ({
          currentResume: {
            ...state.currentResume,
            experience: state.currentResume.experience.filter((_, i) => i !== index),
          },
        })),

      // Education Logic
      addEducation: (edu) =>
        set((state) => ({
          currentResume: {
            ...state.currentResume,
            education: [...state.currentResume.education, edu],
          },
        })),
      updateEducation: (index, edu) =>
        set((state) => {
          const newEdu = [...state.currentResume.education];
          newEdu[index] = edu;
          return { currentResume: { ...state.currentResume, education: newEdu } };
        }),
      removeEducation: (index) =>
        set((state) => ({
          currentResume: {
            ...state.currentResume,
            education: state.currentResume.education.filter((_, i) => i !== index),
          },
        })),

      resetResume: () => set({ currentResume: initialResume }),
    }),
    {
      name: 'resume-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);