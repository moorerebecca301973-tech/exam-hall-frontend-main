import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({ baseURL: API_URL });

/** Extracts a human-readable message from a FastAPI error response. */
export function apiErrorMessage(err, fallback = "Something went wrong") {
  const detail = err?.response?.data?.detail;
  if (!detail) return err?.message || fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    // Pydantic validation error array
    return detail.map((d) => d.msg || JSON.stringify(d)).join("; ");
  }
  return fallback;
}

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

// ---------------------------------------------------------------------------
// Admin auth
// ---------------------------------------------------------------------------
export const AdminAPI = {
  bootstrapRegister: (payload) => api.post("/auth/register", payload).then((r) => r.data),
  registerAdditional: (token, payload) =>
    api
      .post("/auth/register-additional", payload, { headers: authHeader(token) })
      .then((r) => r.data),
  login: (username, password) => {
    const form = new URLSearchParams();
    form.set("username", username);
    form.set("password", password);
    return api
      .post("/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })
      .then((r) => r.data);
  },
  me: (token) => api.get("/auth/me", { headers: authHeader(token) }).then((r) => r.data),
};

// ---------------------------------------------------------------------------
// Departments
// ---------------------------------------------------------------------------
export const DepartmentAPI = {
  list: () => api.get("/departments").then((r) => r.data),
  create: (token, payload) =>
    api.post("/departments", payload, { headers: authHeader(token) }).then((r) => r.data),
  update: (token, id, payload) =>
    api.put(`/departments/${id}`, payload, { headers: authHeader(token) }).then((r) => r.data),
  remove: (token, id) => api.delete(`/departments/${id}`, { headers: authHeader(token) }),
};

// ---------------------------------------------------------------------------
// Sessions & semesters
// ---------------------------------------------------------------------------
export const SessionAPI = {
  list: (token) => api.get("/sessions", { headers: authHeader(token) }).then((r) => r.data),
  create: (token, payload) =>
    api.post("/sessions", payload, { headers: authHeader(token) }).then((r) => r.data),
};

export const SemesterAPI = {
  list: (token) => api.get("/semesters", { headers: authHeader(token) }).then((r) => r.data),
  active: () =>
    api
      .get("/semesters/active")
      .then((r) => r.data)
      .catch(() => null),
  create: (token, payload) =>
    api.post("/semesters", payload, { headers: authHeader(token) }).then((r) => r.data),
  start: (token, id) =>
    api.post(`/semesters/${id}/start`, {}, { headers: authHeader(token) }).then((r) => r.data),
  submit: (token, id) =>
    api.post(`/semesters/${id}/submit`, {}, { headers: authHeader(token) }).then((r) => r.data),
};

// ---------------------------------------------------------------------------
// Courses & course offerings
// ---------------------------------------------------------------------------
export const CourseAPI = {
  list: () => api.get("/courses").then((r) => r.data),
  create: (token, payload) =>
    api.post("/courses", payload, { headers: authHeader(token) }).then((r) => r.data),
};

export const CourseOfferingAPI = {
  list: (params = {}) => api.get("/course-offerings", { params }).then((r) => r.data),
  create: (token, payload) =>
    api.post("/course-offerings", payload, { headers: authHeader(token) }).then((r) => r.data),
  remove: (token, id) =>
    api.delete(`/course-offerings/${id}`, { headers: authHeader(token) }),
};

// ---------------------------------------------------------------------------
// Halls
// ---------------------------------------------------------------------------
export const HallAPI = {
  list: () => api.get("/halls").then((r) => r.data),
  create: (token, payload) =>
    api.post("/halls", payload, { headers: authHeader(token) }).then((r) => r.data),
  update: (token, id, payload) =>
    api.put(`/halls/${id}`, payload, { headers: authHeader(token) }).then((r) => r.data),
  remove: (token, id) => api.delete(`/halls/${id}`, { headers: authHeader(token) }),
};

// ---------------------------------------------------------------------------
// Exams (timetable)
// ---------------------------------------------------------------------------
export const ExamAPI = {
  list: (params = {}) => api.get("/exams", { params }).then((r) => r.data),
  create: (token, payload) =>
    api.post("/exams", payload, { headers: authHeader(token) }).then((r) => r.data),
  setStatus: (token, id, status) =>
    api
      .patch(`/exams/${id}/status`, { status }, { headers: authHeader(token) })
      .then((r) => r.data),
};

// ---------------------------------------------------------------------------
// Hall allocations (mixing departments/courses into a hall sitting)
// ---------------------------------------------------------------------------
export const HallAllocationAPI = {
  listAll: (token) =>
    api.get("/hall-allocations", { headers: authHeader(token) }).then((r) => r.data),
  listForExam: (token, examId) =>
    api
      .get(`/hall-allocations/exam/${examId}`, { headers: authHeader(token) })
      .then((r) => r.data),
  allocate: (token, payload) =>
    api.post("/hall-allocations", payload, { headers: authHeader(token) }).then((r) => r.data),
  autoAllocate: (token, payload) =>
    api
      .post("/hall-allocations/auto", payload, { headers: authHeader(token) })
      .then((r) => r.data),
  recompute: (token, examId) =>
    api
      .post(`/hall-allocations/exam/${examId}/recompute-seats`, {}, { headers: authHeader(token) })
      .then((r) => r.data),
  removeRange: (token, rangeId) =>
    api.delete(`/hall-allocations/department-ranges/${rangeId}`, { headers: authHeader(token) }),
  removeAllocation: (token, id) =>
    api.delete(`/hall-allocations/${id}`, { headers: authHeader(token) }),
};

// ---------------------------------------------------------------------------
// Students
// ---------------------------------------------------------------------------
export const StudentAPI = {
  register: (payload) => api.post("/students/register", payload).then((r) => r.data),
  login: (payload) => api.post("/students/login", payload).then((r) => r.data),
  me: (token) => api.get("/students/me", { headers: authHeader(token) }).then((r) => r.data),
  myCourses: (token) =>
    api.get("/students/me/courses", { headers: authHeader(token) }).then((r) => r.data),
  mySeats: (token) =>
    api.get("/students/me/seats", { headers: authHeader(token) }).then((r) => r.data),
  myTimetable: (token) =>
    api.get("/students/me/timetable", { headers: authHeader(token) }).then((r) => r.data),
  roster: (token, params = {}) =>
    api.get("/students", { params, headers: authHeader(token) }).then((r) => r.data),
};

export const LEVELS = ["ND1", "ND2", "HND1", "HND2"];
export const SEMESTER_NAMES = ["First", "Second"];
