import React from "react";

const SummaryCards = ({ title, data }) => {
  return (
    <div>
      <p className="text-lg font-semibold">{title}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
        {data.map((item, index) => (
          <div
            key={index}
            className={`flex items-center p-4 rounded-lg shadow-md text-white ${item.bgColor || "bg-gray-500"}`}
          >
            <div className="mr-3 text-4xl">{item.icon}</div>
            <div>
              <p className="text-2xl font-bold">{item.count} <span className="text-2xl">{item.unit}</span></p>
              <p className="text-sm font-semibold">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

};

export default SummaryCards;
