import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

const PengajuanCutiForm = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const jenisCuti = location.state?.jenisCuti;

	const { user, detailPegawai, kuotaCuti, isLoading } = useAuthStore();
	const { daftarPegawai, daftarKetuaTim, daftarKepalaSapel, konfigurasiSistem } = useFormOptions();

	// 🔹 Formik Setup
	const formik = useFormik({
		initialValues,
		validationSchema,
		onSubmit: () => {}, // dikendalikan manual oleh tombol
	});

	// 🔹 Hitung durasi dan kuota cuti
	const totalKuota =
		getKuotaCutiByJenis(kuotaCuti, jenisCuti)?.totalKuota || 0;
	const sisaKuota =
		getKuotaCutiByJenis(kuotaCuti, jenisCuti)?.sisaKuota || 0;
	const durasiCuti = hitungDurasiCuti(
		formik.values.tanggalMulai,
		formik.values.tanggalSelesai
	);

	// 🔹 Handle Simpan Draft
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

			// atasan & pelimpahan
			formData.append(
				"daftarAtasan",
				JSON.stringify(
					[
						values.kaSapel && {
							id: values.kaSapel.value,
							jenis: "Kepala Satuan Pelayanan",
						},
						values.ketuaTim && {
							id: values.ketuaTim.value,
							jenis: "Ketua Tim",
						},
					].filter(Boolean)
				)
			);

			if (values.idPenerimaTugas) {
				formData.append("idPenerimaTugas", values.idPenerimaTugas);
			}

			await axios.post("/pengajuan-cuti", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			toast.success("Draft pengajuan cuti berhasil disimpan!");
			navigate("/draft-cuti");
		} catch (err) {
			console.error(err);
			toast.error(err.response?.data?.msg || "Gagal menyimpan draft");
		}
	};

	// 🔹 Handle Ajukan Cuti
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
			};

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
						values.kaSapel && {
							id: values.kaSapel.value,
							jenis: "Kepala Satuan Pelayanan",
						},
						values.ketuaTim && {
							id: values.ketuaTim.value,
							jenis: "Ketua Tim",
						},
					].filter(Boolean)
				)
			);

			if (values.idPenerimaTugas) {
				formData.append("idPenerimaTugas", values.idPenerimaTugas);
			}

			await axios.post("/pengajuan-cuti", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			toast.success("Pengajuan cuti berhasil dikirim!");
			navigate("/riwayat-cuti");
		} catch (err) {
			console.error(err);
			toast.error(err.response?.data?.msg || "Gagal mengajukan cuti");
		}
	};

	useEffect(() => {
		if (!jenisCuti) {
			toast.warning("Jenis cuti belum dipilih!");
			navigate("/pengajuan-cuti");
		}
	}, [jenisCuti, navigate]);

	if (isLoading || !detailPegawai || !Array.isArray(kuotaCuti)) {
		return <Spinner />;
	}

	return (
		<MainLayout role={user.role}>
			<FormPengajuanCuti
				formik={formik}
				mode="create"
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
				konfigurasiSistem={konfigurasiSistem}
			/>
		</MainLayout>
	);
};

export default PengajuanCutiForm;