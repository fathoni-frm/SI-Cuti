import React from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import MainLayout from "../Layouts/MainLayout";
import {
	FaCalendarAlt,
	FaGlobe,
	FaBriefcaseMedical,
	FaExclamationCircle,
	FaDoorOpen,
	FaBaby,
} from "react-icons/fa";

const PengajuanCuti = () => {
	const { user } = useAuthStore();
	const navigate = useNavigate();

	const cutiOptions = [
		{
			title: "Cuti Tahunan",
			icon: <FaCalendarAlt className="text-3xl text-gray-700" />,
		},
		{
			title: "Cuti Besar",
			icon: <FaGlobe className="text-3xl text-gray-700" />,
		},
		{
			title: "Cuti Sakit",
			icon: <FaBriefcaseMedical className="text-3xl text-gray-700" />,
		},
		{
			title: "Cuti Alasan Penting",
			icon: <FaExclamationCircle className="text-3xl text-gray-700" />,
		},
		{
			title: "Cuti Di Luar Tanggungan Negara",
			icon: <FaDoorOpen className="text-3xl text-gray-700" />,
		},
		{
			title: "Cuti Melahirkan",
			icon: <FaBaby className="text-3xl text-gray-700" />,
		},
	];

	const handleClick = (jenisCuti) => {
		navigate("/pengajuan-cuti/form", { state: { jenisCuti } });
	};

	return (
		<MainLayout role={user.role}>
			<div className="p-6 w-full">
				<h1 className="text-2xl font-bold mb-6">Pengajuan Cuti</h1>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mr-10">
					{cutiOptions.map((cuti, index) => (
						<button
							key={index}
							onClick={() => handleClick(cuti.title)}
							className="flex items-center gap-3 px-4 py-5 bg-gray-100 hover:bg-gray-400 rounded-md border border-gray-300 text-left transition cursor-pointer">
							{cuti.icon}
							<span className="text-base font-semibold text-gray-800">
								{cuti.title}
							</span>
						</button>
					))}
				</div>
			</div>
		</MainLayout>
	);
};

export default PengajuanCuti;
