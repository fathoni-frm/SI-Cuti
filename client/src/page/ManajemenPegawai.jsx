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
			<div className="p-4 sm:p-6 w-full">
				{/* Title */}
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
					<h1 className="text-center sm:text-left text-xl lg:text-2xl font-bold text-gray-800">
						Manajemen Pegawai
					</h1>
					<button
						onClick={() => navigate("/manajemen-pegawai/tambah")}
						className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center sm:justify-start gap-2 cursor-pointer transition-colors duration-150 w-full sm:w-auto text-sm sm:text-base">
						<FaPlus /> Tambah Pegawai
					</button>
				</div>

				{/* Detail Section */}
				<BackgroundItem>
					<div className="p-4 sm:p-6">
						{/* Header dengan ikon */}
						<div className="flex items-center justify-center mb-4">
							<h2 className="text-xl lg:text-2xl font-bold text-center text-gray-800">
								Daftar Pegawai Balai Besar <br />
								Karantina Hewan, Ikan & Tumbuhan Kalimantan Timur
							</h2>
						</div>

						{/* Tabel */}
						<div className="flex border border-gray-200 rounded-lg shadow-sm overflow-x-auto max-w-full">
							<table className="table-fixed min-w-full divide-y divide-gray-200 shrink-0 grow-0">
								{/* Header Tabel */}
								<thead className="bg-gray-200">
									<tr className="text-sm text-black tracking-wider">
										<th className="w-[35px] px-2 py-2">NO</th>
										<th className="w-[230px] px-2 py-2 text-left">NAMA</th>
										<th className="w-[100px] px-2 py-2">NIP</th>
										<th className="w-[100px] px-2 py-2">UNIT KERJA</th>
										<th className="w-[100px] px-2 py-2">GOLONGAN</th>
										<th className="w-[150px] px-2 py-2">JABATAN STRUKTURAL</th>
										<th className="w-[150px] px-2 py-2">JABATAN FUNGSIONAL</th>
										<th className="w-[40px] px-2 py-2">AKSI</th>
									</tr>
								</thead>

								{/* Body Tabel */}
								<tbody className="bg-white divide-y divide-gray-200">
									{currentItems.map((pegawai, index) => (
										<tr
											key={pegawai.id}
											className={`text-sm text-gray-700 text-center ${
												index % 2 === 0 ? "bg-white" : "bg-gray-50"
											} hover:bg-gray-100`}>
											<td className="px-2 py-2 font-medium text-black break-words whitespace-normal">
												{indexOfFirstItem + index + 1}
											</td>
											<td className="px-2 py-2 text-left font-medium text-black break-words whitespace-normal">
												{pegawai.nama}
											</td>
											<td className="px-2 py-2 break-words whitespace-normal">
												{pegawai.nip}
											</td>
											<td className="px-2 py-2 break-words whitespace-normal">
												{pegawai.unitKerja}
											</td>
											<td className="px-2 py-2 break-words whitespace-normal">
												{pegawai.golongan}
											</td>
											<td className="px-2 py-2 break-words whitespace-normal">
												{pegawai.jabatanStruktural}
											</td>
											<td className="px-2 py-2 break-words whitespace-normal">
												{pegawai.jabatanFungsional}
											</td>
											<td className="px-2 py-2 font-medium relative whitespace-normal">
												<div
													onClick={() =>
														setOpenDropdownIndex(
															openDropdownIndex === index ? null : index
														)
													}
													className="flex justify-center text-gray-500 hover:text-gray-300 cursor-pointer">
													<FaEllipsisV className="h-5 w-5" />

													{/* Dropdown Aksi */}
													{openDropdownIndex === index && (
														<div
															ref={dropdownRef}
															className={`absolute z-20 ${
																index >= currentItems.length - 2
																	? "bottom-full -mb-4"
																	: "top-full -mt-6"
															} right-1 w-24 bg-white border border-gray-300 rounded-md shadow-md text-left`}>
															<div
																className={`absolute ${
																	index >= currentItems.length - 2
																		? "-bottom-1.5 border-b border-r"
																		: "-top-1.5 border-t border-l"
																} right-4 w-3 h-3 bg-white border-gray-300 rotate-45 z-10`}></div>
															<div className="py-2.5 flex flex-col gap-1.5 px-2">
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
					</div>
				</BackgroundItem>
			</div>
		</MainLayout>
	);
};

export default ManajemenPegawai;
