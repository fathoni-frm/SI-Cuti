import React from "react";

const SummaryCards = ({ title, data }) => {
  return (
    <div>
      <p className="text-lg">{title}</p>
      <div className="flex flex-wrap gap-4 mt-2">
        {data.map((item, index) => (
          <div
            key={index}
            className={`flex items-center p-4 rounded-lg shadow-md w-78 text-white ${item.bgColor || "bg-[#d4c5b1]"}`}
          >
            <div className="mr-4">{item.icon}</div>
            <div>
              <p className="text-md">{item.count} {item.unit}</p>
              <p className="text-lg font-semibold">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummaryCards;
