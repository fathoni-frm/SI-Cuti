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

	return (
		<>
			<table className="w-full border-collapse">
				<thead>
					<tr className="bg-gray-200">
						<th className="w-[40px] border border-gray-300 p-2">No</th>
						<th className="w-[400px] border border-gray-300 py-2">
							Tanggal pembuatan draft
						</th>
						<th className="border border-gray-300 p-2">Jenis Cuti</th>
						<th className="border border-gray-300 p-2">Tanggal Mulai</th>
						<th className="border border-gray-300 p-2">Tanggal Selesai</th>
						<th className="w-[60px] border border-gray-300 p-2">Aksi</th>
					</tr>
				</thead>
				<tbody>
					{data.map((item, index) => (
						<tr key={item.id} className="text-center relative">
							<td className="border border-gray-300 p-2">{index + 1}</td>
							<td className="border border-gray-300 p-2">
								{formatGMT8(item.updatedAt)}
							</td>
							<td className="border border-gray-300 p-2">{item.jenisCuti}</td>
							<td className="border border-gray-300 p-2">
								{formatGMT8(item.tanggalMulai, { showTime: false })}
							</td>
							<td className="border border-gray-300 p-2">
								{formatGMT8(item.tanggalSelesai, { showTime: false })}
							</td>
							<td className="border border-gray-300 p-2 relative">
								<button
									onClick={() => toggleMenu(index)}
									className="text-gray-800 hover:text-gray-300">
									<FaEllipsisV className="cursor-pointer mx-auto" />
								</button>

								{selectedRow === index && (
									<div
										ref={dropdownRef}
										className="absolute right-1.5 z-20 mt-0.5 w-22 bg-white border border-gray-300 rounded-md shadow-md text-left">
										<div className="absolute -top-2 right-4 w-3 h-3 bg-white border-t border-l border-gray-300 rotate-45 z-10"></div>
										<div className="py-2 px-1">
											<Link
												to={`/pengajuan-cuti/edit/${item.id}`}
												className="flex items-center gap-2 px-3.5 py-0.5 mx-auto text-sm font-bold text-white bg-yellow-500 hover:bg-yellow-200 transition-all duration-150 rounded-md">
												<FaEdit />
												Edit
											</Link>
										</div>
										<div className="pb-2">
											<button
												onClick={() => handleDelete(item.id)}
												className="flex items-center gap-2 px-1.5 py-0.5 mx-auto text-sm font-bold text-white bg-red-500 hover:bg-red-200 transition-all duration-150 rounded-md cursor-pointer">
												<FaTrash />
												Hapus
											</button>
										</div>
									</div>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<Pagination />
		</>
	);
};

export default TabelDraftPengajuan;
