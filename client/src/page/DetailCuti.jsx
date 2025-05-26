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
} from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa6";
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
		if (["Belum Diverifikasi", "Diproses"].includes(v.statusVerifikasi)) {
			break;
		}
	}

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
									? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
									: "bg-gray-300 cursor-not-allowed"
							}`}
							title="Cetak surat cuti">
							<MdPrint /> Cetak Dokumen
						</button>
					</div>
				</div>

				<div className="space-y-5"></div>
				{/* Profil Pegawai */}
				<BackgroundItem
					title="Profil Pegawai"
					marginY={false}
					icon={<FaUser />}>
					<table className="w-full my-2">
						<tbody>
							<tr className="hover:bg-gray-50">
								<td className="w-1/6 py-2 font-medium text-gray-600">
									Nama / NIP
								</td>
								<td className="w-[20px] text-gray-400">:</td>
								<td className="font-medium">
									{data.Pegawai.nama} / {data.Pegawai.nip}
								</td>
							</tr>
							<tr className="hover:bg-gray-50">
								<td className="w-1/6 py-2 font-medium text-gray-600">
									Golongan / Jabatan
								</td>
								<td className="w-[20px] text-gray-400">:</td>
								<td className="font-medium">
									{data.Pegawai.golongan} / {data.Pegawai.jabatanFungsional}
								</td>
							</tr>
							<tr className="hover:bg-gray-50">
								<td className="w-1/6 py-2 font-medium text-gray-600">
									Unit Kerja
								</td>
								<td className="w-[20px] text-gray-400">:</td>
								<td className="font-medium">{data.Pegawai.satuanKerja}</td>
							</tr>
							<tr className="hover:bg-gray-50">
								<td className="w-1/6 py-2 font-medium text-gray-600">
									Nomor Telepon
								</td>
								<td className="w-[20px] text-gray-400">:</td>
								<td className="font-medium">{data.Pegawai.noHp}</td>
							</tr>
						</tbody>
					</table>
				</BackgroundItem>

				{/* Keterangan Cuti */}
				<BackgroundItem title="Keterangan Cuti" icon={<FaClipboardList />}>
					<table className="w-full my-2 font-medium text-gray-600">
						<tbody>
							<tr className="hover:bg-gray-50">
								<td className="w-1/6 py-2">Jenis Cuti</td>
								<td>:</td>
								<td className="w-2/6 ">{data.jenisCuti}</td>
								<td className="w-1/6 py-2">Status Permohonan</td>
								<td>:</td>
								<td>
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
								</td>
							</tr>
							<tr className="hover:bg-gray-50">
								<td className="w-1/6 py-2">Kuota Cuti</td>
								<td>:</td>
								<td>{data.totalKuota}</td>
								<td className="w-1/6 py-2">Sisa Kuota Cuti</td>
								<td>:</td>
								<td>{data.sisaKuota}</td>
							</tr>
							<tr className="hover:bg-gray-50">
								<td className="w-1/6 py-2">Periode Cuti</td>
								<td>:</td>
								<td>
									{formatGMT8(data.tanggalMulai, { showTime: false })} s.d.{" "}
									{formatGMT8(data.tanggalSelesai, { showTime: false })}
								</td>
								<td className="w-1/6 py-2">Durasi Cuti</td>
								<td>:</td>
								<td>{data.durasi}</td>
							</tr>
							<tr className="hover:bg-gray-50">
								<td className="w-1/6 py-2">Alasan Cuti</td>
								<td>:</td>
								<td>{data.alasanCuti}</td>
							</tr>
							<tr className="hover:bg-gray-50">
								<td className="w-1/6 py-2">Alamat Selama Cuti</td>
								<td>:</td>
								<td>{data.alamatCuti}</td>
							</tr>
						</tbody>
					</table>
				</BackgroundItem>

				{/* Yang Menyetujui */}
				<BackgroundItem title="Yang Menyetujui" icon={<FaCheckCircle />}>
					<div className="font-medium text-gray-600">
						<p className="mb-2">Pejabat yang bertanggung jawab menyetujui:</p>
						<ol className="list-decimal ml-6">
							{data.VerifikasiCutis?.map((v, i) => (
								<li key={i} className="py-1">
									{v.verifikator.nama} / {v.verifikator.nip} /{" "}
									{v.jenisVerifikator}
								</li>
							))}
						</ol>
					</div>
				</BackgroundItem>

				{/* Formulir Pelimpahan Tugas */}
				{data.PenerimaTugas && (
					<BackgroundItem title="Formulir Pelimpahan Tugas" icon={<FaTasks />}>
						<div className="font-medium text-gray-600">
							<p className="mb-2">
								Selama masa cuti saya, saya melimpahkan Tugas dan Kewenangan
								yang berkaitan dengan kegiatan teknis kepada :
							</p>
							<table className="w-full">
								<tbody>
									<tr>
										<td className="w-1/5 py-1">Nama / NIP</td>
										<td>:</td>
										<td>
											{data.PenerimaTugas.nama} / {data.PenerimaTugas.nip}
										</td>
									</tr>
									<tr>
										<td className="w-1/5 py-1">Pangkat / Golongan / Jabatan</td>
										<td>:</td>
										<td>
											{data.PenerimaTugas.pangkat} /{" "}
											{data.PenerimaTugas.golongan} /{" "}
											{data.PenerimaTugas.jabatanFungsional}
										</td>
									</tr>
									<tr>
										<td className="w-1/5 py-1">Satuan Pelayanan</td>
										<td>:</td>
										<td>{data.PenerimaTugas.satuanKerja}</td>
									</tr>
								</tbody>
							</table>
						</div>
					</BackgroundItem>
				)}

				{/* Lampiran */}
				{data.lampiran && (
					<BackgroundItem title="Lampiran" icon={<FaFileAlt />}>
						{data.lampiran ? (
							<a
								href={`http://localhost:3000/uploads/lampiran/${data.lampiran}`}
								target="_blank"
								rel="noreferrer"
								className="flex items-center font-medium text-gray-700 bg-gray-100 px-4 py-2 rounded-md gap-2 shadow-inner">
								<FaFilePdf className="fa-solid fa-file" /> {data.lampiran}
							</a>
						) : (
							<p className="font-medium text-gray-600">Tidak ada lampiran</p>
						)}
					</BackgroundItem>
				)}

				{/* Aktivitas Permohonan */}
				<BackgroundItem title="Aktivitas Permohonan" icon={<FaClipboardList />}>
					<div className="relative font-medium text-gray-600 border-l-4 border-gray-700 pl-3 space-y-4">
						<div className="relative">
							<div className="absolute -left-5 top-[calc(50%-5px)] w-3 h-3 bg-yellow-500 border-1 border-white rounded-full shadow-sm"></div>
							<div className="bg-gray-50 p-3 rounded-md shadow-inner">
								<div className="flex justify-between items-center">
									<p className="text-gray-700 font-medium">
										Cuti diajukan oleh pegawai
									</p>
									<p className="text-sm text-gray-500">
										{formatGMT8(data.tanggalPengajuan)}
									</p>
								</div>
							</div>
						</div>
						{verifikatorTertampil?.map((v, i) => (
							<div key={i} className="relative">
								<div className="absolute -left-5 top-[calc(50%-5px)] w-3 h-3 bg-yellow-500 border-1 border-white rounded-full shadow-sm"></div>
								<div className="bg-gray-50 p-3 rounded-md shadow-inner">
									<div className="flex justify-between items-center">
										<p className="text-gray-700 font-medium">
											{v.jenisVerifikator}
											<span
												className={`px-2 py-0.5 ml-2 rounded-full text-xs font-medium
												${
													v.statusVerifikasi === "Disetujui"
														? "bg-green-100 text-green-800"
														: v.statusVerifikasi === "Ditolak"
														? "bg-red-100 text-red-800"
														: v.statusVerifikasi === "Diproses"
														? "bg-yellow-100 text-yellow-800"
														: v.statusVerifikasi === "Belum Diverifikasi"
														? "bg-blue-100 text-blue-800"
														: v.statusVerifikasi === "Dibatalkan"
														? "bg-red-100 text-red-800"
														: "bg-gray-200 text-gray-800"
												}`}>
												{v.statusVerifikasi}
											</span>
										</p>
										<p className="text-sm text-gray-500">
											{v.updatedAt !== data.tanggalPengajuan
												? formatGMT8(v.updatedAt)
												: ""}
										</p>
									</div>
									<p className="text-gray-600">
										{v.verifikator.nama} / {v.verifikator.nip}
									</p>
									<p className="text-gray-500 italic">
										{v.komentar
											? `Komentar : ${v.komentar}`
											: v.statusVerifikasi === "Belum Diverifikasi"
											? "Keterangan : Verifikator belum melihat pengajuan cuti anda. Hubungi verifikator apabila belum diverifikasi dalam 24 jam"
											: v.statusVerifikasi === "Diproses"
											? "Keterangan : Verifikator telah melihat pengajuan cuti anda. Hubungi verifikator apabila belum diverifikasi dalam 24 jam"
											: ""}
									</p>
								</div>
							</div>
						))}
					</div>
				</BackgroundItem>

				{/* Tombol */}
				{bisaVerifikasi && (
					<div className="flex flex-col sm:flex-row justify-between gap-20">
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
