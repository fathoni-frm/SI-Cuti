import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import axios from "../api/axios";
import MainLayout from "../Layouts/MainLayout";
import Spinner from "../components/Spinner";
import useAuthStore from "../store/authStore";
import useFormOptions from "../hooks/useFormOptions";
import FormPengajuanCuti from "../components/FormPengajuanCuti";
import {
	initialValues,
	validationSchema,
	hitungDurasiCuti,
	getKuotaCutiByJenis,
} from "../schemas/formCutiSchema";

const EditDraft = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user, detailPegawai, kuotaCuti, isLoading } = useAuthStore();
	const { daftarPegawai, daftarKetuaTim, daftarKepalaSapel } = useFormOptions();

	const [jenisCuti, setJenisCuti] = useState("");
	const [isFetching, setIsFetching] = useState(true);

	// 🔹 Ambil data draft dari server
	const fetchDraft = async () => {
		try {
			const res = await axios.get(`/pengajuan-cuti/draft/edit/${id}`);
			const data = res.data;

			setJenisCuti(data.jenisCuti);

			const sortedVerifikasi = [...data.VerifikasiCutis].sort(
				(a, b) => a.urutanVerifikasi - b.urutanVerifikasi
			);

			const ketuaTim = sortedVerifikasi.find(
				(v) => v.jenisVerifikator === "Ketua Tim"
			);
			const kaSapel = sortedVerifikasi.find(
				(v) => v.jenisVerifikator === "Kepala Satuan Pelayanan"
			);

			const pelimpahan = data.PelimpahanTuga
				? {
                    value: data.PelimpahanTuga.idPenerima,
                    label: data.PelimpahanTuga.nama,
                    nip: data.PelimpahanTuga.nip,
                    pangkat: data.PelimpahanTuga.pangkat,
                    golongan: data.PelimpahanTuga.golongan,
                    jabatan: data.PelimpahanTuga.jabatan,
                    satuanKerja: data.PelimpahanTuga.satuanKerja,
				  }
				: null;

			formik.setValues({
				id: data.id,
				idPegawai: data.idPegawai,
				jenisCuti: data.jenisCuti,
				tanggalMulai: data.tanggalMulai,
				tanggalSelesai: data.tanggalSelesai,
				alasanCuti: data.alasanCuti || "",
				alamatCuti: data.alamatCuti || "",
				lampiran: data.lampiran,
				ketuaTim: ketuaTim
					? { value: ketuaTim.idPimpinan, label: ketuaTim.namaPimpinan }
					: null,
				kaSapel: kaSapel
					? { value: kaSapel.idPimpinan, label: kaSapel.namaPimpinan }
					: null,
				idPenerimaTugas: pelimpahan?.value || "",
				pelimpahanNama: pelimpahan?.label || "",
				pelimpahanNip: pelimpahan?.nip || "",
				pelimpahanPangkat: pelimpahan?.pangkat || "",
				pelimpahanGolongan: pelimpahan?.golongan || "",
				pelimpahanJabatan: pelimpahan?.jabatan || "",
				pelimpahanSatuanKerja: pelimpahan?.satuanKerja || "",
			});
		} catch (err) {
			console.error(err);
			toast.error("Gagal memuat data draft cuti");
			navigate("/draft-cuti");
		} finally {
			setIsFetching(false);
		}
	};

	// 🔹 Formik setup
	const formik = useFormik({
		initialValues,
		validationSchema,
		enableReinitialize: true,
		onSubmit: () => {},
	});

	useEffect(() => {
		if (id) fetchDraft();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const totalKuota =
		getKuotaCutiByJenis(kuotaCuti, jenisCuti)?.totalKuota || 0;
	const sisaKuota =
		getKuotaCutiByJenis(kuotaCuti, jenisCuti)?.sisaKuota || 0;
	const durasiCuti = hitungDurasiCuti(
		formik.values.tanggalMulai,
		formik.values.tanggalSelesai
	);

	// 🔹 Simpan Draft
	const handleSubmitDraft = async (values) => {
		try {
			if (!values.tanggalMulai || !values.tanggalSelesai) {
				toast.warning("Isi tanggal mulai dan selesai sebelum menyimpan draft!");
				return;
			}

			const formData = new FormData();
			formData.append("idPegawai", detailPegawai.id);
			formData.append("jenisCuti", jenisCuti);
			formData.append("tanggalMulai", values.tanggalMulai);
			formData.append("tanggalSelesai", values.tanggalSelesai);
			formData.append("durasi", durasiCuti);
			formData.append("alasanCuti", values.alasanCuti);
			formData.append("alamatCuti", values.alamatCuti);
			if (values.lampiran) formData.append("lampiran", values.lampiran);
			formData.append("isDraft", true);

			formData.append(
				"daftarAtasan",
				JSON.stringify(
					[
						values.ketuaTim && {
							id: values.ketuaTim.value,
							jenis: "Ketua Tim",
						},
						values.kaSapel && {
							id: values.kaSapel.value,
							jenis: "Kepala Satuan Pelayanan",
						},
					].filter(Boolean)
				)
			);

			if (values.idPenerimaTugas) {
				formData.append("idPenerimaTugas", values.idPenerimaTugas);
			}

			await axios.put(`/pengajuan-cuti/${id}`, formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			toast.success("Draft cuti berhasil diperbarui!");
			navigate("/draft-cuti");
		} catch (err) {
			console.error(err);
			toast.error(err.response?.data?.msg || "Gagal memperbarui draft");
		}
	};

	// 🔹 Ajukan Cuti (final)
	const handleSubmitFinal = async (values) => {
		try {
			if (durasiCuti <= 0) {
				toast.warning("Durasi cuti belum valid! Perhatikan lagi tanggal mulai dan selesai.");
				return;
			}

			if (durasiCuti > sisaKuota) {
				toast.warning(
					`Sisa kuota ${jenisCuti} Anda hanya ${sisaKuota} hari, sedangkan Anda mengajukan ${durasiCuti} hari.`
				);
				return;
			}

			if (!values.idPenerimaTugas) {
				toast.warning("Penerima tugas belum dipilih!");
				return;
			}

			const formData = new FormData();
			formData.append("idPegawai", detailPegawai.id);
			formData.append("jenisCuti", jenisCuti);
			formData.append("tanggalMulai", values.tanggalMulai);
			formData.append("tanggalSelesai", values.tanggalSelesai);
			formData.append("durasi", durasiCuti);
			formData.append("alasanCuti", values.alasanCuti);
			formData.append("alamatCuti", values.alamatCuti);
			formData.append("isDraft", false);
			formData.append("tanggalPengajuan", new Date().toISOString());
			formData.append("totalKuota", totalKuota);
			formData.append("sisaKuota", sisaKuota);

			if (values.lampiran) formData.append("lampiran", values.lampiran);

			formData.append(
				"daftarAtasan",
				JSON.stringify(
					[
						values.ketuaTim && {
							id: values.ketuaTim.value,
							jenis: "Ketua Tim",
						},
						values.kaSapel && {
							id: values.kaSapel.value,
							jenis: "Kepala Satuan Pelayanan",
						},
					].filter(Boolean)
				)
			);

			if (values.idPenerimaTugas) {
				formData.append("idPenerimaTugas", values.idPenerimaTugas);
			}

			await axios.put(`/pengajuan-cuti/${id}`, formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			toast.success("Pengajuan cuti berhasil dikirim!");
			navigate("/riwayat-cuti");
		} catch (err) {
			console.error(err);
			toast.error(err.response?.data?.msg || "Gagal mengajukan cuti");
		}
	};

	if (isLoading || isFetching || !detailPegawai || !Array.isArray(kuotaCuti)) {
		return <Spinner />;
	}

	return (
		<MainLayout role={user.role}>
			<FormPengajuanCuti
				formik={formik}
				mode="edit"
				onSubmitDraft={handleSubmitDraft}
				onSubmitFinal={handleSubmitFinal}
				jenisCuti={jenisCuti}
				detailPegawai={detailPegawai}
				totalKuota={totalKuota}
				sisaKuota={sisaKuota}
				durasiCuti={durasiCuti}
				daftarPegawai={daftarPegawai}
				daftarKetuaTim={daftarKetuaTim}
				daftarKepalaSapel={daftarKepalaSapel}
			/>
		</MainLayout>
	);
};

export default EditDraft;