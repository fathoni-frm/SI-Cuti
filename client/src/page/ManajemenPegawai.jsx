import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import axios from "../api/axios";
import useAuthStore from "../store/authStore";
import MainLayout from "../Layouts/MainLayout";
import BackgroundItem from "../components/BackgroundItem";
import Pagination from "../components/Pagination";
import {
	FaPlus,
	FaEllipsisV,
	FaFileAlt,
	FaEdit,
	FaTrash,
} from "react-icons/fa";

const ManajemenPegawai = () => {
	const { user } = useAuthStore();
	const navigate = useNavigate();
	const [pegawaiList, setPegawaiList] = useState([]);

	const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
	const dropdownRef = useRef(null);

	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = pegawaiList.slice(indexOfFirstItem, indexOfLastItem);
	const totalPages = Math.ceil(pegawaiList.length / itemsPerPage);

	//Mengambil data seluruh pegawai
	useEffect(() => {
		const fetchPegawai = async () => {
			try {
				const res = await axios.get("/pegawai");
				setPegawaiList(res.data);
			} catch (err) {
				console.error("Gagal mengambil data pegawai", err);
			}
		};
		fetchPegawai();
	}, []);

	//Handle Dropdown
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setOpenDropdownIndex(null);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleDelete = (id) => {
		Swal.fire({
			title: "Yakin ingin menghapus?",
			text: "Data pegawai yang dihapus tidak dapat dikembalikan!",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#d33",
			cancelButtonColor: "#3085d6",
			confirmButtonText: "Ya, hapus!",
			cancelButtonText: "Batal",
		}).then(async (result) => {
			if (result.isConfirmed) {
				try {
					await axios.delete(`/pegawai/${id}`);
					toast.success("Data pegawai berhasil dihapus!");
					fetchPegawai();
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

	return (
		<MainLayout role={user.role}>
			<div className="p-6 w-full bg-gray-100">
				{/* Title */}
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-2xl font-bold">Manajemen Pegawai</h1>
					<button
						onClick={() => navigate("/manajemen-pegawai/tambah")}
						className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 cursor-pointer">
						<FaPlus /> Tambah Pegawai
					</button>
				</div>

				{/* Detail Section */}
				<BackgroundItem>
					{/* Header dengan ikon */}
					<div className="flex items-center justify-center gap-3 mb-6">
						<h2 className="text-2xl font-bold text-center text-gray-800">
							Daftar Pegawai Balai Besar <br />
							Karantina Hewan, Ikan & Tumbuhan Kalimantan Timur
						</h2>
					</div>

					{/* Tabel */}
					<div className="border border-gray-200 rounded-lg shadow-sm">
						<table className="table-fixed min-w-full divide-y divide-gray-200">
							{/* Header Tabel */}
							<thead className="bg-gray-200">
								<tr className="text-center">
									<th className="w-10 px-2 py-3 text-center text-sm font-medium text-black tracking-wider">
										No
									</th>
									<th className="w-60 px-2 py-3 text-left text-sm font-medium text-black tracking-wider">
										NAMA
									</th>
									<th className="w-36 px-2 py-3 text-center text-sm font-medium text-black tracking-wider">
										NIP
									</th>
									<th className="w-28 px-2 py-3 text-center text-sm font-medium text-black tracking-wider">
										UNIT KERJA
									</th>
									<th className="w-28 px-2 py-3 text-center text-sm font-medium text-black tracking-wider">
										GOLONGAN
									</th>
									<th className="w-40 px-2 py-3 text-center text-sm font-medium text-black tracking-wider">
										JABATAN STRUKTURAL
									</th>
									<th className="w-40 px-2 py-3 text-center text-sm font-medium text-black tracking-wider">
										JABATAN FUNGSIONAL
									</th>
									<th className="w-10 px-2 py-3 text-center text-sm font-medium text-black tracking-wider">
										AKSI
									</th>
								</tr>
							</thead>

							{/* Body Tabel */}
							<tbody className="bg-white divide-y divide-gray-200">
								{currentItems.map((pegawai, index) => (
									<tr
										key={pegawai.id}
										className={`${
											index % 2 === 0 ? "bg-white" : "bg-gray-50"
										} hover:bg-gray-100`}>
										<td className="px-2 py-3 text-center text-sm font-medium text-gray-900 whitespace-normal">
											{indexOfFirstItem + index + 1}
										</td>
										<td className="px-2 py-4 text-left text-sm text-gray-900 font-medium break-words whitespace-normal">
											{pegawai.nama}
										</td>
										<td className="px-2 py-4 text-center text-sm text-gray-700 break-words whitespace-normal">
											{pegawai.nip}
										</td>
										<td className="px-2 py-4 text-center text-sm text-gray-700 break-words whitespace-normal">
											{pegawai.unitKerja}
										</td>
										<td className="px-2 py-4 text-center text-sm text-gray-700 break-words whitespace-normal">
											{pegawai.golongan}
										</td>
										<td className="px-2 py-4 text-center text-sm text-gray-700 break-words whitespace-normal">
											{pegawai.jabatanStruktural}
										</td>
										<td className="px-2 py-4 text-center text-sm text-gray-700 break-words whitespace-normal">
											{pegawai.jabatanFungsional}
										</td>
										<td className="px-2 py-4 text-center text-sm font-medium relative whitespace-normal">
											<div
												onClick={() =>
													setOpenDropdownIndex(
														openDropdownIndex === index ? null : index
													)
												}
												className="flex justify-center text-gray-400 hover:text-gray-600 focus:outline-none">
												<FaEllipsisV className="h-5 w-5" />

												{/* Dropdown Aksi */}
												{openDropdownIndex === index && (
													<div
														ref={dropdownRef}
														className="absolute right-1 z-20 mt-7 w-24 bg-white border border-gray-300 rounded-md shadow-md text-left">
														<div className="absolute -top-2 right-4 w-3 h-3 bg-white border-t border-l border-gray-300 rotate-45 z-10"></div>
														<div className="py-2 flex flex-col gap-2 px-2">
															<Link
																to={`/detail-pegawai/${pegawai.id}`}
																className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-white bg-blue-500 hover:bg-blue-200 rounded">
																<FaFileAlt />
																<span>Detail</span>
															</Link>
															<Link
																to={`/manajemen-pegawai/edit/${pegawai.id}`}
																className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-200 rounded">
																<FaEdit />
																<span>Edit</span>
															</Link>
															<button
																onClick={() => handleDelete(pegawai.id)}
																className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-white bg-red-500 hover:bg-red-200 rounded cursor-pointer">
																<FaTrash />
																<span>Hapus</span>
															</button>
														</div>
													</div>
												)}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Pagination */}
					<div className="mt-6">
						<Pagination
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={(page) => setCurrentPage(page)}
						/>
					</div>
				</BackgroundItem>
			</div>
		</MainLayout>
	);
};

export default ManajemenPegawai;
