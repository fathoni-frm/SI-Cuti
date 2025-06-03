import React, { useEffect, useState, useRef, useCallback } from "react";
import Spinner from "./Spinner";

// Utility functions
const processHolidayData = (data, currentYear) => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	return Object.entries(data)
		.filter(([date, { holiday }]) => date !== "info" && holiday)
		.map(([date, holidayData]) => {
			const holidayDate = new Date(date);
			holidayDate.setHours(0, 0, 0, 0);

			return {
				date,
				name: holidayData.summary[0],
				isPast: holidayDate < today,
				isToday: holidayDate.getTime() === today.getTime(),
			};
		})
		.filter(({ date }) => new Date(date).getFullYear() === currentYear)
		.sort((a, b) => new Date(a.date) - new Date(b.date));
};

const formatHolidayDate = (dateString) => {
	return new Date(dateString).toLocaleDateString("id-ID", {
		weekday: "long",
		day: "2-digit",
		month: "long",
	});
};

// Holiday Item Component
const HolidayItem = React.memo(({ holiday, itemRef }) => {
	const { date, name, isPast, isToday } = holiday;

	return (
		<div
			ref={itemRef}
			className={`relative pl-2 pb-4 transition-all duration-200 ${
				isPast ? "opacity-80" : ""
			}`}>
			{/* Garis */}
			<div className="absolute -left-1.5 h-full w-0.5 bg-white/30"></div>
			{/* Titik */}
			<div
				className={`absolute left-[-10px] top-1.5 w-2.5 h-2.5 rounded-full ${
					isPast ? "bg-gray-500" : "bg-yellow-500"
				}`}></div>
			{/* Isi */}
			<div className={`${isPast ? "text-gray-300" : "text-white"}`}>
				<p className="font-bold text-sm">
					{formatHolidayDate(date)}
					{isToday && (
						<span className="ml-2 text-xs bg-yellow-400 text-gray-800 px-0.5 rounded">
							HARI INI
						</span>
					)}
				</p>
				<p className="font-light text-sm">{name}</p>
			</div>
		</div>
	);
});

// Main Component
const NationalHolidays = () => {
	const [holidays, setHolidays] = useState([]);
	const [loading, setLoading] = useState(true);
	const currentYear = new Date().getFullYear();
	const todayRef = useRef(null);
	
	const fetchHolidays = useCallback(async () => {
		try {
			const res = await fetch(
				"https://raw.githubusercontent.com/guangrei/APIHariLibur_V2/main/calendar.json"
			);
			const data = await res.json();
			setHolidays(processHolidayData(data, currentYear));
		} catch (error) {
			console.error("Gagal memuat data hari libur:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchHolidays();
	}, [fetchHolidays]);

	useEffect(() => {
		if (!loading && todayRef.current && window.innerWidth >= 1024) {
			const timer = setTimeout(() => {
				todayRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 200);
            return () => clearTimeout(timer);
		}
	}, [loading]);

	const activeIndex = holidays.findIndex(({ isToday, isPast }) => isToday || !isPast);
	
	return (
		<div className="w-full lg:w-[250px] lg:flex-shrink-0 flex flex-col bg-[#1E2D3B]">
			<div className="py-4 text-white h-full flex flex-col">
				<h2 className="text-lg text-center lg:text-left font-bold mb-4 ml-4 flex-shrink-0">
					Libur Nasional
				</h2>

				{loading ? (
					<Spinner />
				) : (
					<div className="flex-1 min-h-0 relative">
						<div className="relative lg:absolute lg:inset-0 lg:overflow-y-auto pl-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
							{holidays.length > 0 ? (
								holidays.map((holiday, index) => (
									<HolidayItem
										key={holiday.date}
										holiday={holiday}
										itemRef={index === activeIndex ? todayRef : null}
									/>
								))
							) : (
								<div className="h-full flex items-center justify-center">
									<p className="text-sm italic">
										Terjadi kesalahan saat memuat data hari libur.
									</p>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default NationalHolidays;
