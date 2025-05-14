import React from "react";
import MainLayout from "../Layouts/MainLayout";
import NationalHolidays from "../components/NationalHolidays";
import SummaryCards from "../components/SummaryCards";
import TableDashboard from "../components/TabelDashboard";
import { FaTimesCircle, FaSpinner, FaCheckCircle } from "react-icons/fa";

const DashboardAdmin = () => {
	const dataPermohonanPegawai = [
		{
			label: "Diproses",
			count: 17,
			unit: "Permohonan",
			icon: <FaSpinner className="text-5xl text-white" />,
			bgColor: "bg-blue-600",
		},
		{
			label: "Telah Selesai",
			count: 17,
			unit: "Permohonan",
			icon: <FaCheckCircle className="text-5xl text-white" />,
			bgColor: "bg-green-600", 
		},
		{
			label: "Dibatalkan",
			count: 9,
			unit: "Permohonan",
			icon: <FaTimesCircle className="text-5xl text-white" />,
			bgColor: "bg-red-600", 
		},
	];

	const statuses = ["Diproses", "Telah Selesai", "Dibatalkan"];

	return (
		<MainLayout role="Admin">
			<div className="flex flex-grow min-h-0 h-full">
				<div className="flex-grow bg-gray-100 p-6 w-5/6">
					<h1 className="text-2xl font-bold">Dashboard</h1>
					{/* Card Rekap */}
					<SummaryCards
						title="Rekap Permohonan Cuti Pegawai"
						data={dataPermohonanPegawai}
					/>
					{/* Tabel */}
					{statuses.map((status, index) => (
						<TableDashboard key={index} status={status} index={index} />
					))}
				</div>
				{/* Hari Libur */}
				<NationalHolidays />
			</div>
		</MainLayout>
	);
};

export default DashboardAdmin;
