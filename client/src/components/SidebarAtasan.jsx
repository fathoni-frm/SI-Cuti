import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaHistory, FaFileAlt, FaClipboardCheck } from "react-icons/fa";
import { AiFillFileAdd } from "react-icons/ai";

const SidebarAtasan = () => {
	const location = useLocation();

	const isActive = (path) =>
		location.pathname.startsWith(path)
			? "bg-gray-700 text-white"
			: "text-gray-300 hover:bg-gray-700";

	return (
		<div className="h-full w-1/6 bg-[#12333A] text-white flex flex-col space-y-2 p-3">
			<Link
				to="/dashboard"
				className={`flex items-center space-x-3 p-2 rounded ${isActive(
					"/dashboard"
				)}`}>
				<FaHome className="text-2xl" />
				<span>Dashboard</span>
			</Link>
			<Link
				to="/pengajuan-cuti"
				className={`flex items-center space-x-3 p-2 rounded ${isActive(
					"/pengajuan-cuti"
				)}`}>
				<AiFillFileAdd className="text-xl" />
				<span>Pengajuan Cuti</span>
			</Link>
			<Link
				to="/riwayat-cuti"
				className={`flex items-center space-x-3 p-2 rounded ${isActive(
					"/riwayat-cuti"
				)}`}>
				<FaHistory className="text-xl" />
				<span>Riwayat Pengajuan Cuti</span>
			</Link>
			<Link
				to="/draft-cuti"
				className={`flex items-center space-x-3 p-2 rounded ${isActive(
					"/draft-cuti"
				)}`}>
				<FaFileAlt className="text-xl" />
				<span>Draft Pengajuan Cuti</span>
			</Link>
			<hr className="border-2 border-gray-300 w-5/6 mx-auto" />
			<Link
				to="/permohonan-cuti"
				className={`flex items-center space-x-3 p-2 rounded ${isActive(
					"/permohonan-cuti"
				)}`}>
				<FaClipboardCheck className="text-xl" />
				<span>Permohonan Cuti</span>
			</Link>
		</div>
	);
};

export default SidebarAtasan;
