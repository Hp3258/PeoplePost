import Link from "next/link";

import { ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import ReportCard from "../components/ReportCard";
import LiveReportList from "../components/LiveReportList";
import { getCurrentUserData } from "../data-service/actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AccountPage() {
  const data = await getCurrentUserData();
  const userReports = data?.data;
  const userId = data?.userId;

  const reports = Array.isArray(userReports) ? userReports : [];

  const resolvedCount = reports.filter((r) => r.status === "RESOLVED").length;
  const pendingCount = reports.length - resolvedCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10 fade-in">
        <header className="flex justify-between items-center pb-4">
          <Link
            href="/"
            className="text-lg font-bold text-indigo-600 hover:text-indigo-700 transition-all flex items-center gap-2 group"
          >
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to PeoplePost Home</span>
          </Link>
        </header>

        <header className="border-b-2 border-indigo-100 pb-6 mb-6">
          <h1 className="text-5xl font-black text-gray-900">
            My Reports 📋
          </h1>
          <p className="text-gray-600 mt-3 text-lg">
            Track the status and history of all your reported issues
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-hover bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-2xl shadow-lg border-2 border-indigo-200 group">
            <p className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">Total Reports</p>
            <p className="text-5xl font-black text-indigo-600 mt-3 group-hover:scale-110 transition-transform">
              {reports.length}
            </p>
            <p className="text-xs text-indigo-600 mt-2">All time</p>
          </div>

          <div className="card-hover bg-gradient-to-br from-yellow-50 to-yellow-100 p-8 rounded-2xl shadow-lg border-2 border-yellow-200 group">
            <p className="text-sm font-semibold text-yellow-700 uppercase tracking-wide">
              Pending / In Process
            </p>
            <p className="text-5xl font-black text-yellow-600 mt-3 group-hover:scale-110 transition-transform">
              {pendingCount}
            </p>
            <p className="text-xs text-yellow-600 mt-2">Awaiting resolution</p>
          </div>

          <div className="card-hover bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-lg border-2 border-green-200 group">
            <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">
              Successfully Resolved
            </p>
            <div className="flex items-center gap-3 mt-3">
              <p className="text-5xl font-black text-green-600 group-hover:scale-110 transition-transform">
                {resolvedCount}
              </p>
              <CheckCircleIcon className="w-10 h-10 text-green-500" />
            </div>
            <p className="text-xs text-green-600 mt-2">Issues fixed</p>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-2">
            Report History
            <span className="text-2xl">📜</span>
          </h2>
          <div className="space-y-4">
            {reports.length > 0 ? (
              <LiveReportList initialReports={reports} userId={userId} />
            ) : (
              <div className="p-10 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl text-center border-2 border-dashed border-indigo-200">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-xl font-bold text-gray-900 mb-2">No reports filed yet!</p>
                <p className="text-gray-600 mb-6">
                  Start making a difference by reporting issues in your community
                </p>
                <Link
                  href="/report"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  File Your First Report
                  <span>→</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
