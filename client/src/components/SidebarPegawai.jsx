import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaHistory, FaFileAlt, FaPeopleArrows } from "react-icons/fa";
import { AiFillFileAdd } from "react-icons/ai";

const SidebarPegawai = ({ isSidebarOpen, toggleSidebar }) => {
	const location = useLocation();

	const isActive = (path) =>
		location.pathname.startsWith(path)
			? "bg-gray-700 text-white"
			: "text-gray-300 hover:bg-gray-700";

	// Kelas dasar untuk semua kondisi
	const baseClasses = `
        bg-[#12333A] text-white flex flex-col p-2
        overflow-y-auto overflow-x-hidden 
        transition-all duration-300 ease-in-out`;

	// Kelas untuk perilaku mobile/tablet (selalu fixed overlay)
	const mobileTabletClasses = `
        fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] w-52
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`;

	// Kelas untuk perilaku desktop (static, bagian dari flow)
	const desktopBaseClasses = `
        lg:static lg:top-auto lg:left-auto lg:h-auto lg:z-auto 
        lg:translate-x-0`;

	const desktopToggledClasses = isSidebarOpen
		? `lg:w-60 xl:w-64` // Lebar & padding desktop saat terbuka
		: `lg:w-0 lg:p-0 lg:opacity-0 lg:invisible`; // Lebar & padding 0 + tak terlihat saat tertutup

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
		isSidebarOpen ? "opacity-100" : "opacity-0 lg:opacity-0 lg:invisible" // Disesuaikan agar lebih konsisten saat sidebar desktop collapse
	} transition-opacity duration-100 delay-100`; // Delay agar teks hilang setelah sidebar menciut

	return (
		<aside className={sidebarClasses} aria-label="Sidebar Pegawai">
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
					to="/pengajuan-cuti"
					onClick={handleMobileLinkClick}
					className={`flex items-center space-x-3 p-2.5 rounded-md ${isActive(
						"/pengajuan-cuti"
					)}`}>
					<AiFillFileAdd className="text-xl flex-shrink-0" />
					<span className={linkTextClass}>Pengajuan Cuti</span>
				</Link>
				<Link
					to="/riwayat-cuti"
					onClick={handleMobileLinkClick}
					className={`flex items-center space-x-3 p-2.5 rounded-md ${isActive(
						"/riwayat-cuti"
					)}`}>
					<FaHistory className="text-xl flex-shrink-0" />
					<span className={linkTextClass}>Riwayat Pengajuan</span>
				</Link>
				<Link
					to="/draft-cuti"
					onClick={handleMobileLinkClick}
					className={`flex items-center space-x-3 p-2.5 rounded-md ${isActive(
						"/draft-cuti"
					)}`}>
					<FaFileAlt className="text-xl flex-shrink-0" />
					<span className={linkTextClass}>Draft Pengajuan</span>
				</Link>

				<hr
					className={`border-1 border-gray-600 w-5/6 mx-auto my-2 transition-opacity duration-150 ${
						isSidebarOpen ? "opacity-100" : "opacity-0"
					}`}
				/>

				<Link
					to="/permohonan-pelimpahan-tugas"
					onClick={handleMobileLinkClick}
					className={`flex items-center space-x-3 p-2.5 rounded-md ${isActive(
						"/permohonan-pelimpahan-tugas"
					)}`}>
					<FaPeopleArrows className="text-xl flex-shrink-0" />
					<span className={linkTextClass}>
						Permohonan <br /> Pelimpahan Tugas
					</span>
				</Link>
			</div>
		</aside>
	);
};

export default SidebarPegawai;
