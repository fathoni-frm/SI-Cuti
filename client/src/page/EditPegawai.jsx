import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../api/axios";
import useAuthStore from "../store/authStore";
import { validationSchemaEdit } from "../schemas/formPegawaiSchema";
import { Formik } from "formik";
import Swal from "sweetalert2";
import MainLayout from "../Layouts/MainLayout";
import BackgroundItem from "../components/BackgroundItem";
import TabelKuotaCuti from "../components/TabelKuotaCuti";
import FormDataPegawai from "../components/FormDataPegawai";
import { MdEditSquare } from "react-icons/md";
import { FaCalendarAlt } from "react-icons/fa";

const EditPegawai = () => {
	const { user, getValidToken, refreshToken } = useAuthStore();
	const { id } = useParams();
	const navigate = useNavigate();
	const [initialData, setInitialData] = useState(null);
	const [kuotaCuti, setKuotaCuti] = useState([]);
	const formikRef = useRef();
	const tabelKuotaRef = useRef();
	const [loading, setLoading] = useState(true);

	const fetchPegawai = async () => {
		try {
			const currentToken = await getValidToken();
			const res = await axios.get(`/pegawai/${id}`, {
				headers: {
					Authorization: `Bearer ${currentToken}`,
				},
			});
			const pegawaiData = res.data;
			const akun = pegawaiData.User || {};

			// Parse data untuk form
			const [tempatLahir, tanggalLahir] = pegawaiData.ttl
				? pegawaiData.ttl.split(", ")
				: ["", ""];

			setInitialData({
				...pegawaiData,
				tempatLahir,
				tanggalLahir,
				username: akun.username,
				role: akun.role,
				password: "",
			});

			const kuotaRes = await axios.get(`/kuota-cuti/${id}`, {
				headers: {
					Authorization: `Bearer ${currentToken}`,
				},
			});
			setKuotaCuti(kuotaRes.data);
		} catch (err) {
			console.error("Gagal mengambil data pegawai:", err);
			toast.error("Gagal memuat data pegawai");
			navigate("/manajemen-pegawai");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		let isMounted = true;

		const fetchData = async () => {
			try {
				await fetchPegawai();
			} catch (err) {
				if (isMounted) {
					console.error("Gagal mengambil data pegawai:", err);
					toast.error("Gagal memuat data pegawai");
					navigate("/manajemen-pegawai");
				}
			}
		};

		fetchData();

		const interval = setInterval(async () => {
			try {
				await refreshToken();
			} catch (err) {
				console.error("Gagal memperbarui token:", err);
			}
		}, 14 * 60 * 1000);

		return () => {
			isMounted = false;
			clearInterval(interval);
		};
	}, [id, refreshToken, navigate]);

	const handleCombinedSubmit = async () => {
		if (formikRef.current) {
			formikRef.current.handleSubmit();
		}
	};

	const handleSubmit = async (values, { setSubmitting }) => {
		const kuotaData = tabelKuotaRef.current?.getKuotaCutiData();

		Swal.fire({
			title: "Yakin ingin mengubah data?",
			text: "Data pegawai yang diubah tidak dapat dikembalikan!",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#efb100",
			cancelButtonColor: "#3085d6",
			confirmButtonText: "Ya, ubah!",
			cancelButtonText: "Batal",
		}).then(async (result) => {
			if (result.isConfirmed) {
				try {
					const currentToken = await getValidToken();
					await Promise.all([
						axios.put(
							`/pegawai/${id}`,
							{
								...values,
								ttl: `${values.tempatLahir}, ${values.tanggalLahir}`,
								user: {
									username: values.username,
									password: values.password,
									role: values.role,
								},
							},
							{
								headers: {
									Authorization: `Bearer ${currentToken}`,
								},
							}
						),
						axios.put(`/kuota-cuti/${id}`, kuotaData, {
							headers: { Authorization: `Bearer ${currentToken}` },
						}),
					]);

					toast.success("Data pegawai berhasil diperbarui!");
					navigate("/manajemen-pegawai");
				} catch (err) {
					console.error("Gagal memperbarui data:", err);
					toast.error("Gagal memperbarui data pegawai");
				} finally {
					setSubmitting(false);
				}
			}
		});
	};

	return (
		<MainLayout role={user.role}>
			<div className="p-4 sm:p-6 w-full">
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
					<h1 className="text-left text-xl lg:text-2xl font-bold text-gray-800">
						<span className="text-gray-500">Manajemen Pegawai</span> / Edit
						Pegawai
					</h1>
					{/* <button
						type="submit"
						onClick={handleCombinedSubmit}
						className="flex justify-center items-center bg-yellow-500 text-white px-4 py-2 gap-2 rounded-lg hover:bg-yellow-600 shadow cursor-pointer">
						<MdEditSquare className="text-lg" />
						Simpan Perubahan Data
					</button> */}
				</div>

				{/* Form Section */}
				<BackgroundItem>
					<div className="p-4 sm:p-6">
						{!loading && initialData && (
							<Formik
								initialValues={initialData}
								validationSchema={validationSchemaEdit}
								onSubmit={handleSubmit}
								enableReinitialize
								innerRef={formikRef}>
								{(formik) => (
									<FormDataPegawai formik={formik}></FormDataPegawai>
								)}
							</Formik>
						)}
						{/* Informasi Kuota Cuti Pegawai */}
						<BackgroundItem
							title="Informasi Kuota Cuti Pegawai"
							icon={<FaCalendarAlt />}>
							<TabelKuotaCuti
								ref={tabelKuotaRef}
								data={kuotaCuti}
								isEditing={true}
							/>
						</BackgroundItem>
						<button
							type="submit"
							onClick={handleCombinedSubmit}
							className="flex justify-self-end items-center bg-yellow-500 text-white px-4 py-2 mt-4 gap-2 rounded-lg hover:bg-yellow-600 shadow cursor-pointer">
							<MdEditSquare className="text-lg" />
							Simpan Perubahan Data
						</button>
					</div>
				</BackgroundItem>
			</div>
		</MainLayout>
	);
};

export default EditPegawai;
