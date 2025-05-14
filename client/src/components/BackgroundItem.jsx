import React from "react";

const BackgroundItem = ({ title, icon, marginX = true, marginY = true, children }) => {
	return (
		<div className="bg-white rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg">
			{/* Tampilkan title hanya jika tersedia */}
			{title && (
				<div className="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-4 rounded-t-xl border-b border-gray-200">
					<h2 className="text-lg font-semibold text-white flex items-center gap-3">
						{icon && <span className="text-2xl">{icon}</span>} {title}
					</h2>
				</div>
			)}
			<div className={`text-gray-700 ${marginX && `mx-7`} ${marginY && `my-7`}`}>{children}</div>
		</div>
	);
};

export default BackgroundItem;
