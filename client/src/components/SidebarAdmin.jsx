import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
	FaHome,
	FaClipboardCheck,
	FaUsersCog,
	FaCalendarPlus,
} from "react-icons/fa";

const SidebarAdmin = ({ isSidebarOpen, toggleSidebar }) => {
	const location = useLocation();

	const isActive = (path) =>
		location.pathname.startsWith(path)
			? "bg-gray-700 text-white"
			: "text-gray-300 hover:bg-gray-700";

	const baseClasses = `
	  bg-[#133138] text-white flex flex-col p-2
	  overflow-y-auto overflow-x-hidden 
	  transition-all duration-300 ease-in-out`;

	const mobileTabletClasses = `
	  fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] 
	  w-55 /* Lebar sidebar overlay mobile */
	  ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`;

	const desktopBaseClasses = `
	  lg:static lg:top-auto lg:left-auto lg:h-auto lg:z-auto 
	  lg:translate-x-0`;

	const desktopToggledClasses = isSidebarOpen
		? `lg:w-60 xl:w-64`
		: `lg:w-0 lg:p-0 lg:opacity-0 lg:invisible`;

	const sidebarClasses = `
	  ${baseClasses} 
	  ${mobileTabletClasses} 
	  ${desktopBaseClasses} 
	  ${desktopToggledClasses}`;

	const handleMobileLinkClick = () => {
		if (
			typeof window !== "undefined" &&
			window.innerWidth < 1024 &&
			isSidebarOpen
		) {
			toggleSidebar();
		}
	};

	const linkTextClass = `${
		isSidebarOpen ? "opacity-100" : "opacity-0 lg:opacity-0 lg:invisible"
	} transition-opacity duration-100 delay-100`;

	return (
		<aside className={sidebarClasses} aria-label="Sidebar Admin">
			<div
				className={`${
					isSidebarOpen ? "opacity-100" : "opacity-0 lg:opacity-100"
				} w-full h-full transition-opacity duration-150 delay-100 space-y-1`}>
				<Link
					to="/dashboard"
					onClick={handleMobileLinkClick}
					className={`flex items-center space-x-3 p-2.5 rounded-md ${isActive(
						"/dashboard"
					)}`}>
					<FaHome className="text-2xl flex-shrink-0" />
					<span className={linkTextClass}>Dashboard</span>
				</Link>
				<Link
					to="/permohonan-cuti"
					onClick={handleMobileLinkClick}
					className={`flex items-center space-x-3 p-2.5 rounded-md ${isActive(
						"/permohonan-cuti"
					)}`}>
					<FaClipboardCheck className="text-xl flex-shrink-0" />
					<span className={linkTextClass}>Permohonan Cuti</span>
				</Link>
				<Link
					to="/manajemen-cuti"
					onClick={handleMobileLinkClick}
					className={`flex items-center space-x-3 p-2.5 rounded-md ${isActive(
						"/manajemen-cuti"
					)}`}>
					<FaCalendarPlus className="text-xl flex-shrink-0" />
					<span className={linkTextClass}>Manajemen Cuti</span>
				</Link>

				<hr
					className={`border-1 border-gray-600 w-5/6 mx-auto my-2 transition-opacity duration-150 ${
						isSidebarOpen ? "opacity-100" : "opacity-0"
					}`}
				/>

				<Link
					to="/manajemen-pegawai"
					onClick={handleMobileLinkClick}
					className={`flex items-center space-x-3 p-2.5 rounded-md ${isActive(
						"/manajemen-pegawai"
					)}`}>
					<FaUsersCog className="text-xl flex-shrink-0" />
					<span className={linkTextClass}>Manajemen Pegawai</span>
				</Link>
			</div>
		</aside>
	);
};

export default SidebarAdmin;
