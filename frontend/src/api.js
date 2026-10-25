export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function getSessionUser() {
  try {
    return JSON.parse(localStorage.getItem("wmsu_user"));
  } catch {
    return null;
  }
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }
  if (!response.ok) throw new Error(result.error || "Request failed.");
  return result.data;
}