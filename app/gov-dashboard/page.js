import DepartmentAdminDashboard from "../components/DepartmentAdminDashboard";
import { getServerSupabaseClient } from "../data-service/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function GovDashboardPage() {
  const supabase = await getServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: reportsData } = await supabase
    .from("reports")
    .select("*, users(name), upvotes(id)");

  // Sort by upvotes (descending), then by date (newest first)
  const sortedReports = (reportsData || [])
    .map(report => ({
      ...report,
      upvoteCount: report.upvotes ? report.upvotes.length : 0
    }))
    .sort((a, b) => {
      if (b.upvoteCount !== a.upvoteCount) {
        return b.upvoteCount - a.upvoteCount;
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <DepartmentAdminDashboard reportsData={sortedReports} officialId={user?.id} />
    </div>
  );
}
