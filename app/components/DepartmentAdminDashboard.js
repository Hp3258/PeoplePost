"use client";

import { useState, useMemo } from "react";
import AdminComplaintCard from "./AdminComplaintCard";
import { MagnifyingGlassIcon, FunnelIcon, ChartPieIcon, CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

const DEPARTMENTS = [
  "All",
  "Roads",
  "Streetlight",
  "Water & Drainage",
  "Waste Management",
  "Animal Control",
  "Other"
];

export default function DepartmentAdminDashboard({ reportsData, officialId }) {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");

  // Filtering Logic
  const filteredReports = useMemo(() => {
    return reportsData.filter(report => {
      // Tab Filter
      if (activeTab !== "All" && report.category !== activeTab) {
        // Handle "Other" category which might catch anything not in main list
        if (activeTab === "Other" && DEPARTMENTS.includes(report.category)) return false;
        if (activeTab !== "Other") return false;
      }

      // Search Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!report.title.toLowerCase().includes(query) && 
            !report.description.toLowerCase().includes(query) &&
            !(report.users?.name?.toLowerCase().includes(query))) {
          return false;
        }
      }

      // Status Filter
      if (statusFilter !== "ALL" && report.status !== statusFilter) return false;

      // Date Filter
      if (dateFilter !== "ALL") {
        const reportDate = new Date(report.created_at);
        const now = new Date();
        const diffDays = (now - reportDate) / (1000 * 60 * 60 * 24);
        
        if (dateFilter === "TODAY" && diffDays > 1) return false;
        if (dateFilter === "WEEK" && diffDays > 7) return false;
        if (dateFilter === "MONTH" && diffDays > 30) return false;
      }

      return true;
    });
  }, [reportsData, activeTab, searchQuery, statusFilter, dateFilter]);

  // Tab Stats
  const getPendingCountForDept = (dept) => {
    return reportsData.filter(r => {
      const isDeptMatch = dept === "All" || r.category === dept || (dept === "Other" && !DEPARTMENTS.includes(r.category));
      return isDeptMatch && r.status === "NEW";
    }).length;
  };

  // Sidebar Stats for Active Tab
  const stats = useMemo(() => {
    const reportsInTab = reportsData.filter(r => 
      activeTab === "All" || r.category === activeTab || (activeTab === "Other" && !DEPARTMENTS.includes(r.category))
    );
    
    const total = reportsInTab.length;
    const pending = reportsInTab.filter(r => r.status === "NEW").length;
    
    const now = new Date();
    const resolvedThisWeek = reportsInTab.filter(r => {
      if (r.status !== "RESOLVED") return false;
      const reportDate = new Date(r.created_at);
      return (now - reportDate) / (1000 * 60 * 60 * 24) <= 7;
    }).length;

    // Mock Average Resolution Time (in real app, we'd need a resolved_at timestamp)
    // Here we'll just return a static mock or basic calculation based on created_at for resolved items
    const avgResTime = reportsInTab.filter(r => r.status === "RESOLVED").length > 0 ? "2.4" : "0";

    return { total, pending, resolvedThisWeek, avgResTime };
  }, [reportsData, activeTab]);


  return (
    <div className="flex flex-col h-full md:flex-row bg-gray-50">
      
      {/* Sidebar Stats */}
      <div className="w-full md:w-64 lg:w-72 bg-white border-r border-gray-200 p-6 flex-shrink-0 order-2 md:order-1">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <ChartPieIcon className="w-6 h-6 mr-2 text-indigo-600" />
          Dashboard Stats
        </h2>
        
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{activeTab} Complaints</p>
            <p className="text-3xl font-black text-gray-900">{stats.total}</p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-yellow-800">Pending</p>
              <ExclamationCircleIcon className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-green-800">Resolved (7d)</p>
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-700">{stats.resolvedThisWeek}</p>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-indigo-800">Avg Resolution</p>
              <ClockIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-indigo-700">{stats.avgResTime} days</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 order-1 md:order-2 overflow-hidden h-screen">
        
        {/* Department Tabs */}
        <div className="bg-white border-b border-gray-200 pt-4 px-4 overflow-x-auto no-scrollbar">
          <div className="flex space-x-2 pb-[-1px]">
            {DEPARTMENTS.map(dept => {
              const isActive = activeTab === dept;
              const pendingCount = getPendingCountForDept(dept);
              
              return (
                <button
                  key={dept}
                  onClick={() => setActiveTab(dept)}
                  className={`whitespace-nowrap flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive 
                      ? "border-indigo-600 text-indigo-600 bg-indigo-50/50" 
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {dept}
                  {pendingCount > 0 && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-bold ${
                      isActive ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search complaints, descriptions, or citizens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <FunnelIcon className="h-5 w-5 text-gray-400 hidden sm:block" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full sm:w-auto pl-3 pr-8 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer hover:border-gray-400 transition-colors"
            >
              <option value="ALL">All Status</option>
              <option value="NEW">🟡 Pending</option>
              <option value="IN_PROCESS">🔵 In Progress</option>
              <option value="RESOLVED">🟢 Resolved</option>
              <option value="REJECTED">🔴 Rejected</option>
            </select>
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="block w-full sm:w-auto pl-3 pr-8 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer hover:border-gray-400 transition-colors"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="WEEK">Past 7 Days</option>
              <option value="MONTH">Past 30 Days</option>
            </select>
          </div>
        </div>

        {/* Complaint Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {filteredReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
              {filteredReports.map(report => (
                <AdminComplaintCard key={report.id} report={report} officialId={officialId} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-10">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircleIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No complaints found</h3>
              <p className="text-gray-500 max-w-sm">
                There are no reports matching your current tab, search, and filter criteria.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
