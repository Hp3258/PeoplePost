"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "../data-service/supabaseClient";
import ReportCard from "./ReportCard";
import toast from "react-hot-toast";

export default function LiveReportList({ initialReports, userId }) {
  const [reports, setReports] = useState(initialReports);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to changes on the reports table for this user
    const channel = supabaseClient
      .channel('realtime-reports')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reports',
          filter: `userId=eq.${userId}`,
        },
        (payload) => {
          const updatedReport = payload.new;
          
          setReports((currentReports) => {
            return currentReports.map((report) => {
              if (report.id === updatedReport.id) {
                // Check if status changed to trigger toast
                if (report.status !== updatedReport.status) {
                  if (updatedReport.status === 'RESOLVED') {
                    toast.success(`🎉 Great news! Your report "${updatedReport.title}" has been RESOLVED!`, {
                      duration: 6000,
                      icon: '✅'
                    });
                  } else if (updatedReport.status === 'IN_PROCESS') {
                    toast('Your report is now IN PROCESS. Officials are working on it.', {
                      icon: '👷',
                    });
                  }
                }
                return updatedReport;
              }
              return report;
            });
          });
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [userId]);

  if (reports.length === 0) {
    return null; // Handled by parent
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  );
}
