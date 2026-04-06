const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://future-forge-backend-production.up.railway.app"
).replace(/\/$/, "");

export const API_ENDPOINTS = {
  auth: {
    register: "/api/auth/register",
    login: "/api/auth/login",
  },
  users: {
    list: "/api/users",
  },
  integration: {
    questions: "/api/admin/questions/simple",
    assignments: "/api/admin/assignments",
    assignmentsByStudent: (studentEmail) =>
      `/api/admin/assignments/student/${encodeURIComponent(studentEmail)}`,
    suggestions: "/api/admin/suggestions",
    suggestionByStudent: (studentEmail) =>
      `/api/admin/suggestions/${encodeURIComponent(studentEmail)}`,
    submissions: "/api/assessments/submissions",
    submissionsByStudent: (studentEmail) =>
      `/api/assessments/submissions/student/${encodeURIComponent(studentEmail)}`,
    assessmentHistoryByStudent: (studentEmail) =>
      `/api/results/history/student/${encodeURIComponent(studentEmail)}`,
    assessmentHistory: "/api/results/history",
    questionById: (questionId) => `/api/admin/questions/${questionId}`,
    assignmentById: (assignmentId) => `/api/admin/assignments/${assignmentId}`,
  },
};

export const mapBackendRoleToUiRole = (role) => {
  if (role === "ADMIN") return "admin";
  return "student";
};

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("authToken");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      (isJson && (body.message || body.error)) ||
      (typeof body === "string" && body) ||
      "Request failed";
    throw new Error(message);
  }

  return body;
}

export async function apiGet(path) {
  return apiRequest(path, { method: "GET" });
}

export async function apiPost(path, body) {
  return apiRequest(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function apiDelete(path) {
  return apiRequest(path, { method: "DELETE" });
}
