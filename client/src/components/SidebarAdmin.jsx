import React from "react";
import { Link } from "react-router-dom";
import {
	FaHome,
	FaClipboardCheck,
	FaUsersCog,
	FaCalendarPlus 
} from "react-icons/fa";

const SidebarAdmin = () => {
	return (
		<div className="h-full w-64 bg-[#133138] text-white flex flex-col space-y-2 p-3">
			<Link
				to="/dashboard"
				className="flex items-center space-x-3 hover:bg-gray-700 p-2 rounded">
				<FaHome className="text-2xl" />
				<span>Dashboard</span>
			</Link>
			<Link
				to="/permohonan-cuti"
				className="flex items-center space-x-3 hover:bg-gray-700 p-2 rounded">
				<FaClipboardCheck className="text-xl" />
				<span>Permohonan Cuti</span>
			</Link>
			<Link
				to="/manajemen-cuti"
				className="flex items-center space-x-3 hover:bg-gray-700 p-2 rounded">
				<FaCalendarPlus  className="text-xl" />
				<span>Manajemen Cuti Pegawai</span>
			</Link>
			<hr className="border-2 border-gray-300 w-5/6 mx-auto" />
			<Link
				to="/manajemen-pegawai"
				className="flex items-center space-x-3 hover:bg-gray-700 p-2 rounded">
				<FaUsersCog className="text-xl" />
				<span>Manajemen Pegawai</span>
			</Link>
		</div>
	);
};

export default SidebarAdmin;
