import React, { useState, useEffect } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import useAuthStore from "../store/authStore";
import axios from "../api/axios";
import MainLayout from "../Layouts/MainLayout";
import BackgroundItem from "../components/BackgroundItem";
import TabelKuotaCuti from "../components/TabelKuotaCuti";
import { FaSearch, FaPlus } from "react-icons/fa";

const ManajemenCuti = () => {
	const { user, getValidToken, refreshToken } = useAuthStore();
	const [daftarPegawai, setDaftarPegawai] = useState([]);
	const [selectedPegawai, setSelectedPegawai] = useState(null);
	const [dataKuotaCuti, setDataKuotaCuti] = useState([]);

	const optionsPegawai = daftarPegawai.map((pegawai) => ({
		value: pegawai.id,
		label: pegawai.nama,
		nip: pegawai.nip,
		pangkat: pegawai.pangkat,
		golongan: pegawai.golongan,
		satuanKerja: pegawai.satuanKerja,
		jabatan: pegawai.jabatanFungsional,
	}));

	const fetchPegawai = async () => {
		try {
			const res = await axios.get("/form/pegawai");
			setDaftarPegawai(res.data);
		} catch (error) {
			console.error("Gagal fetch data pegawai:", error);
		}
	};

	useEffect(() => {
		fetchPegawai();
	}, []);

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

	// Form 1: Pilih Pegawai
	const formikSelectPegawai = useFormik({
		initialValues: { pegawai: null },
		validationSchema: Yup.object().shape({
			pegawai: Yup.object().required("Nama Pegawai wajib dipilih"),
		}),
		onSubmit: async ({ pegawai }) => {
			try {
				const token = await getValidToken();
				const kuotaRes = await axios.get(`/kuota-cuti/${pegawai.value}`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				setDataKuotaCuti(kuotaRes.data);
				setSelectedPegawai(pegawai);
			} catch (err) {
				console.error("Gagal mengambil data:", err);
			}
		},
	});

	// Form 2: Tambah Kuota
	const formikTambahKuota = useFormik({
		initialValues: { tambahKuota: "" },
		validationSchema: Yup.object().shape({
			tambahKuota: Yup.number()
				.required("Masukkan jumlah kuota")
				.min(1, "Minimal 1 hari"),
		}),
		onSubmit: async ({ tambahKuota }) => {
			Swal.fire({
				title: "Yakin ingin menambah kuota cuti?",
				html: `Tambahkan kuota cuti tahunan sebanyak <strong>${tambahKuota} hari</strong> kepada <strong>${selectedPegawai.label}</strong>`,
				icon: "question",
				showCancelButton: true,
				confirmButtonColor: "#efb100",
				cancelButtonColor: "#3085d6",
				confirmButtonText: "Ya, Tambahkan!",
				cancelButtonText: "Batal",
			}).then(async (result) => {
				if (result.isConfirmed) {
					try {
						const token = await getValidToken();
						await axios.post(
							"/kuota-cuti/tambah",
							{
								idPegawai: selectedPegawai.value,
								jumlah: tambahKuota,
							},
							{ headers: { Authorization: `Bearer ${token}` } }
						);
						formikTambahKuota.resetForm();
						formikSelectPegawai.resetForm();
						setSelectedPegawai(null);
						toast.success("Kuota berhasil ditambahkan!");
					} catch (err) {
						console.error("Gagal tambah kuota:", err);
					}
				}
			});
		},
	});

	return (
		<MainLayout role={user.role}>
			<div className="p-4 sm:p-6 w-full space-y-6 ">
				<h1 className="text-xl lg:text-2xl font-bold text-gray-800">
					Manajemen Kuota Cuti Pegawai
				</h1>

				{/* Form 1: Pilih Pegawai */}
				<BackgroundItem>
					<div className="p-4 sm:p-6">
						<form onSubmit={formikSelectPegawai.handleSubmit}>
							<label className="font-medium text-lg text-gray-700 block mb-3">
								Nama Pegawai
							</label>
							<Select
								options={optionsPegawai}
								name="pegawai"
								placeholder="Ketik Nama Pegawai..."
								value={formikSelectPegawai.values.pegawai}
								onChange={(option) =>
									formikSelectPegawai.setFieldValue("pegawai", option)
								}
								onBlur={() =>
									formikSelectPegawai.setFieldTouched("pegawai", true)
								}
								className="mt-2"
							/>
							{formikSelectPegawai.errors.pegawai &&
								formikSelectPegawai.touched.pegawai && (
									<div className="text-sm text-red-500 mt-1">
										{formikSelectPegawai.errors.pegawai}
									</div>
								)}
							<div className="flex justify-end mt-4">
								<button
									type="submit"
									className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors duration-150 w-full sm:w-auto font-medium text-sm lg:text-base hover:bg-blue-600 cursor-pointer">
									<FaSearch /> Detail Kuota Cuti
								</button>
							</div>
						</form>
					</div>
				</BackgroundItem>

				{/* Form 2: Tampil setelah pegawai dipilih */}
				{selectedPegawai && (
					<BackgroundItem>
						<div className="p-4 sm:p-6">
							<h2 className="text-xl lg:text-2xl font-bold mb-4 text-center text-gray-800">
								Tambah Kuota Cuti Kepada :
							</h2>

							{/* Card Identitas Pegawai */}
							<div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm mb-4 md:mb-6">
								<h3 className="text-lg font-semibold text-gray-700 mb-3 sm:mb-4 border-b border-gray-300 pb-2">
									Identitas Pegawai
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4 sm:gap-x-6 text-sm lg:text-base text-gray-600">
									<div>
										<span className="font-semibold">Nama : </span>
										{selectedPegawai.label}
									</div>
									<div>
										<span className="font-semibold">NIP : </span>
										{selectedPegawai.nip}
									</div>
									<div>
										<span className="font-semibold">Pangkat : </span>
										{selectedPegawai.pangkat}
									</div>
									<div>
										<span className="font-semibold">Golongan : </span>
										{selectedPegawai.golongan}
									</div>
									<div>
										<span className="font-semibold">Satuan Pelayanan : </span>
										{selectedPegawai.satuanKerja}
									</div>
									<div>
										<span className="font-semibold">Jabatan : </span>
										{selectedPegawai.jabatan}
									</div>
								</div>
							</div>

							{/* Form Tambah Kuota */}
							<form
								onSubmit={formikTambahKuota.handleSubmit}
								className="mb-4 md:mb-6">
								<div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
									<h3 className="text-lg font-semibold text-gray-700 mb-3 sm:mb-4 border-b border-gray-300 pb-2">
										Tambahkan Kuota Cuti Pegawai
									</h3>
									<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
										<label
											htmlFor="tambahKuotaInput"
											className="flex-shrink-0 text-base lg:text-lg font-medium text-gray-700">
											Jumlah Kuota :
										</label>
										<input
											id="tambahKuotaInput"
											type="number"
											name="tambahKuota"
											min={1}
											max={100}
											title="Masukkan jumlah kuota yang akan ditambahkan pada kuota cuti tahunan pegawai"
											value={formikTambahKuota.values.tambahKuota}
											onChange={formikTambahKuota.handleChange}
											onBlur={formikTambahKuota.handleBlur}
											placeholder="Masukkan penambahan kuota cuti tahunan pegawai"
											className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm lg:text-base"
										/>
										<button
											type="submit"
											className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 px-4 sm:px-5 rounded-lg shadow-md font-semibold transition flex items-center justify-center gap-2 text-sm sm:text-base flex-shrink-0">
											<FaPlus /> Tambahkan Kuota
										</button>
									</div>
									{formikTambahKuota.errors.tambahKuota &&
										formikTambahKuota.touched.tambahKuota && (
											<div className="text-sm text-red-500 mt-2">
												{formikTambahKuota.errors.tambahKuota}
											</div>
										)}
								</div>
							</form>

							{/* Tabel Kuota */}
							<div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
								<h3 className="text-lg font-semibold text-gray-700 mb-3 sm:mb-4 border-b border-gray-300 pb-2">
									Daftar Kuota Cuti Pegawai Saat Ini
								</h3>
								<TabelKuotaCuti data={dataKuotaCuti} roundedTop={true} />
							</div>
						</div>
					</BackgroundItem>
				)}
			</div>
		</MainLayout>
	);
};

export default ManajemenCuti;
