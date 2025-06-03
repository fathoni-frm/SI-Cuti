import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import {
	initialValues,
	validationSchemaAdd,
} from "../schemas/formPegawaiSchema";
import axios from "../api/axios";
import { Formik } from "formik";
import { toast } from "react-toastify";
import MainLayout from "../Layouts/MainLayout";
import BackgroundItem from "../components/BackgroundItem";
import FormDataPegawai from "../components/FormDataPegawai";
import { FaUserPlus } from "react-icons/fa";

const TambahPegawai = () => {
	const { user, getValidToken, refreshToken } = useAuthStore();
	const navigate = useNavigate();

	const scrollToError = (errors) => {
		const firstErrorKey = Object.keys(errors)[0];
		if (firstErrorKey) {
			const element = document.querySelector(`[name="${firstErrorKey}"]`);
			if (element) {
				// Scroll ke element dengan smooth behavior
				element.scrollIntoView({
					behavior: "smooth",
					block: "center",
				});

				// Tambahkan focus ke element
				element.focus();

				// Highlight element
				element.style.borderColor = "#ef4444";
				setTimeout(() => {
					element.style.borderColor = "";
				}, 3000);
			}
		}
	};

	const handleSubmit = async (values, { setSubmitting, setErrors }) => {
		try {
			const currentToken = await getValidToken();

			// Validasi NIP dan username
			await axios.post(
				"/pegawai/validate",
				{
					nip: values.nip,
					username: values.username,
				},
				{
					headers: {
						Authorization: `Bearer ${currentToken}`,
					},
				}
			);

			// Tambahkan data ke tabel pegawai
			const pegawaiRes = await axios.post(
				"/pegawai",
				{
					...values,
					ttl: `${values.tempatLahir}, ${values.tanggalLahir}`,
				},
				{
					headers: {
						Authorization: `Bearer ${currentToken}`,
					},
				}
			);

			// Tambahkan data ke tabel user
			await axios.post(
				"/auth/register",
				{
					username: values.username,
					password: values.password,
					role: values.role,
					idPegawai: pegawaiRes.data.id,
				},
				{
					headers: {
						Authorization: `Bearer ${currentToken}`,
					},
				}
			);

			// Tambahkan data ke tabel kuota cuti
			await axios.post(
				"/kuota-cuti",
				{
					idPegawai: pegawaiRes.data.id,
				},
				{
					headers: {
						Authorization: `Bearer ${currentToken}`,
					},
				}
			);

			toast.success("Data pegawai berhasil ditambahkan!");
			navigate("/manajemen-pegawai");
		} catch (err) {
			console.error("Error:", err.response?.data || err.message);
			if (err.response?.status === 401) {
				toast.error("Sesi telah berakhir, silakan login kembali");
				navigate("/login");
			} else if (err.response?.data?.errors) {
				setErrors(err.response.data.errors);
				setTimeout(() => scrollToError(err.response.data.errors), 100);
			} else {
				toast.error(
					err.response?.data?.msg || "Terjadi kesalahan saat menyimpan data."
				);
			}
		} finally {
			setSubmitting(false);
		}
	};

	useEffect(() => {
		const interval = setInterval(async () => {
			try {
				await refreshToken();
			} catch (err) {
				console.error("Gagal memperbarui token:", err);
			}
		}, 14 * 60 * 1000); // 14 menit

		return () => clearInterval(interval);
	}, [refreshToken]);

	return (
		<MainLayout role={user.role}>
			<div className="p-6 w-full bg-gray-100">
				<h1 className="text-lg lg:text-xl font-bold mb-4">
					<span className="text-gray-500">Manajemen Pegawai</span> / Tambah
					Pegawai
				</h1>

				<BackgroundItem>
					<div className="p-4 sm:p-6">
						<Formik
							initialValues={initialValues}
							validationSchema={validationSchemaAdd}
							onSubmit={handleSubmit}>
							{(formik) => (
								<FormDataPegawai formik={formik}>
									<button
										type="submit"
										className="flex justify-self-end items-center bg-green-600 text-white px-4 py-2 gap-2 rounded-lg hover:bg-green-700 shadow cursor-pointer"
										disabled={formik.isSubmitting}>
										<FaUserPlus className="text-lg" />
										{formik.isSubmitting ? "Menyimpan..." : "Tambah Data"}
									</button>
								</FormDataPegawai>
							)}
						</Formik>
					</div>
				</BackgroundItem>
			</div>
		</MainLayout>
	);
};

export default TambahPegawai;
