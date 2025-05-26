import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import axios from "../api/axios";
import { formatGMT8 } from "../schemas/timeFormatter";
import Pagination from "./Pagination";
import { FaEllipsisV, FaFileAlt, FaPrint } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";

const TabelPermohonan = ({
	tipe,
	isDashboard = false,
	showQuota = true,
	showPagination = true,
	lihat = false,
}) => {
	const { user, accessToken, isLoading } = useAuthStore();
	const [selectedRow, setSelectedRow] = useState(null);
	const [data, setData] = useState([]);
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
				console.error("Gagal update status verifikasi frontend:", error);
			}
		}

		if (user.role === "Atasan" && statusVerifikasi === "Diproses") {
			navigate(`/detail-cuti/${idPengajuan}`);
		}
	};

	const toggleMenu = (index) => {
		setSelectedRow(selectedRow === index ? null : index);
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axios.get("/permohonan-cuti", {
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				});

				if (!user) return;

				let hasil = [];

				if (user.role === "Atasan") {
					// Ambil array yang sesuai dengan tipe
					const verifikasiSaya = res.data[tipe] || [];

					// Normalisasi struktur data untuk kebutuhan tampilan
					hasil = verifikasiSaya.map((item) => ({
						idVerifikasi: item.id,
						idPengajuan: item.idPengajuan,
						tanggalPengajuan: item.PengajuanCuti.tanggalPengajuan,
						jenisCuti: item.PengajuanCuti.jenisCuti,
						tanggalMulai: item.PengajuanCuti.tanggalMulai,
						tanggalSelesai: item.PengajuanCuti.tanggalSelesai,
						totalKuota: item.PengajuanCuti.totalKuota,
						sisaKuota: item.PengajuanCuti.sisaKuota,
						status: item.PengajuanCuti.status,
						statusVerifikasi: item.statusVerifikasi,
						Pegawai: { nama: item.PengajuanCuti.Pegawai.nama },
					}));
				} else {
					// untuk Admin, data belum dikelompokkan
					hasil = res.data;
				}

				setData(hasil);
			} catch (error) {
				console.error("Gagal fetch data cuti:", error);
			}
		};

		fetchData();
	}, [tipe]);

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
		return <p className="ml-5 my-5">Tidak ada permohonan untuk saat ini.</p>;

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
							<th className="py-3 px-1">No</th>
							<th className="py-3">Tanggal Pengajuan</th>
							<th className="py-3">Nama Pemohon</th>
							<th className="py-3">Jenis Cuti</th>
							<th className="py-3">Mulai</th>
							<th className="py-3">Akhir</th>
							{showQuota && (
								<>
									<th className="py-3">Kuota Cuti</th>
									<th className="py-3">Sisa Kuota Cuti</th>
								</>
							)}
							<th className="py-3">Status</th>
							<th className="py-3 px-1">Aksi</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{data.map((item, index) => (
							<tr
								key={item.idPengajuan || item.id}
								className={`${
									index % 2 === 0 ? "bg-white" : "bg-gray-50"
								} text-center whitespace-nowrap text-sm text-gray-700 hover:bg-gray-100`}>
								<td className="py-3">{index + 1}</td>
								<td className="py-3">{formatGMT8(item.tanggalPengajuan)}</td>
								<td className="py-3">{item.Pegawai.nama}</td>
								<td className="py-3">{item.jenisCuti}</td>
								<td className="py-3">
									{formatGMT8(item.tanggalMulai, { showTime: false })}
								</td>
								<td className="py-3">
									{formatGMT8(item.tanggalSelesai, { showTime: false })}
								</td>
								{showQuota && (
									<>
										<td className="py-3">{item.totalKuota}</td>
										<td className="py-3">{item.sisaKuota}</td>
									</>
								)}
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
												className="text-gray-500 text-xl hover:text-gray-700 cursor-pointer mx-auto">
												<FaEllipsisV />
											</button>

											{selectedRow === index && (
												<div
													ref={dropdownRef}
													className="absolute right-3.5 z-20 mt-0.5 w-22 bg-white border border-gray-300 rounded-md shadow-md text-left">
													<div className="absolute -top-2 right-4 w-3 h-3 bg-white border-t border-l border-gray-300 rotate-45 z-10"></div>
													<div className="py-2 px-1.5">
														<Link
															to={`/detail-cuti/${item.idPengajuan || item.id}`}
															className="flex items-center gap-2 px-1.5 py-0.5 mx-auto text-sm font-bold text-white bg-blue-500 hover:bg-blue-200 transition-all duration-150 rounded-md">
															<FaFileAlt />
															<span>Detail</span>
														</Link>
													</div>
													<div className="pb-2">
														<button
															onClick={() => console.log("Cetak clicked")}
															className="flex items-center gap-2 px-1.5 py-0.5 mx-auto text-sm font-bold text-white bg-gray-500 hover:bg-gray-200 transition-all duration-150 rounded-md">
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
					<Pagination />
				</div>
			)}
		</>
	);
};

export default TabelPermohonan;
