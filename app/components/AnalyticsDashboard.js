"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function AnalyticsDashboard({ issues }) {
  // Aggregate data for charts
  const categoryData = useMemo(() => {
    const counts = issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map((key) => ({
      name: key,
      value: counts[key],
    }));
  }, [issues]);

  const statusData = useMemo(() => {
    const counts = issues.reduce((acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1;
      return acc;
    }, {});
    return [
      { name: "NEW", count: counts["NEW"] || 0 },
      { name: "IN PROCESS", count: counts["IN_PROCESS"] || 0 },
      { name: "RESOLVED", count: counts["RESOLVED"] || 0 },
    ];
  }, [issues]);

  const severityData = useMemo(() => {
    const counts = issues.reduce((acc, issue) => {
      const sev = issue.severity || "Unknown";
      acc[sev] = (acc[sev] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map((key) => ({
      name: key,
      count: counts[key],
    }));
  }, [issues]);

  const resolvedCount = issues.filter(i => i.status === "RESOLVED").length;
  const resolutionRate = issues.length > 0 ? Math.round((resolvedCount / issues.length) * 100) : 0;

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50 w-full">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">City Analytics Overview</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-semibold text-gray-500 uppercase">Total Reports</p>
          <p className="text-4xl font-black text-indigo-600 mt-2">{issues.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-semibold text-gray-500 uppercase">Resolution Rate</p>
          <p className="text-4xl font-black text-green-500 mt-2">{resolutionRate}%</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-semibold text-gray-500 uppercase">Pending Issues</p>
          <p className="text-4xl font-black text-yellow-500 mt-2">{issues.length - resolvedCount}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Category Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Issues by Category</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Status Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Issues by Status</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Severity Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-4">AI-Predicted Severity Levels</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={severityData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
