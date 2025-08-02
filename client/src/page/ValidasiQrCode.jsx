import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosPublic from "../api/axiosPublic";
import { formatGMT8 } from "../schemas/timeFormatter";
import logo from "../assets/logo.png";
import Spinner from "../components/Spinner";

const ValidasiQrCode = () => {
	const { doc, id, role, sig } = useParams();
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
				const res = await axiosPublic.get(`/v/${doc}/${id}/${role}/${sig}`);
				setData(res.data);
				setStatus("success");
			} catch (err) {
				setStatus("error");
			}
		};
		fetchData();
	}, [doc, id, role, sig]);

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
	console.log(data);
	return (
		<div className="max-w-3xl mx-auto md:my-10 bg-white border border-gray-300 p-8 rounded-lg shadow-lg">
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
						<strong>Nama :</strong> {data.penandatangan?.nama}
					</p>
					<p>
						<strong>NIP :</strong> {data.penandatangan?.nip}
					</p>
					<p>
						<strong>Jabatan :</strong> {data.penandatangan.jabatan}
					</p>
					<p>
						<strong>Tanggal :</strong> {formatGMT8(data.penandatangan.tanggal)}
					</p>
				</div>
			</div>

			{/* Surat Info */}
			<div className="mb-6">
				<h2 className="text-lg font-semibold mb-3 border-b pb-1">
					Dokumen yang Ditandatangani
				</h2>
				<p>
					<strong>Perihal :</strong> {data.surat?.perihal}
				</p>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-800 mt-4">
					<p>
						<strong>Pemilik Dokumen :</strong> {data.surat?.nama}
					</p>
					<p>
						<strong>NIP :</strong> {data.surat?.nip}
					</p>
				</div>
			</div>

			{/* Footer */}
			<div className="border-t pt-4 text-sm text-gray-600 text-center">
				QR code ini digunakan sebagai tanda tangan digital resmi untuk
				memvalidasi dokumen di Balai Besar Karantina Hewan, Ikan
				dan Tumbuhan Kalimantan Timur.
			</div>
		</div>
	);
};

export default ValidasiQrCode;
