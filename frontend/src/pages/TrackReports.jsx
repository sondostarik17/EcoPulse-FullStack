
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  MapPin,
  CalendarDays,
  Trash2,
  RefreshCw,
  LoaderCircle,
  CheckCircle2,
  Clock3,
  AlertCircle,
  XCircle,
  Image as ImageIcon,
  ShieldCheck,
  FileText,
  CarFront,
  Flag,
} from "lucide-react";
import Swal from "sweetalert2";
import { apiRequest } from "../services/api";

const API_ORIGIN = "http://localhost:5000";

const translations = {
  en: {
    eyebrow: "ECOPULSE COMMUNITY",
    title: "Track Your Reports",
    subtitle:
      "Follow your submitted waste reports and stay updated on their progress.",
    total: "Total Reports",
    pending: "Pending",
    progress: "In Progress",
    resolved: "Resolved",
    rejected: "Rejected",
    refresh: "Refresh",
    loading: "Loading your reports...",
    emptyTitle: "No Reports Yet",
    emptyText:
      "You haven't submitted any waste reports yet. Help keep your community clean.",
    reportNow: "Report Waste",
    description: "Description",
    location: "Location",
    submitted: "Submitted",
    priority: "Priority",
    request: "Report",
    delete: "Delete",
    deleteTitle: "Delete this report?",
    deleteText:
      "This report will be permanently deleted. This action cannot be undone.",
    cancel: "Cancel",
    confirmDelete: "Yes, delete it",
    deleted: "Report deleted successfully",
    error: "Something went wrong",
    loadError: "Could not load your reports.",
    retry: "Try Again",
    noImage: "No image available",
    pendingStatus: "Pending Review",
    progressStatus: "In Progress",
    resolvedStatus: "Resolved",
    rejectedStatus: "Rejected",
    high: "High",
    medium: "Medium",
    low: "Low",
    unknown: "Unknown",
    loginTitle: "Login Required",
    loginText: "Please log in to view your reports.",
    login: "Go to Login",
    noDescription: "No description provided.",
    noLocation: "Location not available",
    imageAlt: "Waste report",
    deletedError: "Could not delete this report.",
    close: "Close",

    journeyTitle: "Report Journey",
    journeyPending: "Your report is waiting for review.",
    journeyProgress: "The cleaning team is working on your report.",
    journeyResolved: "Great! Your reported issue has been resolved.",
    journeyRejected: "This report has been rejected.",
    journeyStart: "Submitted",
    journeyMiddle: "Working",
    journeyFinish: "Completed",
    journeyRejectedPoint: "Stopped",
  },

  ar: {
    eyebrow: "مجتمع إيكوبالس",
    title: "متابعة البلاغات",
    subtitle:
      "تابعي البلاغات التي أرسلتيها واعرفي آخر تحديثات حالة كل بلاغ.",
    total: "إجمالي البلاغات",
    pending: "قيد المراجعة",
    progress: "جاري العمل",
    resolved: "تم الحل",
    rejected: "مرفوض",
    refresh: "تحديث",
    loading: "جاري تحميل البلاغات...",
    emptyTitle: "لا توجد بلاغات حتى الآن",
    emptyText:
      "لم تقومي بإرسال أي بلاغات حتى الآن. ساعدينا في الحفاظ على نظافة المجتمع.",
    reportNow: "الإبلاغ عن مشكلة",
    description: "الوصف",
    location: "الموقع",
    submitted: "تاريخ الإرسال",
    priority: "الأولوية",
    request: "البلاغ",
    delete: "حذف",
    deleteTitle: "هل تريدين حذف البلاغ؟",
    deleteText: "سيتم حذف البلاغ نهائيًا، ولا يمكن التراجع عن هذا الإجراء.",
    cancel: "إلغاء",
    confirmDelete: "نعم، احذف",
    deleted: "تم حذف البلاغ بنجاح",
    error: "حدث خطأ",
    loadError: "تعذر تحميل البلاغات.",
    retry: "حاولي مرة أخرى",
    noImage: "لا توجد صورة",
    pendingStatus: "قيد المراجعة",
    progressStatus: "جاري العمل",
    resolvedStatus: "تم الحل",
    rejectedStatus: "مرفوض",
    high: "عالية",
    medium: "متوسطة",
    low: "منخفضة",
    unknown: "غير محدد",
    loginTitle: "تسجيل الدخول مطلوب",
    loginText: "سجلي الدخول أولًا لمشاهدة بلاغاتك.",
    login: "الذهاب لتسجيل الدخول",
    noDescription: "لا يوجد وصف للبلاغ.",
    noLocation: "الموقع غير متاح",
    imageAlt: "صورة البلاغ",
    deletedError: "تعذر حذف البلاغ.",
    close: "إغلاق",

    journeyTitle: "رحلة البلاغ",
    journeyPending: "بلاغك في انتظار المراجعة.",
    journeyProgress: "فريق النظافة يعمل على حل المشكلة.",
    journeyResolved: "رائع! تم حل المشكلة التي أبلغتِ عنها.",
    journeyRejected: "تم رفض هذا البلاغ.",
    journeyStart: "تم الإرسال",
    journeyMiddle: "جاري العمل",
    journeyFinish: "تم الحل",
    journeyRejectedPoint: "متوقف",
  },
};

const getStatus = (status = "") => {
  const value = String(status).toLowerCase().trim();

  if (["resolved", "completed", "complete", "done"].includes(value)) {
    return "resolved";
  }

  if (["rejected", "declined"].includes(value)) {
    return "rejected";
  }

  if (
    ["in progress", "in_progress", "processing", "working"].includes(value)
  ) {
    return "progress";
  }

  return "pending";
};

const getStatusConfig = (status, t) => {
  const configs = {
    pending: {
      label: t.pendingStatus,
      icon: Clock3,
      className:
        "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    progress: {
      label: t.progressStatus,
      icon: RefreshCw,
      className:
        "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    resolved: {
      label: t.resolvedStatus,
      icon: CheckCircle2,
      className:
        "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400",
    },
    rejected: {
      label: t.rejectedStatus,
      icon: XCircle,
      className:
        "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
    },
  };

  return configs[getStatus(status)];
};

const getPriority = (priority, t) => {
  const value = String(priority || "").toLowerCase();

  if (value === "high") return t.high;
  if (value === "low") return t.low;
  if (value === "medium") return t.medium;

  return priority || t.unknown;
};

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return "";

  if (/^(https?:\/\/|data:)/i.test(imageUrl)) {
    return imageUrl;
  }

  return `${API_ORIGIN}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
};

const formatDate = (date, language) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return new Intl.DateTimeFormat(
    language === "ar" ? "ar-EG" : "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(parsedDate);
};

const getReportNumber = (report) => {
  if (report.requestId) return report.requestId;
  if (!report._id) return "—";

  return `#${String(report._id).slice(-6).toUpperCase()}`;
};

// ==========================================
// Report Journey - Animated Car Road
// ==========================================

const ReportJourney = ({ status, t, isArabic }) => {
  const normalizedStatus = getStatus(status);

  const isPending = normalizedStatus === "pending";
  const isProgress = normalizedStatus === "progress";
  const isResolved = normalizedStatus === "resolved";
  const isRejected = normalizedStatus === "rejected";

  const carPosition = isResolved
    ? 91
    : isProgress
      ? 50
      : isRejected
        ? 50
        : 8;

  // Mirror the car position in Arabic
  const visualCarPosition = isArabic ? 100 - carPosition : carPosition;

  const progressWidth = isResolved
    ? "100%"
    : isProgress || isRejected
      ? "50%"
      : "8%";

  const journeyMessage = isResolved
    ? t.journeyResolved
    : isProgress
      ? t.journeyProgress
      : isRejected
        ? t.journeyRejected
        : t.journeyPending;

  const progressColor = isRejected
    ? "bg-red-500"
    : isResolved
      ? "bg-green-500"
      : isProgress
        ? "bg-blue-500"
        : "bg-amber-500";

  return (
    <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.025]">
      {/* Journey title */}
      <div className="mb-5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">
            <CarFront size={17} />
          </div>

          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
            {t.journeyTitle}
          </span>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
            isResolved
              ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
              : isRejected
                ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                : isProgress
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
          }`}
        >
          {isResolved
            ? t.resolvedStatus
            : isRejected
              ? t.rejectedStatus
              : isProgress
                ? t.progressStatus
                : t.pendingStatus}
        </span>
      </div>

      {/* Road */}
      <div className="relative mx-2 mb-7 mt-2 h-12">
        {/* Road background */}
        <div className="absolute left-0 right-0 top-1/2 h-3 -translate-y-1/2 rounded-full border border-gray-300 bg-gray-200 dark:border-white/10 dark:bg-[#242424]">
          {/* Road dashed line */}
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-gray-400/80 dark:border-gray-500/60" />
        </div>

        {/* Progress road */}
        <div
          className={`absolute top-1/2 z-[1] h-3 -translate-y-1/2 rounded-full transition-all duration-1000 ${progressColor}`}
          style={{
            [isArabic ? "right" : "left"]: 0,
            width: progressWidth,
          }}
        />

        {/* Start point */}
        <div
          className={`absolute top-1/2 z-[2] flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-green-500 shadow dark:border-[#0D0D0F] ${
            isArabic ? "right-0" : "left-0"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
        </div>

        {/* Finish point */}
        <div
          className={`absolute top-1/2 z-[2] flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white shadow dark:border-[#0D0D0F] ${
            isResolved
              ? "bg-green-500 text-white"
              : "bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-300"
          } ${isArabic ? "left-0" : "right-0"}`}
        >
          <Flag size={13} />
        </div>

        {/* Rejected stop marker */}
        {isRejected && (
          <div
            className="absolute top-1/2 z-[3] flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-red-500 text-white shadow dark:border-[#0D0D0F]"
            style={{
              left: isArabic ? "50%" : "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <XCircle size={15} />
          </div>
        )}

        {/* Animated car */}
        <div
          className="absolute top-1/2 z-[4] -translate-y-1/2 transition-all duration-1000 ease-in-out"
          style={{
            left: `${visualCarPosition}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 border-white shadow-lg dark:border-[#0D0D0F] ${
              isResolved
                ? "bg-green-500 text-white"
                : isRejected
                  ? "bg-red-500 text-white"
                  : isProgress
                    ? "bg-blue-500 text-white"
                    : "bg-amber-500 text-white"
            }`}
          >
            <CarFront
              size={23}
              className={isProgress ? "animate-pulse" : ""}
            />
          </div>
        </div>
      </div>

      {/* Journey labels */}
      <div className="mb-4 grid grid-cols-3 gap-1 text-center">
        <div>
          <span className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400">
            {t.journeyStart}
          </span>
        </div>

        <div>
          <span
            className={`block text-[10px] font-semibold ${
              isProgress || isResolved
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {t.journeyMiddle}
          </span>
        </div>

        <div>
          <span
            className={`block text-[10px] font-semibold ${
              isResolved
                ? "text-green-600 dark:text-green-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {t.journeyFinish}
          </span>
        </div>
      </div>

      {/* Status message */}
      <div
        className={`flex items-start gap-2 rounded-xl p-3 ${
          isResolved
            ? "bg-green-100/80 text-green-800 dark:bg-green-500/10 dark:text-green-300"
            : isRejected
              ? "bg-red-100/80 text-red-800 dark:bg-red-500/10 dark:text-red-300"
              : isProgress
                ? "bg-blue-100/80 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300"
                : "bg-amber-100/80 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
        }`}
      >
        {isResolved ? (
          <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
        ) : isRejected ? (
          <XCircle size={17} className="mt-0.5 shrink-0" />
        ) : isProgress ? (
          <RefreshCw size={17} className="mt-0.5 shrink-0" />
        ) : (
          <Clock3 size={17} className="mt-0.5 shrink-0" />
        )}

        <p className="text-xs font-medium leading-5">{journeyMessage}</p>
      </div>
    </div>
  );
};

// ==========================================
// Track Reports Page
// ==========================================

const TrackReports = () => {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [language, setLanguage] = useState(
    () => localStorage.getItem("selectedLang") || "en"
  );

  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains("dark")
  );

  const t = translations[language] || translations.en;
  const isArabic = language === "ar";

  // Load reports from MongoDB
  const loadReports = useCallback(
    async (showLoader = true) => {
      if (showLoader) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      setLoadError("");

      try {
        const response = await apiRequest("/reports/my-reports", {
          method: "GET",
        });

        const fetchedReports = Array.isArray(response)
          ? response
          : response.reports || response.data || [];

        if (!Array.isArray(fetchedReports)) {
          throw new Error("Invalid reports response from server.");
        }

        setReports(fetchedReports);
      } catch (error) {
        console.error("Loading reports error:", error);

        const message = error.message || "";
        const lowerMessage = message.toLowerCase();

        if (
          lowerMessage.includes("not authorized") ||
          lowerMessage.includes("unauthorized") ||
          lowerMessage.includes("session") ||
          lowerMessage.includes("expired")
        ) {
          setLoadError("UNAUTHORIZED");
        } else {
          setLoadError(message || t.loadError);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [t.loadError]
  );

  // Initial loading
  useEffect(() => {
    loadReports(true);
  }, [loadReports]);

  // Auto refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        loadReports(false);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [loadReports]);

  // Language and theme listeners
  useEffect(() => {
    const updateLanguage = () => {
      setLanguage(localStorage.getItem("selectedLang") || "en");
    };

    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    window.addEventListener("languageChanged", updateLanguage);
    window.addEventListener("themeChanged", updateTheme);
    window.addEventListener("storage", updateLanguage);

    const observer = new MutationObserver(updateTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      window.removeEventListener("languageChanged", updateLanguage);
      window.removeEventListener("themeChanged", updateTheme);
      window.removeEventListener("storage", updateLanguage);
      observer.disconnect();
    };
  }, []);

  // Refresh after another page submits or updates a report
  useEffect(() => {
    const refreshReports = () => loadReports(false);

    window.addEventListener("reportsUpdated", refreshReports);

    return () => {
      window.removeEventListener("reportsUpdated", refreshReports);
    };
  }, [loadReports]);

  // Statistics
  const statistics = useMemo(
    () => ({
      total: reports.length,
      pending: reports.filter(
        (report) => getStatus(report.status) === "pending"
      ).length,
      progress: reports.filter(
        (report) => getStatus(report.status) === "progress"
      ).length,
      resolved: reports.filter(
        (report) => getStatus(report.status) === "resolved"
      ).length,
      rejected: reports.filter(
        (report) => getStatus(report.status) === "rejected"
      ).length,
    }),
    [reports]
  );

  // Delete report
  const handleDelete = async (report) => {
    if (!report?._id || deletingId !== null) return;

    const result = await Swal.fire({
      background: isDark ? "#0D0D0F" : "#FFFFFF",
      color: isDark ? "#F5F5F5" : "#111827",
      icon: "warning",
      title: t.deleteTitle,
      text: t.deleteText,
      showCancelButton: true,
      confirmButtonText: t.confirmDelete,
      cancelButtonText: t.cancel,
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#6B7280",
      reverseButtons: isArabic,
    });

    if (!result.isConfirmed) return;

    setDeletingId(report._id);

    try {
      const response = await apiRequest(
        `/reports/${encodeURIComponent(report._id)}`,
        { method: "DELETE" }
      );

      if (!response || response.success !== true) {
        throw new Error(response?.message || t.deletedError);
      }

      setReports((previous) =>
        previous.filter((item) => item._id !== report._id)
      );

      window.dispatchEvent(new Event("reportsUpdated"));

      await Swal.fire({
        background: isDark ? "#0D0D0F" : "#FFFFFF",
        color: isDark ? "#F5F5F5" : "#111827",
        icon: "success",
        title: t.deleted,
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("DELETE FAILED:", error);

      await Swal.fire({
        background: isDark ? "#0D0D0F" : "#FFFFFF",
        color: isDark ? "#F5F5F5" : "#111827",
        icon: "error",
        title: t.error,
        text: error.message || t.deletedError,
        confirmButtonText: t.close,
        confirmButtonColor: "#22C55E",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const summaryCards = [
    {
      key: "total",
      label: t.total,
      value: statistics.total,
      icon: ClipboardList,
      color: "text-green-600 dark:text-green-400",
      background: "bg-green-100 dark:bg-green-500/10",
    },
    {
      key: "pending",
      label: t.pending,
      value: statistics.pending,
      icon: Clock3,
      color: "text-amber-600 dark:text-amber-400",
      background: "bg-amber-100 dark:bg-amber-500/10",
    },
    {
      key: "progress",
      label: t.progress,
      value: statistics.progress,
      icon: RefreshCw,
      color: "text-blue-600 dark:text-blue-400",
      background: "bg-blue-100 dark:bg-blue-500/10",
    },
    {
      key: "resolved",
      label: t.resolved,
      value: statistics.resolved,
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
      background: "bg-green-100 dark:bg-green-500/10",
    },
    {
      key: "rejected",
      label: t.rejected,
      value: statistics.rejected,
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      background: "bg-red-100 dark:bg-red-500/10",
    },
  ];

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen bg-gray-50 px-3 py-6 text-gray-900 transition-colors duration-300 dark:bg-[#050505] dark:text-white sm:px-6 sm:py-8 lg:px-8"
    >
      <div className="mx-auto max-w-[1450px]">
        {/* Header */}
        <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-green-600 dark:text-green-400">
              <ShieldCheck size={16} />
              {t.eyebrow}
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {t.title}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400 sm:text-base">
              {t.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadReports(false)}
            disabled={isRefreshing || isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-500/30 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20"
          >
            <RefreshCw
              size={17}
              className={isRefreshing ? "animate-spin" : ""}
            />
            {t.refresh}
          </button>
        </header>

        {/* Statistics */}
        <section className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.key}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-[#0D0D0F] sm:p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.background}`}
                  >
                    <Icon size={20} className={card.color} />
                  </div>

                  <span
                    className={`text-2xl font-bold tabular-nums ${card.color}`}
                  >
                    {card.value}
                  </span>
                </div>

                <p className="mt-4 text-xs font-medium text-gray-600 dark:text-gray-400 sm:text-sm">
                  {card.label}
                </p>
              </div>
            );
          })}
        </section>

        {/* Section title */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">
            <ClipboardList size={20} />
          </div>

          <div>
            <h2 className="text-lg font-bold">{t.title}</h2>
            <p className="text-xs text-gray-500">
              {statistics.total} {t.request}
            </p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#0D0D0F]">
            <LoaderCircle
              size={38}
              className="animate-spin text-green-500"
            />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {t.loading}
            </p>
          </div>
        )}

        {/* Error */}
        {!isLoading && loadError && (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-red-200 bg-white p-6 text-center dark:border-red-500/20 dark:bg-[#0D0D0F]">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <AlertCircle size={27} />
            </div>

            <h3 className="mt-4 text-lg font-bold">
              {loadError === "UNAUTHORIZED" ? t.loginTitle : t.error}
            </h3>

            <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
              {loadError === "UNAUTHORIZED"
                ? t.loginText
                : loadError || t.loadError}
            </p>

            {loadError === "UNAUTHORIZED" ? (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-5 rounded-xl bg-green-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-green-400"
              >
                {t.login}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => loadReports(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-green-400"
              >
                <RefreshCw size={16} />
                {t.retry}
              </button>
            )}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !loadError && reports.length === 0 && (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center dark:border-white/10 dark:bg-[#0D0D0F]">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">
              <ClipboardList size={37} />
            </div>

            <h3 className="mt-6 text-xl font-bold">{t.emptyTitle}</h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
              {t.emptyText}
            </p>

            <button
              type="button"
              onClick={() => navigate("/report")}
              className="mt-6 rounded-xl bg-green-500 px-6 py-3 text-sm font-bold text-black transition hover:bg-green-400 hover:shadow-lg hover:shadow-green-500/20"
            >
              {t.reportNow}
            </button>
          </div>
        )}

        {/* Reports */}
        {!isLoading && !loadError && reports.length > 0 && (
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {reports.map((report) => {
              const status = getStatusConfig(report.status, t);
              const StatusIcon = status.icon;
              const imageUrl = getImageUrl(report.imageUrl);

              return (
                <article
                  key={report._id || report.requestId}
                  className="group min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-[#0D0D0F]"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="relative h-56 shrink-0 overflow-hidden bg-gray-100 dark:bg-[#080808] sm:h-auto sm:min-h-[260px] sm:w-[38%]">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={t.imageAlt}
                          loading="lazy"
                          className="h-full min-h-[220px] w-full object-cover transition duration-500 group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                            event.currentTarget.nextElementSibling?.classList.remove(
                              "hidden"
                            );
                          }}
                        />
                      ) : null}

                      <div
                        className={`${
                          imageUrl ? "hidden" : "flex"
                        } absolute inset-0 flex-col items-center justify-center gap-2 text-gray-400`}
                      >
                        <ImageIcon size={35} />
                        <span className="text-xs">{t.noImage}</span>
                      </div>

                      <div className="absolute left-3 top-3 rounded-lg border border-white/20 bg-black/75 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                        {getReportNumber(report)}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                          {t.request}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.className}`}
                        >
                          <StatusIcon size={14} />
                          {status.label}
                        </span>
                      </div>

                      {/* Description */}
                      <div className="mt-4">
                        <h3 className="mb-2 flex items-center gap-2 text-sm font-bold">
                          <FileText
                            size={16}
                            className="shrink-0 text-green-600 dark:text-green-400"
                          />
                          {t.description}
                        </h3>

                        <p className="break-words text-sm leading-6 text-gray-600 dark:text-gray-300">
                          {report.description || t.noDescription}
                        </p>
                      </div>

                      {/* Location */}
                      <div className="mt-4 flex min-w-0 items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <MapPin
                          size={16}
                          className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
                        />
                        <span className="min-w-0 break-words leading-5">
                          {report.address || t.noLocation}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <CalendarDays
                          size={15}
                          className="shrink-0 text-green-600 dark:text-green-400"
                        />
                        <span>
                          {formatDate(
                            report.createdAt || report.date,
                            language
                          )}
                        </span>
                      </div>

                      {/* Issue type and priority */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300">
                          {report.issueType || t.unknown}
                        </span>

                        {report.priority && (
                          <span className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300">
                            {t.priority}: {getPriority(report.priority, t)}
                          </span>
                        )}
                      </div>

                      {/* Animated journey */}
                      <ReportJourney
                        status={report.status}
                        t={t}
                        isArabic={isArabic}
                      />

                      {/* Footer */}
                      <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-white/10">
                        <span className="text-[11px] text-gray-500">
                          EcoPulse
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDelete(report)}
                          disabled={
                            deletingId === report._id ||
                            deletingId !== null
                          }
                          aria-label={t.delete}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                        >
                          {deletingId === report._id ? (
                            <LoaderCircle
                              size={14}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          {t.delete}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* Bottom note */}
        {!isLoading && !loadError && reports.length > 0 && (
          <div className="mt-7 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-500/15 dark:bg-green-500/[0.04]">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
            />

            <p className="text-xs leading-6 text-gray-600 dark:text-gray-400">
              {isArabic
                ? "يتم تحميل البلاغات من قاعدة البيانات. حالة البلاغ تتحدث تلقائيًا عندما يقوم المسؤول بتحديثها."
                : "Reports are loaded from the database. Their status updates automatically when an administrator changes it."}
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default TrackReports;
