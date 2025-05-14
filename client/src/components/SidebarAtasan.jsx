import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaHistory, FaFileAlt, FaClipboardCheck } from "react-icons/fa";
import { AiFillFileAdd } from "react-icons/ai";

const SidebarAtasan = () => {
	return (
		<div className="h-full w-1/6 bg-[#12333A] text-white flex flex-col space-y-2 p-3">
			<Link
				to="/dashboard"
				className="flex items-center space-x-3 hover:bg-gray-700 p-2 rounded">
				<FaHome className="text-2xl" />
				<span>Dashboard</span>
			</Link>
			<Link
				to="/pengajuan-cuti"
				className="flex items-center space-x-3 hover:bg-gray-700 p-2 rounded">
				<AiFillFileAdd className="text-xl" />
				<span>Pengajuan Cuti</span>
			</Link>
			<Link
				to="/riwayat-cuti"
				className="flex items-center space-x-3 hover:bg-gray-700 p-2 rounded">
				<FaHistory className="text-xl" />
				<span>Riwayat Pengajuan Cuti</span>
			</Link>
			<Link
				to="/draft-cuti"
				className="flex items-center space-x-3 hover:bg-gray-700 p-2 rounded">
				<FaFileAlt className="text-xl" />
				<span>Draft Pengajuan Cuti</span>
			</Link>
			<hr className="border-2 border-gray-300 w-5/6 mx-auto" />
			<Link
				to="/permohonan-cuti"
				className="flex items-center space-x-3 hover:bg-gray-700 p-2 rounded">
				<FaClipboardCheck className="text-xl" />
				<span>Permohonan Cuti</span>
			</Link>
		</div>
	);
};

export default SidebarAtasan;
