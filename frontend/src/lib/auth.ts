export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed.token || null;
  } catch {
    return null;
  }
};

export const clearAuthToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("user");
};
