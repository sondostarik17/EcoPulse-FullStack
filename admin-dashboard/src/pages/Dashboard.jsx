
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Activity,
  ArrowUpRight,
  Users,
  RefreshCw,
  XCircle,
  MapPin,
  CalendarDays,
} from "lucide-react";

import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { useAppContext } from "../context/AppContext";
import { apiRequest } from "../services/api";

function getStatus(report) {
  const value = String(report.status || report.statusText || "Pending")
    .toLowerCase()
    .replaceAll("_", " ")
    .trim();

  if (
    value.includes("resolved") ||
    value.includes("complete") ||
    value.includes("done")
  ) {
    return "completed";
  }

  if (value.includes("reject")) {
    return "rejected";
  }

  if (
    value.includes("progress") ||
    value.includes("review") ||
    value.includes("processing")
  ) {
    return "in-progress";
  }

  return "pending";
}

function getReportId(report, index) {
  return (
    report.requestId ||
    report.reportId ||
    report._id ||
    report.id ||
    `#${index + 1}`
  );
}

function getLocation(report) {
  const location =
    report.location ||
    report.address ||
    report.place ||
    report.locationName;

  if (typeof location === "string") return location;

  if (location && typeof location === "object") {
    return (
      location.address ||
      location.name ||
      location.formattedAddress ||
      "Location unavailable"
    );
  }

  return "Location unavailable";
}

function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useAppContext();

  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReports: 0,
    pendingReports: 0,
    inProgressReports: 0,
    resolvedReports: 0,
    rejectedReports: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const [dashboardData, reportsData] = await Promise.all([
        apiRequest("/admin/dashboard"),
        apiRequest("/admin/reports"),
      ]);

      if (!dashboardData.success || !reportsData.success) {
        throw new Error("Unable to load dashboard data.");
      }

      setStats({
        totalUsers: Number(dashboardData.stats?.totalUsers || 0),
        totalReports: Number(dashboardData.stats?.totalReports || 0),
        pendingReports: Number(dashboardData.stats?.pendingReports || 0),
        inProgressReports: Number(
          dashboardData.stats?.inProgressReports || 0
        ),
        resolvedReports: Number(
          dashboardData.stats?.resolvedReports || 0
        ),
        rejectedReports: Number(
          dashboardData.stats?.rejectedReports || 0
        ),
      });

      setReports(
        Array.isArray(reportsData.reports) ? reportsData.reports : []
      );
    } catch (err) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const statusData = useMemo(
    () => [
      {
        label: "Pending",
        value: stats.pendingReports,
        color: "bg-amber-400",
      },
      {
        label: "In Progress",
        value: stats.inProgressReports,
        color: "bg-blue-500",
      },
      {
        label: "Resolved",
        value: stats.resolvedReports,
        color: "bg-emerald-500",
      },
      {
        label: "Rejected",
        value: stats.rejectedReports,
        color: "bg-red-500",
      },
    ],
    [stats]
  );

  const recentReports = reports.slice(0, 6);

  return (
    <div className="space-y-7">

      {/* Welcome */}
      <section className="relative overflow-hidden rounded-3xl bg-gray-950 px-6 py-7 text-white shadow-xl shadow-gray-900/10 dark:bg-[#13131b] sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-14 -top-24 h-64 w-64 rounded-full border-[35px] border-emerald-500/10" />

        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
              <Activity size={14} />
              Admin Control Center
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Make a cleaner city,
              <span className="text-emerald-400">
                {" "}one report at a time.
              </span>
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-300">
              Review community reports, monitor progress, and keep cleanup
              requests organized from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/reports")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-gray-950 transition hover:bg-emerald-400"
          >
            <ClipboardList size={17} />
            Review Reports
            <ArrowUpRight size={16} />
          </button>
        </div>
      </section>

      {/* Page heading and refresh */}
      <section className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-extrabold text-gray-950 dark:text-white">
            Dashboard Overview
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Live information from your EcoPulse database
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadDashboard(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-emerald-400 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-gray-900 dark:text-gray-200"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </section>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-red-500"
            />
            <div>
              <p className="text-sm font-bold text-red-700 dark:text-red-400">
                Could not load dashboard data
              </p>
              <p className="mt-1 text-sm text-red-600 dark:text-red-300">
                {error}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadDashboard(true)}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Statistics */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-extrabold text-gray-950 dark:text-white">
            Platform Statistics
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Current numbers from the database
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 2xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl border border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-gray-900"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 2xl:grid-cols-4">
            <StatCard
              title="Total Reports"
              value={stats.totalReports}
              subtitle="All submitted reports"
              icon={ClipboardList}
              color="green"
            />

            <StatCard
              title="Pending Reports"
              value={stats.pendingReports}
              subtitle="Waiting for review"
              icon={Clock3}
              color="amber"
            />

            <StatCard
              title="In Progress"
              value={stats.inProgressReports}
              subtitle="Currently being handled"
              icon={AlertCircle}
              color="blue"
            />

            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              subtitle="Registered community members"
              icon={Users}
              color="green"
            />
          </div>
        )}
      </section>

      {/* Status Overview */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.3fr_0.7fr]">

        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-white/[0.08] dark:bg-gray-900/80 sm:p-6">
          <h2 className="font-extrabold text-gray-950 dark:text-white">
            Report Status
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Distribution of all reports by status
          </p>

          {loading ? (
            <div className="mt-7 h-40 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />
          ) : (
            <div className="mt-7 space-y-5">
              {statusData.map((item) => {
                const percentage =
                  stats.totalReports > 0
                    ? Math.round(
                        (item.value / stats.totalReports) * 100
                      )
                    : 0;

                return (
                  <div key={item.label}>
                    <div className="mb-2 flex justify-between gap-3 text-sm">
                      <span className="font-medium text-gray-600 dark:text-gray-300">
                        {item.label}
                      </span>

                      <span className="font-bold text-gray-900 dark:text-white">
                        {item.value} ({percentage}%)
                      </span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.07]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-white/[0.08] dark:bg-gray-900/80 sm:p-6">
          <h2 className="font-extrabold text-gray-950 dark:text-white">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Common administration tasks
          </p>

          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={() => navigate("/reports")}
              className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50/60 dark:border-white/[0.08] dark:hover:bg-emerald-400/[0.05]"
            >
              <span className="font-bold text-gray-900 dark:text-white">
                View all reports
              </span>
              <ArrowUpRight size={18} className="text-emerald-600" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/users")}
              className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50/60 dark:border-white/[0.08] dark:hover:bg-emerald-400/[0.05]"
            >
              <span className="font-bold text-gray-900 dark:text-white">
                Manage users
              </span>
              <Users size={18} className="text-emerald-600" />
            </button>
          </div>
        </div>
      </section>

      {/* Recent Reports */}
      <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white dark:border-white/[0.08] dark:bg-gray-900/80">
        <div className="flex flex-col justify-between gap-3 border-b border-gray-100 p-5 dark:border-white/[0.08] sm:flex-row sm:items-center sm:p-6">
          <div>
            <h2 className="font-extrabold text-gray-950 dark:text-white">
              Recent Reports
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Latest reports submitted by users
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/reports")}
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400"
          >
            View All
            <ArrowUpRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-12 animate-pulse rounded-lg bg-gray-100 dark:bg-white/5"
              />
            ))}
          </div>
        ) : recentReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-white/5">
              <ClipboardList size={25} />
            </div>
            <p className="font-bold text-gray-800 dark:text-white">
              No reports yet
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              New reports will appear here when users submit them.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-gray-50 dark:bg-white/[0.025]">
                <tr className="text-xs uppercase text-gray-500">
                  <th className="px-6 py-4">Report</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {recentReports.map((report, index) => (
                  <tr
                    key={report._id || report.id || index}
                    className="border-t border-gray-100 transition hover:bg-gray-50/70 dark:border-white/[0.06] dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                      {getReportId(report, index)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex max-w-xs items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <MapPin
                          size={15}
                          className="shrink-0 text-emerald-600"
                        />
                        <span className="truncate">
                          {getLocation(report)}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <CalendarDays size={15} />
                        {formatDate(report.createdAt || report.date)}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={getStatus(report)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
