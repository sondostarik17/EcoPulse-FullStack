
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  apiRequest,
  getCurrentAdmin,
} from "../services/api";

const AppContext = createContext(null);

const translations = {
  en: {
    dashboard: "Dashboard",
    reports: "Reports",
    users: "Users",
    analytics: "Analytics",
    settings: "Settings",
    adminPanel: "Admin Panel",
    overview: "Overview",
    login: "Login",
    logout: "Logout",
    search: "Search",
    notifications: "Notifications",
    profile: "Profile",
    welcome: "Welcome back",
    loading: "Loading...",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    language: "Language",
    english: "English",
    arabic: "Arabic",
    totalReports: "Total Reports",
    pendingReports: "Pending Reports",
    completedReports: "Completed Reports",
    totalUsers: "Total Users",
    recentReports: "Recent Reports",
    viewAll: "View All",
    noData: "No data available",
    newReport: "New report received",
    noNotifications: "No notifications yet",
    markAllRead: "Mark all as read",
    viewReports: "View reports",
  },

  ar: {
    dashboard: "لوحة التحكم",
    reports: "البلاغات",
    users: "المستخدمون",
    analytics: "الإحصائيات",
    settings: "الإعدادات",
    adminPanel: "لوحة الإدارة",
    overview: "نظرة عامة",
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
    search: "بحث",
    notifications: "الإشعارات",
    profile: "الملف الشخصي",
    welcome: "مرحبًا بعودتك",
    loading: "جاري التحميل...",
    lightMode: "الوضع الفاتح",
    darkMode: "الوضع الداكن",
    language: "اللغة",
    english: "الإنجليزية",
    arabic: "العربية",
    totalReports: "إجمالي البلاغات",
    pendingReports: "البلاغات قيد المراجعة",
    completedReports: "البلاغات المكتملة",
    totalUsers: "إجمالي المستخدمين",
    recentReports: "أحدث البلاغات",
    viewAll: "عرض الكل",
    noData: "لا توجد بيانات",
    newReport: "تم استلام بلاغ جديد",
    noNotifications: "لا توجد إشعارات حتى الآن",
    markAllRead: "تحديد الكل كمقروء",
    viewReports: "عرض البلاغات",
  },
};

export function AppProvider({ children }) {
  // Theme
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark" ? "dark" : "light";
  });

  // Language
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem("language");
    return savedLanguage === "ar" ? "ar" : "en";
  });

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Refs
  const knownReportIds = useRef(null);
  const checkingAuth = useRef(false);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      theme === "dark"
    );

    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Apply language
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir =
      language === "ar" ? "rtl" : "ltr";

    localStorage.setItem("language", language);
  }, [language]);

  // Fetch reports and detect newly submitted reports
  const fetchNotifications = async () => {
    try {
      const data = await apiRequest("/admin/reports", {
        method: "GET",
      });

      const reports = Array.isArray(data.reports)
        ? data.reports
        : [];

      const currentIds = new Set(
        reports.map((report) => report._id).filter(Boolean)
      );

      // First successful fetch: save existing reports as baseline.
      // Old reports will not appear as new notifications.
      if (knownReportIds.current === null) {
        knownReportIds.current = currentIds;
        return;
      }

      const newReports = reports.filter(
        (report) =>
          report._id &&
          !knownReportIds.current.has(report._id)
      );

      if (newReports.length > 0) {
        const newNotifications = newReports.map((report) => ({
          id: report._id,
          reportId: report._id,
          title: "newReport",
          description:
            report.description || report.location || "",
          createdAt: report.createdAt || new Date().toISOString(),
          isRead: false,
        }));

        setNotifications((current) => [
          ...newNotifications,
          ...current,
        ]);
      }

      // Remember all IDs so the same report is not notified twice.
      knownReportIds.current = currentIds;
    } catch (error) {
      console.error("Notifications error:", error.message);
    }
  };

  // Verify admin session
  const verifyAdmin = async () => {
    if (checkingAuth.current) return;

    checkingAuth.current = true;

    try {
      await getCurrentAdmin();
      setIsAdmin(true);
    } catch (error) {
      setIsAdmin(false);
      setNotifications([]);
      knownReportIds.current = null;
    } finally {
      checkingAuth.current = false;
    }
  };

  // Check the session on startup and when login/logout changes.
  useEffect(() => {
    verifyAdmin();

    const handleAuthChanged = () => {
      verifyAdmin();
    };

    window.addEventListener("authChanged", handleAuthChanged);

    return () => {
      window.removeEventListener(
        "authChanged",
        handleAuthChanged
      );
    };
  }, []);

  // Poll for new reports only while an admin is logged in.
  useEffect(() => {
    if (!isAdmin) return;

    // First fetch establishes the baseline.
    fetchNotifications();

    const intervalId = window.setInterval(() => {
      fetchNotifications();
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isAdmin]);

  // Mark one notification as read.
  const markNotificationRead = (notificationId) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  // Mark all notifications as read.
  const markAllNotificationsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );
  };

  // Remove all notifications from the current session.
  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  // Theme functions
  const toggleTheme = () => {
    setTheme((current) =>
      current === "dark" ? "light" : "dark"
    );
  };

  // Language functions
  const toggleLanguage = () => {
    setLanguage((current) =>
      current === "ar" ? "en" : "ar"
    );
  };

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,

    language,
    setLanguage,
    toggleLanguage,

    isArabic: language === "ar",
    isDark: theme === "dark",

    t,

    // Notifications
    notifications,
    unreadCount,
    isAdmin,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      "useAppContext must be used inside AppProvider"
    );
  }

  return context;
}

export const useApp = useAppContext;
