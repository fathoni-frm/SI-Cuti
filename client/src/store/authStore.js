import { create } from 'zustand';
import axios from "../api/axios";

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  detailPegawai: null,
  kuotaCuti: [],

  login: async ({ username, password }) => {
    const res = await axios.post("/auth/login", {
      username,
      password,
    }, { withCredentials: true });

    const { user, accessToken } = res.data;
    set({
      user,
      accessToken,
      isLoading: false,
    });
    axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    await get().fetchUserData(user.idPegawai);
  },

  logout: async () => {
    await axios.delete("/auth/logout", {
      withCredentials: true,
    });

    set({
      user: null, accessToken: null, isLoading: false, detailPegawai: null, kuotaCuti: [],
    });

    delete axios.defaults.headers.common["Authorization"];
  },

  refreshToken: async () => {
    try {
      const res = await axios.get("/auth/token", {
        withCredentials: true,
      });

      const { accessToken, user } = res.data;
      set({
        accessToken,
        user,
        isLoading: false,
      });

      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      if (user) {
        await get().fetchUserData(user.idPegawai);
      }

      return accessToken;
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        console.log("User belum login, skip refresh token")
      } else {
        console.error("Refresh token gagal", err);
      }

      set({
        user: null,
        accessToken: null,
        isLoading: false,
        detailPegawai: null,
        kuotaCuti: [],
      });
    }
  },

  isTokenExpired: (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },

  getValidToken: async () => {
    const { accessToken, refreshToken, isTokenExpired } = get();
    if (accessToken && !isTokenExpired(accessToken)) {
      return accessToken;
    }
    try {
      const newToken = await refreshToken();
      if (!newToken) {
        throw new Error("Gagal mendapatkan token baru");
      }
      return newToken;
    } catch (err) {
      console.error("Gagal refresh token:", err);
      throw err;
    }
  },

  fetchUserData: async (idPegawai) => {
    try {
      const [pegawaiRes, kuotaRes] = await Promise.all([
        axios.get(`/pegawai/${idPegawai}`),
        axios.get(`/kuota-cuti/${idPegawai}`)
      ]);
      
      set({
        detailPegawai: pegawaiRes.data,
        kuotaCuti: kuotaRes.data
      });
    } catch (err) {
      console.error("Gagal memuat detail pegawai atau kuota cuti", err);
      set({
        detailPegawai: null,
        kuotaCuti: [],
      });
    }
  },


}));

export default useAuthStore;