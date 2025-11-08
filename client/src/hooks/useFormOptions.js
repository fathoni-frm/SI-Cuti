import { useEffect, useState } from "react";
import axios from "../api/axios";
import { toast } from "react-toastify";

/**
 * Hook untuk mengambil daftar data referensi
 * yang digunakan di form pengajuan cuti:
 * - daftarPegawai (untuk pelimpahan tugas)
 * - daftarKetuaTim (untuk verifikator pertama)
 * - daftarKepalaSapel (untuk verifikator kedua)
 */
const useFormOptions = () => {
  const [daftarPegawai, setDaftarPegawai] = useState([]);
  const [daftarKetuaTim, setDaftarKetuaTim] = useState([]);
  const [daftarKepalaSapel, setDaftarKepalaSapel] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [pegawaiRes, ketuaTimRes, kepalaSapelRes] = await Promise.all([
          axios.get("/form/pegawai"),
          axios.get("/form/ketua-tim"),
          axios.get("/form/kepala-sapel"),
        ]);

        setDaftarPegawai(pegawaiRes.data || []);
        setDaftarKetuaTim(ketuaTimRes.data || []);
        setDaftarKepalaSapel(kepalaSapelRes.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat data referensi form pengajuan cuti");
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  return {
    daftarPegawai,
    daftarKetuaTim,
    daftarKepalaSapel,
    loading,
  };
};

export default useFormOptions;