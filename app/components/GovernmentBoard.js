"use client";
import { useState } from "react";
import ReportList from "./ReportList";
import dynamic from "next/dynamic";
import AnalyticsDashboard from "./AnalyticsDashboard";
import { ChartBarIcon, MapIcon } from "@heroicons/react/24/outline";

const Map = dynamic(() => import("../components/Map"), { ssr: false });

export default function GovermentBoard({ data }) {
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 19.83, lng: 75.33 }); // Default to India/Aurangabad
  const [viewMode, setViewMode] = useState("map"); // "map" or "analytics"

  // Map backend data to frontend model
  const issues = (data?.data ?? []).map((item) => {
    const {
      id,
      created_at,
      description,
      title,
      address,
      status,
      imageUrls,
      category,
      severity,
      lat,
      lng,
    } = item;
    const coords = { lat, lng };
    return {
      id,
      submitted_at: created_at,
      description,
      address,
      title,
      images: imageUrls,
      status,
      category,
      severity,
      coords,
    };
  });

  return (
    <>
      <ReportList
        selectedIssue={selectedIssue}
        setSelectedIssue={setSelectedIssue}
        mock={issues} // 'mock' is now real database data
        mapCenter={mapCenter}
        setMapCenter={setMapCenter}
      />

      <div className="w-full md:w-7/12 lg:w-8/12 bg-gray-100 relative flex flex-col h-screen">
        
        {/* Toggle Bar */}
        <div className="bg-white border-b flex p-2 justify-end shadow-sm z-10">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center px-4 py-2 rounded-md transition ${viewMode === "map" ? "bg-white shadow-sm font-semibold text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              <MapIcon className="w-5 h-5 mr-2" />
              Live Map
            </button>
            <button
              onClick={() => setViewMode("analytics")}
              className={`flex items-center px-4 py-2 rounded-md transition ${viewMode === "analytics" ? "bg-white shadow-sm font-semibold text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              <ChartBarIcon className="w-5 h-5 mr-2" />
              Analytics
            </button>
          </div>
        </div>

        {/* View Area */}
        <div className="flex-1 relative overflow-hidden">
          {viewMode === "map" ? (
            <Map
              mock={issues}
              position={mapCenter}
              setPosition={setMapCenter}
              selectedIssue={selectedIssue}
            />
          ) : (
            <AnalyticsDashboard issues={issues} />
          )}
        </div>
      </div>
    </>
  );
}
