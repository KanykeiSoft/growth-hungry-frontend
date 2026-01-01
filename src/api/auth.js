import { api } from "./client";

export const authApi = {
  async register(payload) {
    const { data } = await api.post("/api/auth/register", payload);
    return data;
  },

  async login(payload) {
    const { data } = await api.post("/api/auth/login", payload);

    // backend должен вернуть token
    if (data?.token) {
      localStorage.setItem("token", data.token);
    } else {
      throw new Error("Token not returned from server");
    }

    return data;
  },

  logout() {
    localStorage.removeItem("token");
  },
};

  