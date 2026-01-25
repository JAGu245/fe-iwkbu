"use client";

import { useEffect, useState } from "react";
import MemastikanData from "./memastikan-data";

const DataQuadranDashboard = () => {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formattedDate = now.toLocaleDateString("id-ID");
      const formattedTime = now.toLocaleTimeString("id-ID", {
        hour12: false,
      });
      setCurrentTime(`${formattedDate} ${formattedTime}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    setDateRange({ start, end });
  };

  // Get current month dates as default
  const getDefaultDateRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: firstDay,
      end: lastDay,
    };
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-900 text-white py-4 px-4 md:px-8">
        <h1 className="text-xl md:text-3xl font-bold text-center uppercase leading-tight">
          DASHBOAR DATA QUADRAN
        </h1>
        <p className="text-sm md:text-base text-center mt-1 font-semibold text-white">
          CLOSING TIME | {currentTime} | JR JATENG
        </p>
      </div>

      {/* Sub Header */}
      <div className="bg-white py-4 px-4 md:px-8 border-b border-gray-200">
        <h2 className="text-base md:text-lg font-bold text-black text-center uppercase tracking-wide">
          Analisis Kinerja Cabang Berdasarkan Quadran{" "}
          {dateRange.start && dateRange.end
            ? `${formatDisplayDate(dateRange.start)} s.d. ${formatDisplayDate(
                dateRange.end
              )}`
            : `${formatDisplayDate(
                getDefaultDateRange().start
              )} s.d. ${formatDisplayDate(getDefaultDateRange().end)}`}
        </h2>
      </div>

      {/* Rekap Section */}
      <div className="px-4 md:px-8 py-6">
        <MemastikanData
          onDateRangeChange={handleDateRangeChange}
          startDate={null}
          endDate={null}
        />
      </div>
    </div>
  );
};

export default DataQuadranDashboard;
