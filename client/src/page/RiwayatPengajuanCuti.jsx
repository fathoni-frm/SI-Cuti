import React, { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import axios from "../api/axios";
import MainLayout from "../Layouts/MainLayout";
import TabelRiwayat from "../components/TabelRiwayat";
import BackgroundItem from "../components/BackgroundItem";
import Spinner from "../components/Spinner";

const RiwayatPengajuanCuti = () => {
	const { user, isLoading } = useAuthStore();
	const [data, setData] = useState([]);

	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
	const totalPages = Math.ceil(data.length / itemsPerPage);

	useEffect(() => {
		const fetchRiwayat = async () => {
			try {
				const res = await axios.get(
					`/pengajuan-cuti/riwayat/${user.idPegawai}`
				);
				setData(res.data);
			} catch (err) {
				console.error(err);
			}
		};
		fetchRiwayat();
	}, []);

	if (isLoading) return <Spinner />;

	return (
		<MainLayout role={user.role}>
			<div className="p-6 w-full">
				<div className="flex justify-between">
					<h1 className="text-2xl font-bold mb-4">Riwayat Pengajuan Cuti</h1>
				</div>
				<BackgroundItem>
					<h2 className="text-2xl font-bold mb-4 text-center">
						Riwayat Pengajuan Cuti Anda
					</h2>
					<TabelRiwayat
						data={currentItems}
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={setCurrentPage}
					/>
				</BackgroundItem>
			</div>
		</MainLayout>
	);
};

export default RiwayatPengajuanCuti;
