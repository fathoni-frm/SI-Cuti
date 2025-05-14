import React from "react";

const StatusBadge = ({ status }) => {
	let color = "bg-gray-400";
	if (status === "Belum Diproses") color = "bg-yellow-400";
	if (status === "Diproses") color = "bg-blue-400";
	if (status === "Diterima") color = "bg-green-400";
	if (status === "Ditolak") color = "bg-red-400";

	return (
		<span className={`px-2 py-1 text-white rounded ${color}`}>{status}</span>
	);
};

export default StatusBadge;
