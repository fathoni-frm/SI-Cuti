import React, { useState, forwardRef, useImperativeHandle } from "react";

const TabelKuotaCuti = forwardRef(({ data = [], isEditing = false, roundedTop = false }, ref) => {
	const [editedKuota, setEditedKuota] = useState({});

	useImperativeHandle(ref, () => ({
		getKuotaCutiData: () => {
			// Gabungkan item asli dengan data yang diedit
			return data.map((item) => ({
				...item,
				totalKuota: editedKuota[item.id]?.totalKuota ?? item.totalKuota,
				sisaKuota: editedKuota[item.id]?.sisaKuota ?? item.sisaKuota,
			}));
		},
	}));

	const getTahunByJenisCuti = (jenisCuti) => {
		const currentYear = new Date().getFullYear();
		switch (jenisCuti) {
			case "Cuti Tahunan":
				return currentYear;
			case "Cuti Tahunan N-1":
				return currentYear - 1;
			case "Cuti Tahunan N-2":
				return currentYear - 2;
			default:
				return "-";
		}
	};

	const getTanggalBerlaku = (jenisCuti) => {
		const currentYear = new Date().getFullYear();
		switch (jenisCuti) {
			case "Cuti Besar":
				return `1 Januari ${currentYear}`;
			case "Cuti Tahunan":
				return `1 Januari ${currentYear}`;
			case "Cuti Tahunan N-1":
				return `1 Januari ${currentYear - 1}`;
			case "Cuti Tahunan N-2":
				return `1 Januari ${currentYear - 2}`;
			default:
				return "-";
		}
	};

	const getTanggalBerakhir = (jenisCuti) => {
		const currentYear = new Date().getFullYear();
		switch (jenisCuti) {
			case "Cuti Besar":
				return `30 Desember ${currentYear}`;
			case "Cuti Tahunan":
				return `30 Desember ${currentYear + 2}`;
			case "Cuti Tahunan N-1":
				return `30 Desember ${currentYear + 1}`;
			case "Cuti Tahunan N-2":
				return `30 Desember ${currentYear}`;
			default:
				return "-";
		}
	};

	const handleInputChange = (idKuota, field, value) => {
		setEditedKuota((prev) => ({
			...prev,
			[idKuota]: {
				...prev[idKuota],
				[field]: value,
			},
		}));
	};

	if (!data.length) {
		return <p className="text-center mt-2">Tidak ada data kuota cuti.</p>;
	}

	return (
		<div className={`flex border border-gray-200 shadow-sm overflow-x-auto max-w-full ${roundedTop ? 'rounded-t-lg' : ''} rounded-b-lg`}>
		  <table className="table-fixed min-w-full divide-y divide-gray-200 shrink-0 grow-0">
			{/* Header */}
			<thead className="bg-gray-200">
			  <tr className="text-sm text-black uppercase tracking-wider">
				<th className="w-[280px] pl-3 px-1 py-2 text-left">
				  Jenis Cuti
				</th>
				<th className="px-1 py-2">
				  Periode
				</th>
				<th className="px-1 py-2">
				  Tanggal Berlaku
				</th>
				<th className="px-1 py-2">
				  Tanggal Berakhir
				</th>
				<th className="px-1 py-2">
				  Kuota
				</th>
				<th className="px-1 py-2">
				  Sisa Kuota
				</th>
			  </tr>
			</thead>
	  
			{/* Body */}
			<tbody className="divide-y divide-gray-200">
			  {data.map((item, index) => (
				<tr key={item.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} whitespace-nowrap text-sm text-gray-700 hover:bg-gray-100`}>
				  <td className="pl-3 py-3">
					{item.jenisCuti}
				  </td>
				  <td className="py-3 text-center">
					{getTahunByJenisCuti(item.jenisCuti)}
				  </td>
				  <td className="py-3 text-center">
					{getTanggalBerlaku(item.jenisCuti)}
				  </td>
				  <td className="py-3 text-center">
					{getTanggalBerakhir(item.jenisCuti)}
				  </td>
				  <td className="py-3 text-center">
					{isEditing ? (
					  <input
						type="number"
						min={0}
						value={editedKuota[item.id]?.totalKuota ?? item.totalKuota}
						onChange={(e) =>
						  handleInputChange(item.id, "totalKuota", e.target.value)
						}
						className="w-20 px-2 py-1 text-center border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
					  />
					) : (
					  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
						{item.totalKuota} hari
					  </span>
					)}
				  </td>
				  <td className="py-3 text-center">
					{isEditing ? (
					  <input
						type="number"
						min={0}
						value={editedKuota[item.id]?.sisaKuota ?? item.sisaKuota}
						onChange={(e) =>
						  handleInputChange(item.id, "sisaKuota", e.target.value)
						}
						className="w-20 px-2 py-1 text-center border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
					  />
					) : (
					  <span
						className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
						  item.sisaKuota > 3
							? "bg-green-100 text-green-800"
							: item.sisaKuota > 0
							? "bg-yellow-100 text-yellow-800"
							: "bg-red-100 text-red-800"
						}`}
					  >
						{item.sisaKuota} hari
					  </span>
					)}
				  </td>
				</tr>
			  ))}
			</tbody>
		  </table>
		</div>
	  );
});

export default TabelKuotaCuti;
