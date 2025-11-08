import React, { forwardRef, useRef } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import BackgroundItem from "../components/BackgroundItem";
import {
	FaUser,
	FaClipboardList,
	FaCalendarAlt,
	FaCheckCircle,
	FaTasks,
	FaFileAlt,
	FaTrashAlt,
	FaPaperclip,
	FaSave,
	FaPaperPlane,
} from "react-icons/fa";

const FormPengajuanCuti = ({
	formik,
	mode = "create",
	onSubmitDraft,
	onSubmitFinal,
	jenisCuti,
	detailPegawai,
	totalKuota,
	sisaKuota,
	durasiCuti,
	daftarPegawai,
	daftarKetuaTim,
	daftarKepalaSapel,
}) => {
	const fileInputRef = useRef(null);
	const isEdit = mode === "edit";

	const showError = (field) =>
		formik.touched[field] && formik.errors[field] ? (
			<p className="text-xs text-red-500 mt-1">{formik.errors[field]}</p>
		) : null;

	const getSelectClass = (field) =>
		formik.touched[field] && formik.errors[field]
			? { control: (base) => ({ ...base, borderColor: "#ef4444" }) }
			: {};

	const pegawaiOptions = daftarPegawai.map((p) => ({
		value: p.id,
		label: `${p.nama} (${p.nip})`,
	}));

	const ketuaTimOptions = daftarKetuaTim.map((p) => ({
		value: p.id,
		label: `${p.nama} (${p.nip})`,
	}));

	const kepalaSapelOptions = daftarKepalaSapel.map((p) => ({
		value: p.id,
		label: `${p.nama} (${p.nip})`,
	}));

	const CustomDateInput = forwardRef(({ value, onClick, placeholder, fieldName, onClear }, ref) => (
		<div className="relative w-full">
			<button
				type="button"
				ref={ref}
				onClick={onClick}
				data-field={fieldName}
				className="flex items-center justify-between w-full py-2 px-3 border border-gray-300 rounded-md bg-white text-gray-700 hover:ring-2 hover:ring-blue-400 transition-all"
			>
				<span className="flex items-center gap-2">
					<FaCalendarAlt className="text-gray-600" />
					{value ? value : <span className="text-gray-400">{placeholder}</span>}
				</span>
				{value && (
					<span
						onClick={(e) => {
							e.stopPropagation();
							onClear();
						}}
						className="ml-2 px-1 text-gray-400 hover:text-red-500 cursor-pointer font-bold text-lg"
						title="Hapus tanggal"
					>
						×
					</span>
				)}
			</button>
		</div>
	));
	
	return (
		<div className="w-full p-4 sm:p-6 mx-auto bg-gray-50 rounded-xl">
			<h1 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800">
				{isEdit ? "Draft Pengajuan Cuti" : "Form Pengajuan Cuti"} /{" "}
				<span className="text-gray-500">{jenisCuti}</span>
			</h1>

			<form onSubmit={formik.handleSubmit} className="space-y-6">
				{/* ===== Profil Pegawai ===== */}
				<BackgroundItem title="Profil Pegawai" icon={<FaUser />}>
					<div className="px-6 py-4 text-gray-800 text-sm sm:text-base grid gap-4 sm:grid-cols-2">
						<div>
							<label className="block text-sm font-medium text-gray-600 mb-1">
								Nama
							</label>
							<input
								type="text"
								value={`${detailPegawai.nama}`}
								disabled
								className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-600 mb-1">
								NIP
							</label>
							<input
								type="text"
								value={`${detailPegawai.nip}`}
								disabled
								className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-600 mb-1">
								Golongan
							</label>
							<input
								type="text"
								value={`${detailPegawai.golongan}`}
								disabled
								className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-600 mb-1">
								Jabatan
							</label>
							<input
								type="text"
								value={`${detailPegawai.jabatanFungsional}`}
								disabled
								className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-600 mb-1">
								Unit Kerja
							</label>
							<input
								type="text"
								value={`${detailPegawai.satuanKerja}`}
								disabled
								className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-600 mb-1">
								Nomor Telepon
							</label>
							<input
								type="text"
								value={`${detailPegawai.noHp}`}
								disabled
								className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
							/>
						</div>
					</div>
				</BackgroundItem>

				{/* ===== Keterangan Cuti ===== */}
				<BackgroundItem title="Keterangan Cuti" icon={<FaClipboardList />}>
					<div className="px-6 py-4 text-gray-800 text-sm sm:text-base grid gap-4 sm:grid-cols-2">
						<div>
							<label className="block text-sm font-medium text-gray-600 mb-1">
								Jenis Cuti
							</label>
							<input
								type="text"
								value={jenisCuti}
								disabled
								className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-600 mb-1">
								Total Kuota
							</label>
							<input
								type="text"
								value={`${totalKuota || 0} hari`}
								disabled
								className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
							/>
						</div>
						<div className="mb-2">
							<label className="block text-sm font-medium text-gray-600 mb-3.5">
								Sisa Kuota
							</label>
							<span className="bg-blue-100 text-blue-700 px-3 py-3 rounded-md text-sm font-semibold">
								{`${sisaKuota || 0} hari`}
							</span>
						</div>
						<div className="mb-2">
							<label className="block text-sm font-medium text-gray-600 mb-3.5">
								Durasi Cuti
							</label>
							<span className="bg-yellow-100 text-yellow-700 px-3 py-3 rounded-md text-sm font-semibold">
								{`${durasiCuti || 0} hari`}
							</span>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-600 mb-1">
								Tanggal Mulai <span className="text-red-500">*</span>
							</label>
							<DatePicker
								selected={
									formik.values.tanggalMulai
										? new Date(formik.values.tanggalMulai)
										: null
								}
								onChange={(date) => {
									formik.setFieldValue("tanggalMulai", date);
									if (formik.values.tanggalSelesai && new Date(formik.values.tanggalSelesai) < date) {
										formik.setFieldValue("tanggalSelesai", null);
									}
								}}
								onBlur={() => formik.setFieldTouched("tanggalMulai", true)}
								filterDate={(date) => date.getDay() !== 0 && date.getDay() !== 6}
								minDate={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
								customInput={
									<CustomDateInput
										placeholder="Pilih tanggal mulai"
										fieldName="tanggalMulai"
										onClear={() => formik.setFieldValue("tanggalMulai", null)}
									/>
								}
								dateFormat="dd/MM/yyyy"
							/>
							{showError("tanggalMulai")}
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-600 mb-1">
								Tanggal Selesai <span className="text-red-500">*</span>
							</label>
							<DatePicker
								selected={
									formik.values.tanggalSelesai
										? new Date(formik.values.tanggalSelesai)
										: null
								}
								onChange={(date) => formik.setFieldValue("tanggalSelesai", date)}
								onBlur={() => formik.setFieldTouched("tanggalSelesai", true)}
								filterDate={(date) => date.getDay() !== 0 && date.getDay() !== 6}
								minDate={
									formik.values.tanggalMulai
										? new Date(formik.values.tanggalMulai)
										: null
								}
								customInput={
									<CustomDateInput
										placeholder="Pilih tanggal selesai"
										fieldName="tanggalSelesai"
										onClear={() => formik.setFieldValue("tanggalSelesai", null)}
									/>
								}
								dateFormat="dd/MM/yyyy"
							/>
							{showError("tanggalSelesai")}
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-600 mb-1">
								Alasan Cuti <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								name="alasanCuti"
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.alasanCuti}
								placeholder="Tuliskan alasan cuti anda"
								className={`w-full p-2 border rounded-md ${formik.touched.alasanCuti && formik.errors.alasanCuti
									? "border-red-500"
									: "border-gray-300"
									}`}
							/>
							{showError("alasanCuti")}
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-600 mb-1">
								Alamat Selama Cuti <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								name="alamatCuti"
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.alamatCuti}
								placeholder="Alamat anda selama cuti (kota)"
								className={`w-full p-2 border rounded-md ${formik.touched.alamatCuti && formik.errors.alamatCuti
									? "border-red-500"
									: "border-gray-300"
									}`}
							/>
							{showError("alamatCuti")}
						</div>
					</div>
				</BackgroundItem>

				{/* ===== Persetujuan Atasan ===== */}
				<BackgroundItem title="Yang Menyetujui" icon={<FaCheckCircle />}>
					<div className="px-6 py-4 text-gray-800 text-sm sm:text-base grid sm:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-600 mb-1">
								Kepala Balai Besar
							</label>
							<input
								type="text"
								value="Drh. Arum Kusnila Dewi, M.Si"
								disabled
								className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-600 mb-1">
								Kepala Bagian Umum
							</label>
							<input
								type="text"
								value="Agus Ali Hamzah, S.H., M.A.P"
								disabled
								className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-600 mb-1">
								Ketua Tim (Opsional)
							</label>
							<Select
								name="ketuaTim"
								options={ketuaTimOptions}
								value={formik.values.ketuaTim ? ketuaTimOptions.find(
									(opt) => opt.value === formik.values.ketuaTim.value
								) : null}
								onChange={(opt) => formik.setFieldValue("ketuaTim", opt)}
								isClearable
								placeholder="Pilih ketua tim"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-600 mb-1">
								Kepala Satuan Pelayanan (Opsional)
							</label>
							<Select
								name="kaSapel"
								options={kepalaSapelOptions}
								value={formik.values.kaSapel ? kepalaSapelOptions.find(
									(opt) => opt.value === formik.values.kaSapel.value
								) : null}
								onChange={(opt) => formik.setFieldValue("kaSapel", opt)}
								isClearable
								placeholder="Pilih kepala satuan pelayanan"
							/>
						</div>
					</div>
				</BackgroundItem>

				{/* ===== Pelimpahan Tugas ===== */}
				<BackgroundItem title="Formulir Pelimpahan Tugas" icon={<FaTasks />}>
					<div className="px-6 py-4 text-gray-800 text-sm sm:text-base ">
						<p></p>
						<label className="block text-sm font-medium text-gray-600 mb-3">
							Selama masa cuti saya, saya melimpahkan Tugas dan Kewenangan yang berkaitan dengan kegiatan teknis kepada : <span className="text-red-500">*</span>
						</label>
						<Select
							name="idPenerimaTugas"
							options={pegawaiOptions}
							value={formik.values.idPenerimaTugas ? pegawaiOptions.find(
								(opt) => opt.value === formik.values.idPenerimaTugas
							) : null}
							onChange={(opt) =>
								formik.setFieldValue("idPenerimaTugas", opt?.value || null)
							}
							onBlur={() => formik.setFieldTouched("idPenerimaTugas", true)}
							isClearable
							placeholder="Pilih penerima tugas"
							styles={getSelectClass("idPenerimaTugas")}
						/>
						{showError("idPenerimaTugas")}
					</div>
				</BackgroundItem>

				{/* ===== Lampiran ===== */}
				<BackgroundItem title="Lampiran" icon={<FaFileAlt />}>
					<div className="px-6 py-4 text-gray-800 text-sm sm:text-base ">
						<label className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 px-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
							<FaPaperclip />
							<span className="text-sm text-gray-600 text-center">
								{formik.values.lampiran ? (
									typeof formik.values.lampiran === "string" ? (
										<>
											File terlampir:{" "}
											<a
												href={`${import.meta.env.VITE_PUBLIC_URL}/uploads/lampiran/${formik.values.lampiran}`}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-600 underline"
											>
												{formik.values.lampiran}
											</a>
										</>
									) : (
										`File terpilih: ${formik.values.lampiran.name}`
									)
								) : (
									"Klik untuk upload atau drag file ke sini"
								)}
							</span>
							<input
								ref={fileInputRef}
								name="lampiran"
								type="file"
								accept=".pdf,.jpg,.jpeg,.png"
								className="hidden"
								onChange={(e) =>
									formik.setFieldValue("lampiran", e.currentTarget.files[0])
								}
								onBlur={() => formik.setFieldTouched("lampiran", true)}
							/>
						</label>
						{formik.values.lampiran && (
							<div className="flex justify-center mt-2">
								<button
									type="button"
									onClick={() => {
										formik.setFieldValue("lampiran", null);
										if (fileInputRef.current) fileInputRef.current.value = "";
									}}
									className="inline-flex items-center px-2 py-1.5 bg-red-600 text-white text-xs font-medium rounded-full hover:bg-red-700"
								>
									<FaTrashAlt className="mr-1" />
									Hapus Lampiran
								</button>
							</div>
						)}
						{showError("lampiran")}
					</div>
				</BackgroundItem>

				{/* ===== Tombol Aksi ===== */}
				<div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-20 mt-6">
					<button
						type="button"
						onClick={() => onSubmitDraft(formik.values)}
						className="flex items-center justify-center w-full gap-2 py-3 bg-white border border-gray-700 rounded-lg hover:bg-gray-200 transition cursor-pointer"
					>
						<FaSave /> Simpan Draft
					</button>

					<button
						type="button"
						onClick={() => onSubmitFinal(formik.values)}
						className="flex items-center justify-center w-full gap-2 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 shadow-md transition cursor-pointer"
					>
						<FaPaperPlane /> kirim Pengajuan
					</button>
				</div>
			</form>
		</div>
	);
};

export default FormPengajuanCuti;
