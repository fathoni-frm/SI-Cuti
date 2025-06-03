import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosPublic from "../api/axiosPublic";
import logo from "../assets/logo.png";
import Spinner from "../components/Spinner";

const ValidasiVerifikator = () => {
	const { id } = useParams();
	const [data, setData] = useState(null);
	const [status, setStatus] = useState("loading");

	const formatTanggal = (tanggal, waktu = true) => {
		const date = new Date(tanggal);
		return date.toLocaleDateString("id-ID", {
			day: "2-digit",
			month: "long",
			year: "numeric",
			...(waktu && {
				hour: "2-digit",
				minute: "2-digit",
			}),
		});
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axiosPublic.get(`/validasi/verifikator/${id}`);
				setData(res.data);
				setStatus("success");
			} catch (err) {
				setStatus("error");
			}
		};
		fetchData();
	}, [id]);

	if (status === "loading") return <Spinner />;
	if (status === "error") {
		return (
			<div className="max-w-xl mx-auto mt-20 bg-white border border-red-500 p-6 rounded-lg text-center shadow">
				<img src={logo} alt="Logo Instansi" className="mx-auto mb-4 w-20" />
				<h1 className="text-2xl font-bold text-red-600 mb-2">
					QR Code Tidak Valid ❌
				</h1>
				<p className="text-gray-700">
					QR code ini tidak dikenali atau belum diverifikasi secara resmi.
				</p>
			</div>
		);
	}

	return (
		<div className="max-w-3xl mx-auto md:my-10 bg-white border border-gray-300 p-8 rounded-lg shadow">
			{/* Header */}
			<div className="text-center mb-6">
				<img src={logo} alt="Logo Instansi" className="mx-auto mb-4 w-20" />
				<h1 className="text-3xl font-bold text-green-600">QR Code Valid ✅</h1>
				<p className="text-gray-700">
					QR code ini resmi dan telah diverifikasi oleh sistem.
				</p>
			</div>

			{/* Verifikator Info */}
			<div className="mb-8">
				<h2 className="text-lg font-semibold mb-3 border-b pb-1">
					Informasi Penandatangan
				</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-800">
					<p>
						<strong>Nama :</strong> {data.verifikator?.nama}
					</p>
					<p>
						<strong>NIP :</strong> {data.verifikator?.nip}
					</p>
					<p>
						<strong>Jabatan :</strong> {data.jenisVerifikator}
					</p>
					<p>
						<strong>Tanggal :</strong> {formatTanggal(data.tanggalVerifikasi)}
					</p>
				</div>
			</div>

			{/* Surat Info */}
			<div className="mb-6">
				<h2 className="text-lg font-semibold mb-3 border-b pb-1">
					Surat yang Ditandatangani
				</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-800">
					<p>
						<strong>Perihal :</strong> Pengajuan Cuti
					</p>
					<p>
						<strong>Nama Pegawai :</strong> {data.PengajuanCuti?.Pegawai?.nama}
					</p>
					<p>
						<strong>NIP Pegawai :</strong> {data.PengajuanCuti?.Pegawai?.nip}
					</p>
					<p>
						<strong>Jenis Cuti :</strong> {data.PengajuanCuti?.jenisCuti}
					</p>
				</div>
				<div className="my-4">
					<p>
						<strong>Tanggal Cuti:</strong>{" "}
						{formatTanggal(data.PengajuanCuti?.tanggalMulai, false)} s.d.{" "}
						{formatTanggal(data.PengajuanCuti?.tanggalSelesai, false)}
					</p>
				</div>
			</div>

			{/* Footer */}
			<div className="border-t pt-4 text-sm text-gray-600 text-center">
				QR code ini digunakan sebagai tanda tangan digital resmi untuk
				memvalidasi surat permohonan cuti pada Balai Besar Karantina Hewan, Ikan
				dan Tumbuhan Kalimantan Timur.
			</div>
		</div>
	);
};

export default ValidasiVerifikator;
