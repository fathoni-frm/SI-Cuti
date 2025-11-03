import * as Yup from "yup";

// Initial values untuk Formik
export const initialValues = {
  id: 0,
  jenisCuti: "",
  tanggalPengajuan: "",
  totalKuota: 0,
  sisaKuota: 0,
  tanggalMulai: "",
  tanggalSelesai: "",
  alasanCuti: "",
  alamatCuti: "",
  lampiran: "",
  status: "",
  ketuaTim: null,
  kaSapel: null,
  idPenerimaTugas: null,
  pelimpahanNama: "",
  pelimpahanNip: "",
  pelimpahanPangkat: "",
  pelimpahanGolongan: "",
  pelimpahanJabatan: "",
  pelimpahanSatuanKerja: "",
};

// Untuk pengajuan cuti
export const validationSchema = Yup.object({
  tanggalMulai: Yup.date().required("Wajib diisi"),
  tanggalSelesai: Yup.date().required("Wajib diisi"),
  alasanCuti: Yup.string().required("Wajib diisi"),
  alamatCuti: Yup.string().required("Wajib diisi"),
  ketuaTim: Yup.object().nullable(),
  kaSapel: Yup.object().nullable(),
  idPenerimaTugas: Yup.mixed().required("Pelimpahan tugas wajib diisi"),
  lampiran: Yup.mixed().nullable()
    .test(
      "file-format-valid",
      "Format lampiran harus PDF, JPG, JPEG, atau PNG",
      function (value) {
        if (!value) return true; // tidak wajib
        if (value instanceof File) {
          const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
          return validTypes.includes(value.type);
        }
        return true; // jika string (nama file dari draft), tetap lolos
      }
    ).test(
      "file-size-valid",
      "Ukuran file maksimal 5MB",
      function (value) {
        if (!value) return true;
        if (value instanceof File) {
          return value.size <= 5 * 1024 * 1024; // 5MB
        }
        return true;
      }
    ),
});

// Hitung durasi cuti berdasarkan tanggal
export const hitungDurasiCuti = (start, end) => {
  if (!start || !end) {
    return 0;
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  startDate.setHours(12, 0, 0, 0);
  endDate.setHours(12, 0, 0, 0);

  let count = 0;

  while (startDate <= endDate) {
    const day = startDate.getDay();
    if (day !== 0 && day !== 6) {
      // 0 = Minggu, 6 = Sabtu
      count++;
    }
    startDate.setDate(startDate.getDate() + 1);
  }
  return count;
};

// Ambil kuota cuti dari list berdasarkan jenis
export const getKuotaCutiByJenis = (kuotaCuti, jenisCuti) => {
  if (!Array.isArray(kuotaCuti) || kuotaCuti.length === 0) return null;

  if (jenisCuti === "Cuti Tahunan") {
    const urutanKuota = ["Cuti Tahunan N-2", "Cuti Tahunan N-1", "Cuti Tahunan"];
    let totalKuota = 0;
    let sisaKuota = 0;

    for (const jenis of urutanKuota) {
      const dataCuti = kuotaCuti.find(
        (item) => item.jenisCuti.toLowerCase() === jenis.toLowerCase()
      );

      if (!dataCuti) return null;
      if (dataCuti) {
        totalKuota += dataCuti.totalKuota;
        sisaKuota += dataCuti.sisaKuota;
      }
    }

    return {
      totalKuota: totalKuota,
      sisaKuota: sisaKuota,
    };
  }
  else {
    const dataCuti = kuotaCuti.find(
      (item) => item.jenisCuti.toLowerCase() === jenisCuti.toLowerCase()
    );

    if (!dataCuti) return null;

    return {
      totalKuota: dataCuti.totalKuota,
      sisaKuota: dataCuti.sisaKuota,
    };
  }
};
