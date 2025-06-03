import React from "react";

const BackgroundItem = ({ title, icon, children }) => {
	return (
		<div className="bg-white rounded-md shadow-md border border-gray-100 transition-all hover:shadow-lg">
			{title && (
				<div className="bg-gradient-to-r from-gray-500 to-gray-600 px-4 sm:px-6 py-3 rounded-t-md border-b border-gray-200">
					<h2 className="text-lg font-semibold text-white flex items-center gap-3">
						{icon && <span className="text-2xl">{icon}</span>} {title}
					</h2>
				</div>
			)}
			<div className="text-gray-700 rounded-b-md">{children}</div>
		</div>
	);
};

export default BackgroundItem;
