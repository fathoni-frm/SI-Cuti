import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
	FaHome,
	FaClipboardCheck,
	FaUsersCog,
	FaCalendarPlus,
} from "react-icons/fa";

const SidebarAdmin = () => {
	const location = useLocation();

	const isActive = (path) =>
		location.pathname.startsWith(path)
			? "bg-gray-700 text-white"
			: "text-gray-300 hover:bg-gray-700";

	return (
		<div className="h-full w-64 bg-[#133138] text-white flex flex-col space-y-2 p-3">
			<Link
				to="/dashboard"
				className={`flex items-center space-x-3 p-2 rounded ${isActive(
					"/dashboard"
				)}`}>
				<FaHome className="text-2xl" />
				<span>Dashboard</span>
			</Link>
			<Link
				to="/permohonan-cuti"
				className={`flex items-center space-x-3 p-2 rounded ${isActive(
					"/permohonan-cuti"
				)}`}>
				<FaClipboardCheck className="text-xl" />
				<span>Permohonan Cuti</span>
			</Link>
			<Link
				to="/manajemen-cuti"
				className={`flex items-center space-x-3 p-2 rounded ${isActive("/manajemen-cuti")}`}>
				<FaCalendarPlus className="text-xl" />
				<span>Manajemen Cuti Pegawai</span>
			</Link>
			<hr className="border-2 border-gray-300 w-5/6 mx-auto" />
			<Link
				to="/manajemen-pegawai"
				className={`flex items-center space-x-3 p-2 rounded ${isActive("/manajemen-pegawai")}`}>
				<FaUsersCog className="text-xl" />
				<span>Manajemen Pegawai</span>
			</Link>
		</div>
	);
};

export default SidebarAdmin;
