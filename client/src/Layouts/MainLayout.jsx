import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import SidebarAdmin from "../components/SidebarAdmin";
import SidebarAtasan from "../components/SidebarAtasan";
import SidebarPegawai from "../components/SidebarPegawai";

const MainLayout = ({ children, role }) => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(
		typeof window !== "undefined" ? window.innerWidth >= 1024 : false
	);

	const renderSidebar = () => {
		switch (role?.toLowerCase()) {
			case "admin":
				return (
					<SidebarAdmin
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
				);
			case "atasan":
				return (
					<SidebarAtasan
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
				);
			case "pegawai":
				return (
					<SidebarPegawai
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
				);
			default:
				return null;
		}
	};

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 1024) {
				setIsSidebarOpen(true);
			} else {
				setIsSidebarOpen(false);
			}
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<div className="min-h-screen flex flex-col bg-gray-100">
			{/* Navbar */}
			<Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
			<div className="flex flex-grow pt-16">
				{renderSidebar()}
				{/* Sidebar */}
				{isSidebarOpen && (
					<div
						onClick={toggleSidebar}
						className="fixed inset-0 z-20 bg-black opacity-50 lg:hidden"
						aria-hidden="true"></div>
				)}
				{/* Main Content Area */}
				<main className="flex-grow overflow-y-auto transition-all duration-300 ease-in-out">
					{children}
				</main>
			</div>
		</div>
	);
};

export default MainLayout;
