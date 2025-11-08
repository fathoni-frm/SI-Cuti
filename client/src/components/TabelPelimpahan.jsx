import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import axios from "../api/axios";
import { formatGMT8 } from "../schemas/timeFormatter";
import Pagination from "./Pagination";
import { FaEllipsisV, FaFileAlt, FaPrint } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";

const TabelPelimpahan = ({
	data = [],
	lihat = false,
	currentPage = 1,
	totalPages = 1,
	onPageChange = () => { },
	itemsPerPage,
}) => {
	const { user } = useAuthStore();
	const [selectedRow, setSelectedRow] = useState(null);
	const dropdownRef = useRef(null);
	const navigate = useNavigate();

	const handleLihatPelimpahan = async (item) => {
		const { id, idPenerima, status } = item;

		if (user.idPegawai === idPenerima && status === "Belum Diverifikasi") {
			try {
				await axios.patch(`/status-pelimpahan-diproses/${id}`);

				navigate(`/detail-pelimpahan/${id}`);
			} catch (error) {
				console.error("Gagal update status verifikasi:", error);
			}
		}

		if (user.idPegawai === idPenerima && status === "Diproses") {
			navigate(`/detail-pelimpahan/${id}`);
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
							<th className="px-2 py-3 rounded-tl-lg w-[5%]">No</th>
							<th className="px-2 py-3 w-[15%]">Tanggal Pengajuan</th>
							<th className="px-2 py-3 w-[25%]">Nama Pemohon</th>
							<th className="px-2 py-3 w-[15%]">Tanggal Mulai</th>
							<th className="px-2 py-3 w-[15%]">Tanggal Selesai</th>
							<th className="px-2 py-3 w-[10%]">Status</th>
							<th className="px-2 py-3 rounded-tr-lg w-[5%]">Aksi</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{data.map((item, index) => (
							<tr
								key={item.id}
								className={`text-gray-700 text-center 
								${index % 2 === 0 ? "bg-white" : "bg-gray-50"} 
                                hover:bg-gray-100`}>
								<td className="px-2 py-2 whitespace-nowrap">
									{(currentPage - 1) * itemsPerPage + index + 1}
								</td>
								<td className="px-2 py-2 whitespace-nowrap">
									{formatGMT8(item.PengajuanCuti.tanggalPengajuan)}
								</td>
								<td className="px-2 py-2 whitespace-nowrap">
									{item.PengajuanCuti.pegawai.nama}
								</td>
								<td className="px-2 py-2 whitespace-nowrap">
									{formatGMT8(item.PengajuanCuti.tanggalMulai, {
										showTime: false,
									})}
								</td>
								<td className="px-2 py-2 whitespace-nowrap">
									{formatGMT8(item.PengajuanCuti.tanggalSelesai, {
										showTime: false,
									})}
								</td>
								<td className="px-2 py-2 whitespace-nowrap">
									<span
										className={`text-xs font-semibold px-2 py-1 rounded-full ${item.PengajuanCuti.status === "Disetujui"
												? "bg-green-100 text-green-800"
												: item.PengajuanCuti.status === "Ditolak"
													? "bg-red-100 text-red-800"
													: item.PengajuanCuti.status === "Diproses"
														? "bg-yellow-100 text-yellow-800"
														: item.PengajuanCuti.status === "Dibatalkan"
															? "bg-gray-100 text-gray-700"
															: "bg-blue-100 text-blue-700"
											}`}>
										{item.PengajuanCuti.status}
									</span>
								</td>
								<td className="px-2 py-2 whitespace-nowrap relative">
									{lihat ? (
										<button
											onClick={(e) => {
												e.preventDefault();
												handleLihatPelimpahan(item);
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
															to={`/detail-pelimpahan/${item.id}`}
															className="flex items-center gap-2 px-1.5 py-0.5 mx-auto text-sm font-semibold text-white transition bg-blue-500 hover:bg-blue-600 duration-150 rounded-md">
															<FaFileAlt />
															<span>Detail</span>
														</Link>
													</div>
													<div className="pb-2">
														<button
															onClick={() =>
																handleCetakSurat(item.PengajuanCuti)
															}
															disabled={
																item.PengajuanCuti.status !== "Disetujui" &&
																!item.PengajuanCuti.suratCuti
															}
															className={`flex items-center gap-2 px-1.5 py-0.5 mx-auto text-sm font-semibold text-white transition duration-150 rounded-md ${item.PengajuanCuti.status === "Disetujui" &&
																	item.PengajuanCuti.suratCuti
																	? "bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
																	: "bg-gray-300 cursor-not-allowed"
																}`}
															title={`
                                                            ${item.PengajuanCuti
																	.status ===
																	"Disetujui" &&
																	item.PengajuanCuti
																		.suratCuti
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

			<div className="mt-4">
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={onPageChange}
				/>
			</div>
		</>
	);
};

export default TabelPelimpahan;
