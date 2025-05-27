import React from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
	const handlePrev = () => {
		if (currentPage > 1) {
			onPageChange(currentPage - 1);
		}
	};

	const handleNext = () => {
		if (currentPage < totalPages) {
			onPageChange(currentPage + 1);
		}
	};

	const renderPageNumbers = () => {
		const pages = [];
		const maxVisiblePages = 3;
		let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
		let endPage = startPage + maxVisiblePages - 1;

		if (endPage > totalPages) {
			endPage = totalPages;
			startPage = Math.max(1, endPage - maxVisiblePages + 1);
		}

		if (startPage > 1) {
			pages.push(
				<button
					key={1}
					onClick={() => onPageChange(1)}
					className="px-2 py-1 text-gray-500 hover:underline cursor-pointer">
					1
				</button>
			);
			if (startPage > 1) {
				pages.push(
					<span key="start-ellipsis" className="px-2">
						...
					</span>
				);
			}
		}

		// Nomor halaman aktif
		for (let i = startPage; i <= endPage; i++) {
			pages.push(
				<button
					key={i}
					onClick={() => onPageChange(i)}
					className={`px-2 py-1 rounded ${
						i === currentPage
							? "text-black font-bold underline "
							: "text-gray-500 font-light"
					} hover:underline cursor-pointer`}>
					{i}
				</button>
			);
		}
		
		if (endPage < totalPages) {
			if (endPage < totalPages) {
				pages.push(
					<span key="end-ellipsis" className="px-2">
						...
					</span>
				);
			}
			pages.push(
				<button
					key={totalPages}
					onClick={() => onPageChange(totalPages)}
					className="px-2 py-1 text-gray-500 hover:underline cursor-pointer">
					{totalPages}
				</button>
			);
		}

		return pages;
	};

	return (
		<div className="flex justify-end items-center mt-4">
			<button
				onClick={handlePrev}
				disabled={currentPage === 1}
				className={`px-3 py-2 rounded mr-2 text-white ${
					currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-gray-500 hover:bg-gray-700 cursor-pointer"
				}`}>
				<FaArrowLeft />
			</button>

			<div className="flex space-x-1">{renderPageNumbers()}</div>

			<button
				onClick={handleNext}
				disabled={currentPage === totalPages}
				className={`px-3 py-2 rounded ml-2 text-white ${
					currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-gray-500 hover:bg-gray-700 cursor-pointer"
				}`}>
				<FaArrowRight />
			</button>
		</div>
	);
};

export default Pagination;