import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("auth_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("auth_token") || null
  );

  // ── Persiste sesión desde cualquier fetch externo ─────────────
  // Recibe el objeto { token, user } que devuelve el backend
  const setSession = ({ token: newToken, user: newUser }) => {
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  // ── Login completo — usado desde el Header ────────────────────
  const login = async (correo, contrasena) => {
    const res = await fetch("http://192.168.1.8/usuario/auth/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, contrasena }), 
    });

    const data = await res.json();

    if (!res.ok) {
      const msg =
        typeof data === "object"
          ? Object.values(data).flat().join(" · ")
          : "Credenciales incorrectas.";
      throw new Error(msg);
    }

    setSession({ token: data.token, user: data.user });
    return data; // el caller puede leer debe_cambiar_contrasena
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, setSession, isLoggedIn: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);