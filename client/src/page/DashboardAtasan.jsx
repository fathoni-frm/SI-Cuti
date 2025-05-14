import React, { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import axios from "../api/axios";
import MainLayout from "../Layouts/MainLayout";
import SummaryCards from "../components/SummaryCards";
import BackgroundItem from "../components/BackgroundItem";
import TabelKuotaCuti from "../components/TabelKuotaCuti";
import TabelPermohonan from "../components/TabelPermohonan";
import TabelRiwayat from "../components/TabelRiwayat";
import NationalHolidays from "../components/NationalHolidays";
import {
	FaCheckCircle,
	FaClock,
	FaTimesCircle,
	FaSpinner,
} from "react-icons/fa";

const DashboardAtasan = () => {
	const { user, accessToken } = useAuthStore();
	const [dataKuotaCuti, setDataKuotaCuti] = useState([]);

	const dataPermohonanPegawai = [
		{
			label: "Belum Anda Proses",
			count: 9,
			unit: "Permohonan",
			icon: <FaClock className="text-5xl text-white" />,
			bgColor: "bg-amber-500",
		},
		{
			label: "Anda Setujui",
			count: 17,
			unit: "Permohonan",
			icon: <FaCheckCircle className="text-5xl text-white" />,
			bgColor: "bg-green-600",
		},
		{
			label: "Anda Tolak",
			count: 17,
			unit: "Permohonan",
			icon: <FaTimesCircle className="text-5xl text-white" />,
			bgColor: "bg-red-600",
		},
	];

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
		<MainLayout role="Atasan">
			<div className="flex flex-grow min-h-0 h-full">
				<div className="flex-grow h-full bg-gray-100 p-6 w-5/6 overflow-auto space-y-5">
					<h1 className="text-2xl font-bold">Dashboard</h1>

					{/* Rekap Permohonan Cuti Pegawai */}
					<SummaryCards
						title="Rekap Permohonan Cuti Pegawai"
						data={dataPermohonanPegawai}
					/>

					{/* Permohonan Cuti Belum Diproses */}
					<BackgroundItem
						title="Permohonan Cuti Yang Belum Anda Proses"
						marginX={false}
						marginY={false}>
						<TabelPermohonan
							tipe="permohonanCuti"
							isDashboard={true}
							showQuota={false}
							showPagination={false}
							lihat={true}
						/>
					</BackgroundItem>

					<hr className="border-2 border-gray-900 w-full my-5" />

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

export default DashboardAtasan;
