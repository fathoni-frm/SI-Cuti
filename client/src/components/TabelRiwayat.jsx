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
				className={`flex max-w-full rounded-b-lg overflow-auto
					${isDashboard ? "" : "rounded-t-lg"}
					`}>
				<table className="table-fixed min-w-full divide-y divide-gray-200 shrink-0 grow-0">
					<thead className="bg-gray-200">
						<tr className="text-sm text-black uppercase tracking-wider">
							<th className="w-[10px] px-1 py-2">No</th>
							<th className="w-[120px] px-1 py-2">
								Tanggal Pengajuan
							</th>
							<th className="w-[100px] px-1 py-2">Jenis Cuti</th>
							<th className="w-[100px] px-1 py-2">Tanggal Mulai</th>
							<th className="w-[100px] px-1 py-2">Tanggal Selesai</th>
							<th className="w-[40px] px-1 py-2">Status</th>
							<th className="w-[40px] px-1 py-2">Aksi</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{data.map((item, index) => (
							<tr
								key={item.id}
								className={`text-sm text-gray-700 text-center ${
									index % 2 === 0 ? "bg-white" : "bg-gray-50"
								} hover:bg-gray-100`}>
								<td className="px-1 py-2 break-words whitespace-normal">{index + 1}</td>
								<td className="px-1 py-2 break-words whitespace-normal">
									{formatGMT8(item.tanggalPengajuan)}
								</td>
								<td className="px-1 py-2 break-words whitespace-normal">
									{item.jenisCuti}
								</td>
								<td className="px-1 py-2 break-words whitespace-normal">
									{formatGMT8(item.tanggalMulai, { showTime: false })}
								</td>
								<td className="px-1 py-2 break-words whitespace-normal">
									{formatGMT8(item.tanggalSelesai, { showTime: false })}
								</td>
								<td className="px-1 py-2 break-words whitespace-normal">
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
								<td className="px-1 py-2 break-words whitespace-normal relative">
									<button
										onClick={() => toggleMenu(index)}
										className="text-gray-800 hover:text-gray-300">
										<FaEllipsisV className="cursor-pointer mx-auto" />
									</button>

									{/* Dropdown Menu */}
									{selectedRow === index && (
										<div
											ref={dropdownRef}
											className={`absolute z-20 ${
												index >= data.length - 2
													? "bottom-full -mb-2"
													: "top-full -mt-3"
											} right-5 w-21 bg-white border border-gray-300 rounded-md shadow-md text-left`}>
											<div className={`absolute ${
															index >= data.length - 2
																? "-bottom-1.5 border-b border-r"
																: "-top-1.5 border-t border-l"
														} right-4 w-3 h-3 bg-white border-gray-300 rotate-45 z-10`}></div>
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
