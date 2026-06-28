"use client";
import { useState } from "react";
import StatusBadge from "./StatusBadge";
import { ClockIcon, MapPinIcon, XMarkIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";

import UpvoteButton from "./UpvoteButton";

export default function ReportCard({ report }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="block bg-white p-4 rounded-xl shadow-md transition duration-150 hover:shadow-lg hover:ring-2 ring-indigo-500/50 cursor-pointer relative"
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 truncate pr-4">
            {report.title}
          </h3>
          <StatusBadge status={report.status} />
        </div>

        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-indigo-600 font-medium uppercase">
            {report.category}
          </p>
          <div onClick={(e) => e.stopPropagation()}>
            <UpvoteButton reportId={report.id} />
          </div>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center">
            <MapPinIcon className="w-4 h-4 mr-1 text-gray-400" />
            <span>Location: {report.address}</span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 mr-1 text-gray-400" />
            <span>Reported: {new Date(report.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
          </div>
        </div>

        {report.status === "RESOLVED" && report.resolutionImageUrls && report.resolutionImageUrls.length > 0 && (
          <div className="mt-2 flex items-center text-xs text-green-600 font-medium">
            <CheckBadgeIcon className="w-4 h-4 mr-1" />
            <span>Resolution proof available</span>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Report Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Title and Status */}
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {report.title}
                  </h3>
                  <StatusBadge status={report.status} />
                </div>
                <p className="text-sm text-indigo-600 font-medium uppercase">
                  {report.category}
                </p>
              </div>

              {/* Location and Date */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center text-sm text-gray-700">
                  <MapPinIcon className="w-5 h-5 mr-2 text-gray-500" />
                  <span><strong>Location:</strong> {report.address}</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <ClockIcon className="w-5 h-5 mr-2 text-gray-500" />
                  <span><strong>Reported:</strong> {new Date(report.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                  {report.description || "No description provided"}
                </p>
              </div>

              {/* Reported Images */}
              {report.imageUrls && report.imageUrls.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Reported Images ({report.imageUrls.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {report.imageUrls.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Report image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg shadow-md"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Resolution Proof Images */}
              {report.status === "RESOLVED" && report.resolutionImageUrls && report.resolutionImageUrls.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                  <div className="flex items-center mb-3">
                    <CheckBadgeIcon className="w-6 h-6 text-green-600 mr-2" />
                    <h4 className="font-semibold text-green-800">
                      Resolution Proof Images ({report.resolutionImageUrls.length})
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {report.resolutionImageUrls.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Resolution proof ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg shadow-md border-2 border-green-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-green-700 mt-3 font-medium">
                    ✅ This issue has been resolved by the authorities
                  </p>
                </div>
              )}

              {/* No Resolution Images Message */}
              {report.status === "RESOLVED" && (!report.resolutionImageUrls || report.resolutionImageUrls.length === 0) && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-green-700 font-medium">
                    ✅ This issue has been marked as resolved
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
