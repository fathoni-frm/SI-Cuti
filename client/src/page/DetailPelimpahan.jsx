import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import axios from "../api/axios";
import { formatGMT8 } from "../schemas/timeFormatter";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import MainLayout from "../Layouts/MainLayout";
import BackgroundItem from "../components/BackgroundItem";
import Spinner from "../components/Spinner";
import {
	FaUserTie,
	FaUserCheck,
	FaArrowLeft,
	FaCheckCircle,
	FaTimesCircle,
	FaInfoCircle,
} from "react-icons/fa";
import { MdPrint } from "react-icons/md";

const DetailPelimapahan = () => {
	const { id } = useParams();
	const { user } = useAuthStore();
	const [data, setData] = useState(null);
	const navigate = useNavigate();
	const MySwal = withReactContent(Swal);

	const DetailRow = ({ label, children }) => (
		<div className="flex flex-col py-2 sm:flex-row sm:items-start sm:py-2.5">
			<dt className="w-full text-sm font-medium text-gray-500 sm:w-1/5 lg:w-1/6 ">
				{label}
			</dt>
			<dd className="flex w-full mt-1 text-sm font-semibold text-gray-800 sm:w-4/5 lg:w-5/6 sm:mt-0">
				<span className="hidden w-6 text-center sm:inline-block">:</span>
				<span className="flex-1">{children}</span>
			</dd>
		</div>
	);

	const handleCetakSurat = async () => {
		if (!data.PengajuanCuti.suratCuti || data.PengajuanCuti.status !== "Disetujui") return;
		const url = `${import.meta.env.VITE_PUBLIC_URL}/uploads/surat-cuti/${data.PengajuanCuti.suratCuti}`;
		window.open(url, "_blank");
	};

	const handleKonfirmasi = async (status) => {
		const { value: catatan } = await MySwal.fire({
			title:
				status === "Disetujui"
					? "Terima Pelimpahan Tugas?"
					: "Tolak Pelimpahan Tugas?",
			text:
				status === "Disetujui"
					? "Anda akan resmi bertanggung jawab atas tugas selama periode cuti."
					: "Anda akan menolak pelimpahan tugas ini.",
			input: "textarea",
			inputLabel: status === "Disetujui" ? "Catatan" : "Alasan Penolakan",
			inputPlaceholder:
				status === "Disetujui"
					? "Apabila tidak ada catatan, isi dengan (-)"
					: "Masukkan alasan penolakan",
			inputValidator: (value) => {
				if (!value || value.trim().length === 0) {
					return "Komentar wajib diisi!";
				}
			},
			showCancelButton: true,
			confirmButtonText: status === "Disetujui" ? "Ya, Terima" : "Ya, Tolak",
			confirmButtonColor: status === "Disetujui" ? "#16a34a" : "#dc2626",
			cancelButtonText: "Batal",
			reverseButtons: true,
			heightAuto: false,
		});

		if (catatan === undefined) return;

		try {
			await axios.patch(`/verifikasi-pelimpahan/${data.id}`, {
				status: status,
				komentar: catatan.trim(),
			});

			await MySwal.fire({
				icon: "success",
				title: "Berhasil",
				text:
					status === "Disetujui"
						? "Pelimpahan tugas telah diterima."
						: "Pelimpahan tugas telah ditolak.",
				timer: 2500,
				showConfirmButton: false,
			});
			navigate("/permohonan-pelimpahan-tugas");
		} catch (err) {
			console.error(err);
			MySwal.fire({
				icon: "error",
				title: "Gagal",
				text: "Terjadi kesalahan saat memproses permintaan.",
			});
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axios.get(`/pelimpahan-tugas/${id}`, {
					withCredentials: true,
				});
				setData(res.data);
			} catch (err) {
				console.error("Gagal ambil detail cuti:", err);
			}
		};

		fetchData();
	}, [id]);

	if (!data) return <Spinner />;

	const isPenerima = user?.idPegawai === data.idPenerima;
	const bisaKonfirmasi = isPenerima && data.status === "Diproses";
	const dibatalkan =
		data.status === "Disetujui" &&
		(data.PengajuanCuti.status === "Ditolak" ||
			data.PengajuanCuti.status === "Dibatalkan");

	return (
		<MainLayout role={user.role}>
			<div className="p-4 sm:p-6 w-full space-y-5">
				<h1 className="mb-6 text-xl font-bold sm:text-2xl text-gray-800">
					<span className="text-gray-500">Permohonan Pelimpahan Tugas / </span>
					Detail Pelimpahan
				</h1>

				{/* TOMBOL */}
				<div className="flex justify-between items-center flex-wrap gap-3">
					<button
						onClick={() => navigate(-1)}
						className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition cursor-pointer text-sm">
						<FaArrowLeft className="text-xs" /> Kembali
					</button>
					<div className="flex gap-3">
						<button
							onClick={handleCetakSurat}
							disabled={!data.PengajuanCuti.suratCuti}
							className={`flex items-center gap-2 px-4 py-2 rounded-md text-white transition text-sm ${
								data.PengajuanCuti.suratCuti
									? "bg-emerald-500 hover:bg-emerald-600 cursor-pointer"
									: "bg-gray-300 cursor-not-allowed"
							}`}
							title={
								data.PengajuanCuti.suratCuti
									? "Cetak surat pelimpahan."
									: "Surat pelimpahan belum tersedia."
							}>
							<MdPrint /> Cetak Dokumen
						</button>
					</div>
				</div>

				<div
					role="alert"
					className={`flex items-start w-full p-4 text-sm border-l-4 rounded-r-lg shadow-sm lg:max-w-7xl
						${
							data.status === "Disetujui" && !dibatalkan
								? "text-green-800 bg-green-50 border-green-400"
								: data.status === "Ditolak" || dibatalkan
								? "text-red-800 bg-red-50 border-red-400"
								: data.status === "Belum Diverifikasi" || data.status === "Diproses"
								? "text-yellow-800 bg-yellow-50 border-yellow-400"
								: "text-gray-800 bg-gray-50 border-gray-400"
						}`}>
					<FaInfoCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
					<div className="text-justify">
						{(data.status === "Belum Diverifikasi" ||
							data.status === "Diproses") && (
							<>
								<p className="mb-2">
									Anda menerima permohonan pelimpahan tugas dari{" "}
									<strong>{data.PengajuanCuti.pegawai.nama}</strong> selama masa
									cutinya. Sesuai dengan ketentuan yang berlaku, apabila Anda
									menyetujui pelimpahan ini, maka seluruh tanggung jawab yang
									berkaitan dengan kegiatan teknis dari pegawai yang
									bersangkutan akan menjadi tanggung jawab Anda selama periode
									cuti berlangsung.
								</p>
								<p>
									Silahkan tinjau kembali informasi berikut sebelum menyetujui
									atau menolak pelimpahan tugas ini.
								</p>
							</>
						)}
						{dibatalkan && (
							<p>
								Pelimpahan tugas dari {data.PengajuanCuti.pegawai.nama} telah{" "}
								<strong>dibatalkan</strong> secara otomatis, karena pengajuan cuti dari pegawai yang bersangkutan telah {data.PengajuanCuti.status.toLowerCase()}. 
							</p>
						)}
						{data.status === "Disetujui" && !dibatalkan && (
							<p>
								Anda telah <strong>menyetujui</strong> pelimpahan tugas ini.
								Selama periode cuti, seluruh tanggung jawab dari pegawai yang
								bersangkutan akan berada pada Anda.
							</p>
						)}
						{data.status === "Ditolak" && (
							<p>
								Anda telah <strong>menolak</strong> pelimpahan tugas ini.
								Informasi ini telah dikirimkan kembali kepada pemohon untuk
								tindak lanjut.
							</p>
						)}
					</div>
				</div>

				{/* 1. IDENTITAS PEGAWAI PENGAJU */}
				<BackgroundItem
					title="Pegawai Yang Melimpahkan Tugas"
					icon={<FaUserTie />}>
					<div className="p-4 sm:px-6">
						<dl>
							<DetailRow label="Nama / NIP">
								{`${data.PengajuanCuti.pegawai.nama} / ${data.PengajuanCuti.pegawai.nip}`}
							</DetailRow>
							<DetailRow label="Pangkat / Gol / Jabatan">
								{`${data.PengajuanCuti.pegawai.pangkat} / ${data.PengajuanCuti.pegawai.golongan} / ${data.PengajuanCuti.pegawai.jabatanFungsional}`}
							</DetailRow>
							<DetailRow label="Satuan Kerja">
								{data.PengajuanCuti.pegawai.satuanKerja}
							</DetailRow>
							<DetailRow label="Periode Cuti">
								{`${formatGMT8(data.PengajuanCuti.tanggalMulai, {
									showTime: false,
								})} s/d ${formatGMT8(data.PengajuanCuti.tanggalSelesai, {
									showTime: false,
								})}`}
							</DetailRow>
						</dl>
					</div>
				</BackgroundItem>

				{/* 2. DETAIL PENERIMA TUGAS (Struktur tabel diganti) */}
				<BackgroundItem
					title="Penerima Pelimpahan Tugas"
					icon={<FaUserCheck />}>
					<div className="p-4 sm:px-6">
						<dl>
							<DetailRow label="Nama / NIP">
								{`${data.penerima.nama} / ${data.penerima.nip}`}
							</DetailRow>
							<DetailRow label="Pangkat / Gol / Jabatan">
								{`${data.penerima.pangkat} / ${data.penerima.golongan} / ${data.penerima.jabatanFungsional}`}
							</DetailRow>
							<DetailRow label="Satuan Kerja">
								{data.penerima.satuanKerja}
							</DetailRow>
						</dl>
					</div>
				</BackgroundItem>

				{/* 3. TOMBOL AKSI (Layout dipertahankan sesuai permintaan) */}
				{bisaKonfirmasi && (
					<div className="flex flex-col sm:flex-row justify-between gap-5 md:gap-20">
						<button
							onClick={() => handleKonfirmasi("Ditolak")}
							className="w-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition cursor-pointer">
							<FaTimesCircle /> Tolak
						</button>
						<button
							onClick={() => handleKonfirmasi("Disetujui")}
							className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition cursor-pointer">
							<FaCheckCircle /> Terima
						</button>
					</div>
				)}
			</div>
		</MainLayout>
	);
};

export default DetailPelimapahan;
