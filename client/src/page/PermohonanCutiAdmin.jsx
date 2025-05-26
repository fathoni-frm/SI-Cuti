import React, { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import axios from "../api/axios";
import { formatGMT8 } from "../schemas/timeFormatter";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import MainLayout from "../Layouts/MainLayout";
import TabelPermohonan from "../components/TabelPermohonan";
import BackgroundItem from "../components/BackgroundItem";
import { LuDownload } from "react-icons/lu";

const PermohonanCutiAdmin = () => {
	const { user, accessToken } = useAuthStore();
	const MySwal = withReactContent(Swal);
	const [data, setData] = useState([]);


	const exportToExcel = async () => {
		const { value: formValues } = await MySwal.fire({
			title: "Filter Ekspor Data Cuti",
			html: (
				<div className="space-y-4">
					<div>
						<label
							htmlFor="tahun"
							className="block text-sm font-medium text-gray-700 mb-1">
							Tahun Pengajuan
						</label>
						<input
							id="tahun"
							type="number"
							className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Contoh: 2025"
							min="2000"
							max="2100"
						/>
					</div>

					<div>
						<label
							htmlFor="status"
							className="block text-sm font-medium text-gray-700 mb-1">
							Status Pengajuan
						</label>
						<select
							id="status"
							className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
							<option hidden>Pilih Status</option>
							<option value="">Semua Status</option>
							<option value="Disetujui">Disetujui</option>
							<option value="Ditolak">Ditolak</option>
							<option value="Dibatalkan">Dibatalkan</option>
						</select>
					</div>
				</div>
			),
			focusConfirm: false,
			showCancelButton: true,
			confirmButtonText: "Ekspor",
			cancelButtonText: "Batal",
			preConfirm: () => {
				const tahun = document.getElementById("tahun").value;
				const status = document.getElementById("status").value;

				if (!tahun) {
					Swal.showValidationMessage("Isi tahun pengajuan cuti");
					return false;
				}

				if (tahun) {
					const tahunNum = parseInt(tahun);
					if (isNaN(tahunNum) || tahunNum < 2000 || tahunNum > 2100) {
						Swal.showValidationMessage("Tahun harus angka (2000-2100)");
						return false;
					}
				}

				if (
					status !== "" &&
					status !== "Disetujui" &&
					status !== "Ditolak" &&
					status !== "Dibatalkan"
				) {
					Swal.showValidationMessage("Pilih status pengajuan cuti");
					return false;
				}

				return { tahun, status };
			},
		});

		if (!formValues) return;

		try {
			const { tahun, status } = formValues;

			const filteredData = data.filter((item) => {
				const tanggal = item.tanggalPengajuan
				? new Date(item.tanggalPengajuan)
				: null;
				const year =
				tanggal instanceof Date && !isNaN(tanggal)
				? tanggal.getFullYear().toString()
				: "";
				
				const yearMatch = tahun ? year === tahun : true;
				const statusMatch = status ? item.status === status : true;
				
				return yearMatch && statusMatch;
			});
			
			if (filteredData.length === 0) {
				return Swal.fire(
					"Tidak Ada Data",
					"Sepertinya tidak ada data pada tahun tersebut.",
					"warning"
				);
			}

			const dataCuti = filteredData.map((item, index) => ({
				No: index + 1,
				"Tanggal Pengajuan": formatGMT8(item.tanggalPengajuan),
				"Nama Pegawai": item.Pegawai.nama,
				"NIP Pegawai": item.Pegawai.nip,
				"Jenis Cuti": item.jenisCuti,
				"Tanggal Mulai": formatGMT8(item.tanggalMulai, { showTime: false }),
				"Tanggal Selesai": formatGMT8(item.tanggalSelesai, { showTime: false }),
				"Kuota Cuti": item.totalKuota,
				"Sisa Kuota Cuti": item.sisaKuota,
				"Status Cuti": item.status,
				"Alamat Cuti": item.alamatCuti,
				"Alasan Cuti": item.alasanCuti,
				"Nama Penerima Tugas": item.PenerimaTugas?.nama || "-",
				"NIP Penerima Tugas": item.PenerimaTugas?.nip || "-",
			}));

			const worksheet = XLSX.utils.json_to_sheet(dataCuti);
			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet, "Data Cuti");

			const fileName = ["Disetujui", "Ditolak", "Dibatalkan"].includes(status)
				? `Data Cuti_${status}_Tahun ${tahun} - ${formatGMT8(
						new Date().toISOString().slice(0, 10),
						{ showTime: false }
				  )}.xlsx`
				: `Data Cuti_Tahun ${tahun} - ${formatGMT8(
						new Date().toISOString().slice(0, 10),
						{ showTime: false }
				  )}.xlsx`;
			XLSX.writeFile(workbook, fileName);
		} catch (error) {
			console.error(error);
			Swal.fire("Gagal", "Terjadi kesalahan saat mengekspor data.", "error");
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axios.get("/permohonan-cuti");
				setData(res.data);
			} catch (err) {
				console.error("Gagal memuat data permohonan cuti:", err);
			}
		};

		fetchData();
	}, [accessToken]);

	return (
		<MainLayout role={user.role}>
			<div className="p-6 w-full">
				<div className="flex justify-between mb-4">
					<h1 className="text-2xl font-bold">Permohonan Cuti</h1>
					<button
						onClick={() => exportToExcel()}
						className="bg-[#2c3e50] text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
						<LuDownload className="text-xl text-white" /> Ekspor Data
					</button>
				</div>
				<BackgroundItem>
					<h2 className="text-2xl font-bold mb-5 text-center">
						Daftar Permohonan Cuti
					</h2>
					<TabelPermohonan
						data={data}
						showQuota={true}
						showPagination={true}
						lihat={false}
					/>
				</BackgroundItem>
			</div>
		</MainLayout>
	);
};

export default PermohonanCutiAdmin;
