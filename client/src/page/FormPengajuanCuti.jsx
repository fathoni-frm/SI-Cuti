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

	const CustomDateInput = ({ value, onClick, placeholder }) => (
		<button
			type="button"
			onClick={onClick}
			className="flex items-center gap-2 w-35 p-2 border border-gray-500 rounded-lg bg-white text-left hover:ring-2 hover:ring-blue-400 transition-all">
			<FaCalendarAlt className="text-gray-600" />
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
					text: `Sisa kuota ${jenisCuti || formik.values.jenisCuti} Anda hanya ${sisaKuota} hari, sedangkan Anda mengajukan ${durasiCuti} hari.`,
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
			const pelimpahan = data.idPenerimaTugas
				? findPelimpahanOption(data.idPenerimaTugas)
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
			<div className="p-6 w-full max-w-7xl mx-auto">
				<h1 className="text-2xl font-bold mb-6">
					<span className="text-gray-500">Pengajuan Cuti</span> /{" "}
					{formik.values.jenisCuti || jenisCuti}
				</h1>
				<form onSubmit={formik.handleSubmit} className="space-y-6">
					{/* Profil Pegawai */}
					<BackgroundItem
						title="Profil Pegawai"
						marginY={false}
						icon={<FaUser />}>
						<table className="w-full my-2 font-medium text-black">
							<tbody>
								<tr className="hover:bg-gray-50">
									<td className="w-1/6 py-3">Nama / NIP</td>
									<td className="w-[20px] ">:</td>
									<td>
										{detailPegawai.nama} <span className="">/</span>{" "}
										{detailPegawai.nip}
									</td>
								</tr>
								<tr className="hover:bg-gray-50">
									<td className="w-1/6 py-3">Golongan / Jabatan</td>
									<td className="w-[20px] ">:</td>
									<td>
										{detailPegawai.golongan} <span className="">/</span>{" "}
										{detailPegawai.jabatanFungsional}
									</td>
								</tr>
								<tr className="hover:bg-gray-50">
									<td className="w-1/6 py-3">Unit Kerja</td>
									<td className="w-[20px] ">:</td>
									<td>{detailPegawai.satuanKerja}</td>
								</tr>
								<tr className="hover:bg-gray-50">
									<td className="w-1/6 py-3">Nomor Telepon</td>
									<td className="w-[20px] ">:</td>
									<td>{detailPegawai.noHp}</td>
								</tr>
							</tbody>
						</table>
					</BackgroundItem>

					{/* Keterangan Cuti */}
					<BackgroundItem
						title="Keterangan Cuti"
						marginY={false}
						icon={<FaClipboardList />}>
						<table className="w-full my-2 mb-4 font-medium text-black">
							<tbody>
								<tr className="hover:bg-gray-50">
									<td className="w-1/6 py-3">Jenis Cuti</td>
									<td className="w-[20px]">:</td>
									<td className="w-1/3">
										{formik.values.jenisCuti || jenisCuti}
									</td>
								</tr>
								<tr className="hover:bg-gray-50">
									<td className="w-1/6 py-3">Total Kuota Cuti</td>
									<td className="w-[20px]">:</td>
									<td>{totalKuota} hari</td>
									<td className="w-1/6 py-3">Sisa Kuota Cuti</td>
									<td className="w-[20px]">:</td>
									<td>{sisaKuota} hari</td>
								</tr>
								<tr className="hover:bg-gray-50">
									<td className="w-1/6 py-3">Periode Cuti</td>
									<td className="w-[20px]">:</td>
									<td>
										<div className="flex items-center gap-2">
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
													<p className="text-red-500 text-sm mt-1">
														{formik.errors.tanggalMulai}
													</p>
												)}
											<span className="pb-1">s.d.</span>
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
													<p className="text-red-500 text-sm mt-1">
														{formik.errors.tanggalSelesai}
													</p>
												)}
										</div>
									</td>
									<td className="w-1/6 py-3">Durasi Cuti</td>
									<td className="w-[20px]">:</td>
									<td>
										<span>
											{durasiCuti > 0 ? `${durasiCuti} hari` : "0 hari"}
										</span>
									</td>
								</tr>
								<tr className="hover:bg-gray-50">
									<td className="w-1/6 py-3">Alasan Cuti</td>
									<td className="w-[20px]">:</td>
									<td colSpan={4}>
										<input
											type="text"
											className="p-1 border rounded-md w-full"
											name="alasanCuti"
											value={formik.values.alasanCuti}
											onChange={formik.handleChange}
											onBlur={formik.handleBlur}
											aria-invalid="true"
										/>
										{formik.touched.alasanCuti && formik.errors.alasanCuti && (
											<p className="text-red-500 text-sm">
												{formik.errors.alasanCuti}
											</p>
										)}
									</td>
								</tr>
								<tr className="hover:bg-gray-50">
									<td className="w-1/6 py-3">Alamat Selama Cuti</td>
									<td className="w-[20px]">:</td>
									<td colSpan={4}>
										<input
											type="text"
											className="p-1 border rounded-md w-full"
											name="alamatCuti"
											value={formik.values.alamatCuti}
											onChange={formik.handleChange}
											onBlur={formik.handleBlur}
											aria-invalid="true"
										/>
										{formik.touched.alamatCuti && formik.errors.alamatCuti && (
											<p className="text-red-500 text-sm">
												{formik.errors.alamatCuti}
											</p>
										)}
									</td>
								</tr>
							</tbody>
						</table>
					</BackgroundItem>

					{/* Yang Menyetujui */}
					<BackgroundItem title="Yang Menyetujui" icon={<FaCheckCircle />}>
						<p className="font-medium text-black mb-3">
							Pejabat yang bertanggung jawab menyetujui :
						</p>
						<ol className="list-decimal ml-8 space-y-1 font-medium text-black">
							<li className="py-1">
								Drh. Arum Kusnila Dewi, M.Si - Kepala Balai Besar
							</li>
							<li className="py-1">
								Agus Ali Hamzah, S.H., M.A.P - Kepala Sub Bagian Umum
							</li>
							<li className="py-1">
								<label htmlFor="ketuaTim">Ketua Tim (Opsional)</label>
								<Select
									id="ketuaTim"
									name="ketuaTim"
									options={optionsAtasan}
									placeholder="Cari dan pilih nama ketua tim..."
									className="react-select-container font-normal text-black"
									classNamePrefix="react-select"
									styles={{
										control: (base) => ({
											...base,
											minHeight: "42px",
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
							<li className="py-1 font-medium text-black">
								<label htmlFor="kaSapel">
									Kepala Satuan Pelayanan (Opsional)
								</label>
								<Select
									id="kaSapel"
									name="kaSapel"
									options={optionsAtasan}
									placeholder="Cari dan pilih nama kepala satuan pelayanan..."
									className="react-select-container font-normal text-black"
									classNamePrefix="react-select"
									styles={{
										control: (base) => ({
											...base,
											minHeight: "42px",
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
					</BackgroundItem>

					{/* Formulir Pelimpahan Tugas */}
					<BackgroundItem
						title="Formulir Pelimpahan Tugas (Opsional)"
						icon={<FaTasks />}>
						<p className="mb-3 font-medium text-black">
							Selama masa cuti saya, saya melimpahkan Tugas dan Kewenangan yang
							berkaitan dengan kegiatan teknis kepada :
						</p>
						<table className="w-full font-medium text-black">
							<tbody>
								<tr>
									<td className="w-1/5 py-2">Nama / NIP</td>
									<td className="w-[20px]">:</td>
									<td>
										<div className="flex gap-2">
											<div className="w-1/2">
												<Select
													name="pelimpahanNama"
													options={optionsPegawai}
													placeholder="Ketik Nama Pegawai..."
													className="react-select-container"
													classNamePrefix="react-select"
													value={optionsPegawai.find(
														(option) =>
															option.value === formik.values.idPenerimaTugas
													)}
													onChange={(option) => {
														if (option === null) {
															setFieldValue("idPenerimaTugas", null);
															setFieldValue("pelimpahanNama", "");
															setFieldValue("pelimpahanNip", "");
															setFieldValue("pelimpahanPangkat", "");
															setFieldValue("pelimpahanGolongan", "");
															setFieldValue("pelimpahanJabatan", "");
															setFieldValue("pelimpahanSatuanKerja", "");
														} else {
															setFieldValue("idPenerimaTugas", option.value);
															setFieldValue("pelimpahanNama", option.label);
															setFieldValue("pelimpahanNip", option.nip);
															setFieldValue(
																"pelimpahanPangkat",
																option.pangkat
															);
															setFieldValue(
																"pelimpahanGolongan",
																option.golongan
															);
															setFieldValue(
																"pelimpahanJabatan",
																option.jabatan
															);
															setFieldValue(
																"pelimpahanSatuanKerja",
																option.satuanKerja
															);
														}
													}}
													isClearable
												/>
											</div>
											{formik.values.pelimpahanNama && (
												<span className="p-1">
													/ {formik.values.pelimpahanNip}
												</span>
											)}
										</div>
									</td>
								</tr>
								<tr>
									<td className="w-1/5 py-2">Pangkat / Golongan / Jabatan</td>
									<td>:</td>
									<td>
										{formik.values.pelimpahanNama && (
											<span className="p-1">
												{formik.values.pelimpahanPangkat} /{" "}
												{formik.values.pelimpahanGolongan} /{" "}
												{formik.values.pelimpahanJabatan}
											</span>
										)}
									</td>
								</tr>
								<tr>
									<td className="w-1/5 py-2">Satuan Pelayanan</td>
									<td>:</td>
									<td>
										{formik.values.pelimpahanNama && (
											<span className="p-1">
												{formik.values.pelimpahanSatuanKerja}
											</span>
										)}
									</td>
								</tr>
							</tbody>
						</table>
					</BackgroundItem>

					{/* Lampiran */}
					<BackgroundItem title="Lampiran (Opsional)" icon={<FaFileAlt />}>
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
										<span className="text-blue-500 font-medium">
											Klik untuk upload
										</span>{" "}
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
					</BackgroundItem>

					{/* Tombol */}
					<div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
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
