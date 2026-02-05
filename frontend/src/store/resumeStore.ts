import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  IResume, 
  IExperience, 
  IEducation, 
  IPersonalInfo, 
  ResumeField, 
  UpdateFieldValue,
  ApiResponse 
} from '@/types/shared';

// Re-export types for backward compatibility
export type { IResume, IExperience, IEducation, IPersonalInfo };

interface ResumeState {
  currentResume: IResume;
  resumes: IResume[];
  
  // Actions
  setResume: (resume: IResume) => void;
  setResumes: (resumes: IResume[]) => void;
  updatePersonalInfo: (field: keyof IPersonalInfo, value: string) => void;
  updateField: (field: ResumeField, value: UpdateFieldValue) => void;
  setSkills: (skills: string[]) => void;
  
  // Experience
  addExperience: (exp: IExperience) => void;
  updateExperience: (index: number, exp: IExperience) => void;
  removeExperience: (index: number) => void;

  // Education (Phải có các hàm này)
  addEducation: (edu: IEducation) => void;
  updateEducation: (index: number, edu: IEducation) => void;
  removeEducation: (index: number) => void;

  // AI Enhance
  aiEnhanceText: (text: string, type?: string) => Promise<string>;

  // AI Generate full resume
  aiGenerateFull: (payload: { prompt?: string; jobDescription?: string }) => Promise<{
    summary: string;
    experience: IExperience[];
    education: IEducation[];
    skills: string[];
  }>;

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
      resumes: [],

      setResume: (resume) => set({ currentResume: resume }),
      setResumes: (resumes) => set({ resumes }),

      updatePersonalInfo: (field, value) =>
        set((state) => ({
          currentResume: {
            ...state.currentResume,
            personalInfo: { ...state.currentResume.personalInfo, [field]: value },
          },
        })),

      updateField: (field, value) =>
        set((state) => ({
          currentResume: { ...state.currentResume, [field]: value },
        })),

      setSkills: (skills) =>
        set((state) => ({
          currentResume: { ...state.currentResume, skills },
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

      aiEnhanceText: async (text: string, type?: string) => {
        try {
          if (!text?.trim()) {
            throw new Error('Please enter some text to enhance');
          }
          
          const { api } = await import('@/lib/utils');
          const response = await api.aiEnhance(text, type);
          
          if (!response.success || !response.data) {
            const errorMsg = response.message || response.error || 'Failed to enhance text';
            throw new Error(errorMsg);
          }
          
          return response.data;
        } catch (error) {
          // Re-throw error so caller can handle it (show toast, etc.)
          const errorMessage = error instanceof Error ? error.message : 'AI enhancement failed';
          throw new Error(errorMessage);
        }
      },

      aiGenerateFull: async (payload) => {
        try {
          const { api } = await import('@/lib/utils');
          const response = await api.aiGenerateFullResume(payload);
          return response.data as {
            summary: string;
            experience: IExperience[];
            education: IEducation[];
            skills: string[];
          };
        } catch (error) {
          console.error('AI Generate full resume failed:', error);
          throw error;
        }
      },

      resetResume: () => set({ currentResume: initialResume }),
    }),
    {
      name: 'resume-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);