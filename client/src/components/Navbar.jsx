import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import Spinner from "./Spinner";
import { FaBell, FaChevronDown, FaUserCog, FaSignOutAlt } from "react-icons/fa";

const Navbar = () => {
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef(null);
	const { detailPegawai, logout, isLoading } = useAuthStore();
	const navigate = useNavigate();

	if (isLoading || !detailPegawai) {
		return <Spinner />;
	}
	const handleLogout = async () => {
		await logout();
		navigate("/login");
	};

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<nav className="bg-[#133130] flex justify-between items-center px-6 py-3 text-white">
			<div className="flex items-center">
				<img
					src="https://bbkhit.com/public/img/logo.png"
					alt="logo"
					className="h-10 w-10 rounded-full"
				/>
				<span className="ml-4 text-2xl font-medium">SI Cuti</span>
			</div>
			<div className="flex items-center">
				<FaBell className="text-xl mr-4 cursor-pointer" />
				<div className="flex items-center">
					<div className="flex items-center relative" ref={dropdownRef}>
						<div
							className="flex items-center cursor-pointer"
							onClick={() => setDropdownOpen(!dropdownOpen)}>
							<img
								src="https://storage.googleapis.com/a1aa/image/XBXRVUF75QQnMaQt9gHGU1As5wT3qbrv3HIR6KqqS88.jpg"
								alt="Admin Profile"
								className="h-10 w-10 rounded-full"
							/>
							<span className="ml-2">Halo, {detailPegawai.nama}</span>
							<FaChevronDown className="ml-2" />
						</div>

						{dropdownOpen && (
							<div className="absolute top-6 -right-4 mt-2 w-44 bg-white text-black rounded-md shadow-lg py-2 z-50">
								<div className="absolute -top-1 right-4 w-3 h-3 bg-white border-t border-l border-gray-300 rotate-45"></div>
								<button className="flex items-center gap-2 px-1.5 py-0.5 mx-auto mt-0.5  hover:bg-gray-300 transition-all duration-150 rounded-md cursor-pointer">
									<FaUserCog /> Pengaturan Profil
								</button>
								<button
									className="flex items-center gap-2 px-10 py-0.5 mx-auto mt-2 bg-red-700 text-white hover:bg-red-300 transition-all duration-150 rounded-md cursor-pointer"
									onClick={handleLogout}>
									<FaSignOutAlt /> Logout
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
