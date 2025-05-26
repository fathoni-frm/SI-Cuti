import React, { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import axios from "../api/axios";
import MainLayout from "../Layouts/MainLayout";
import TabelPermohonan from "../components/TabelPermohonan";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Spinner from "../components/Spinner";

const PermohonanCutiAtasan = () => {
	const { user, isLoading } = useAuthStore();
	const [showBelumDiproses, setShowBelumDiproses] = useState(true);
	const [showDisetujui, setShowDisetujui] = useState(false);
	const [showTidakDisetujui, setShowTidakDisetujui] = useState(false);
	const [permohonanCuti, setPermohonanCuti] = useState([]);
	const [disetujui, setDisetujui] = useState([]);
	const [ditolak, setDitolak] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axios.get("/permohonan-cuti");

				const normalisasi = (array) =>
					array.map((item) => ({
						idVerifikasi: item.id,
						idPengajuan: item.idPengajuan,
						tanggalPengajuan: item.PengajuanCuti.tanggalPengajuan,
						jenisCuti: item.PengajuanCuti.jenisCuti,
						tanggalMulai: item.PengajuanCuti.tanggalMulai,
						tanggalSelesai: item.PengajuanCuti.tanggalSelesai,
						totalKuota: item.PengajuanCuti.totalKuota,
						sisaKuota: item.PengajuanCuti.sisaKuota,
						status: item.PengajuanCuti.status,
						statusVerifikasi: item.statusVerifikasi,
						Pegawai: { nama: item.PengajuanCuti.Pegawai.nama },
					}));

				setPermohonanCuti(normalisasi(res.data.permohonanCuti));
				setDisetujui(normalisasi(res.data.disetujui));
				setDitolak(normalisasi(res.data.ditolak));
			} catch (err) {
				console.error("Gagal mengambil data permohonan:", err);
			}
		};

		fetchData();
	}, []);

	if (isLoading) return <Spinner />;

	return (
		<MainLayout role={user.role}>
			<div className="p-6 w-full">
				<h1 className="text-2xl font-bold mb-6">Permohonan Cuti</h1>

				{/* Belum Diproses */}
				<div className="bg-white rounded-md shadow-sm p-4 mb-6">
					<div
						className="flex justify-between items-center mb-2 cursor-pointer"
						onClick={() => setShowBelumDiproses(!showBelumDiproses)}>
						<h2 className="text-lg font-semibold">Belum Anda Proses</h2>
						{showBelumDiproses ? (
							<FaChevronUp className="text-gray-500" />
						) : (
							<FaChevronDown className="text-gray-500" />
						)}
					</div>
					{showBelumDiproses && (
						<TabelPermohonan
							data={permohonanCuti}
							showQuota={true}
							showPagination={false}
							lihat={true}
						/>
					)}
				</div>

				{/* Disetujui */}
				<div className="bg-white rounded-md shadow-sm p-4 mb-6">
					<div
						className="flex justify-between items-center mb-2 cursor-pointer"
						onClick={() => setShowDisetujui(!showDisetujui)}>
						<h2 className="text-lg font-semibold">Disetujui Anda</h2>
						{showDisetujui ? (
							<FaChevronUp className="text-gray-500" />
						) : (
							<FaChevronDown className="text-gray-500" />
						)}
					</div>
					{showDisetujui && (
						<TabelPermohonan
							data={disetujui}
							showQuota={false}
							showPagination={false}
							lihat={false}
						/>
					)}
				</div>

				{/* Tidak Disetujui */}
				<div className="bg-white rounded-md shadow-sm p-4">
					<div
						className="flex justify-between items-center mb-2 cursor-pointer"
						onClick={() => setShowTidakDisetujui(!showTidakDisetujui)}>
						<h2 className="text-lg font-semibold">Tidak Disetujui Anda</h2>
						{showTidakDisetujui ? (
							<FaChevronUp className="text-gray-500" />
						) : (
							<FaChevronDown className="text-gray-500" />
						)}
					</div>
					{showTidakDisetujui && (
						<TabelPermohonan
							data={ditolak}
							showQuota={false}
							showPagination={false}
							lihat={false}
						/>
					)}
				</div>
			</div>
		</MainLayout>
	);
};

export default PermohonanCutiAtasan;
