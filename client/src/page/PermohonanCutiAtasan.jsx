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
	const [showDisetujui, setShowDisetujui] = useState(true);
	const [showTidakDisetujui, setShowTidakDisetujui] = useState(true);
	const [permohonanCuti, setPermohonanCuti] = useState([]);
	const [disetujui, setDisetujui] = useState([]);
	const [ditolak, setDitolak] = useState([]);

	const itemsPerPage = 10;
	const [currentPageBelum, setCurrentPageBelum] = useState(1);
	const [currentPageDisetujui, setCurrentPageDisetujui] = useState(1);
	const [currentPageDitolak, setCurrentPageDitolak] = useState(1);

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
				
				const hasilPermohonanCuti = normalisasi(res.data.permohonanCuti);
				const hasilDisetujui = normalisasi(res.data.disetujui);
				const hasilditolak = normalisasi(res.data.ditolak);

				setPermohonanCuti(hasilPermohonanCuti.sort((a, b) => new Date(b.tanggalPengajuan) - new Date(a.tanggalPengajuan)));
				setDisetujui(hasilDisetujui.sort((a, b) => new Date(b.tanggalPengajuan) - new Date(a.tanggalPengajuan)));
				setDitolak(hasilditolak.sort((a, b) => new Date(b.tanggalPengajuan) - new Date(a.tanggalPengajuan)));
			} catch (err) {
				console.error("Gagal mengambil data permohonan:", err);
			}
		};

		fetchData();
	}, []);

	if (isLoading) return <Spinner />;

	const paginate = (data, currentPage) => {
		const start = (currentPage - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		return data.slice(start, end);
	};

	const totalPagesBelum = Math.ceil(permohonanCuti.length / itemsPerPage);
	const totalPagesDisetujui = Math.ceil(disetujui.length / itemsPerPage);
	const totalPagesDitolak = Math.ceil(ditolak.length / itemsPerPage);

	return (
		<MainLayout role={user.role}>
			<div className="p-6 w-full">
				<h1 className="text-2xl font-bold mb-6">Permohonan Cuti</h1>

				{/* Belum Diproses */}
				<div className="bg-white rounded-md drop-shadow-sm shadow-inner p-4 mb-6">
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
							data={paginate(permohonanCuti, currentPageBelum)}
							showQuota={true}
							lihat={true}
							currentPage={currentPageBelum}
							totalPages={totalPagesBelum}
							onPageChange={setCurrentPageBelum}
						/>
					)}
				</div>

				{/* Disetujui */}
				<div className="bg-white rounded-md drop-shadow-sm shadow-inner p-4 mb-6">
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
							data={paginate(disetujui, currentPageDisetujui)}
							showQuota={false}
							lihat={false}
							currentPage={currentPageDisetujui}
							totalPages={totalPagesDisetujui}
							onPageChange={setCurrentPageDisetujui}
						/>
					)}
				</div>

				{/* Tidak Disetujui */}
				<div className="bg-white rounded-md drop-shadow-sm shadow-inner p-4">
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
							data={paginate(ditolak, currentPageDitolak)}
							showQuota={false}
							lihat={false}
							currentPage={currentPageDitolak}
							totalPages={totalPagesDitolak}
							onPageChange={setCurrentPageDitolak}
						/>
					)}
				</div>
			</div>
		</MainLayout>
	);
};

export default PermohonanCutiAtasan;
