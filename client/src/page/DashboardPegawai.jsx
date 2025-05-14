import React, { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import axios from "../api/axios";
import MainLayout from "../Layouts/MainLayout";
import SummaryCards from "../components/SummaryCards";
import BackgroundItem from "../components/BackgroundItem";
import TabelKuotaCuti from "../components/TabelKuotaCuti";
import TabelRiwayat from "../components/TabelRiwayat";
import NationalHolidays from "../components/NationalHolidays";
import { FaCheckCircle, FaSpinner, FaTimesCircle } from "react-icons/fa";

const DashboardPegawai = () => {
	const { user, accessToken } = useAuthStore();
	const [dataKuotaCuti, setDataKuotaCuti] = useState([]);

	const dataPengajuanAnda = [
		{
			label: "Disetujui",
			count: 17,
			unit: "Pengajuan",
			icon: <FaCheckCircle className="text-5xl text-white" />,
			bgColor: "bg-green-600",
		},
		{
			label: "Sedang Diproses",
			count: 40,
			unit: "Pengajuan",
			icon: <FaSpinner className="text-5xl text-white" />,
			bgColor: "bg-blue-600",
		},
		{
			label: "Tidak Disetujui",
			count: 9,
			unit: "Pengajuan",
			icon: <FaTimesCircle className="text-5xl text-white" />,
			bgColor: "bg-red-600",
		},
	];

	useEffect(() => {
		const kuotaCuti = async () => {
			const kuotaRes = await axios.get(`/kuota-cuti/${user.idPegawai}`, {
				headers: { Authorization: `Bearer ${accessToken}` },
			});
			setDataKuotaCuti(kuotaRes.data);
		};
		kuotaCuti();
	}, []);

	return (
		<MainLayout role="Pegawai">
			<div className="flex flex-grow min-h-0 h-full">
				<div className="flex-grow bg-gray-100 p-6 w-5/6 space-y-5">
					<h1 className="text-2xl font-bold">Dashboard</h1>
					{/* Rekap Pengajuan Cuti Anda */}
					<SummaryCards
						title="Rekap Pengajuan Cuti Anda"
						data={dataPengajuanAnda}
					/>

					{/* Kuota Cuti */}
					<BackgroundItem title="Sisa Kuota Cuti Anda" marginX={false} marginY={false}>
						<TabelKuotaCuti data={dataKuotaCuti} />
					</BackgroundItem>

					{/* Riwayat Pengajuan Cuti Anda */}
					<BackgroundItem title="Riwayat Pengajuan Cuti Anda" marginX={false} marginY={false}>
						<TabelRiwayat showPagination={false} isDashboard={true} />
					</BackgroundItem>
				</div>

				{/* Hari Libur */}
				<NationalHolidays />
			</div>
		</MainLayout>
	);
};

export default DashboardPegawai;
