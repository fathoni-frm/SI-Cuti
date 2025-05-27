import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../store/authStore";
import axios from "../api/axios";
import { formatGMT8 } from "../schemas/timeFormatter";
import Pagination from "./Pagination";
import { FaEllipsisV, FaFileAlt, FaPrint } from "react-icons/fa";

const TabelRiwayat = ({
	data = [],
	showPagination = true,
	isDashboard = false,
	currentPage = 1,
	totalPages = 1,
	onPageChange = () => {},
}) => {
	const [selectedRow, setSelectedRow] = useState(null);
	const dropdownRef = useRef(null);

	const handleCetakSurat = async (item) => {
		if (!item.suratCuti || item.status !== "Disetujui") return;
		const url = `http://localhost:3000/uploads/surat-cuti/${item.suratCuti}`;
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
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	if (!data || data.length === 0) {
		return (
			<p className="flex justify-center ml-5 my-5">
				Tidak ada data riwayat cuti
			</p>
		);
	}

	return (
		<>
			<div
				className={`rounded-b-lg
					${
						isDashboard
							? "overflow-x-hidden overflow-y-visible"
							: "rounded-t-lg overflow-auto"
					}
					`}>
				<table className="w-full">
					<thead className="bg-gray-200">
						<tr className="text-sm text-black uppercase tracking-wider">
							<th className="w-[40px] py-3 px-1">No</th>
							<th className="py-3">Tanggal Pengajuan</th>
							<th className="py-3">Jenis Cuti</th>
							<th className="py-3">Tanggal Mulai</th>
							<th className="py-3">Tanggal Selesai</th>
							<th className="py-3">Status</th>
							<th className="w-[60px] py-3">Aksi</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{data.map((item, index) => (
							<tr
								key={item.id}
								className={`${
									index % 2 === 0 ? "bg-white" : "bg-gray-50"
								} text-center whitespace-nowrap text-sm text-gray-700 hover:bg-gray-100`}>
								<td className="py-3">{index + 1}</td>
								<td className="py-3">{formatGMT8(item.tanggalPengajuan)}</td>
								<td className="py-3">{item.jenisCuti}</td>
								<td className="py-3">
									{formatGMT8(item.tanggalMulai, { showTime: false })}
								</td>
								<td className="py-3">
									{formatGMT8(item.tanggalSelesai, { showTime: false })}
								</td>
								<td className="py-3">
									<span
										className={`text-sm font-semibold px-3 py-1 rounded-full ${
											item.status === "Disetujui"
												? "bg-green-100 text-green-800"
												: item.status === "Ditolak"
												? "bg-red-100 text-red-800"
												: item.status === "Diproses"
												? "bg-yellow-100 text-yellow-800"
												: item.status === "Dibatalkan"
												? "bg-red-100 text-red-800"
												: "bg-gray-200 text-gray-800"
										}`}>
										{item.status}
									</span>
								</td>
								<td className="py-3 relative">
									<button
										onClick={() => toggleMenu(index)}
										className="text-gray-800 hover:text-gray-300">
										<FaEllipsisV className="cursor-pointer mx-auto" />
									</button>

									{/* Dropdown Menu */}
									{selectedRow === index && (
										<div
											ref={dropdownRef}
											className="absolute right-1.5 z-20 mt-0.5 w-22 bg-white border border-gray-300 rounded-md shadow-md text-left">
											<div className="absolute -top-2 right-4 w-3 h-3 bg-white border-t border-l border-gray-300 rotate-45 z-10"></div>
											<div className="py-2 px-1.5">
												<Link
													to={`/detail-cuti/${item.id}`}
													className="flex items-center gap-2 px-1.5 py-0.5 mx-auto text-sm font-semibold text-white bg-blue-500 hover:bg-blue-200 transition-all duration-150 rounded-md">
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
													className={`flex items-center gap-2 px-1.5 py-0.5 mx-auto text-sm font-semibold text-white transition duration-150 rounded-md ${
														item.status === "Disetujui" && item.suratCuti
															? "bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
															: "bg-gray-300 cursor-not-allowed"
													}`}>
													<FaPrint />
													<span>Cetak</span>
												</button>
											</div>
										</div>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Komponen Pagination */}
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

export default TabelRiwayat;
