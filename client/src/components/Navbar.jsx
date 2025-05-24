import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAuthStore from "../store/authStore";
import axios from "../api/axios";
import Spinner from "./Spinner";
import {
	FaBell,
	FaChevronDown,
	FaUserCog,
	FaSignOutAlt,
	FaTrash,
	FaCheck,
} from "react-icons/fa";

const Navbar = () => {
	const navigate = useNavigate();
	const { user, detailPegawai, logout, isLoading } = useAuthStore();
	const dropdownRef = useRef(null);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [notifikasi, setNotifikasi] = useState([]);
	const [notifOpen, setNotifOpen] = useState(false);
	
	if (isLoading || !detailPegawai) {
		return <Spinner />;
	}

	const handleBacaNotifikasi = async (idNotifikasi, idPengajuan) => {
		try {
			await axios.patch(`/notifikasi/${idNotifikasi}/baca`, {
				idPegawai: user.idPegawai,
				idPengajuan,
			});
			setNotifikasi((prev) =>
				prev.map((n) => (n.id === idNotifikasi ? { ...n, isRead: true } : n))
			);
			navigate(`/detail-cuti/${idPengajuan}`);
		} catch (err) {
			console.error("Gagal menandai notifikasi sebagai dibaca:", err);
		}
	};

	const handleHapusNotifikasiTerbaca = async () => {
		const terbaca = notifikasi.filter((n) => n.isRead);
		if (terbaca.length === 0) return;

		const confirm = await Swal.fire({
			title: "Hapus notifikasi terbaca?",
			text: "Tindakan ini akan menghapus notifikasi yang telah dibaca secara permanen.",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#d33",
			cancelButtonColor: "#aaa",
			confirmButtonText: "Ya, hapus",
			cancelButtonText: "Batal",
		});

		if (confirm.isConfirmed) {
			try {
				await Promise.all(
					terbaca.map((n) => axios.delete(`/notifikasi/${n.id}`))
				);
				setNotifikasi((prev) => prev.filter((n) => !n.isRead));
				Swal.fire("Berhasil", "Notifikasi terbaca telah dihapus.", "success");
			} catch (err) {
				console.error("Gagal menghapus notifikasi:", err);
				Swal.fire(
					"Gagal",
					"Terjadi kesalahan saat menghapus notifikasi.",
					"error"
				);
			}
		}
	};

	const handleTandaiSemuaDibaca = async () => {
		const belumDibaca = notifikasi.filter((n) => !n.isRead);
		if (belumDibaca.length === 0) return;

		try {
			await Promise.all(
				belumDibaca.map((n) => axios.patch(`/notifikasi/${n.id}/baca`))
			);
			setNotifikasi((prev) =>
				prev.map((n) =>
					belumDibaca.some((b) => b.id === n.id) ? { ...n, isRead: true } : n
				)
			);
		} catch (err) {
			console.error("Gagal tandai sebagai dibaca:", err);
		}
	};

	const handleLogout = async () => {
		await logout();
		navigate("/login");
	};

	useEffect(() => {
		const fetchNotifikasi = async () => {
			try {
				const res = await axios.get("/notifikasi");
				setNotifikasi(res.data);
			} catch (err) {
				console.error("Gagal memuat notifikasi:", err);
			}
		};
		fetchNotifikasi();
	}, []);

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
				<div className="relative mr-4">
					<div
						className="relative cursor-pointer group"
						onClick={() => setNotifOpen(!notifOpen)}>
						<FaBell className="text-xl text-yellow-500 group-hover:text-yellow-600" />
						{notifikasi.some((n) => !n.isRead) && (
							<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 py-0 rounded-full group-hover:bg-red-600 group-hover:text-gray-400">
								{notifikasi.filter((n) => !n.isRead).length}
							</span>
						)}
					</div>
					{notifOpen && (
						<div
							className={`absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50 origin-top-right transition transform duration-200 ${
								notifOpen
									? "scale-100 opacity-100"
									: "scale-95 opacity-0 pointer-events-none"
							}`}
							style={{ overflow: "hidden" }}>
							{notifikasi.length === 0 ? (
								<p className="text-center text-sm text-gray-500 py-4">
									Tidak ada notifikasi
								</p>
							) : (
								<div className="max-h-80 overflow-y-auto">
									<div className="text-right px-4 pb-1 border-b-1 border-black space-x-3 bg-gray-200">
										<button
											onClick={handleTandaiSemuaDibaca}
											className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
											title="Tandai semua telah dibaca"
											disabled={!notifikasi.some((n) => !n.isRead)}>
											<FaCheck />
										</button>
										<button
											onClick={handleHapusNotifikasiTerbaca}
											className="text-xs text-red-500 hover:text-red-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
											title="Hapus semua yang telah dibaca"
											disabled={!notifikasi.some((n) => n.isRead)}>
											<FaTrash />
										</button>
									</div>
									{notifikasi.map((notif) => (
										<div
											key={notif.id}
											onClick={() => {
												setNotifOpen(false);
												handleBacaNotifikasi(notif.id, notif.idPengajuan);
											}}
											className={`px-4 py-2 text-sm border-b border-gray-400 cursor-pointer transition-all duration-200 hover:bg-gray-100 relative
											${!notif.isRead ? "bg-yellow-50 font-semibold text-black" : "text-gray-600"}`}>
											<span className="absolute top-2 right-4 text-xs text-gray-400">
												{new Date(notif.createdAt)
													.toLocaleTimeString("id-ID", {
														hour: "2-digit",
														minute: "2-digit",
														hour12: false,
													})
													.replace(".", ":") +
													" • " +
													new Date(notif.createdAt).toLocaleDateString(
														"id-ID",
														{
															day: "2-digit",
															month: "short",
															year: "numeric",
														}
													)}
											</span>
											<p className="font-semibold">{notif.judul}</p>
											<p className="text-xs text-gray-600 mt-0.5">
												{notif.pesan}
											</p>
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</div>
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
