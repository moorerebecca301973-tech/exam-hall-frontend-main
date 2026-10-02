import { createContext, useCallback, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const ADMIN_TOKEN_KEY = "eha_admin_token";
const ADMIN_USER_KEY = "eha_admin_user";
const STUDENT_TOKEN_KEY = "eha_student_token";
const STUDENT_USER_KEY = "eha_student_user";

function readJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [adminToken, setAdminTokenState] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY));
  const [admin, setAdminState] = useState(() => readJSON(ADMIN_USER_KEY));
  const [studentToken, setStudentTokenState] = useState(() =>
    localStorage.getItem(STUDENT_TOKEN_KEY)
  );
  const [student, setStudentState] = useState(() => readJSON(STUDENT_USER_KEY));

  const setAdminSession = useCallback((token, user) => {
    setAdminTokenState(token);
    setAdminState(user);
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
  }, []);

  const clearAdminSession = useCallback(() => {
    setAdminTokenState(null);
    setAdminState(null);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  }, []);

  const setStudentSession = useCallback((token, user) => {
    setStudentTokenState(token);
    setStudentState(user);
    localStorage.setItem(STUDENT_TOKEN_KEY, token);
    localStorage.setItem(STUDENT_USER_KEY, JSON.stringify(user));
  }, []);

  const clearStudentSession = useCallback(() => {
    setStudentTokenState(null);
    setStudentState(null);
    localStorage.removeItem(STUDENT_TOKEN_KEY);
    localStorage.removeItem(STUDENT_USER_KEY);
  }, []);

  const value = useMemo(
    () => ({
      adminToken,
      admin,
      setAdminSession,
      clearAdminSession,
      studentToken,
      student,
      setStudentSession,
      clearStudentSession,
    }),
    [adminToken, admin, studentToken, student, setAdminSession, clearAdminSession, setStudentSession, clearStudentSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
