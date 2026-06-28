"use client";
import { ArrowLeftIcon, MapPinIcon, FunnelIcon } from "@heroicons/react/24/outline";
import ReturnHomeButton from "./ReturnHome";
import StatusBadgeForGov from "./StatusBadgeForGov";
import toast from "react-hot-toast";
import { supabaseClient } from "../data-service/supabaseClient";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import UpvoteButton from "./UpvoteButton";

export default function ReportList({
  selectedIssue,
  setSelectedIssue,
  mock: MOCK_ISSUES,
  setMapCenter,
  mapCenter,
}) {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");

  const handleIssueClick = (issue) => {
    setSelectedIssue(issue);
    if (issue.coords) {
      setMapCenter(issue.coords);
    }
  };

  const handleBackToList = () => {
    setSelectedIssue(null);
  };

  // Filter logic
  const filteredIssues = useMemo(() => {
    let filtered = [...MOCK_ISSUES];

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((issue) => issue.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== "ALL") {
      const now = new Date();
      filtered = filtered.filter((issue) => {
        const issueDate = new Date(issue.submitted_at);
        const diffTime = Math.abs(now - issueDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (dateFilter === "TODAY") {
          return diffDays <= 1;
        } else if (dateFilter === "WEEK") {
          return diffDays <= 7;
        } else if (dateFilter === "MONTH") {
          return diffDays <= 30;
        }
        return true;
      });
    }

    return filtered;
  }, [MOCK_ISSUES, statusFilter, dateFilter]);

  return (
    <div className="w-full md:w-5/12 lg:w-4/12 border-r bg-white flex flex-col md:max-h-screen overflow-hidden">
      {selectedIssue ? (
        <IssueDetailPanel
          setSelectedIssue={setSelectedIssue}
          issue={selectedIssue}
          onBack={handleBackToList}
        />
      ) : (
        <>
          <header className="p-4 border-b sticky top-0 bg-white z-20">
            <div className="flex justify-between items-center mb-3">
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-gray-800">
                  Reports ({filteredIssues.length})
                </h1>
              </div>
              <ReturnHomeButton />
            </div>

            {/* Filter Section */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FunnelIcon className="w-4 h-4" />
                <span className="font-medium">Filters</span>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full text-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="NEW">New</option>
                  <option value="IN_PROCESS">In Process</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Date Range
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full text-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="ALL">All Time</option>
                  <option value="TODAY">Today</option>
                  <option value="WEEK">Last 7 Days</option>
                  <option value="MONTH">Last 30 Days</option>
                </select>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredIssues.length > 0 ? (
              filteredIssues.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => handleIssueClick(issue)}
                  className="p-4 bg-gray-50 border-l-4 border-indigo-600 rounded-lg shadow-sm hover:shadow-md transition duration-150 cursor-pointer space-y-1"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-semibold text-gray-900 truncate pr-2">
                      {issue.title}
                    </h3>
                    <StatusBadgeForGov status={issue.status} />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-indigo-600 font-medium uppercase">
                      {issue.category}
                    </p>
                    <div onClick={(e) => e.stopPropagation()}>
                      <UpvoteButton reportId={issue.id} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-1 text-gray-400" />
                    {issue.address}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="font-medium">No reports found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const IssueDetailPanel = ({ issue, onBack, setSelectedIssue }) => {
  const router = useRouter();
  const [resolutionImages, setResolutionImages] = useState([]);
  const [resolutionImagePreviews, setResolutionImagePreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleStatusUpdate = async (newStatus) => {
    try {
      setIsUploading(true);
      let resolutionImageUrls = [];

      // If marking as RESOLVED and there are resolution images, upload them
      if (newStatus === "RESOLVED" && resolutionImages.length > 0) {
        const { uploadResolutionImages } = await import(
          "../data-service/clientfunctions"
        );
        resolutionImageUrls = await uploadResolutionImages(resolutionImages);
        toast.success("Resolution images uploaded successfully!");
      }

      // Use the server action so that the Resend email is triggered on RESOLVED
      const { updateReportStatus } = await import("../data-service/actions");
      const result = await updateReportStatus(issue.id, newStatus);

      if (result?.error) {
        throw new Error(result.error);
      }

      // If we have resolution images, save them via a separate update
      if (resolutionImageUrls.length > 0) {
        await supabaseClient
          .from("reports")
          .update({ resolutionImageUrls })
          .eq("id", issue.id);
      }

      setSelectedIssue(null);
      router.refresh();
      toast.success(`Status changed to ${newStatus}`);
    } catch (error) {
      console.error("Full error:", error);
      const errorMessage = error?.message || "Failed to update status. Please try again.";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleResolutionImageChange = (e) => {
    const newFiles = Array.from(e.target.files);

    if (resolutionImages.length >= 5) {
      toast.error("Maximum of 5 resolution images allowed.");
      return;
    }

    let filesToAdd = [];
    let imageUrlsToAdd = [];

    const remainingSlots = 5 - resolutionImages.length;

    for (let i = 0; i < newFiles.length && i < remainingSlots; i++) {
      const file = newFiles[i];
      filesToAdd.push(file);
      imageUrlsToAdd.push(URL.createObjectURL(file));
    }

    if (newFiles.length > remainingSlots) {
      toast.error(`Only ${remainingSlots} more images could be added.`);
    }

    setResolutionImages((prev) => [...prev, ...filesToAdd]);
    setResolutionImagePreviews((prev) => [...prev, ...imageUrlsToAdd]);

    e.target.value = null;
  };

  const removeResolutionImage = (indexToRemove) => {
    URL.revokeObjectURL(resolutionImagePreviews[indexToRemove]);
    setResolutionImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setResolutionImagePreviews((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  return (
    <div className="p-6 h-full bg-white flex flex-col">
      <div className="flex items-center space-x-4 border-b pb-4 mb-4">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-indigo-600 transition"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 truncate">
          Issue #{issue.id} Details
        </h2>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pr-2">
        {" "}
        <div className="p-3 bg-indigo-50 rounded-lg border-l-4 border-indigo-600">
          <h3 className="font-semibold text-xl text-indigo-800 mb-1">
            {issue.title}
          </h3>
          <div className="flex items-center space-x-3">
            <StatusBadgeForGov status={issue.status} />
            <span className="text-sm text-gray-500">
              Filed: {issue.submitted_at}
            </span>
          </div>
        </div>
        <div className="p-4 bg-white rounded-lg border shadow-sm">
          <p className="font-semibold text-gray-700 flex items-center mb-1">
            <MapPinIcon className="w-4 h-4 mr-1 text-indigo-600" />
            Location: {issue.address}
          </p>
          <p className="text-sm text-gray-500">Category: {issue.category}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">
            Detailed Description
          </h3>
          <p className="text-gray-600 bg-gray-50 p-3 rounded-md text-sm">
            {issue.description}
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">
            Reported Images ({(issue.imageUrls || []).length})
          </h3>
          {(issue.imageUrls || []).length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {(issue.imageUrls || []).map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Issue photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg shadow-md"
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm italic">
              No images attached by the reporter.
            </p>
          )}
        </div>

        {/* Resolution Images Display */}
        {issue.resolutionImageUrls && issue.resolutionImageUrls.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Resolution Proof Images ({issue.resolutionImageUrls.length})
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {issue.resolutionImageUrls.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Resolution proof ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg shadow-md border-2 border-green-500"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
        <h3 className="font-bold text-lg">Management Actions</h3>

        {/* Resolution Proof Image Upload */}
        {issue.status !== "RESOLVED" && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              📸 Resolution Proof Images (Optional - {resolutionImages.length}
              /5)
            </label>
            <p className="text-xs text-gray-600 mb-3">
              Upload images as proof when marking this issue as resolved
            </p>

            <div
              className={`relative border-2 border-dashed p-4 rounded-lg text-center transition ${resolutionImages.length >= 5
                ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                : "border-green-400 bg-green-50 hover:bg-green-100 cursor-pointer"
                }`}
            >
              <input
                type="file"
                multiple
                disabled={resolutionImages.length >= 5}
                onChange={handleResolutionImageChange}
                accept="image/jpeg,image/png,image/jpg"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <p className="text-sm text-gray-600 font-medium">
                {resolutionImages.length >= 5
                  ? "Maximum 5 images reached"
                  : "Click to upload resolution proof images"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPEG, PNG only. Max 5 files.
              </p>
            </div>

            {/* Resolution Image Previews */}
            {resolutionImagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {resolutionImagePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative w-20 h-20 rounded-lg overflow-hidden shadow-md"
                  >
                    <img
                      src={preview}
                      alt={`Resolution preview ${index}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeResolutionImage(index)}
                      className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-bl-lg hover:bg-red-700 transition text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Status Update Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => handleStatusUpdate("IN_PROCESS")}
            className="flex-1 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition disabled:opacity-50"
            disabled={
              issue.status === "RESOLVED" ||
              issue.status === "IN_PROCESS" ||
              isUploading
            }
          >
            {isUploading ? "Updating..." : "Mark IN PROCESS"}
          </button>
          <button
            onClick={() => handleStatusUpdate("RESOLVED")}
            className="flex-1 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            disabled={issue.status === "RESOLVED" || isUploading}
          >
            {isUploading ? "Uploading..." : "Mark RESOLVED"}
          </button>
        </div>
      </div>
    </div>
  );
};
