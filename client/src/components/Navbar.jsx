import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import useAuthStore from "../store/authStore";
import axios from "../api/axios";
import Spinner from "./Spinner";
import FotoProfil from "../assets/foto-profil.jpg";
import {
	FaBell,
	FaChevronDown,
	FaChevronUp,
	FaUserCog,
	FaSignOutAlt,
	FaBars,
} from "react-icons/fa";
import { MdMarkEmailRead } from "react-icons/md";
import { IoMdTrash } from "react-icons/io";

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
	const navigate = useNavigate();
	const { user, detailPegawai, logout, isLoading } = useAuthStore();
	const notifDropdownRef = useRef(null);
	const profileDropdownRef = useRef(null);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [notifOpen, setNotifOpen] = useState(false);
	const [notifikasi, setNotifikasi] = useState([]);

	if (isLoading || !detailPegawai) {
		return <Spinner />;
	}

	const handleBacaNotifikasi = async (idNotifikasi, idPengajuan) => {
		try {
			const res = await axios.patch(`/notifikasi/${idNotifikasi}/baca`, {
				idPegawai: user.idPegawai,
				idPengajuan,
			});
			setNotifikasi((prev) =>
				prev.map((n) => (n.id === idNotifikasi ? { ...n, isRead: true } : n))
			);

			if (res.data.tipe === "pelimpahan" && res.data.idPelimpahan) {
				navigate(`/detail-pelimpahan/${res.data.idPelimpahan}`);
			} else if (res.data.tipe === "kuota") {
				navigate("/dashboard#kuota-cuti");
			} else {
				navigate(`/detail-cuti/${idPengajuan}`);
			}
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
				belumDibaca.map((n) => {
					axios.patch(`/notifikasi/${n.id}/baca`, {
						idPegawai: user.idPegawai,
						idPengajuan: n.idPengajuan,
					});
				})
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
		function handleClickOutside(event) {
			if (
				notifDropdownRef.current &&
				!notifDropdownRef.current.contains(event.target)
			) {
				setNotifOpen(false);
			}
			if (
				profileDropdownRef.current &&
				!profileDropdownRef.current.contains(event.target)
			) {
				setDropdownOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<nav className="bg-[#133130] flex justify-between items-center px-3 sm:px-4 py-3 text-white fixed top-0 left-0 right-0 z-40 h-16 shadow-md">
			<div className="flex items-center">
				<button
					onClick={toggleSidebar}
					className={`p-2 mr-1 sm:mr-2 rounded-md hover:bg-gray-700 focus:outline-none active:bg-gray-600 cursor-pointer ${
						isSidebarOpen ? "text-gray-500" : "text-white"
					}`}
					aria-label="Toggle sidebar"
					title={isSidebarOpen ? "Tutup Sidebar" : "Buka Sidebar"}>
					<FaBars className="h-5 w-5 sm:h-6 sm:w-6" />
				</button>

				<Link to="/dashboard" className="flex items-center cursor-pointer">
					<img
						src="https://bbkhit.com/public/img/logo.png"
						alt="Logo Aplikasi"
						className="h-8 w-8 sm:h-9 sm:w-9 rounded-full"
					/>
					<span className="ml-2 text-lg sm:text-xl font-semibold sm:inline">
						SI Cuti
					</span>
				</Link>
			</div>

			<div className="flex items-center space-x-2 sm:space-x-4">
				<div className="relative" ref={notifDropdownRef}>
					<button
						onClick={() => setNotifOpen(!notifOpen)}
						className="relative p-2 rounded-full hover:bg-gray-700 group focus:outline-none cursor-pointer"
						aria-label="Notifikasi">
						<FaBell className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 group-hover:text-yellow-300" />
						{notifikasi.some((n) => !n.isRead) && (
							<span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-red-500 text-white text-[10px] sm:text-xs w-4 h-4 sm:w-4.5 sm:h-4.5 flex items-center justify-center rounded-full group-hover:bg-red-600">
								{notifikasi.filter((n) => !n.isRead).length}
							</span>
						)}
					</button>
					{notifOpen && (
						<div className="absolute -right-15 mt-2 w-72 sm:right-0 sm:w-80 max-h-[44vh] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl z-50 origin-top-right">
							<div className="flex p-2 border-b border-gray-200 justify-between items-center sticky top-0 bg-white">
								<h3 className="text-sm font-semibold text-gray-700">
									Notifikasi
								</h3>
								<div className="space-x-2">
									<button
										onClick={handleTandaiSemuaDibaca}
										className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
										title="Tandai semua telah dibaca"
										disabled={!notifikasi.some((n) => !n.isRead)}>
										<MdMarkEmailRead size={18} />
									</button>
									<button
										onClick={handleHapusNotifikasiTerbaca}
										className="text-xs text-red-500 hover:text-red-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
										title="Hapus semua yang telah dibaca"
										disabled={!notifikasi.some((n) => n.isRead)}>
										<IoMdTrash size={18} />
									</button>
								</div>
							</div>
							{notifikasi.length === 0 ? (
								<p className="text-center text-sm text-gray-500 py-10">
									Tidak ada notifikasi baru.
								</p>
							) : (
								<div className="divide-y divide-gray-100">
									{notifikasi.map((notif) => (
										<div
											key={notif.id}
											onClick={() =>
												handleBacaNotifikasi(notif.id, notif.idPengajuan)
											}
											className={`p-3 cursor-pointer transition-colors duration-150 hover:bg-gray-100
						  					${!notif.isRead ? "bg-sky-100" : "bg-white"}`}>
											<div className="flex justify-between items-start">
												<div className="flex items-center">
													<p
														className={`text-xs sm:text-sm font-semibold ${
															!notif.isRead ? "text-sky-700" : "text-gray-800"
														}`}>
														{notif.judul}
													</p>
													{!notif.isRead && (
														<span className="w-2 h-2 bg-sky-500 rounded-full flex-shrink-0 ml-1 mt-0.5"></span>
													)}
												</div>
												<p className="text-xs sm:text-sm text-gray-400 text-right">
													{new Date(notif.createdAt).toLocaleDateString(
														"id-ID",
														{
															day: "numeric",
															month: "short",
														}
													)}{" "}
													-{" "}
													{new Date(notif.createdAt).toLocaleTimeString(
														"id-ID",
														{
															hour: "2-digit",
															minute: "2-digit",
														}
													)}
												</p>
											</div>
											<p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
												{notif.pesan}
											</p>
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</div>

				<div className="relative" ref={profileDropdownRef}>
					<button
						onClick={() => setDropdownOpen(!dropdownOpen)}
						className="flex items-center p-1 rounded-full hover:bg-gray-700 focus:outline-none cursor-pointer"
						aria-label="Menu Pengguna">
						<img
							src={detailPegawai.foto || FotoProfil}
							alt="Foto Profil"
							className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover"
						/>
						{/* <span className="ml-1.5 text-sm font-medium hidden sm:inline">
							Halo, {detailPegawai.nama.split(" ")[0]}
						</span> */}
						{dropdownOpen ? (
							<FaChevronUp className="ml-1 sm:ml-1.5 h-3 w-3 text-gray-300" />
						) : (
							<FaChevronDown className="ml-1 sm:ml-1.5 h-3 w-3 text-gray-300" />
						)}
					</button>
					{dropdownOpen && (
						<div className="absolute right-0 w-42 bg-white rounded-md shadow-xl py-1 mt-2 z-50 border border-gray-200 origin-top-right">
							<Link
								to="/pengaturan-profil" // Ganti dengan path yang benar
								onClick={() => setDropdownOpen(false)}
								className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 transition-colors duration-150">
								<FaUserCog className="h-4 w-4" /> Pengaturan Profil
							</Link>
							<Link
								onClick={() => {
									setDropdownOpen(false);
									handleLogout();
								}}
								className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-200 transition-colors duration-150">
								<FaSignOutAlt className="h-4 w-4" /> Logout
							</Link>
						</div>
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
