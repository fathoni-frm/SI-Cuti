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
	const [isDownloading, setIsDownloading] = useState(false);
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
				navigate(-1); // atau fetch ulang data jika ingin tetap di halaman ini
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
			navigate(-1);
		} catch (error) {
			Swal.fire("Gagal", "Terjadi kesalahan saat membatalkan cuti.", "error");
		}
	};

	const handleCetakSurat = async (id) => {
		try {
			setIsDownloading(true);
			const res = await axios.get(`/pengajuan-cuti/cetak/${id}`, {
				responseType: "blob",
			});

			const fileURL = window.URL.createObjectURL(
				new Blob([res.data], { type: "application/pdf" })
			);
			const link = document.createElement("a");
			link.href = fileURL;
			link.setAttribute("download", `SuratCuti_${id}.pdf`);
			document.body.appendChild(link);
			link.click();
			link.remove();
		} catch (error) {
			console.error("Gagal mencetak surat:", error);
			toast.error("Gagal mengunduh surat cuti.");
		} finally {
			setIsDownloading(false);
		}
	};

	return (
		<MainLayout role={user.role}>
			<div className="p-6 w-full space-y-5">
				<h1 className="text-2xl font-bold">
					<span className="text-gray-400">Detail Cuti</span> / {data.jenisCuti}
				</h1>
				<div className="flex justify-between ">
					<button
						onClick={() => navigate(-1)}
						className="flex bg-gray-700 text-white px-4 py-2 rounded-md cursor-pointer">
						<FaArrowLeft className="text-sm text-white my-auto mr-2" /> Kembali
					</button>

					<div className="flex space-x-3">
						{user.role === "Admin" && data.status === "Disetujui" && (
							<button
								onClick={handleBatalkanCuti}
								disabled={isCutiSudahLewat}
								title={
									isCutiSudahLewat
										? "Tidak dapat membatalkan cuti, karena cuti sudah lewat lebih dari 3 hari."
										: "Batalkan pengajuan cuti ini."
								}
								className={`flex px-4 py-2 rounded-md items-center gap-2 text-white ${
									isCutiSudahLewat
										? "bg-gray-400 cursor-not-allowed"
										: "bg-red-600 cursor-pointer hover:bg-red-700"
								}`}>
								<FaTimesCircle className="text-xl" /> Batalkan Cuti
							</button>
						)}
						<button
							onClick={() => handleCetakSurat(data.id)}
							disabled={data.status !== "Disetujui" || isDownloading}
							className={`flex px-4 py-2 rounded-md items-center gap-2 text-white ${
								data.status === "Disetujui" && !isDownloading
									? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
									: "bg-gray-700 cursor-not-allowed"
							}`}
							title={
								data.status !== "Disetujui"
									? "Hanya pengajuan yang disetujui yang dapat mencetak surat cuti"
									: isDownloading
									? "Sedang mencetak..."
									: "Cetak surat cuti"
							}>
							{isDownloading ? (
								<>
									<div className="w-5 h-5 border-3 border-white border-dashed rounded-full animate-spin"></div>
									<span>Mencetak...</span>
								</>
							) : (
								<>
									<MdPrint className="text-xl" /> Cetak Dokumen
								</>
							)}
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
					<table className="w-full my-2">
						<tbody>
							<tr className="hover:bg-gray-50">
								<td className="w-1/6 py-2 font-medium text-gray-600">
									Jenis Cuti
								</td>
								<td>:</td>
								<td className="w-2/6 font-medium">{data.jenisCuti}</td>
								<td className="w-1/6 py-2 font-medium text-gray-600">
									Status Permohonan
								</td>
								<td>:</td>
								<td className="font-medium">{data.status}</td>
							</tr>
							<tr className="hover:bg-gray-50">
								<td className="w-1/6 py-2 font-medium text-gray-600">
									Kuota Cuti
								</td>
								<td>:</td>
								<td className="font-medium">{data.totalKuota}</td>
								<td className="w-1/6 py-2 font-medium text-gray-600">
									Sisa Kuota Cuti
								</td>
								<td>:</td>
								<td className="font-medium">{data.sisaKuota}</td>
							</tr>
							<tr className="hover:bg-gray-50">
								<td className="w-1/6 py-2 font-medium text-gray-600">
									Periode Cuti
								</td>
								<td>:</td>
								<td className="font-medium">
									{formatGMT8(data.tanggalMulai, { showTime: false })} s.d.{" "}
									{formatGMT8(data.tanggalSelesai, { showTime: false })}
								</td>
								<td className="w-1/6 py-2 font-medium text-gray-600">
									Durasi Cuti
								</td>
								<td>:</td>
								<td className="font-medium">{data.durasi}</td>
							</tr>
							<tr className="hover:bg-gray-50">
								<td className="w-1/6 py-2 font-medium text-gray-600">
									Alasan Cuti
								</td>
								<td>:</td>
								<td className="font-medium">{data.alasanCuti}</td>
							</tr>
							<tr className="hover:bg-gray-50">
								<td className="w-1/6 py-2 font-medium text-gray-600">
									Alamat Selama Cuti
								</td>
								<td>:</td>
								<td className="font-medium">{data.alamatCuti}</td>
							</tr>
						</tbody>
					</table>
				</BackgroundItem>

				{/* Yang Menyetujui */}
				<BackgroundItem title="Yang Menyetujui" icon={<FaCheckCircle />}>
					<p className="mb-2">Pejabat yang bertanggung jawab menyetujui:</p>
					<ol className="list-decimal ml-6">
						{data.VerifikasiCutis?.map((v, i) => (
							<li key={i} className="py-1">
								{v.verifikator.nama} / {v.verifikator.nip} /{" "}
								{v.verifikator.jabatanFungsional} - Status: {v.statusVerifikasi}
							</li>
						))}
					</ol>
				</BackgroundItem>

				{/* Formulir Pelimpahan Tugas */}
				{data.PenerimaTugas && (
					<BackgroundItem title="Formulir Pelimpahan Tugas" icon={<FaTasks />}>
						<p className="mb-2">
							Selama masa cuti saya, saya melimpahkan Tugas dan Kewenangan yang
							berkaitan dengan kegiatan teknis kepada :
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
										{data.PenerimaTugas.pangkat} / {data.PenerimaTugas.golongan}{" "}
										/ {data.PenerimaTugas.jabatanFungsional}
									</td>
								</tr>
								<tr>
									<td className="w-1/5 py-1">Satuan Pelayanan</td>
									<td>:</td>
									<td>{data.PenerimaTugas.satuanKerja}</td>
								</tr>
							</tbody>
						</table>
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
								className="bg-gray-200 px-4 py-2 rounded-md flex items-center gap-2">
								<FaFilePdf className="fa-solid fa-file" /> {data.lampiran}
							</a>
						) : (
							<p>Tidak ada lampiran</p>
						)}
					</BackgroundItem>
				)}

				{/* Aktivitas Permohonan */}
				<BackgroundItem title="Aktivitas Permohonan" icon={<FaClipboardList />}>
					<div className="relative border-l-4 border-gray-700 pl-6 space-y-4">
						{data.VerifikasiCutis?.map((v, i) => (
							<div key={i} className="relative">
								<div className="absolute -left-8 top-2 w-3 h-3 bg-gray-700 rounded-full"></div>
								<div>
									{/* <p className="font-semibold">{formatDateTime(v.updatedAt)}</p> */}
									<p>
										{v.verifikator.nama} / {v.verifikator.nip} -{" "}
										{v.statusVerifikasi}
									</p>
									<p className="text-gray-600">Komentar: {v.komentar || "-"}</p>
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
							className="w-full bg-red-500 text-white flex items-center justify-center gap-2 px-4 py-2 rounded-md hover:bg-red-700">
							<FaTimesCircle className="text-lg" />
							Ditolak
						</button>
						<button
							onClick={() => handleVerifikasi("Disetujui")}
							className="w-full bg-green-500 text-white flex items-center justify-center gap-2 px-4 py-2 rounded-md hover:bg-green-700">
							<FaCheckCircle className="text-lg" />
							Disetujui
						</button>
					</div>
				)}
			</div>
		</MainLayout>
	);
};

export default DetailCuti;
