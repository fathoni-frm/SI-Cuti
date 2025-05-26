import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import MainLayout from "../Layouts/MainLayout";
import NationalHolidays from "../components/NationalHolidays";
import SummaryCards from "../components/SummaryCards";
import BackgroundItem from "../components/BackgroundItem";
import TabelPermohonan from "../components/TabelPermohonan";
import { FaTimesCircle, FaSpinner, FaCheckCircle } from "react-icons/fa";

const DashboardAdmin = () => {
	const [semuaData, setSemuaData] = useState([]);
	const dataDiproses = semuaData.filter(item => item.status === "Diproses");
	const dataSelesai = semuaData.filter(item => item.status === "Disetujui" || item.status === "Ditolak");
	const dataDibatalkan = semuaData.filter(item => item.status === "Dibatalkan");

	const dataPermohonanPegawai = [
		{
			label: "Diproses",
			count: dataDiproses.length,
			unit: "Permohonan",
			icon: <FaSpinner className="text-5xl text-white" />,
			bgColor: "bg-blue-600",
		},
		{
			label: "Telah Selesai",
			count: dataSelesai.length,
			unit: "Permohonan",
			icon: <FaCheckCircle className="text-5xl text-white" />,
			bgColor: "bg-green-600",
		},
		{
			label: "Dibatalkan",
			count: dataDibatalkan.length,
			unit: "Permohonan",
			icon: <FaTimesCircle className="text-5xl text-white" />,
			bgColor: "bg-red-600",
		},
	];

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axios.get("/permohonan-cuti");
				setSemuaData(res.data);
			} catch (err) {
				console.error("Gagal ambil data permohonan:", err);
			}
		};
	
		fetchData();
	}, []);
	
	return (
		<MainLayout role="Admin">
			<div className="flex flex-grow min-h-0 h-full">
				<div className="flex-grow bg-gray-100 p-6 w-5/6 space-y-5">
					<h1 className="text-2xl font-bold">Dashboard</h1>
					{/* Card Rekap */}
					<SummaryCards
						title="Rekap Permohonan Cuti Pegawai"
						data={dataPermohonanPegawai}
					/>

					<BackgroundItem
						title="Permohonan Cuti Yang Sedang Diproses"
						marginX={false}
						marginY={false}>
						<TabelPermohonan showPagination={false} isDashboard={true} data={dataDiproses} />
					</BackgroundItem>

					<BackgroundItem
						title="Permohonan Cuti Yang Telah Selesai"
						marginX={false}
						marginY={false}>
						<TabelPermohonan showPagination={false} isDashboard={true} data={dataSelesai} />
					</BackgroundItem>

					<BackgroundItem
						title="Permohonan Cuti Yang Dibatalkan"
						marginX={false}
						marginY={false}>
						<TabelPermohonan showPagination={false} isDashboard={true} data={dataDibatalkan} />
					</BackgroundItem>
				</div>
				{/* Hari Libur */}
				<NationalHolidays />
			</div>
		</MainLayout>
	);
};

export default DashboardAdmin;
