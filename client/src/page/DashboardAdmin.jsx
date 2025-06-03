import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import MainLayout from "../Layouts/MainLayout";
import SummaryCards from "../components/SummaryCards";
import BackgroundItem from "../components/BackgroundItem";
import TabelPermohonan from "../components/TabelPermohonan";
import NationalHolidays from "../components/NationalHolidays";
import { FaTimesCircle, FaSpinner, FaCheckCircle } from "react-icons/fa";

const DashboardAdmin = () => {
	const [semuaData, setSemuaData] = useState([]);
	const dataDiproses = semuaData
		.filter((item) => item.status === "Diproses")
		.sort((a, b) => new Date(b.tanggalPengajuan) - new Date(a.tanggalPengajuan))
		.slice(0, 5);
	const dataSelesai = semuaData
		.filter((item) => item.status === "Disetujui" || item.status === "Ditolak")
		.sort((a, b) => new Date(b.tanggalPengajuan) - new Date(a.tanggalPengajuan))
		.slice(0, 5);
	const dataDibatalkan = semuaData
		.filter((item) => item.status === "Dibatalkan")
		.sort((a, b) => new Date(b.tanggalPengajuan) - new Date(a.tanggalPengajuan))
		.slice(0, 5);

	const dataPermohonanPegawai = [
		{
			label: "Diproses",
			count: dataDiproses.length,
			unit: "Permohonan",
			icon: <FaSpinner />,
			bgColor: "bg-blue-600",
		},
		{
			label: "Telah Selesai",
			count: dataSelesai.length,
			unit: "Permohonan",
			icon: <FaCheckCircle />,
			bgColor: "bg-green-600",
		},
		{
			label: "Dibatalkan",
			count: dataDibatalkan.length,
			unit: "Permohonan",
			icon: <FaTimesCircle />,
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
			<div className="flex flex-col lg:flex-row flex-grow overflow-x-hidden">
				<div className="lg:flex-grow bg-gray-100 p-4 sm:p-6 w-full lg:w-auto space-y-5">
					<h1 className="text-2xl font-bold mb-2">Dashboard</h1>

					<SummaryCards
						title="Rekap Permohonan Cuti Pegawai"
						data={dataPermohonanPegawai}
					/>

					<BackgroundItem title="Permohonan Cuti Yang Sedang Diproses">
						<TabelPermohonan
							showPagination={false}
							isDashboard={true}
							data={dataDiproses}
						/>
					</BackgroundItem>

					<BackgroundItem title="Permohonan Cuti Yang Telah Selesai">
						<TabelPermohonan
							showPagination={false}
							isDashboard={true}
							data={dataSelesai}
						/>
					</BackgroundItem>

					<BackgroundItem title="Permohonan Cuti Yang Dibatalkan">
						<TabelPermohonan
							showPagination={false}
							isDashboard={true}
							data={dataDibatalkan}
						/>
					</BackgroundItem>
				</div>
				<NationalHolidays />
			</div>
		</MainLayout>
	);
};

export default DashboardAdmin;
