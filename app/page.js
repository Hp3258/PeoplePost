import Link from "next/link";
import StatusBadge from "./components/StatusBadge";
import { getServerSupabaseClient } from "./data-service/supabaseServer";
import { getReports, signout } from "./data-service/actions";
import { getServerSupabaseClientReadyOnly } from "./data-service/supabaseReadOnly";

let LATEST_REPORTS = [
  {
    id: 1,
    title: "Large Pothole on Main St.",
    status: "NEW",
    time: "2 hours ago",
    location: "Downtown",
    imageUrl: "/images/pothole_placeholder.jpg",
  },
  {
    id: 2,
    title: "Overflowing Dumpster on Elm",
    status: "IN_PROCESS",
    time: "15 minutes ago",
    location: "North End",
    imageUrl: "/images/garbage_placeholder.jpg",
  },
  {
    id: 3,
    title: "Streetlight Out Near Park",
    status: "RESOLVED",
    time: "Yesterday",
    location: "West Side",
    imageUrl: "/images/streetlight_placeholder.jpg",
  },
];

const STATS = [
  { value: "1,500+", label: "Problems Reported", color: "indigo" },
  { value: "92%", label: "Issues Successfully Resolved", color: "green" },
  { value: "2.1 Days", label: "Average Resolution Time", color: "yellow" },
];

export default async function page() {
  const supabase = await getServerSupabaseClientReadyOnly();
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email;
  const reports = await getReports();
  const latestReports = user && reports?.length ? reports : LATEST_REPORTS;

  let userRole = null;
  let name = "Guest";
  let isLoggedIn = !!user;

  if (user) {
    const { data, error } = await supabase
      .from("users")
      .select("name,role")
      .eq("email", email)
      .single();

    if (data) {
      console.log(data);
      userRole = data.role || "citizen";
      name = data.name || email.split("@")[0];

      name = name.charAt(0).toUpperCase() + name.slice(1);
    } else {
      name = email.split("@")[0];
      name = name.charAt(0).toUpperCase() + name.slice(1);
      userRole = "citizen";
    }
  }

  const reportLink = !user
    ? "/login"
    : userRole === "official"
      ? "/gov-dashboard"
      : "/report";
  const reportButtonText =
    userRole === "official" ? "Go to Dashboard" : "Report a New Problem";
  const userDashboardLink = userRole === "official" ? "/dashboard" : "/account";

  const NavLinks = () => {
    if (isLoggedIn) {
      // For citizens, show "My Reports", for officials show their name
      const buttonText = userRole === "citizen" ? "My Reports 📋" : name || "Dashboard";

      return (
        <div className="flex space-x-4 items-center">
          <Link
            href={userDashboardLink}
            className="text-white bg-indigo-600 hover:bg-indigo-700 font-medium py-2 px-4 rounded-lg transition duration-150"
          >
            {buttonText}
          </Link>

          <form action={signout}>
            <button
              type="submit"
              className="text-gray-600 hover:text-red-600 font-medium transition duration-150 py-2 px-1"
            >
              Sign Out
            </button>
          </form>
        </div>
      );
    } else {
      return (
        <div className="flex space-x-4 justify-center items-center">
          <Link
            href="/login"
            className="text-gray-600 hover:text-indigo-600 font-medium transition duration-150 hidden md:inline"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition duration-150"
          >
            Sign Up
          </Link>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <nav className="glass sticky top-0 z-50 border-b border-gray-200/50" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-extrabold text-gradient hover:scale-105 transition-transform">
            PeoplePost
          </Link>
          <NavLinks />
        </div>
      </nav>

      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pt-20 pb-20 px-4 text-center md:pt-32 md:pb-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-4xl mx-auto relative z-10 fade-in">
          <h1 className="text-5xl font-black text-gray-900 leading-tight sm:text-6xl md:text-7xl tracking-tight">
            See It. Report It.{" "}
            <span className="text-gradient block sm:inline">Resolve It.</span>
          </h1>

          {userRole === "citizen" && (
            <p className="mt-6 text-xl font-semibold text-gray-700 max-w-2xl mx-auto sm:text-2xl">
              Welcome back, <span className="text-indigo-600">{name}</span>! 👋
            </p>
          )}
          {userRole !== "citizen" && (
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto sm:text-2xl leading-relaxed">
              {userRole === "official"
                ? "Your management hub is ready for action. 🚀"
                : "Your direct connection to city services. Post neighborhood issues and track progress in real-time."}
            </p>
          )}

          <Link
            href={reportLink}
            className="mt-10 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-10 rounded-full shadow-2xl hover:shadow-glow transition-all duration-300 transform hover:scale-105 text-lg group"
          >
            {reportButtonText}
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </section>

      <section className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 gap-8 md:grid-cols-3">
          {STATS.map((stat, index) => (
            <div
              key={index}
              className={`card-hover bg-gradient-to-br ${stat.color === "indigo"
                ? "from-indigo-50 to-indigo-100 border-indigo-300"
                : stat.color === "green"
                  ? "from-green-50 to-green-100 border-green-300"
                  : "from-yellow-50 to-yellow-100 border-yellow-300"
                } p-8 rounded-2xl shadow-lg border-2 text-center group`}
            >
              <p className={`text-5xl font-black ${stat.color === "indigo"
                ? "text-indigo-600"
                : stat.color === "green"
                  ? "text-green-600"
                  : "text-yellow-600"
                } group-hover:scale-110 transition-transform`}>
                {stat.value}
              </p>
              <p className="text-sm text-gray-700 mt-3 font-semibold">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {isLoggedIn && (
        <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-4xl font-black text-gray-900">
                Latest Community Reports
              </h2>
              <span className="text-3xl">🚨</span>
            </div>

            <div className="space-y-4">
              {latestReports.map((report) => (
                <div
                  key={report.id}
                  className="card-hover bg-white p-6 rounded-2xl shadow-md border border-gray-200 md:flex md:items-center md:justify-between group"
                >
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {report.title}
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className="relative cursor-default h-6 w-6 flex items-center justify-center group/heart">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-full w-full absolute inset-0 text-gray-400 group-hover/heart:opacity-0 transition-opacity"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>

                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-full w-full text-red-500 opacity-0 group-hover/heart:opacity-100 transition-opacity"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>

                        <StatusBadge status={report.status} />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                      <span className="font-medium">📍 {report.location}</span>
                      <span className="text-gray-400">•</span>
                      <span>{report.time}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center"></div>
          </div>
        </section>
      )}

      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="max-w-6xl mx-auto text-center text-sm">
          &copy; {new Date().getFullYear()} PeoplePost. Built with Next.js &
          Supabase.
        </div>
      </footer>
    </div>
  );
}
