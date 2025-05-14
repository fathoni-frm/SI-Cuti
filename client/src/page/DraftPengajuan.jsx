import React from "react";
import useAuthStore from "../store/authStore";
import MainLayout from "../Layouts/MainLayout";
import TabelDraftPengajuan from "../components/TabelDraftPengajuan";
import BackgroundItem from "../components/BackgroundItem";

const DraftPengajuan = () => {
	const { user } = useAuthStore();
	return (
		<MainLayout role={user.role}>
			<div className="p-6 w-full">
				<div className="flex justify-between">
					<h1 className="text-2xl font-bold mb-4">Draft Pengajuan Cuti</h1>
				</div>
				<BackgroundItem>
					<h2 className="text-2xl font-bold mb-4 text-center">
						Draft Pengajuan Cuti Anda
					</h2>
					<TabelDraftPengajuan />
				</BackgroundItem>
			</div>
		</MainLayout>
	);
};

export default DraftPengajuan;
