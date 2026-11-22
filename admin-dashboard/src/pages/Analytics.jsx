
import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Users,
  Activity,
  AlertCircle,
  Target,
} from "lucide-react";

import { useAppContext } from "../context/AppContext";
import { apiRequest } from "../services/api";

export default function Analytics() {
  const { language } = useAppContext();
  const isArabic = language === "ar";

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await apiRequest("/admin/dashboard");

      if (!data.success) {
        throw new Error(data.message || "Unable to load analytics.");
      }

      setStats(data.stats || {});
    } catch (err) {
      console.error("Analytics error:", err);

      setError(
        err.message ||
          (isArabic
            ? "تعذر تحميل الإحصائيات."
            : "Unable to load analytics.")
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const total = Number(stats?.totalReports || 0);
  const totalUsers = Number(stats?.totalUsers || 0);
  const pending = Number(stats?.pendingReports || 0);
  const inProgress = Number(stats?.inProgressReports || 0);
  const resolved = Number(stats?.resolvedReports || 0);
  const rejected = Number(stats?.rejectedReports || 0);

  const percentage = (value) =>
    total > 0 ? (value / total) * 100 : 0;

  const completionRate = percentage(resolved);
  const pendingRate = percentage(pending);

  const reportItems = [
    {
      key: "pending",
      value: pending,
      label: isArabic ? "قيد المراجعة" : "Pending",
      color: "bg-amber-500",
      icon: Clock,
    },
    {
      key: "progress",
      value: inProgress,
      label: isArabic ? "قيد التنفيذ" : "In Progress",
      color: "bg-blue-500",
      icon: TrendingUp,
    },
    {
      key: "resolved",
      value: resolved,
      label: isArabic ? "مكتملة" : "Resolved",
      color: "bg-emerald-500",
      icon: CheckCircle2,
    },
    {
      key: "rejected",
      value: rejected,
      label: isArabic ? "مرفوضة" : "Rejected",
      color: "bg-red-500",
      icon: XCircle,
    },
  ];

  const cards = [
    {
      title: isArabic ? "إجمالي البلاغات" : "Total Reports",
      value: total,
      icon: ClipboardList,
      description: isArabic
        ? "جميع البلاغات المسجلة"
        : "All submitted reports",
    },
    {
      title: isArabic ? "إجمالي المستخدمين" : "Total Users",
      value: totalUsers,
      icon: Users,
      description: isArabic
        ? "حسابات المستخدمين"
        : "Registered user accounts",
    },
    {
      title: isArabic ? "البلاغات المكتملة" : "Resolved Reports",
      value: resolved,
      icon: CheckCircle2,
      description: isArabic
        ? "البلاغات التي تم حلها"
        : "Successfully resolved reports",
    },
  ];

  return (
    <div className="space-y-7" dir={isArabic ? "rtl" : "ltr"}>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-950 dark:text-white">
            {isArabic ? "الإحصائيات والتحليلات" : "Analytics"}
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {isArabic
              ? "تابعي أداء EcoPulse وحالة البلاغات."
              : "Monitor EcoPulse performance and report activity."}
          </p>
        </div>

        <button
          onClick={() => loadAnalytics(true)}
          disabled={loading || refreshing}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={refreshing ? "animate-spin" : ""}
          />

          {isArabic ? "تحديث البيانات" : "Refresh Data"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />

          <div className="flex-1">
            <p className="font-bold">
              {isArabic ? "حدث خطأ" : "Something went wrong"}
            </p>

            <p className="mt-1">{error}</p>

            <button
              onClick={() => loadAnalytics()}
              className="mt-2 font-bold underline"
            >
              {isArabic ? "إعادة المحاولة" : "Try Again"}
            </button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg dark:border-white/[0.08] dark:bg-gray-900"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <Icon size={24} />
              </div>

              <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                {card.title}
              </p>

              <h2 className="mt-2 text-3xl font-extrabold text-gray-950 dark:text-white">
                {loading ? "..." : card.value}
              </h2>

              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Performance Overview */}
      <div className="grid gap-4 md:grid-cols-2">

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/[0.08] dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
              <Target size={22} />
            </div>

            <div>
              <h3 className="font-bold text-gray-950 dark:text-white">
                {isArabic ? "معدل إكمال البلاغات" : "Resolution Rate"}
              </h3>

              <p className="text-xs text-gray-500">
                {isArabic ? "نسبة البلاغات المحلولة" : "Percentage of resolved reports"}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-end justify-between">
            <span className="text-4xl font-extrabold text-emerald-600">
              {loading ? "..." : `${completionRate.toFixed(1)}%`}
            </span>

            <span className="text-sm text-gray-500">
              {resolved} / {total}
            </span>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/[0.08] dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
              <Activity size={22} />
            </div>

            <div>
              <h3 className="font-bold text-gray-950 dark:text-white">
                {isArabic ? "البلاغات قيد المراجعة" : "Pending Reports Rate"}
              </h3>

              <p className="text-xs text-gray-500">
                {isArabic ? "نسبة البلاغات المنتظرة" : "Reports waiting for review"}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-end justify-between">
            <span className="text-4xl font-extrabold text-amber-500">
              {loading ? "..." : `${pendingRate.toFixed(1)}%`}
            </span>

            <span className="text-sm text-gray-500">
              {pending} / {total}
            </span>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-700"
              style={{ width: `${pendingRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Reports Distribution */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/[0.08] dark:bg-gray-900">

        <div className="mb-7 flex items-center gap-3">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-400/10">
            <BarChart3 size={24} />
          </div>

          <div>
            <h2 className="font-bold text-gray-950 dark:text-white">
              {isArabic ? "تحليل حالات البلاغات" : "Reports Analytics"}
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {isArabic
                ? "توزيع البلاغات حسب الحالة"
                : "Reports distribution by status"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-500">
            <RefreshCw size={24} className="mx-auto animate-spin text-emerald-600" />

            <p className="mt-3">
              {isArabic ? "جاري تحميل الإحصائيات..." : "Loading analytics..."}
            </p>
          </div>
        ) : total === 0 ? (
          <div className="py-10 text-center text-gray-500">
            <ClipboardList size={35} className="mx-auto mb-3 text-gray-400" />

            {isArabic
              ? "لا توجد بلاغات لعرض الإحصائيات."
              : "There are no reports to analyze yet."}
          </div>
        ) : (
          <div className="space-y-6">
            {reportItems.map((item) => {
              const value = item.value;
              const rate = percentage(value);
              const Icon = item.icon;

              return (
                <div key={item.key}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                      <Icon size={17} />
                      {item.label}
                    </div>

                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {value} ({rate.toFixed(1)}%)
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
