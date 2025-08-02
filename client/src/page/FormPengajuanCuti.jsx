import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useAuthStore from "../store/authStore";
import axios from "../api/axios";
import {
	initialValues,
	validationSchema,
	hitungDurasiCuti,
	getKuotaCutiByJenis,
} from "../schemas/formCutiSchema";
import { formatDateWithoutTimezone } from "../schemas/timeFormatter";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import MainLayout from "../Layouts/MainLayout";
import BackgroundItem from "../components/BackgroundItem";
import Spinner from "../components/Spinner";
import {
	FaUser,
	FaClipboardList,
	FaCheckCircle,
	FaFileAlt,
	FaTasks,
	FaPaperclip,
	FaTrashAlt,
	FaCalendarAlt,
} from "react-icons/fa";
import { FiSave } from "react-icons/fi";
import { FaPaperPlane } from "react-icons/fa6";

const FormPengajuanCuti = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const { user, detailPegawai, kuotaCuti, isLoading } = useAuthStore();

	const jenisCuti = location.state?.jenisCuti;

	const [daftarAtasan, setDaftarAtasan] = useState([]);
	const [daftarPegawai, setDaftarPegawai] = useState([]);
	const [durasiCuti, setDurasiCuti] = useState(0);
	const [sisaKuota, setSisaKuota] = useState(0);
	const [totalKuota, setTotalKuota] = useState(0);
	const [sudahFetchDraft, setSudahFetchDraft] = useState(false);
	const fileInputRef = useRef(null);

	const isKuotaCutiValid = Array.isArray(kuotaCuti) && kuotaCuti.length > 0;

	const optionsAtasan = daftarAtasan.map((atasan) => ({
		value: atasan.id,
		label: atasan.nama,
	}));

	const optionsPegawai = daftarPegawai.map((pegawai) => ({
		value: pegawai.id,
		label: pegawai.nama,
		nip: pegawai.nip,
		pangkat: pegawai.pangkat,
		golongan: pegawai.golongan,
		jabatan: pegawai.jabatanFungsional,
		satuanKerja: pegawai.satuanKerja,
	}));

	const findAtasanOption = (idPimpinan) => {
		if (!idPimpinan) return null;
		return optionsAtasan.find((option) => option.value === idPimpinan) || null;
	};

	const findPelimpahanOption = (idPenerimaTugas) => {
		if (!idPenerimaTugas || optionsPegawai.length === 0) return null;
		return (
			optionsPegawai.find((option) => option.value === idPenerimaTugas) || null
		);
	};

	const FormFieldRow = ({ label, children }) => (
		<div className="flex flex-col py-2 px-6 sm:flex-row sm:items-start">
			<div className="flex w-fit font-semibold text-gray-500 space-x-1 md:justify-between md:w-48">
				<div>{label}</div>
				<div>:</div>
			</div>
			<div className="w-full text-base font-medium text-black md:ml-5 sm:w-3/4 lg:w-5/6">
				{children}
			</div>
		</div>
	);

	const CustomDateInput = ({ value, onClick, placeholder }) => (
		<button
			type="button"
			onClick={onClick}
			className="flex items-center gap-2 w-33 py-2 border border-gray-400 rounded-lg bg-white text-center hover:ring-2 hover:ring-blue-400 transition-all">
			<FaCalendarAlt className="ml-1 text-gray-600" />
			<span className="text-sm text-gray-700">{value || placeholder}</span>
		</button>
	);

	const handleSubmitCuti = async (values, isDraft) => {
		try {
			if (isDraft && (!values.tanggalMulai || !values.tanggalSelesai)) {
				Swal.fire({
					title: "Tidak Dapat Menyimpan Draft",
					text: "Isi tanggal mulai dan selesai cuti sebelum menyimpan draft.",
					icon: "warning",
					showConfirmButton: false,
					showCancelButton: true,
					cancelButtonColor: "#3085d6",
					cancelButtonText: "OK",
				});
				return;
			}

			if (durasiCuti > sisaKuota) {
				Swal.fire({
					icon: "error",
					title: "Kuota Tidak Cukup",
					text: `Sisa kuota ${
						jenisCuti || formik.values.jenisCuti
					} Anda hanya ${sisaKuota} hari, sedangkan Anda mengajukan ${durasiCuti} hari.`,
				});
				return;
			}

			const formData = new FormData();
			formData.append("idPegawai", detailPegawai.id);
			formData.append("jenisCuti", jenisCuti);
			formData.append(
				"tanggalMulai",
				formatDateWithoutTimezone(values.tanggalMulai)
			);
			formData.append(
				"tanggalSelesai",
				formatDateWithoutTimezone(values.tanggalSelesai)
			);
			formData.append("durasi", durasiCuti);
			formData.append("alasanCuti", values.alasanCuti);
			formData.append("alamatCuti", values.alamatCuti);
			if (values.lampiran) {
				formData.append("lampiran", values.lampiran);
			}
			formData.append(
				"idPenerimaTugas",
				values.idPenerimaTugas !== null ? values.idPenerimaTugas : null
			);
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
			formData.append("isDraft", isDraft);

			if (!isDraft) {
				formData.append("tanggalPengajuan", new Date().toISOString());
				formData.append("totalKuota", totalKuota);
				formData.append("sisaKuota", sisaKuota);
			}
			
			if (id) {
				// EDIT draft
				await axios.put(`/pengajuan-cuti/${id}`, formData, {
					headers: { "Content-Type": "multipart/form-data" },
				});
			} else {
				// FORM BARU
				await axios.post("/pengajuan-cuti", formData, {
					headers: { "Content-Type": "multipart/form-data" },
				});
			}

			toast.success(
				id && isDraft
					? "Draft diperbarui!"
					: isDraft
					? "Draft berhasil disimpan!"
					: "Cuti berhasil diajukan!"
			);
			navigate(isDraft ? "/draft-cuti" : "/riwayat-cuti");
		} catch (err) {
			console.error("Error:", err.response?.data || err.message);
			toast.error(
				err.response?.data?.msg ||
					(isDraft ? "Gagal menyimpan draft." : "Gagal mengajukan cuti.")
			);
		}
	};

	const formik = useFormik({
		initialValues,
		validationSchema,
		onSubmit: (values) => handleSubmitCuti(values, false),
	});
	const { setFieldValue } = formik;

	const fetchAtasanDanPegawai = async () => {
		try {
			const [resAtasan, resPegawai] = await Promise.all([
				axios.get("/form/atasan"),
				axios.get("/form/pegawai"),
			]);
			setDaftarAtasan(resAtasan.data);
			setDaftarPegawai(resPegawai.data);
		} catch (error) {
			console.error("Gagal fetch data:", error);
			toast.error("Gagal memuat data atasan dan pegawai");
		}
	};

	const fetchDraft = async () => {
		try {
			const res = await axios.get(`/pengajuan-cuti/draft/edit/${id}`);
			const data = res.data;
			const sortedVerifikasi = [...data.VerifikasiCutis].sort(
				(a, b) => a.urutanVerifikasi - b.urutanVerifikasi
			);
			const pelimpahan = data.PelimpahanTuga
			? findPelimpahanOption(data.PelimpahanTuga.idPenerima)
			: {};
			
			formik.setValues({
				id: data.id,
				idPegawai: data.idPegawai,
				jenisCuti: data.jenisCuti,
				tanggalMulai: data.tanggalMulai,
				tanggalSelesai: data.tanggalSelesai,
				alasanCuti: data.alasanCuti || "",
				alamatCuti: data.alamatCuti || "",
				lampiran: data.lampiran,
				ketuaTim: findAtasanOption(
					sortedVerifikasi.find((v) => v.jenisVerifikator === "Ketua Tim")
						?.idPimpinan
				),
				kaSapel: findAtasanOption(
					sortedVerifikasi.find(
						(v) => v.jenisVerifikator === "Kepala Satuan Pelayanan"
					)?.idPimpinan
				),
				idPenerimaTugas: pelimpahan.value || "",
				pelimpahanNama: pelimpahan.label || "",
				pelimpahanNip: pelimpahan.nip || "",
				pelimpahanPangkat: pelimpahan.pangkat || "",
				pelimpahanGolongan: pelimpahan.golongan || "",
				pelimpahanJabatan: pelimpahan.jabatan || "",
				pelimpahanSatuanKerja: pelimpahan.satuanKerja || "",
			});
			setSudahFetchDraft(true);
		} catch (err) {
			console.error("Error fetch draft:", err);
			toast.error("Gagal memuat data draft");
		}
	};

	useEffect(() => {
		fetchAtasanDanPegawai();
	}, []);

	useEffect(() => {
		if (daftarAtasan.length > 0 && id && !sudahFetchDraft) {
			fetchDraft();
		}
	}, [daftarAtasan, id, sudahFetchDraft]);

	useEffect(() => {
		if ((formik.values.jenisCuti || jenisCuti) && isKuotaCutiValid) {
			const kuotaInfo = getKuotaCutiByJenis(
				kuotaCuti,
				formik.values.jenisCuti || jenisCuti
			);
			const { totalKuota, sisaKuota } = kuotaInfo;
			setTotalKuota(totalKuota);
			setSisaKuota(sisaKuota);
		}
	}, [formik.values.jenisCuti, jenisCuti, kuotaCuti]);

	useEffect(() => {
		setDurasiCuti(
			hitungDurasiCuti(formik.values.tanggalMulai, formik.values.tanggalSelesai)
		);
	}, [formik.values.tanggalMulai, formik.values.tanggalSelesai]);

	if (isLoading || !detailPegawai || !isKuotaCutiValid) {
		return <Spinner />;
	}

	return (
		<MainLayout role={user.role}>
			<div className="w-full p-4 mx-auto sm:p-6">
				<h1 className="mb-6 text-xl font-bold sm:text-2xl text-gray-800">
					<span className="text-gray-500">Pengajuan Cuti / </span>
					{formik.values.jenisCuti || jenisCuti}
				</h1>
				<form onSubmit={formik.handleSubmit} className="space-y-6">
					{/* Profil Pegawai */}
					<BackgroundItem
						title="Profil Pegawai"
						icon={<FaUser />}>
						<div className="py-2">
							<FormFieldRow label="Nama / NIP">{`${detailPegawai.nama} / ${detailPegawai.nip}`}</FormFieldRow>
							<FormFieldRow label="Golongan / Jabatan">{`${detailPegawai.golongan} / ${detailPegawai.jabatanFungsional}`}</FormFieldRow>
							<FormFieldRow label="Unit Kerja">
								{detailPegawai.satuanKerja}
							</FormFieldRow>
							<FormFieldRow label="Nomor Telepon">
								{detailPegawai.noHp}
							</FormFieldRow>
						</div>
					</BackgroundItem>

					{/* Keterangan Cuti */}
					<BackgroundItem title="Keterangan Cuti" icon={<FaClipboardList />}>
						<div className="space-y-3 p-4 sm:px-6">
							<div className="flex flex-col md:flex-row md:items-baseline">
								<div className="flex w-fit font-semibold text-gray-500 space-x-1 md:justify-between md:w-48">
									<div>Jenis Cuti</div>
									<div>:</div>
								</div>
								<div className="w-full font-medium text-black md:ml-5 md:mt-0 md:flex-1">
									{formik.values.jenisCuti || jenisCuti}
								</div>
							</div>

							<div className="flex flex-col md:flex-row md:items-baseline">
								<div className="flex w-fit font-semibold text-gray-500 space-x-1 mb-1 md:mb-0 md:justify-between md:w-48">
									<div>Total Kuota</div>
									<div>:</div>
								</div>
								<div className="w-fit mb-3 font-medium text-black md:mb-0 md:ml-5 md:mt-0 md:w-1/3">
									<span className="text-sm px-3 py-1 text-white bg-green-500 rounded-full">
										{totalKuota} hari
									</span>
								</div>
								<div className="flex w-fit font-semibold text-gray-500 space-x-1 mb-1 md:mb-0 md:ml-10 md:justify-between md:w-25">
									<div>Sisa Kuota</div>
									<div>:</div>
								</div>
								<div className="w-fit font-medium text-black md:ml-5 md:mt-0 md:flex-1">
									<span className="text-sm px-3 py-1 text-white bg-yellow-500 rounded-full">
										{sisaKuota} hari
									</span>
								</div>
							</div>

							<div className="flex flex-col md:flex-row md:items-baseline">
								<div className="flex w-fit font-semibold text-gray-500 space-x-1 mb-0.5 md:mb-0 md:justify-between md:place-self-center md:w-48">
									<div>Periode Cuti</div>
									<div>:</div>
								</div>
								<div className="flex justify-center space-x-1 w-fit mb-3 font-medium text-black md:ml-5 md:mb-0">
									<div className="w-fit xs:w-auto">
										<DatePicker
											name="tanggalMulai"
											selected={
												formik.values.tanggalMulai
													? new Date(formik.values.tanggalMulai)
													: null
											}
											onChange={(date) => {
												if (
													formik.values.tanggalSelesai &&
													new Date(formik.values.tanggalSelesai) < date
												) {
													formik.setFieldValue("tanggalSelesai", null);
												}
												formik.setFieldValue("tanggalMulai", date);
											}}
											customInput={<CustomDateInput />}
											minDate={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
											filterDate={(date) =>
												date.getDay() !== 0 && date.getDay() !== 6
											}
											isClearable
											placeholderText="Tanggal Mulai"
											dateFormat="dd/MM/yyyy"
										/>
										{formik.touched.tanggalMulai &&
											formik.errors.tanggalMulai && (
												<p className="mt-1 text-xs text-red-500">
													{formik.errors.tanggalMulai}
												</p>
											)}
									</div>
									<span className="text-gray-500 place-self-center">s.d.</span>
									<div className="w-full xs:w-auto">
										<DatePicker
											name="tanggalSelesai"
											selected={
												formik.values.tanggalSelesai
													? new Date(formik.values.tanggalSelesai)
													: null
											}
											onChange={(date) =>
												formik.setFieldValue("tanggalSelesai", date)
											}
											customInput={<CustomDateInput />}
											minDate={
												formik.values.tanggalMulai
													? new Date(formik.values.tanggalMulai)
													: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
											}
											filterDate={(date) =>
												date.getDay() !== 0 && date.getDay() !== 6
											}
											isClearable
											placeholderText="Tanggal Selesai"
											dateFormat="dd/MM/yyyy"
										/>
										{formik.touched.tanggalSelesai &&
											formik.errors.tanggalSelesai && (
												<p className="mt-1 text-xs text-red-500">
													{formik.errors.tanggalSelesai}
												</p>
											)}
									</div>
								</div>
								<div className="flex w-fit font-semibold text-gray-500 space-x-1 md:ml-7 lg:ml-19 md:justify-between md:place-self-center md:w-25">
									<div>Durasi Cuti</div>
									<div>:</div>
								</div>
								<div className="flex w-fit font-medium text-black md:ml-5 md:mt-0 md:flex-1 md:place-self-center">
									<span>
										{durasiCuti > 0 ? `${durasiCuti} hari` : "0 hari"}
									</span>
								</div>
							</div>

							<div className="flex flex-col md:flex-row md:items-start">
								<div className="flex w-fit font-semibold text-gray-500 space-x-1 md:justify-between md:place-self-center md:w-48">
									<div>Alasan Cuti</div>
									<div>:</div>
								</div>
								<div className="w-full mt-1 md:ml-5 md:mt-0 md:flex-1">
									<input
										name="alasanCuti"
										value={formik.values.alasanCuti}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										rows="3"
										placeholder="Alasan cuti anda"
										className="w-full p-2 transition border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>
							</div>
							{formik.touched.alasanCuti && formik.errors.alasanCuti && (
								<p className="flex justify-end -mt-10 pb-3 mr-4 text-xs text-red-500">
									{formik.errors.alasanCuti}
								</p>
							)}

							<div className="flex flex-col md:flex-row md:items-start">
								<div className="flex w-fit font-semibold text-gray-500 space-x-1 md:justify-between md:place-self-center md:w-48">
									<div>Alamat Cuti</div>
									<div>:</div>
								</div>
								<div className="w-full mt-1 md:ml-5 md:mt-0 md:flex-1">
									<input
										type="text"
										name="alamatCuti"
										value={formik.values.alamatCuti}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										placeholder="Alamat anda selama cuti (kota)"
										className="w-full p-2 transition border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>
							</div>
							{formik.touched.alamatCuti && formik.errors.alamatCuti && (
								<p className="flex justify-end -mt-10 pb-3 mr-4 text-xs text-red-500">
									{formik.errors.alamatCuti}
								</p>
							)}
						</div>
					</BackgroundItem>

					{/* Yang Menyetujui */}
					<BackgroundItem title="Yang Menyetujui" icon={<FaCheckCircle />}>
						<div className="p-4 sm:px-6">
							<p className="mb-3 font-medium text-black">
								Pejabat yang bertanggung jawab menyetujui :
							</p>
							<ol className="list-decimal ml-4.5 space-y-3 font-medium text-black">
								<li>
									<span className="text-gray-500">Kepala Balai Besar :</span>
									{window.innerWidth < 640 ? <br /> : " "}
									Drh. Arum Kusnila Dewi, M.Si
								</li>
								<li>
									<span className="text-gray-500">
										Kepala Bagian Umum :
									</span>
									{window.innerWidth < 640 ? <br /> : " "}
									Agus Ali Hamzah, S.H., M.A.P
								</li>
								<li>
									<label className="text-gray-500" htmlFor="ketuaTim">
										Ketua Tim (Opsional) :
									</label>
									<Select
										id="ketuaTim"
										name="ketuaTim"
										options={optionsAtasan}
										placeholder="Cari dan pilih nama ketua tim..."
										className="react-select-container mt-1 font-medium text-black"
										classNamePrefix="react-select"
										styles={{
											control: (base) => ({
												...base,
												minHeight: "35px",
												borderColor: "#d1d5db",
												"&:hover": {
													borderColor: "#3b82f6",
												},
											}),
										}}
										value={formik.values.ketuaTim}
										onChange={(option) => setFieldValue("ketuaTim", option)}
										isClearable
									/>
								</li>
								<li>
									<label className="text-gray-500" htmlFor="kaSapel">
										Kepala Satuan Pelayanan (Opsional) :
									</label>
									<Select
										id="kaSapel"
										name="kaSapel"
										options={optionsAtasan}
										placeholder="Cari dan pilih nama kepala satuan pelayanan..."
										className="react-select-container mt-1 font-medium text-black"
										classNamePrefix="react-select"
										styles={{
											control: (base) => ({
												...base,
												minHeight: "35px",
												borderColor: "#d1d5db",
												"&:hover": {
													borderColor: "#3b82f6",
												},
											}),
										}}
										value={formik.values.kaSapel}
										onChange={(option) => setFieldValue("kaSapel", option)}
										isClearable
									/>
								</li>
							</ol>
						</div>
					</BackgroundItem>

					{/* Formulir Pelimpahan Tugas */}
					<BackgroundItem
						title="Formulir Pelimpahan Tugas (Opsional)"
						icon={<FaTasks />}>
						<div className="p-4 sm:px-6">
							<p className="mb-4 font-medium text-black text-justify">
								Selama masa cuti saya, saya melimpahkan Tugas dan Kewenangan
								yang berkaitan dengan kegiatan teknis kepada :
							</p>

							<div className="space-y-3 md:space-y-2">
								<div className="flex flex-col md:flex-row md:items-baseline py-2">
									<div className="flex w-fit font-semibold text-gray-600 mb-1 space-x-1 md:justify-between md:mb-0 md:w-3xs">
										<div>Nama / NIP</div>
										<div>:</div>
									</div>
									<div className="font-medium text-black md:ml-1 md:flex-1">
										<div className="flex flex-col gap-y-1 md:flex-row md:items-center md:gap-2">
											<div className="w-full md:w-3/5 lg:w-1/2">
												{/* Lebar Select di desktop */}
												<Select
													name="pelimpahanNama"
													options={optionsPegawai}
													placeholder="Ketik Nama Pegawai . . ."
													className="react-select-container"
													classNamePrefix="react-select"
													value={optionsPegawai.find(
														(option) =>
															option.value === formik.values.idPenerimaTugas
													)}
													onChange={(option) => {
														if (option === null) {
															formik.setFieldValue("idPenerimaTugas", null);
															formik.setFieldValue("pelimpahanNama", "");
															formik.setFieldValue("pelimpahanNip", "");
															formik.setFieldValue("pelimpahanPangkat", "");
															formik.setFieldValue("pelimpahanGolongan", "");
															formik.setFieldValue("pelimpahanJabatan", "");
															formik.setFieldValue("pelimpahanSatuanKerja", "");
														} else {
															formik.setFieldValue(
																"idPenerimaTugas",
																option.value
															);
															formik.setFieldValue(
																"pelimpahanNama",
																option.label
															);
															formik.setFieldValue("pelimpahanNip", option.nip);
															formik.setFieldValue(
																"pelimpahanPangkat",
																option.pangkat
															);
															formik.setFieldValue(
																"pelimpahanGolongan",
																option.golongan
															);
															formik.setFieldValue(
																"pelimpahanJabatan",
																option.jabatan
															);
															formik.setFieldValue(
																"pelimpahanSatuanKerja",
																option.satuanKerja
															);
														}
													}}
													isClearable
													styles={{
														// Sesuaikan styling react-select Anda
														control: (base) => ({
															...base,
															minHeight: "38px",
															borderColor: "#d1d5db",
															"&:hover": { borderColor: "#9ca3af" },
														}),
														menu: (base) => ({ ...base, zIndex: 20 }),
													}}
												/>
											</div>
											{formik.values.pelimpahanNama && (
												<span className="mt-1 md:mt-0 text-gray-700">
													/ {formik.values.pelimpahanNip}
												</span>
											)}
										</div>
									</div>
								</div>

								<div className="flex flex-col md:flex-row md:items-baseline py-2">
									<div className="flex w-fit font-semibold text-gray-600 mb-1 space-x-1 md:justify-between md:mb-0 md:w-3xs">
										<div>Pangkat / Golongan / Jabatan</div>
										<div>:</div>
									</div>
									{formik.values.pelimpahanNama && (
										<div className="font-medium text-black md:ml-1 md:flex-1">
											{`${formik.values.pelimpahanPangkat} / ${formik.values.pelimpahanGolongan} / ${formik.values.pelimpahanJabatan}`}
										</div>
									)}
								</div>

								<div className="flex flex-col md:flex-row md:items-baseline py-2">
									<div className="flex w-fit font-semibold text-gray-600 mb-1 space-x-1 md:justify-between md:mb-0 md:w-3xs">
										<div>Satuan Pelayanan</div>
										<div>:</div>
									</div>
									<div className="font-medium text-black md:ml-1 md:flex-1">
										{formik.values.pelimpahanSatuanKerja}
									</div>
								</div>
							</div>
						</div>
					</BackgroundItem>

					{/* Lampiran */}
					<BackgroundItem title="Lampiran (Opsional)" icon={<FaFileAlt />}>
						<div className="p-4 sm:px-6">
							<label className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 px-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
								<FaPaperclip />
								<span className="text-sm text-black text-center">
									{formik.values.lampiran ? (
										formik.values.lampiran instanceof File ? (
											<span className="font-medium text-blue-600">
												File terpilih: {formik.values.lampiran.name}
											</span>
										) : (
											<>
												<span className="font-medium text-blue-600">
													File terlampir: {formik.values.lampiran}
												</span>
												<br />
												<a
													href={`http://localhost:3000/uploads/lampiran/${formik.values.lampiran}`}
													target="_blank"
													rel="noopener noreferrer"
													className="text-sm text-blue-500 underline">
													Lihat lampiran
												</a>
											</>
										)
									) : (
										<>
											<span className="text-blue-500 font-medium mr-1">
												Klik untuk upload
											</span>
											atau drag file ke sini
										</>
									)}
								</span>
								<span className="text-xs text-gray-400">
									Format: PDF, JPG, PNG (maks. 5MB)
								</span>
								<input
									ref={fileInputRef}
									name="lampiran"
									type="file"
									accept=".pdf,.jpg,.jpeg,.png"
									className="hidden"
									onChange={(event) => {
										formik.setFieldValue(
											"lampiran",
											event.currentTarget.files[0]
										);
									}}
								/>
							</label>
							{formik.values.lampiran && (
								<div className="flex justify-center mt-2">
									<button
										type="button"
										onClick={() => {
											formik.setFieldValue("lampiran", null);
											if (fileInputRef.current) {
												fileInputRef.current.value = "";
											}
										}}
										className="inline-flex items-center px-2 py-1.5 bg-red-600 text-white text-xs font-medium rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all">
										<FaTrashAlt className="mr-2" />
										Hapus lampiran
									</button>
								</div>
							)}
							{formik.touched.lampiran && formik.errors.lampiran && (
								<p className="text-red-500 text-sm mt-1">
									{formik.errors.lampiran}
								</p>
							)}
						</div>
					</BackgroundItem>

					{/* Tombol */}
					<div className="flex flex-col sm:flex-row justify-between gap-5 mt-8">
						<button
							type="button"
							onClick={() => handleSubmitCuti(formik.values, true)}
							className="w-full bg-white border border-black hover:bg-gray-300 hover:text-white hover:border-white flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all cursor-pointer">
							<FiSave /> Simpan Draft
						</button>
						<button
							type="submit"
							className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all cursor-pointer">
							<FaPaperPlane /> Ajukan Cuti
						</button>
					</div>
				</form>
			</div>
		</MainLayout>
	);
};

export default FormPengajuanCuti;
