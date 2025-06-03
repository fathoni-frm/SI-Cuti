import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import axios from "../api/axios";
import { formatGMT8 } from "../schemas/timeFormatter";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import MainLayout from "../Layouts/MainLayout";
import BackgroundItem from "../components/BackgroundItem";
import Spinner from "../components/Spinner";
import {
	FaArrowLeft,
	FaUser,
	FaClipboardList,
	FaCheckCircle,
	FaFileAlt,
	FaTasks,
	FaTimesCircle,
	FaDownload,
} from "react-icons/fa";
import { MdPrint } from "react-icons/md";

const DetailCuti = () => {
	const { id } = useParams();
	const { user } = useAuthStore();
	const [data, setData] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axios.get(`/pengajuan-cuti/${id}`, {
					withCredentials: true,
				});
				const data = res.data;
				setData(data);
			} catch (err) {
				console.error("Gagal ambil detail cuti:", err);
			}
		};

		fetchData();
	}, [id]);

	if (!data) return <Spinner />;

	const akhirCuti = new Date(data.tanggalSelesai);
	const batasPembatalan = new Date(akhirCuti);
	batasPembatalan.setDate(akhirCuti.getDate() + 3);
	const isCutiSudahLewat = new Date() > batasPembatalan;

	const verifikasiList = data.VerifikasiCutis;
	const giliran = verifikasiList.find(
		(item) =>
			item.idPimpinan === user.idPegawai &&
			(item.statusVerifikasi === "Belum Diverifikasi" ||
				item.statusVerifikasi === "Diproses")
	);
	const bisaVerifikasi =
		user.role === "Atasan" && giliran && giliran.idPimpinan === user.idPegawai;

	const verifikatorTertampil = [];
	for (const v of data.VerifikasiCutis) {
		verifikatorTertampil.push(v);
		if (["Belum Diverifikasi", "Diproses", "Ditolak"].includes(v.statusVerifikasi)) {
			break;
		}
	}

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

	const handleVerifikasi = async (status) => {
		const { value: komentar } = await Swal.fire({
			title: `Apakah Anda yakin ingin ${
				status === "Disetujui" ? "menyetujui" : "menolak"
			} cuti ini?`,
			input: "textarea",
			inputLabel: "Berikan komentar atau alasan",
			inputPlaceholder: "Masukkan komentar atau alasan Anda...",
			showCancelButton: true,
			confirmButtonColor: status === "Disetujui" ? "#00c951" : "#d33",
			confirmButtonText: status === "Disetujui" ? "Ya, setujui" : "Ya, tolak",
			cancelButtonText: "Batal",
			inputValidator: (value) => {
				if (!value) {
					return "Komentar wajib diisi!";
				}
			},
		});

		if (komentar) {
			try {
				await axios.patch(
					`/verifikasi-cuti/${giliran.id}`,
					{
						id: giliran.id,
						statusVerifikasi: status,
						komentar,
						tanggalVerifikasi: new Date().toISOString(),
					},
					{
						withCredentials: true,
					}
				);

				Swal.fire(
					"Berhasil!",
					`Cuti telah ${status.toLowerCase()}.`,
					"success"
				);
				navigate("/permohonan-cuti");
			} catch (error) {
				Swal.fire(
					"Gagal",
					"Terjadi kesalahan saat memproses verifikasi.",
					"error"
				);
			}
		}
	};

	const handleBatalkanCuti = async () => {
		const { value: komentar } = await Swal.fire({
			title: "Batalkan Cuti Ini?",
			text: "Langkah ini akan membatalkan cuti yang sudah disetujui, dan akan mengembalikan kuota cuti pegawai secara otomatis.",
			input: "textarea",
			inputLabel: "Isi alasan pembatalan untuk membatalkan cuti ini",
			inputPlaceholder: "Masukkan alasan pembatalan...",
			showCancelButton: true,
			confirmButtonColor: "#d33",
			confirmButtonText: "Ya, Batalkan",
			cancelButtonText: "Batal",
			inputValidator: (value) => {
				if (!value) return "Alasan wajib diisi";
			},
		});
		if (!komentar) return;

		try {
			await axios.patch(
				`/batalkan-cuti/${data.id}`,
				{ komentar, tanggalVerifikasi: new Date().toISOString() },
				{ withCredentials: true }
			);

			Swal.fire("Berhasil", "Pengajuan cuti telah dibatalkan.", "success");
			navigate("/permohonan-cuti");
		} catch (error) {
			Swal.fire("Gagal", "Terjadi kesalahan saat membatalkan cuti.", "error");
		}
	};

	const handleCetakSurat = async () => {
		if (!data.suratCuti || data.status !== "Disetujui") return;
		const url = `http://localhost:3000/uploads/surat-cuti/${data.suratCuti}`;
		window.open(url, "_blank");
	};

	return (
		<MainLayout role={user.role}>
			<div className="p-6 w-full space-y-5">
				<h1 className="text-2xl font-bold">
					<span className="text-gray-400">Detail Cuti</span> / {data.jenisCuti}
				</h1>
				{/* TOMBOL */}
				<div className="flex justify-between items-center flex-wrap gap-3">
					<button
						onClick={() => navigate(-1)}
						className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition cursor-pointer">
						<FaArrowLeft className="text-sm" /> Kembali
					</button>

					<div className="flex gap-3">
						{/* Tombol Batalkan */}
						{user.role === "Admin" && data.status === "Disetujui" && (
							<button
								onClick={handleBatalkanCuti}
								disabled={isCutiSudahLewat}
								className={`flex items-center gap-2 px-4 py-2 rounded-md text-white transition ${
									isCutiSudahLewat
										? "bg-gray-300 cursor-not-allowed"
										: "bg-red-600 hover:bg-red-700 cursor-pointer"
								}`}
								title={
									isCutiSudahLewat
										? "Tidak dapat membatalkan cuti karena cuti sudah lewat lebih dari 3 hari."
										: "Batalkan pengajuan cuti ini."
								}>
								<FaTimesCircle /> Batalkan Cuti
							</button>
						)}

						{/* Tombol Cetak */}
						<button
							onClick={handleCetakSurat}
							disabled={data.status !== "Disetujui" && !data.suratCuti}
							className={`flex items-center gap-2 px-4 py-2 rounded-md text-white transition ${
								data.status === "Disetujui" && data.suratCuti
									? "bg-emerald-500 hover:bg-emerald-600 cursor-pointer"
									: "bg-gray-300 cursor-not-allowed"
							}`}
							title={`
								${
									data.status === "Disetujui" && data.suratCuti
										? "Cetak surat cuti."
										: "Surat cuti tidak tersedia untuk pengajuan yang belum / tidak disetujui."
								}`}>
							<MdPrint /> Cetak Dokumen
						</button>
					</div>
				</div>

				<div className="space-y-5"></div>
				{/* Profil Pegawai */}
				<BackgroundItem title="Profil Pegawai" icon={<FaUser />}>
					<div className="py-2">
						<FormFieldRow label="Nama / NIP">{`${data.Pegawai.nama} / ${data.Pegawai.nip}`}</FormFieldRow>
						<FormFieldRow label="Golongan / Jabatan">{`${data.Pegawai.golongan} / ${data.Pegawai.jabatanFungsional}`}</FormFieldRow>
						<FormFieldRow label="Unit Kerja">
							{data.Pegawai.satuanKerja}
						</FormFieldRow>
						<FormFieldRow label="Nomor Telepon">
							{data.Pegawai.noHp}
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
							<div className="w-fit mb-3 font-medium text-black md:mb-0 md:ml-5 md:mt-0 md:w-1/3">
								{data.jenisCuti}
							</div>
							<div className="flex w-fit font-semibold text-gray-500 space-x-1 mb-1 md:mb-0 md:ml-10 md:justify-between md:w-25">
								<div>Status</div>
								<div>:</div>
							</div>
							<div className="w-fit font-medium text-black md:ml-5 md:mt-0 md:flex-1">
								<span
									className={`text-sm px-3 py-1 rounded-full ${
										data.status === "Disetujui"
											? "bg-green-100 text-green-800"
											: data.status === "Ditolak"
											? "bg-red-100 text-red-800"
											: data.status === "Diproses"
											? "bg-yellow-100 text-yellow-800"
											: data.status === "Dibatalkan"
											? "bg-red-100 text-red-800"
											: "bg-gray-200 text-gray-800"
									}`}>
									{data.status}
								</span>
							</div>
						</div>

						<div className="flex flex-col md:flex-row md:items-baseline">
							<div className="flex w-fit font-semibold text-gray-500 space-x-1 mb-1 md:mb-0 md:justify-between md:w-48">
								<div>Total Kuota</div>
								<div>:</div>
							</div>
							<div className="w-fit mb-3 font-medium text-black md:mb-0 md:ml-5 md:mt-0 md:w-1/3">
								<span className="text-sm px-3 py-1 text-white bg-green-500 rounded-full">
									{data.totalKuota} hari
								</span>
							</div>
							<div className="flex w-fit font-semibold text-gray-500 space-x-1 mb-1 md:mb-0 md:ml-10 md:justify-between md:w-25">
								<div>Sisa Kuota</div>
								<div>:</div>
							</div>
							<div className="w-fit font-medium text-black md:ml-5 md:mt-0 md:flex-1">
								<span className="text-sm px-3 py-1 text-white bg-yellow-500 rounded-full">
									{data.sisaKuota} hari
								</span>
							</div>
						</div>

						<div className="flex flex-col md:flex-row md:items-baseline">
							<div className="flex w-fit font-semibold text-gray-500 space-x-1 mb-0.5 md:mb-0 md:justify-between md:w-48">
								<div>Periode Cuti</div>
								<div>:</div>
							</div>
							<div className="w-fit mb-3 font-medium text-black md:mb-0 md:ml-5 md:mt-0 md:w-1/3">
								{formatGMT8(data.tanggalMulai, { showTime: false })} s.d.{" "}
								{formatGMT8(data.tanggalSelesai, { showTime: false })}
							</div>
							<div className="flex w-fit font-semibold text-gray-500 space-x-1 md:ml-10 md:justify-between md:w-25">
								<div>Durasi Cuti</div>
								<div>:</div>
							</div>
							<div className="flex w-fit font-medium text-black md:ml-5 md:mt-0 md:flex-1">
								<span>{`${data.durasi} hari`}</span>
							</div>
						</div>

						<div className="flex flex-col md:flex-row md:items-start">
							<div className="flex w-fit font-semibold text-gray-500 space-x-1 md:justify-between md:place-self-center md:w-48">
								<div>Alasan Cuti</div>
								<div>:</div>
							</div>
							<div className="w-full font-medium text-black mt-1 md:ml-5 md:mt-0 md:flex-1">
								{data.alasanCuti}
							</div>
						</div>

						<div className="flex flex-col md:flex-row md:items-start">
							<div className="flex w-fit font-semibold text-gray-500 space-x-1 md:justify-between md:place-self-center md:w-48">
								<div>Alamat Cuti</div>
								<div>:</div>
							</div>
							<div className="w-full font-medium text-black mt-1 md:ml-5 md:mt-0 md:flex-1">
								{data.alamatCuti}
							</div>
						</div>
					</div>
				</BackgroundItem>

				{/* Yang Menyetujui */}
				<BackgroundItem title="Yang Menyetujui" icon={<FaCheckCircle />}>
					<div className="p-4 sm:px-6">
						<p className="mb-4 font-medium text-gray-700">
							Pejabat yang bertanggung jawab menyetujui:
						</p>

						<div className="space-y-3">
							{data.VerifikasiCutis?.filter(
								(v) => v.jenisVerifikator !== "Admin"
							).map((v, i) => (
								<div
									key={i}
									className="p-3 bg-gray-50 border border-gray-200 rounded-lg shadow-sm/60">
									<div className="flex items-start gap-x-3">
										<span className="text-sm flex-shrink-0 font-semibold text-gray-500">
											{i + 1}.
										</span>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-semibold text-gray-500 tracking-wider mb-0.5">
												{v.jenisVerifikator}
											</p>
											<p
												className="font-semibold text-black"
												title={v.verifikator.nama}>
												{v.verifikator.nama}
											</p>
											<p className="text-sm text-gray-500">
												NIP: {v.verifikator.nip}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</BackgroundItem>

				{/* Formulir Pelimpahan Tugas */}
				{data.PenerimaTugas && (
					<BackgroundItem title="Formulir Pelimpahan Tugas" icon={<FaTasks />}>
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
										{`${data.PenerimaTugas.nama} / ${data.PenerimaTugas.nip}`}
									</div>
								</div>

								<div className="flex flex-col md:flex-row md:items-baseline py-2">
									<div className="flex w-fit font-semibold text-gray-600 mb-1 space-x-1 md:justify-between md:mb-0 md:w-3xs">
										<div>Pangkat / Golongan / Jabatan</div>
										<div>:</div>
									</div>
									<div className="font-medium text-black md:ml-1 md:flex-1">
										{`${data.PenerimaTugas.pangkat} / ${data.PenerimaTugas.golongan} / ${data.PenerimaTugas.jabatanFungsional}`}
									</div>
								</div>

								<div className="flex flex-col md:flex-row md:items-baseline py-2">
									<div className="flex w-fit font-semibold text-gray-600 mb-1 space-x-1 md:justify-between md:mb-0 md:w-3xs">
										<div>Satuan Pelayanan</div>
										<div>:</div>
									</div>
									<div className="font-medium text-black md:ml-1 md:flex-1">
										{data.PenerimaTugas.satuanKerja}
									</div>
								</div>
							</div>
						</div>
					</BackgroundItem>
				)}

				{/* Lampiran */}
				{data.lampiran && (
					<BackgroundItem title="Lampiran" icon={<FaFileAlt />}>
						<div className="p-4 sm:px-6">
							<a
								href={`http://localhost:3000/uploads/lampiran/${data.lampiran}`}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2.5 px-4 py-2.5 
										text-sm font-medium rounded-md transition-colors duration-150
										bg-gray-50 text-gray-700 hover:bg-gray-100 
										w-full sm:w-auto group shadow-sm 
										border border-gray-200 
										focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
								title="Unduh file">
								<FaDownload className="h-4 w-4 text-gray-600 flex-shrink-0" />
								<span className="truncate max-w-[200px] xs:max-w-[250px] sm:max-w-xs md:max-w-sm lg:max-w-md">
									{data.lampiran}
								</span>
							</a>
						</div>
					</BackgroundItem>
				)}

				{/* Aktivitas Permohonan */}
				<BackgroundItem title="Aktivitas Permohonan" icon={<FaClipboardList />}>
					<div className="p-4 sm:px-6">
						{/* garis */}
						<div className="relative border-l-2 border-gray-300 space-y-6 pl-6 py-2">
							<div className="relative">
								{/* titik */}
								<div className="absolute -left-[calc(1.5rem_+_1px_+_0.375rem)] top-2 w-3 h-3 bg-blue-500 border-2 border-white rounded-full ring-2 ring-blue-300"></div>
								<div className="p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
									<div className="flex flex-col sm:flex-row justify-between sm:items-center mb-1">
										<p className="text-sm font-semibold text-gray-800">
											Cuti diajukan
										</p>
										<p className="text-xs text-gray-500 mt-0.5 sm:mt-0">
											{formatGMT8(data.tanggalPengajuan)}
										</p>
									</div>
									<p className="text-xs text-gray-600">
										Oleh: {data.Pegawai.nama}
									</p>
								</div>
							</div>

							{verifikatorTertampil?.map((v, i) => (
								<div key={i} className="relative">
									{/* titik */}
									<div
										className={`absolute -left-[calc(1.5rem_+_1px_+_0.375rem)] top-2 w-3 h-3 border-2 border-white rounded-full shadow-sm
                        						${
																			v.statusVerifikasi === "Disetujui"
																				? "bg-green-500 ring-2 ring-green-300"
																				: v.statusVerifikasi === "Ditolak"
																				? "bg-red-500 ring-2 ring-red-300"
																				: v.statusVerifikasi === "Diproses"
																				? "bg-yellow-500 ring-2 ring-yellow-300"
																				: v.statusVerifikasi === "Dibatalkan"
																				? "bg-gray-500 ring-2 ring-gray-300"
																				: ""
																		}`}></div>
									<div className="p-3 sm:p-4 bg-white rounded-lg border border-gray-200 shadow-sm ">
										<div className="flex flex-col sm:flex-row justify-between sm:items-center mb-1.5">
											<h4 className="text-sm font-semibold text-gray-800">
												{v.jenisVerifikator}
												<span
													className={`px-2 py-0.5 ml-2 rounded-full text-xs font-medium
                                    					${
																								v.statusVerifikasi ===
																								"Disetujui"
																									? "bg-green-100 text-green-800"
																									: v.statusVerifikasi ===
																									  "Ditolak"
																									? "bg-red-100 text-red-800"
																									: v.statusVerifikasi ===
																									  "Diproses"
																									? "bg-yellow-100 text-yellow-800"
																									: v.statusVerifikasi ===
																									  "Belum Diverifikasi"
																									? "bg-blue-100 text-blue-800"
																									: v.statusVerifikasi ===
																									  "Dibatalkan"
																									? "bg-gray-100 text-gray-800"
																									: ""
																							}`}>
													{v.statusVerifikasi}
												</span>
											</h4>
											<p className="text-xs text-gray-500 mt-0.5 sm:mt-0">
												{(v.jenisVerifikator === "Admin" &&
													v.statusVerifikasi === "Dibatalkan") ||
												(v.statusVerifikasi !== "Belum Diverifikasi" &&
													v.statusVerifikasi !== "Dibatalkan")
													? formatGMT8(v.updatedAt)
													: v.jenisVerifikator !== "Admin" &&
													  v.statusVerifikasi === "Dibatalkan"
													? formatGMT8(v.updatedAt, {showTime : false})
													: ""}
											</p>
										</div>
										<p className="text-xs text-gray-600 mb-1">
											Oleh:{" "}
											<span className="font-medium">{v.verifikator.nama}</span>{" "}
											({v.verifikator.nip})
										</p>
										{(v.komentar ||
											(v.statusVerifikasi === "Belum Diverifikasi" &&
												v.jenisVerifikator !== "Admin") ||
											(v.statusVerifikasi === "Diproses" &&
												v.jenisVerifikator !== "Admin") ||
											(v.statusVerifikasi === "Dibatalkan" &&
												v.jenisVerifikator !== "Admin")) && (
											<p className="mt-2 text-xs text-gray-500 italic bg-gray-100 p-2 rounded-md border/50">
												{v.komentar
													? `Komentar: ${v.komentar}`
													: v.statusVerifikasi === "Belum Diverifikasi"
													? "Menunggu verifikasi dari pejabat terkait. Hubungi pejabat terkait apabila belum diverifikasi dalam 24 jam."
													: v.statusVerifikasi === "Diproses"
													? "Pengajuan telah ditinjau oleh pejabat terkait. Hubungi pejabat terkait apabila belum diverifikasi dalam 24 jam"
													: v.statusVerifikasi === "Dibatalkan"
													? "Pengajuan telah dibatalkan oleh sistem, karena pengajuan telah expired. Hubungi pejabat terkait apabila melakukan pengajuan kembali."
													: ""}
											</p>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				</BackgroundItem>

				{/* Tombol */}
				{bisaVerifikasi && (
					<div className="flex flex-col sm:flex-row justify-between gap-5 md:gap-20">
						<button
							onClick={() => handleVerifikasi("Ditolak")}
							className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md flex items-center justify-center gap-2 transition cursor-pointer">
							<FaTimesCircle />
							Ditolak
						</button>
						<button
							onClick={() => handleVerifikasi("Disetujui")}
							className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md flex items-center justify-center gap-2 transition cursor-pointer">
							<FaCheckCircle />
							Disetujui
						</button>
					</div>
				)}
			</div>
		</MainLayout>
	);
};

export default DetailCuti;
