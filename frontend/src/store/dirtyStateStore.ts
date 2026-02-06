import { create } from 'zustand';

interface DirtyState {
  isDirty: boolean;
  dirtyFields: Set<string>;
  setDirty: (field?: string) => void;
  clearDirty: () => void;
  reset: () => void;
}

export const useDirtyStateStore = create<DirtyState>((set) => ({
  isDirty: false,
  dirtyFields: new Set<string>(),
  
  setDirty: (field?: string) => {
    set((state) => {
      const newDirtyFields = field 
        ? new Set([...state.dirtyFields, field])
        : state.dirtyFields;
      
      return {
        isDirty: true,
        dirtyFields: newDirtyFields,
      };
    });
  },
  
  clearDirty: () => {
    set({
      isDirty: false,
      dirtyFields: new Set(),
    });
  },
  
  reset: () => {
    set({
      isDirty: false,
      dirtyFields: new Set(),
    });
  },
}));
