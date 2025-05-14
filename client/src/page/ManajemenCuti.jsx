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
			<div className="p-6 w-full space-y-8">
				<h1 className="text-2xl font-bold mb-6">
					Manajemen Kuota Cuti Pegawai
				</h1>

				{/* Form 1: Pilih Pegawai */}
				<BackgroundItem>
					<form onSubmit={formikSelectPegawai.handleSubmit}>
						<div className="mb-4">
							<label className="font-medium">Nama Pegawai</label>
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
						</div>
						<div className="flex justify-end">
							<button
								type="submit"
								className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600">
								<FaSearch /> Detail Kuota Cuti
							</button>
						</div>
					</form>
				</BackgroundItem>

				{/* Form 2: Tampil setelah pegawai dipilih */}
				{selectedPegawai && (
					<BackgroundItem>
						<h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
							Tambah Kuota Cuti
						</h2>

						{/* Card Identitas Pegawai */}
						<div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
							<h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
								Identitas Pegawai
							</h3>
							<div className="grid grid-cols-2 gap-y-5 gap-x-6  text-gray-600">
								<div>
									<span className="font-semibold">Nama :</span>{" "}
									{selectedPegawai.label}
								</div>
								<div>
									<span className="font-semibold">NIP :</span>{" "}
									{selectedPegawai.nip}
								</div>
								<div>
									<span className="font-semibold">Pangkat :</span>{" "}
									{selectedPegawai.pangkat}
								</div>
								<div>
									<span className="font-semibold">Golongan :</span>{" "}
									{selectedPegawai.golongan}
								</div>
								<div>
									<span className="font-semibold">Satuan Kerja :</span>{" "}
									{selectedPegawai.satuanKerja}
								</div>
								<div>
									<span className="font-semibold">Jabatan :</span>{" "}
									{selectedPegawai.jabatan}
								</div>
							</div>
						</div>

						{/* Form Tambah Kuota */}
						<form onSubmit={formikTambahKuota.handleSubmit}>
							<div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
								<h3 className="text-lg font-semibold text-gray-700 mb-4">
									Tambahkan Kuota Cuti Pegawai
								</h3>
								<div className="flex items-center gap-4">
									<input
										type="number"
										name="tambahKuota"
										min={1}
										max={10}
										value={formikTambahKuota.values.tambahKuota}
										onChange={formikTambahKuota.handleChange}
										onBlur={formikTambahKuota.handleBlur}
										placeholder="Masukkan jumlah kuota yang akan ditambahkan pada kuota cuti tahunan pegawai"
										className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
									/>
									<button
										type="submit"
										className="w-[250px] bg-gradient-to-r from-green-400 to-green-500 text-white py-2 rounded-lg shadow-lg font-semibold hover:brightness-80 transition flex items-center justify-center gap-2">
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
						<div className="mt-8">
							<TabelKuotaCuti data={dataKuotaCuti} roundedTop={true} />
						</div>
					</BackgroundItem>
				)}
			</div>
		</MainLayout>
	);
};

export default ManajemenCuti;
