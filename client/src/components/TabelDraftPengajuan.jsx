import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import useAuthStore from "../store/authStore";
import axios from "../api/axios";
import { formatGMT8 } from "../schemas/timeFormatter";
import Pagination from "./Pagination";
import { FaEllipsisV, FaEdit, FaTrash } from "react-icons/fa";

const TabelDraftPengajuan = () => {
	const { user } = useAuthStore();
	const [data, setData] = useState([]);
	const [selectedRow, setSelectedRow] = useState(null);
	const dropdownRef = useRef(null);

	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
	const totalPages = Math.ceil(data.length / itemsPerPage);

	const fetchDraft = async () => {
		try {
			const res = await axios.get(`/pengajuan-cuti/draft/${user.idPegawai}`);
			setData(res.data);
		} catch (err) {
			console.error(err);
		}
	};

	const toggleMenu = (index) => {
		setSelectedRow(selectedRow === index ? null : index);
	};

	const handleDelete = (id) => {
		Swal.fire({
			title: "Yakin ingin menghapus?",
			text: "Draft Pengajuan cuti yang dihapus tidak dapat dikembalikan!",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#d33",
			cancelButtonColor: "#3085d6",
			confirmButtonText: "Ya, hapus!",
			cancelButtonText: "Batal",
		}).then(async (result) => {
			if (result.isConfirmed) {
				try {
					await axios.delete(`/pengajuan-cuti/${id}`);
					toast.success("Draft pengajuan berhasil dihapus!");
					fetchDraft();
				} catch (error) {
					Swal.fire(
						"Gagal",
						error.response?.data?.msg || "Terjadi kesalahan",
						"error"
					);
				}
			}
		});
	};

	useEffect(() => {
		if (user?.idPegawai) {
			fetchDraft();
		}
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setSelectedRow(null);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [user]);

	if (!data || data.length === 0) {
		return (
			<p className="flex justify-center ml-5 my-5">Tidak ada data draft cuti</p>
		);
	}

	return (
		<>
			<div className="border-gray-200 rounded-lg shadow-sm overflow-x-auto">
				<table className="w-full text-sm">
					<thead className="bg-gray-200">
						<tr className="text-xs text-black uppercase tracking-wider">
							<th className="px-2 py-3">No</th>
							<th className="px-2 py-3">Tanggal pembuatan draft</th>
							<th className="px-2 py-3">Jenis Cuti</th>
							<th className="px-2 py-3">Tanggal Mulai</th>
							<th className="px-2 py-3">Tanggal Selesai</th>
							<th className="px-2 py-3">Aksi</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{currentItems.map((item, index) => (
							<tr
								key={item.id}
								className={`${
									index % 2 === 0 ? "bg-white" : "bg-gray-50"
								} text-center whitespace-nowrap text-sm text-gray-700 hover:bg-gray-100`}>
								<td className="px-2 py-2 whitespace-nowrap">{index + 1}</td>
								<td className="px-2 py-2 whitespace-nowrap">
									{formatGMT8(item.updatedAt)}
								</td>
								<td className="px-2 py-2 whitespace-nowrap">
									{item.jenisCuti}
								</td>
								<td className="px-2 py-2 whitespace-nowrap">
									{formatGMT8(item.tanggalMulai, { showTime: false })}
								</td>
								<td className="px-2 py-2 whitespace-nowrap">
									{formatGMT8(item.tanggalSelesai, { showTime: false })}
								</td>
								<td className="px-2 py-2 whitespace-nowrap relative">
									<button
										onClick={() => toggleMenu(index)}
										className="text-gray-500 p-1 rounded-xl hover:text-gray-700 hover:bg-gray-200 cursor-pointer">
										<FaEllipsisV />
									</button>

									{selectedRow === index && (
										<div
											ref={dropdownRef}
											className={`absolute z-20 ${
												index >= data.length - 2
													? "bottom-full -mb-2"
													: "top-full -mt-3"
											} right-3 w-21 bg-white border border-gray-300 rounded-md shadow-md text-left`}>
											<div
												className={`absolute ${
													index >= data.length - 2
														? "-bottom-1.5 border-b border-r"
														: "-top-1.5 border-t border-l"
												} right-4 w-3 h-3 bg-white border-gray-300 rotate-45 z-10`}></div>
											<div className="py-2">
												<Link
													to={`/pengajuan-cuti/edit/${item.id}`}
													className="flex justify-center items-center gap-1 py-0.5 mx-1.5 text-sm font-bold text-white bg-yellow-500 hover:bg-yellow-200 transition-all duration-150 rounded-md">
													<FaEdit />
													Edit
												</Link>
											</div>
											<div className="pb-2">
												<Link
													onClick={() => handleDelete(item.id)}
													className="flex justify-center items-center gap-1 py-0.5 mx-1.5 text-sm font-bold text-white bg-red-500 hover:bg-red-200 transition-all duration-150 rounded-md">
													<FaTrash />
													Hapus
												</Link>
											</div>
										</div>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={(page) => setCurrentPage(page)}
			/>
		</>
	);
};

export default TabelDraftPengajuan;
