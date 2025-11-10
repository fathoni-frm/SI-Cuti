import React, { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import axios from "../api/axios";
import LayoutDashboard from "../Layouts/LayoutDashboard";
import SummaryCards from "../components/SummaryCards";
import BackgroundItem from "../components/BackgroundItem";
import TabelKuotaCuti from "../components/TabelKuotaCuti";
import TabelRiwayat from "../components/TabelRiwayat";
import Spinner from "../components/Spinner";
import { FaCheckCircle, FaSpinner, FaTimesCircle } from "react-icons/fa";

const DashboardPegawai = () => {
	const { user, isLoading } = useAuthStore();
	const [dataKuotaCuti, setDataKuotaCuti] = useState([]);
	const [dataRiwayatCuti, setDataRiwayatCuti] = useState([]);

	const dataPengajuanAnda = [
		{
			label: "Disetujui",
			count: dataRiwayatCuti.filter((item) => item.status === "Disetujui")
				.length,
			unit: "Pengajuan",
			icon: <FaCheckCircle />,
			bgColor: "bg-green-600",
		},
		{
			label: "Sedang Diproses",
			count: dataRiwayatCuti.filter((item) => item.status === "Diproses")
				.length,
			unit: "Pengajuan",
			icon: <FaSpinner />,
			bgColor: "bg-blue-600",
		},
		{
			label: "Tidak Disetujui / Dibatalkan",
			count: dataRiwayatCuti.filter(
				(item) => item.status === "Ditolak" || item.status === "Dibatalkan"
			).length,
			unit: "Pengajuan",
			icon: <FaTimesCircle />,
			bgColor: "bg-red-600",
		},
	];

	useEffect(() => {
		const fetchKuotaCuti = async () => {
			try {
				const kuotaRes = await axios.get(`/kuota-cuti/${user.idPegawai}`);
				setDataKuotaCuti(kuotaRes.data);
			} catch (err) {
				console.error("Gagal ambil kuota cuti:", err);
			}
		};

		const fetchRiwayat = async () => {
			try {
				const res = await axios.get(
					`/pengajuan-cuti/riwayat/${user.idPegawai}`
				);
				setDataRiwayatCuti(res.data);
			} catch (err) {
				console.error(err);
			}
		};

		fetchKuotaCuti();
		fetchRiwayat();
	}, []);

	if (isLoading) return <Spinner />;

	return (
		<LayoutDashboard role="Pegawai">
			<div className="flex-grow bg-gray-100 p-4 sm:p-6 w-full lg:w-auto space-y-5 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
				<h1 className="text-2xl font-bold">Dashboard</h1>
				{/* Rekap Pengajuan Cuti Anda */}
				<SummaryCards
					title="Rekap Pengajuan Cuti Anda"
					data={dataPengajuanAnda}
				/>

				{/* Kuota Cuti */}
				<div id="kuota-cuti">
					<BackgroundItem title="Sisa Kuota Cuti Anda">
						<TabelKuotaCuti data={dataKuotaCuti} />
					</BackgroundItem>
				</div>

				{/* Riwayat Pengajuan Cuti Anda */}
				<BackgroundItem title="Riwayat Pengajuan Cuti Anda">
					<TabelRiwayat
						data={dataRiwayatCuti
							.sort(
								(a, b) =>
									new Date(b.tanggalPengajuan) - new Date(a.tanggalPengajuan)
							)
							.slice(0, 5)}
						showPagination={false}
						isDashboard={true}
					/>
				</BackgroundItem>
			</div>
		</LayoutDashboard>
	);
};

export default DashboardPegawai;
