import React from "react";
import useAuthStore from "../store/authStore";
import MainLayout from "../Layouts/MainLayout";
import TabelRiwayat from "../components/TabelRiwayat";
import BackgroundItem from "../components/BackgroundItem";

const RiwayatPengajuanCuti = () => {
	const { user } = useAuthStore();
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
					<TabelRiwayat />
				</BackgroundItem>
			</div>
		</MainLayout>
	);
};

export default RiwayatPengajuanCuti;
