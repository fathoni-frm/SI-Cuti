import React from "react";
import useAuthStore from "../store/authStore";
import MainLayout from "../Layouts/MainLayout";
import TabelDraftPengajuan from "../components/TabelDraftPengajuan";
import BackgroundItem from "../components/BackgroundItem";

const DraftPengajuan = () => {
	const { user } = useAuthStore();
	return (
		<MainLayout role={user.role}>
			<div className="p-4 sm:p-6 w-full">
				<div className="flex justify-between mb-6">
					<h1 className="text-center sm:text-left text-xl lg:text-2xl font-bold text-gray-800">
						Draft Pengajuan Cuti
					</h1>
				</div>
				<BackgroundItem>
					<div className="p-4 sm:p-6">
						<h2 className="text-xl sm:text-2xl font-bold mb-5 text-center">
							Draft Pengajuan Cuti Anda
						</h2>
						<TabelDraftPengajuan />
					</div>
				</BackgroundItem>
			</div>
		</MainLayout>
	);
};

export default DraftPengajuan;
