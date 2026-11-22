
import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Search,
  Filter,
  MapPin,
  CalendarDays,
  ChevronDown,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import StatusBadge from "../components/StatusBadge";
import { apiRequest } from "../services/api";

const STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "In Progress", label: "In Progress" },
  { value: "Resolved", label: "Resolved" },
  { value: "Rejected", label: "Rejected" },
];

function getStatus(report) {
  const value = String(report.status || "Pending").toLowerCase();

  if (value === "resolved" || value === "completed") {
    return "Resolved";
  }

  if (value === "rejected") {
    return "Rejected";
  }

  if (value === "in progress" || value === "in-progress") {
    return "In Progress";
  }

  return "Pending";
}

function getBadgeStatus(status) {
  const statuses = {
    Pending: "pending",
    "In Progress": "in-progress",
    Resolved: "completed",
    Rejected: "rejected",
  };

  return statuses[status] || "pending";
}

function getReportId(report) {
  return report._id || report.id || "N/A";
}

function getLocation(report) {
  const location = report.location || report.address || report.place;

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

function getUserName(report) {
  const user = report.userId;

  if (!user) return "Unknown User";

  return [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ") || user.email || "Unknown User";
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  // Get reports from MongoDB through the backend
  const loadReports = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await apiRequest("/admin/reports");

      if (!response.success) {
        throw new Error(response.message || "Failed to load reports.");
      }

      setReports(
        Array.isArray(response.reports) ? response.reports : []
      );
    } catch (err) {
      console.error("Load reports error:", err);
      setError(err.message || "Unable to load reports.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Update report status in the database
  const updateStatus = async (reportId, nextStatus) => {
    try {
      setUpdatingId(reportId);
      setError("");

      const response = await apiRequest(
        `/admin/reports/${reportId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      if (!response.success) {
        throw new Error(response.message || "Status update failed.");
      }

      setReports((currentReports) =>
        currentReports.map((report) =>
          getReportId(report) === reportId
            ? {
                ...report,
                status: nextStatus,
              }
            : report
        )
      );
    } catch (err) {
      console.error("Update status error:", err);
      setError(err.message || "Unable to update report status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Search and filter
  const filteredReports = useMemo(() => {
    const query = search.toLowerCase().trim();

    return reports.filter((report) => {
      const matchesStatus =
        statusFilter === "all" ||
        getStatus(report) === statusFilter;

      const searchableValues = [
        getReportId(report),
        getLocation(report),
        report.description,
        getUserName(report),
        report.userId?.email,
      ];

      const matchesSearch =
        !query ||
        searchableValues.some((value) =>
          String(value || "").toLowerCase().includes(query)
        );

      return matchesStatus && matchesSearch;
    });
  }, [reports, search, statusFilter]);

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-950 dark:text-white">
            Reports Management
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Review and manage community cleanup reports.
          </p>
        </div>

        <button
          onClick={() => loadReports(true)}
          disabled={refreshing || loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh Data
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />

          <div>
            <p className="font-semibold">Something went wrong</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Reports Section */}
      <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white dark:border-white/[0.08] dark:bg-gray-900/80">

        {/* Filters */}
        <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 dark:border-white/[0.08] sm:p-6 lg:flex-row lg:items-center">

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10">
              <ClipboardList size={21} />
            </div>

            <div>
              <h2 className="font-extrabold text-gray-950 dark:text-white">
                All Reports
              </h2>

              <p className="text-xs text-gray-500">
                {filteredReports.length} reports found
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">

            {/* Search */}
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search reports or users..."
                className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-emerald-500 dark:border-white/10 dark:bg-gray-950 dark:text-white sm:w-64"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-white pl-9 pr-9 text-sm outline-none dark:border-white/10 dark:bg-gray-950 dark:text-white sm:w-44"
              >
                <option value="all">All statuses</option>

                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16">
            <RefreshCw
              size={28}
              className="animate-spin text-emerald-600"
            />

            <p className="mt-4 text-sm text-gray-500">
              Loading reports...
            </p>
          </div>

        ) : filteredReports.length === 0 ? (

          /* Empty State */
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <ClipboardList size={35} className="text-gray-400" />

            <h3 className="mt-4 font-bold text-gray-900 dark:text-white">
              No reports found
            </h3>

            <p className="mt-2 max-w-sm text-sm text-gray-500">
              {reports.length === 0
                ? "Reports from the EcoPulse website will appear here when submitted."
                : "Try changing your search or status filter."}
            </p>
          </div>

        ) : (

          /* Reports Table */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">

              <thead className="bg-gray-50 dark:bg-white/[0.025]">
                <tr className="text-xs uppercase text-gray-500">
                  <th className="px-6 py-4">Report</th>
                  <th className="px-6 py-4">Submitted By</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Update Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.06]">

                {filteredReports.map((report) => {
                  const reportId = getReportId(report);
                  const status = getStatus(report);

                  return (
                    <tr
                      key={reportId}
                      className="transition hover:bg-gray-50 dark:hover:bg-white/[0.025]"
                    >

                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {reportId.slice(-8)}
                        </p>

                        <p className="mt-1 max-w-[220px] truncate text-xs text-gray-500">
                          {report.description || "No description provided"}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                          {getUserName(report)}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {report.userId?.email || ""}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <MapPin size={15} className="shrink-0 text-gray-400" />
                          <span className="max-w-[180px] truncate">
                            {getLocation(report)}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <CalendarDays size={15} className="shrink-0 text-gray-400" />
                          {formatDate(report.createdAt || report.date)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={getBadgeStatus(status)} />
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={status}
                          disabled={updatingId === reportId}
                          onChange={(event) =>
                            updateStatus(reportId, event.target.value)
                          }
                          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold outline-none transition focus:border-emerald-500 disabled:cursor-wait disabled:opacity-50 dark:border-white/10 dark:bg-gray-950 dark:text-white"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>

                        {updatingId === reportId && (
                          <span className="ml-2 text-xs text-gray-400">
                            Saving...
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })}

              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
