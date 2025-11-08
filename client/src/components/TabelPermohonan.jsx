import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import axios from "../api/axios";
import { formatGMT8 } from "../schemas/timeFormatter";
import Pagination from "./Pagination";
import { FaEllipsisV, FaFileAlt, FaPrint } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";

const TabelPermohonan = ({
	data = [],
	isDashboard = false,
	showQuota = true,
	showPagination = true,
	lihat = false,
	currentPage = 1,
	totalPages = 1,
	onPageChange = () => { },
	indexOfLastItem,
	itemsPerPage,
}) => {
	const { user } = useAuthStore();
	const [selectedRow, setSelectedRow] = useState(null);
	const dropdownRef = useRef(null);
	const navigate = useNavigate();

	const handleLihatCuti = async (item) => {
		const { idVerifikasi, statusVerifikasi, idPengajuan } = item;

		if (user.role === "Atasan" && statusVerifikasi === "Belum Diverifikasi") {
			try {
				await axios.patch(`/status-to-diproses/${idVerifikasi}`, {
					idVerifikasi,
				});

				navigate(`/detail-cuti/${idPengajuan}`);
			} catch (error) {
				console.error("Gagal update status verifikasi:", error);
			}
		}

		if (user.role === "Atasan" && statusVerifikasi === "Diproses") {
			navigate(`/detail-cuti/${idPengajuan}`);
		}
	};

	const handleCetakSurat = async (item) => {
		if (!item.suratCuti || item.status !== "Disetujui") return;
		const url = `${import.meta.env.VITE_PUBLIC_URL}/uploads/surat-cuti/${item.suratCuti}`;
		window.open(url, "_blank");
	};

	const toggleMenu = (index) => {
		setSelectedRow(selectedRow === index ? null : index);
	};

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setSelectedRow(null);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	if (!data || data.length === 0)
		return (
			<p className="flex justify-center ml-5 my-5">Tidak ada data permohonan</p>
		);

	return (
		<>
			<div className={`${window.innerWidth < 1024 ? "overflow-auto" : ""}`}>
				<table className="w-full text-sm shadow-sm rounded-lg">
					<thead>
						<tr className="text-xs text-black uppercase tracking-wider bg-gray-200">
							<th className={`px-2 py-3 w-[5%] ${isDashboard ? "" : "rounded-tl-lg"}`}>
								No
							</th>
							<th className="px-2 py-3 w-[15%]">Tanggal Pengajuan</th>
							<th className="px-2 py-3 w-[20%]">Nama Pemohon</th>
							<th className="px-2 py-3 w-[15%]">Jenis Cuti</th>
							<th className="px-2 py-3 w-[10%]">Mulai</th>
							<th className="px-2 py-3 w-[10%]">Selesai</th>
							{showQuota && (
								<>
									<th className="px-2 py-3 w-[7%]">Total Kuota</th>
									<th className="px-2 py-3 w-[7%]">Sisa Kuota</th>
								</>
							)}
							<th className="px-2 py-3 w-[10%]">Status</th>
							<th className={`px-2 py-3 w-[5%] ${isDashboard ? "" : "rounded-tr-lg"}`}>
								Aksi
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{data.map((item, index) => (
							<tr
								key={item.idPengajuan || item.id}
								className={`text-gray-700 text-center ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
									} hover:bg-gray-100`}>
								<td
									className={`${indexOfLastItem
											? "rounded-bl-lg"
											: isDashboard && index.length === indexOfLastItem
												? "rounded-bl-lg"
												: ""
										} px-2 py-2 font-medium text-black`}>
									{isDashboard
										? index + 1
										: (currentPage - 1) * itemsPerPage + index + 1}
								</td>
								<td className="px-2 py-2">
									{formatGMT8(item.tanggalPengajuan)}
								</td>
								<td className="px-2 py-2">
									{item.pegawai.nama}
								</td>
								<td className="px-2 py-2">
									{item.jenisCuti}
								</td>
								<td className="px-2 py-2">
									{formatGMT8(item.tanggalMulai, { showTime: false })}
								</td>
								<td className="px-2 py-2">
									{formatGMT8(item.tanggalSelesai, { showTime: false })}
								</td>
								{showQuota && (
									<>
										<td className="px-2 py-2">
											{item.totalKuota}
										</td>
										<td className="px-2 py-2">
											{item.sisaKuota}
										</td>
									</>
								)}
								<td className="px-2 py-2">
									<span
										className={`text-xs font-semibold px-2 py-1 rounded-full ${item.status === "Disetujui"
												? "bg-green-100 text-green-800"
												: item.status === "Ditolak"
													? "bg-red-100 text-red-800"
													: item.status === "Diproses"
														? "bg-yellow-100 text-yellow-800"
														: item.status === "Dibatalkan"
															? "bg-gray-100 text-gray-700"
															: "bg-blue-100 text-blue-700"
											}`}>
										{item.status}
									</span>
								</td>
								<td
									className={`${indexOfLastItem
											? "rounded-br-lg"
											: isDashboard && index.length === indexOfLastItem
												? "rounded-br-lg"
												: ""
										} px-2 py-2 relative`}>
									{lihat ? (
										<button
											onClick={(e) => {
												e.preventDefault();
												handleLihatCuti(item);
											}}
											className="flex items-center justify-center gap-1 bg-[#FE9D35] text-white text-sm px-1 py-1 rounded-md hover:bg-[#fec68a] transition cursor-pointer mx-auto">
											<IoEyeSharp className="text-base" />
											<span>Lihat</span>
										</button>
									) : (
										<>
											<button
												onClick={() => toggleMenu(index)}
												className="text-gray-500 p-1 rounded-xl hover:text-gray-700 hover:bg-gray-200 cursor-pointer">
												<FaEllipsisV />
											</button>

											{selectedRow === index && (
												<div
													ref={dropdownRef}
													className="absolute z-20 top-full -mt-2 right-4 w-21 bg-white border border-gray-300 rounded-md shadow-md text-left">
													<div className="absolute -top-1.5 border-t border-l right-4 w-3 h-3 bg-white border-gray-300 rotate-45 z-10"></div>
													<div className="py-2 px-1.5">
														<Link
															to={`/detail-cuti/${item.idPengajuan || item.id}`}
															className="flex items-center gap-2 px-1.5 py-0.5 mx-auto text-sm font-semibold text-white transition bg-blue-500 hover:bg-blue-600 duration-150 rounded-md">
															<FaFileAlt />
															<span>Detail</span>
														</Link>
													</div>
													<div className="pb-2">
														<button
															onClick={() => handleCetakSurat(item)}
															disabled={
																item.status !== "Disetujui" && !item.suratCuti
															}
															className={`flex items-center gap-2 px-1.5 py-0.5 mx-auto text-sm font-semibold text-white transition duration-150 rounded-md ${item.status === "Disetujui" && item.suratCuti
																	? "bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
																	: "bg-gray-300 cursor-not-allowed"
																}`}
															title={`
																${item.status === "Disetujui" && item.suratCuti
																	? "Cetak surat cuti."
																	: "Surat cuti tidak tersedia untuk pengajuan yang belum / tidak disetujui."
																}`}>
															<FaPrint />
															<span>Cetak</span>
														</button>
													</div>
												</div>
											)}
										</>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{showPagination && (
				<div className="mt-4">
					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={onPageChange}
					/>
				</div>
			)}
		</>
	);
};

export default TabelPermohonan;
