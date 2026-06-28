"use client";

import { useState } from "react";
import { updateReportStatus, reassignDepartment } from "../data-service/actions";
import { MapPinIcon, CalendarIcon, UserIcon, TagIcon } from "@heroicons/react/24/outline";

const DEPARTMENTS = [
  "Roads",
  "Streetlight",
  "Water & Drainage",
  "Waste Management",
  "Animal Control",
  "Other"
];

const STATUS_COLORS = {
  "NEW": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "IN_PROCESS": "bg-blue-100 text-blue-800 border-blue-200",
  "RESOLVED": "bg-green-100 text-green-800 border-green-200",
  "REJECTED": "bg-red-100 text-red-800 border-red-200",
};

const STATUS_LABELS = {
  "NEW": "Pending",
  "IN_PROCESS": "In Progress",
  "RESOLVED": "Resolved",
  "REJECTED": "Rejected",
};

export default function AdminComplaintCard({ report, officialId }) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isReassigning, setIsReassigning] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [newDepartment, setNewDepartment] = useState("");
  const [reason, setReason] = useState("");
  
  const formattedDate = new Date(report.created_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  const citizenName = report.users?.name || "Unknown Citizen";
  const descPreview = report.description.length > 100 
    ? report.description.substring(0, 100) + "..." 
    : report.description;

  const handleStatusUpdate = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === report.status) return;
    
    setIsUpdatingStatus(true);
    await updateReportStatus(report.id, newStatus);
    setIsUpdatingStatus(false);
  };

  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!newDepartment || !reason.trim()) return;
    
    setIsReassigning(true);
    await reassignDepartment(report.id, newDepartment, reason);
    setIsReassigning(false);
    setShowReassignModal(false);
    setNewDepartment("");
    setReason("");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col transition-all hover:shadow-md">
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-900 pr-2">{report.title}</h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            {report.upvoteCount !== undefined && (
              <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200" title="Community Upvotes">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                  <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25m-9 0h1.5" />
                </svg>
                {report.upvoteCount}
              </span>
            )}
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${STATUS_COLORS[report.status] || "bg-gray-100 text-gray-800"}`}>
              {STATUS_LABELS[report.status] || report.status}
            </span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{descPreview}</p>
        
        <div className="grid grid-cols-1 gap-2 text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium text-gray-700">{citizenName}</span>
          </div>
          <div className="flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-start">
            <MapPinIcon className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
            <span className="line-clamp-1" title={report.address}>{report.address || "Location unavailable"}</span>
          </div>
          <div className="flex items-center">
            <TagIcon className="w-4 h-4 mr-2 text-gray-400" />
            <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium border border-indigo-100">
              {report.category || "Unassigned"}
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 border-t border-gray-200 p-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="w-full sm:w-auto">
          <label className="block text-xs font-semibold text-gray-500 mb-1" htmlFor={`status-${report.id}`}>Update Status</label>
          <select 
            id={`status-${report.id}`}
            value={report.status}
            onChange={handleStatusUpdate}
            disabled={isUpdatingStatus}
            className="block w-full text-sm font-medium border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 cursor-pointer hover:border-gray-400 transition-colors"
          >
            <option value="NEW">🟡 Pending</option>
            <option value="IN_PROCESS">🔵 In Progress</option>
            <option value="RESOLVED">🟢 Resolved</option>
            <option value="REJECTED">🔴 Rejected</option>
          </select>
        </div>
        
        <button
          onClick={() => setShowReassignModal(true)}
          className="w-full sm:w-auto text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 hover:border-indigo-400 px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          Re-assign
        </button>
      </div>

      {/* Reassign Modal */}
      {showReassignModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Re-assign Department</h3>
            <form onSubmit={handleReassignSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">New Department</label>
                <select
                  required
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="" disabled>Select department</option>
                  {DEPARTMENTS.filter(d => d !== report.category).map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for change</label>
                <textarea
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why the ML prediction was overridden..."
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                ></textarea>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowReassignModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReassigning}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isReassigning ? "Saving..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
