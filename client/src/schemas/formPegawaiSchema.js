import * as Yup from "yup";
import axios from "../api/axios";

export const initialValues = {
    nip: "",
    nama: "",
    karpeg: "",
    karisKarsu: "",
    npwp: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "",
    agama: "",
    statusKeluarga: "",
    pendidikanTerakhir: "",
    namaSekolah: "",
    namaUniversitas: "",
    namaFakultas: "",
    namaJurusan: "",
    namaProgramStudi: "",
    unitKerja: "",
    satuanKerja: "",
    pangkat: "",
    golongan: "",
    jabatanStruktural: "",
    jabatanFungsional: "",
    alamatKantor: "",
    noHp: "",
    emailKantor: "",
    emailPribadi: "",
    username: "",
    password: "",
    role: "",
};

export const validationSchemaAdd = Yup.object({
    nip: Yup.string().required("NIP wajib diisi"),
    nama: Yup.string().required("Nama wajib diisi"),
    karpeg: Yup.string().required("Nomor Kartu Pegawai wajib diisi"),
    karisKarsu: Yup.string().required("Nomor Karis-Karsu wajib diisi"),
    npwp: Yup.string().required("Nomor NPWP wajib diisi"),
    tempatLahir: Yup.string().required("Tempat lahir wajib diisi"),
    tanggalLahir: Yup.date().required("Tanggal lahir wajib diisi"),
    jenisKelamin: Yup.string()
        .oneOf(["Laki-laki", "Perempuan"], "Jenis kelamin tidak valid")
        .required("Jenis kelamin wajib diisi"),
    agama: Yup.string()
        .oneOf(
            ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"],
            "Agama tidak valid"
        )
        .required("Agama wajib diisi"),
    statusKeluarga: Yup.string()
        .oneOf(
            ["Menikah", "Belum Menikah", "Duda / Janda"],
            "Status keluarga tidak valid"
        )
        .required("Status keluarga wajib diisi"),
    pendidikanTerakhir: Yup.string().required('Pendidikan terakhir wajib dipilih'),

    namaSekolah: Yup.string()
        .when('pendidikanTerakhir', {
            is: (value) => ['SD / Sederajat', 'SMP / Sederajat', 'SMA / Sederajat'].includes(value),
            then: (schema) => schema.required('Nama sekolah wajib diisi'),
            otherwise: (schema) => schema.notRequired()
        }),

    namaUniversitas: Yup.string()
        .when('pendidikanTerakhir', {
            is: (value) => ['D1 / D2', 'D3', 'S1', 'S2', 'S3'].includes(value),
            then: (schema) => schema.required('Nama universitas wajib diisi'),
            otherwise: (schema) => schema.notRequired()
        }),
    namaFakultas: Yup.string()
        .when('pendidikanTerakhir', {
            is: (value) => ['D1 / D2', 'D3', 'S1', 'S2', 'S3'].includes(value),
            then: (schema) => schema.required('Fakultas wajib diisi'),
            otherwise: (schema) => schema.notRequired()
        }),
    namaJurusan: Yup.string()
        .when('pendidikanTerakhir', {
            is: (value) => ['D1 / D2', 'D3', 'S1', 'S2', 'S3'].includes(value),
            then: (schema) => schema.required('Jurusan wajib diisi'),
            otherwise: (schema) => schema.notRequired()
        }),
    namaProgramStudi: Yup.string()
        .when('pendidikanTerakhir', {
            is: (value) => ['D1 / D2', 'D3', 'S1', 'S2', 'S3'].includes(value),
            then: (schema) => schema.required('Program studi wajib diisi'),
            otherwise: (schema) => schema.notRequired()
        }),

    unitKerja: Yup.string()
        .oneOf(
            [
                "Karantina Hewan",
                "Karantina Ikan",
                "Karantina Tumbuhan",
                "Tata Usaha",
            ],
            "Unit kerja tidak valid"
        )
        .required("Unit kerja wajib diisi"),
    satuanKerja: Yup.string()
        .oneOf(
            ["UPT Induk BBKHIT Kalimantan Timur",
                "Bandara Internasional SAMS",
                "Bandara APT Pranoto",
                "Pelabuhan Laut Semayang",
                "Pelabuhan Laut Kariangau",
                "Pelabuhan Sungai Samarinda",
                "Pelabuhan Laut Loktuan",
                "Pelabuhan Berau",],
            "Satuan kerja tidak valid"
        )
        .required("Satuan kerja wajib diisi"),
    pangkat: Yup.string()
        .oneOf(
            [
                "Juru Muda",
                "Juru Muda Tingkat I",
                "Juru",
                "Juru Tingkat I",
                "Pengatur Muda",
                "Pengatur Muda Tingkat I",
                "Pengatur",
                "Pengatur Tingkat I",
                "Penata Muda",
                "Penata Muda Tingkat I",
                "Penata",
                "Penata Tingkat I",
                "Pembina",
                "Pembina Tingkat I",
                "Pembina Utama Muda",
                "Pembina Utama Madya",
                "Pembina Utama",
            ],
            "Pangkat tidak valid"
        )
        .required("Pangkat wajib diisi"),
    golongan: Yup.string()
        .oneOf(
            [
                "I/a",
                "I/b",
                "I/c",
                "I/d",
                "II/a",
                "II/b",
                "II/c",
                "II/d",
                "III/a",
                "III/b",
                "III/c",
                "III/d",
                "IV/a",
                "IV/b",
                "IV/c",
                "IV/d",
                "IV/e",
            ],
            "Golongan tidak valid"
        )
        .required("Golongan wajib diisi"),
    jabatanStruktural: Yup.string()
        .oneOf(
            ["Kepala Balai Besar", "Kepala Bagian Umum", "Ketua Tim", "Kepala Satuan Pelayanan", "Lainnya"],
            "Jabatan struktural tidak valid"
        )
        .required("Jabatan struktural wajib diisi"),
    jabatanFungsional: Yup.string()
        .oneOf(
            ["Analis Pengelolaan Keuangan APBN Ahli Muda",
                "Analis Perkarantinaan Tumbuhan Ahli Madya",
                "Analis Perkarantinaan Tumbuhan Ahli Muda",
                "Analis Perkarantinaan Tumbuhan Ahli Pertama",
                "Analis Sumber Daya Manusia Aparatur Ahli Muda",
                "Arsiparis Terampil",
                "Calon Analis Perkarantinaan Tumbuhan Ahli Pertama",
                "Dokter Hewan Karantina Ahli Madya",
                "Dokter Hewan Karantina Ahli Muda",
                "Dokter Hewan Karantina Ahli Pertama",
                "Paramedik Karantina Hewan Mahir",
                "Paramedik Karantina Hewan Pemula",
                "Paramedik Karantina Hewan Penyelia",
                "Paramedik Karantina Hewan Terampil",
                "Pemeriksa Karantina Tumbuhan Mahir",
                "Pemeriksa Karantina Tumbuhan Pemula",
                "Pemeriksa Karantina Tumbuhan Penyelia",
                "Pemeriksa Karantina Tumbuhan Terampil",
                "Penelaah Teknis Kebijakan",
                "Pengadministrasi Perkantoran",
                "Pengendali Hama dan Penyakit Ikan Ahli Muda",
                "Pengendali Hama Dan Penyakit Ikan Ahli Pertama",
                "Pranata Hubungan Masyarakat Ahli Pertama",
                "Pranata Keuangan APBN Mahir",
                "Pranata Keuangan APBN Penyelia",
                "Pranata Keuangan APBN Terampil",
                "Pranata Komputer Ahli Muda",
                "Pranata Komputer Ahli Pertama",
                "Pranata Sumber Daya Manusia Aparatur Terampil",
                "Teknisi Pengendali Hama dan Penyakit Ikan Mahir",
                "Teknisi Pengendali Hama dan Penyakit Ikan Penyelia",
                "Teknisi Pengendali Hama dan Penyakit Ikan Terampil",
                "Lainnya"],
            "Jabatan fungsional tidak valid"
        )
        .required("Jabatan fungsional wajib diisi"),
    alamatKantor: Yup.string().required("Alamat kantor wajib diisi"),
    noHp: Yup.string()
        .matches(/^08\d{8,11}$/, "Nomor telepon tidak valid")
        .required("Nomor telepon wajib diisi"),
    emailKantor: Yup.string().required("Email kantor wajib diisi").email("Email kantor tidak valid"),
    emailPribadi: Yup.string().required("Email pribadi wajib diisi").email("Email pribadi tidak valid"),
    username: Yup.string().required("Username wajib diisi"),
    password: Yup.string()
        .min(8, "Password minimal 8 karakter")
        .required("Password wajib diisi"),
    role: Yup.string()
        .oneOf(["Admin", "Pegawai", "Atasan"], "Role tidak valid")
        .required("Role wajib dipilih"),
});

export const validationSchemaEdit = Yup.object({
    nip: Yup.string().required("NIP wajib diisi"),
    nama: Yup.string().required("Nama wajib diisi"),
    karpeg: Yup.string().required("Nomor Kartu Pegawai wajib diisi"),
    karisKarsu: Yup.string().required("Nomor Karis-Karsu wajib diisi"),
    npwp: Yup.string().required("Nomor NPWP wajib diisi"),
    tempatLahir: Yup.string().required("Tempat lahir wajib diisi"),
    tanggalLahir: Yup.date().required("Tanggal lahir wajib diisi"),
    jenisKelamin: Yup.string()
        .oneOf(["Laki-laki", "Perempuan"], "Jenis kelamin tidak valid")
        .required("Jenis kelamin wajib diisi"),
    agama: Yup.string()
        .oneOf(
            ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"],
            "Agama tidak valid"
        )
        .required("Agama wajib diisi"),
    statusKeluarga: Yup.string()
        .oneOf(
            ["Menikah", "Belum Menikah", "Duda / Janda"],
            "Status keluarga tidak valid"
        )
        .required("Status keluarga wajib diisi"),
    pendidikanTerakhir: Yup.string().required('Pendidikan terakhir wajib dipilih'),

    namaSekolah: Yup.string()
        .when('pendidikanTerakhir', {
            is: (value) => ['SD / Sederajat', 'SMP / Sederajat', 'SMA / Sederajat'].includes(value),
            then: (schema) => schema.required('Nama sekolah wajib diisi'),
            otherwise: (schema) => schema.notRequired()
        }),

    namaUniversitas: Yup.string()
        .when('pendidikanTerakhir', {
            is: (value) => ['D1 / D2', 'D3', 'S1', 'S2', 'S3'].includes(value),
            then: (schema) => schema.required('Nama universitas wajib diisi'),
            otherwise: (schema) => schema.notRequired()
        }),
    namaFakultas: Yup.string()
        .when('pendidikanTerakhir', {
            is: (value) => ['D1 / D2', 'D3', 'S1', 'S2', 'S3'].includes(value),
            then: (schema) => schema.required('Fakultas wajib diisi'),
            otherwise: (schema) => schema.notRequired()
        }),
    namaJurusan: Yup.string()
        .when('pendidikanTerakhir', {
            is: (value) => ['D1 / D2', 'D3', 'S1', 'S2', 'S3'].includes(value),
            then: (schema) => schema.required('Jurusan wajib diisi'),
            otherwise: (schema) => schema.notRequired()
        }),
    namaProgramStudi: Yup.string()
        .when('pendidikanTerakhir', {
            is: (value) => ['D1 / D2', 'D3', 'S1', 'S2', 'S3'].includes(value),
            then: (schema) => schema.required('Program studi wajib diisi'),
            otherwise: (schema) => schema.notRequired()
        }),

    unitKerja: Yup.string()
        .oneOf(
            [
                "Karantina Hewan",
                "Karantina Ikan",
                "Karantina Tumbuhan",
                "Tata Usaha",
            ],
            "Unit kerja tidak valid"
        )
        .required("Unit kerja wajib diisi"),
    satuanKerja: Yup.string()
        .oneOf(
            ["UPT Induk BBKHIT Kalimantan Timur",
                "Bandara Internasional SAMS",
                "Bandara APT Pranoto",
                "Pelabuhan Laut Semayang",
                "Pelabuhan Laut Kariangau",
                "Pelabuhan Sungai Samarinda",
                "Pelabuhan Laut Loktuan",
                "Pelabuhan Berau",],
            "Satuan kerja tidak valid"
        )
        .required("Satuan kerja wajib diisi"),
    pangkat: Yup.string()
        .oneOf(
            [
                "Juru Muda",
                "Juru Muda Tingkat I",
                "Juru",
                "Juru Tingkat I",
                "Pengatur Muda",
                "Pengatur Muda Tingkat I",
                "Pengatur",
                "Pengatur Tingkat I",
                "Penata Muda",
                "Penata Muda Tingkat I",
                "Penata",
                "Penata Tingkat I",
                "Pembina",
                "Pembina Tingkat I",
                "Pembina Utama Muda",
                "Pembina Utama Madya",
                "Pembina Utama",
            ],
            "Pangkat tidak valid"
        )
        .required("Pangkat wajib diisi"),
    golongan: Yup.string()
        .oneOf(
            [
                "I/a",
                "I/b",
                "I/c",
                "I/d",
                "II/a",
                "II/b",
                "II/c",
                "II/d",
                "III/a",
                "III/b",
                "III/c",
                "III/d",
                "IV/a",
                "IV/b",
                "IV/c",
                "IV/d",
                "IV/e",
            ],
            "Golongan tidak valid"
        )
        .required("Golongan wajib diisi"),
    jabatanStruktural: Yup.string()
        .oneOf(
            ["Kepala Balai Besar", "Kepala Bagian Umum", "Ketua Tim", "Kepala Satuan Pelayanan", "Lainnya"],
            "Jabatan struktural tidak valid"
        )
        .required("Jabatan struktural wajib diisi"),
    jabatanFungsional: Yup.string()
        .oneOf(
            ["Analis Pengelolaan Keuangan APBN Ahli Muda",
                "Analis Perkarantinaan Tumbuhan Ahli Madya",
                "Analis Perkarantinaan Tumbuhan Ahli Muda",
                "Analis Perkarantinaan Tumbuhan Ahli Pertama",
                "Analis Sumber Daya Manusia Aparatur Ahli Muda",
                "Arsiparis Terampil",
                "Calon Analis Perkarantinaan Tumbuhan Ahli Pertama",
                "Dokter Hewan Karantina Ahli Madya",
                "Dokter Hewan Karantina Ahli Muda",
                "Dokter Hewan Karantina Ahli Pertama",
                "Paramedik Karantina Hewan Mahir",
                "Paramedik Karantina Hewan Pemula",
                "Paramedik Karantina Hewan Penyelia",
                "Paramedik Karantina Hewan Terampil",
                "Pemeriksa Karantina Tumbuhan Mahir",
                "Pemeriksa Karantina Tumbuhan Pemula",
                "Pemeriksa Karantina Tumbuhan Penyelia",
                "Pemeriksa Karantina Tumbuhan Terampil",
                "Penelaah Teknis Kebijakan",
                "Pengadministrasi Perkantoran",
                "Pengendali Hama dan Penyakit Ikan Ahli Muda",
                "Pengendali Hama Dan Penyakit Ikan Ahli Pertama",
                "Pranata Hubungan Masyarakat Ahli Pertama",
                "Pranata Keuangan APBN Mahir",
                "Pranata Keuangan APBN Penyelia",
                "Pranata Keuangan APBN Terampil",
                "Pranata Komputer Ahli Muda",
                "Pranata Komputer Ahli Pertama",
                "Pranata Sumber Daya Manusia Aparatur Terampil",
                "Teknisi Pengendali Hama dan Penyakit Ikan Mahir",
                "Teknisi Pengendali Hama dan Penyakit Ikan Penyelia",
                "Teknisi Pengendali Hama dan Penyakit Ikan Terampil",
                "Lainnya",],
            "Jabatan fungsional tidak valid"
        )
        .required("Jabatan fungsional wajib diisi"),
    alamatKantor: Yup.string().required("Alamat kantor wajib diisi"),
    noHp: Yup.string()
        .matches(/^08\d{8,11}$/, "Nomor telepon tidak valid")
        .required("Nomor telepon wajib diisi"),
    emailKantor: Yup.string().required("Email kantor wajib diisi").email("Email kantor tidak valid"),
    emailPribadi: Yup.string().required("Email pribadi wajib diisi").email("Email pribadi tidak valid"),
    username: Yup.string().required("Username wajib diisi"),
    password: Yup.string()
        .min(8, "Password minimal 8 karakter"),
    role: Yup.string()
        .oneOf(["Admin", "Pegawai", "Atasan"], "Role tidak valid")
        .required("Role wajib dipilih"),
});

export const validationSchemaEditDataDiri = Yup.object({
    karpeg: Yup.string().required("Nomor Kartu Pegawai wajib diisi"),
    karisKarsu: Yup.string().required("Nomor Karis-Karsu wajib diisi"),
    npwp: Yup.string().required("Nomor NPWP wajib diisi"),
    tempatLahir: Yup.string().required("Tempat lahir wajib diisi"),
    tanggalLahir: Yup.date().required("Tanggal lahir wajib diisi"),
    jenisKelamin: Yup.string()
        .oneOf(["Laki-laki", "Perempuan"], "Jenis kelamin tidak valid")
        .required("Jenis kelamin wajib diisi"),
    agama: Yup.string()
        .oneOf(
            ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"],
            "Agama tidak valid"
        )
        .required("Agama wajib diisi"),
    statusKeluarga: Yup.string()
        .oneOf(["Menikah", "Belum Menikah", "Duda / Janda"], "Status keluarga tidak valid")
        .required("Status keluarga wajib diisi"),
    noHp: Yup.string()
        .matches(/^08\d{8,11}$/, "Nomor telepon tidak valid")
        .required("Nomor telepon wajib diisi"),
    emailPribadi: Yup.string()
        .required("Email pribadi wajib diisi")
        .email("Email pribadi tidak valid"),
})

export const validateNipUsername = async (nip, username) => {
    try {
        const res = await axios.post("/pegawai/validate", { nip, username });
        // Jika berhasil, berarti tidak duplikat
        return true;
    } catch (error) {
        // Jika error 400 atau 422 dan mengandung detail kesalahan
        if (error.response?.data?.errors) {
            throw error.response.data.errors;
        }
        throw new Error("Terjadi kesalahan saat validasi NIP/username");
    }
};

export const pangkatToGolongan = {
    "Juru Muda": "I/a",
    "Juru Muda Tingkat I": "I/b",
    "Juru": "I/c",
    "Juru Tingkat I": "I/d",
    "Pengatur Muda": "II/a",
    "Pengatur Muda Tingkat I": "II/b",
    "Pengatur": "II/c",
    "Pengatur Tingkat I": "II/d",
    "Penata Muda": "III/a",
    "Penata Muda Tingkat I": "III/b",
    "Penata": "III/c",
    "Penata Tingkat I": "III/d",
    "Pembina": "IV/a",
    "Pembina Tingkat I": "IV/b",
    "Pembina Utama Muda": "IV/c",
    "Pembina Utama Madya": "IV/d",
    "Pembina Utama": "IV/e",
};

export const golonganToPangkat = Object.fromEntries(
    Object.entries(pangkatToGolongan).map(([pangkat, golongan]) => [golongan, pangkat])
);

export const jabatanToRole = {
    "Kepala Balai Besar": "Atasan",
    "Kepala Bagian Umum": "Atasan",
    "Ketua Tim": "Atasan",
    "Kepala Satuan Pelayanan": "Atasan",
};

export const roleToJabatan = {
    "Pegawai": "Lainnya",
    "Admin": "Lainnya",
};