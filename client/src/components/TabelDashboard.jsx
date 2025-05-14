import React from "react";

const TabelDashboard = ({ status }) => {
	return (
		<div className="bg-white p-4 rounded-lg shadow-md mt-4">
			<h2 className="text-lg font-bold">{status}</h2>
			<table className="w-full mt-2 border-collapse border border-gray-300">
				<thead>
					<tr className="bg-gray-200">
						<th className="border p-2">No</th>
						<th className="border p-2">Tanggal Pengajuan</th>
						<th className="border p-2">Nama Pemohon</th>
						<th className="border p-2">Jenis Cuti</th>
						<th className="border p-2">Mulai</th>
						<th className="border p-2">Akhir</th>
						<th className="border p-2">Status</th>
						<th className="border p-2">Action</th>
					</tr>
				</thead>
				<tbody>
					<tr className="text-center">
						<td className="border p-2">1</td>
						<td className="border p-2">Text</td>
						<td className="border p-2">Text</td>
						<td className="border p-2">Text</td>
						<td className="border p-2">Text</td>
						<td className="border p-2">Text</td>
						<td className="border p-2">
							<span className="px-2 py-1 text-white rounded-md bg-gray-400">
								Text
							</span>
						</td>
						<td className="border p-2">...</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
};

export default TabelDashboard;
