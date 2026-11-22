
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Bell,
  ChevronDown,
  Menu,
  Moon,
  Sun,
  LogOut,
  Loader2,
  FileText,
  Check,
  CheckCheck,
  X,
  Clock,
} from "lucide-react";

import { useAppContext } from "../context/AppContext";
import { logoutAdmin } from "../services/api";

export default function Topbar({
  onMenuClick,
  title = "Dashboard Overview",
}) {
  const {
    theme,
    toggleTheme,
    language,
    setLanguage,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useAppContext();

  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] =
    useState(false);

  const isArabic = language === "ar";
  const isDark = theme === "dark";

  const text = {
    admin: isArabic ? "لوحة الإدارة" : "Admin",
    dashboard: isArabic ? "لوحة التحكم" : title,
    welcome: isArabic ? "مرحباً بكِ، Admin" : "Welcome back, Admin",

    light: isArabic ? "الوضع الفاتح" : "Light Mode",
    dark: isArabic ? "الوضع الداكن" : "Dark Mode",

    notifications: isArabic ? "الإشعارات" : "Notifications",
    newNotifications: isArabic
      ? "إشعارات جديدة"
      : "New notifications",

    noNotifications: isArabic
      ? "لا توجد إشعارات جديدة"
      : "No new notifications",

    markAllRead: isArabic
      ? "تحديد الكل كمقروء"
      : "Mark all as read",

    clear: isArabic ? "مسح الكل" : "Clear all",

    newReport: isArabic
      ? "تم استلام بلاغ جديد"
      : "New report received",

    viewReport: isArabic
      ? "عرض البلاغات"
      : "View reports",

    administrator: isArabic ? "مدير النظام" : "Administrator",
    workspace: isArabic ? "مساحة الإدارة" : "Admin workspace",

    logout: isArabic ? "تسجيل الخروج" : "Logout",
    loggingOut: isArabic ? "جاري الخروج..." : "Logging out...",

    logoutError: isArabic
      ? "تعذر تسجيل الخروج. حاولي مرة أخرى."
      : "Could not log out. Please try again.",

    justNow: isArabic ? "الآن" : "Just now",
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logoutAdmin();
      navigate("/login", { replace: true });
    } catch (error) {
      window.alert(text.logoutError);
      setIsLoggingOut(false);
    }
  };

  const handleNotificationClick = (notification) => {
    markNotificationRead(notification.id);
    setIsNotificationsOpen(false);

    navigate("/reports");
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
  };

  const handleClearNotifications = () => {
    clearNotifications();
  };

  const formatTime = (date) => {
    if (!date) return text.justNow;

    const time = new Date(date);

    if (Number.isNaN(time.getTime())) {
      return text.justNow;
    }

    return time.toLocaleString(isArabic ? "ar-EG" : "en-US", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  return (
    <header
      dir={isArabic ? "rtl" : "ltr"}
      className="sticky top-0 z-30 flex min-h-[82px] items-center justify-between gap-3 border-b border-gray-200/80 bg-white/90 px-4 backdrop-blur-xl transition-colors duration-300 dark:border-white/[0.08] dark:bg-gray-950/90 sm:px-6 lg:px-8"
    >
      {/* Left Section */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
              {text.admin}
            </p>

            <span className="text-gray-300 dark:text-gray-700">
              /
            </span>

            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {text.dashboard}
            </p>
          </div>

          <h1 className="mt-1 truncate text-lg font-extrabold tracking-tight text-gray-950 dark:text-white sm:text-xl">
            {text.welcome}
          </h1>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">

        {/* Language */}
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="h-10 cursor-pointer rounded-xl border border-gray-200 bg-white px-2 text-sm font-semibold text-gray-700 outline-none transition hover:bg-gray-50 focus:border-emerald-500 dark:border-white/10 dark:bg-gray-900 dark:text-gray-200 sm:px-3"
          aria-label="Change language"
        >
          <option value="en">EN</option>
          <option value="ar">العربية</option>
        </select>

        {/* Dark / Light Mode */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? text.light : text.dark}
          aria-label={isDark ? text.light : text.dark}
          aria-pressed={isDark}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition-all duration-300 hover:scale-105 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-yellow-300 dark:hover:bg-white/[0.08]"
        >
          {isDark ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setIsNotificationsOpen((current) => !current)
            }
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-300 dark:hover:bg-white/[0.08]"
            aria-label={text.notifications}
            aria-expanded={isNotificationsOpen}
          >
            <Bell size={18} />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-950">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <>
              <button
                type="button"
                aria-label="Close notifications"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setIsNotificationsOpen(false)}
              />

              <div className="absolute end-0 top-14 z-50 w-[min(350px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/10 dark:border-white/10 dark:bg-gray-900 dark:shadow-black/30">

                {/* Dropdown Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 dark:border-white/[0.08]">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      {text.notifications}
                    </h3>

                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {unreadCount} {text.newNotifications}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        title={text.markAllRead}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 transition hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-400/10"
                      >
                        <CheckCheck size={17} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setIsNotificationsOpen(false)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 dark:hover:bg-white/10"
                      aria-label="Close"
                    >
                      <X size={17} />
                    </button>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-[360px] overflow-y-auto">

                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-white/[0.06]">
                        <Bell size={22} />
                      </div>

                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {text.noNotifications}
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        type="button"
                        key={notification.id}
                        onClick={() =>
                          handleNotificationClick(notification)
                        }
                        className={`flex w-full items-start gap-3 border-b border-gray-100 px-4 py-4 text-start transition hover:bg-gray-50 dark:border-white/[0.06] dark:hover:bg-white/[0.04] ${
                          !notification.isRead
                            ? "bg-emerald-50/50 dark:bg-emerald-400/[0.04]"
                            : ""
                        }`}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400">
                          <FileText size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {text.newReport}
                            </p>

                            {!notification.isRead && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                            )}
                          </div>

                          {notification.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                              {notification.description}
                            </p>
                          )}

                          <div className="mt-2 flex items-center gap-1 text-[11px] text-gray-400">
                            <Clock size={12} />
                            {formatTime(notification.createdAt)}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* Dropdown Footer */}
                {notifications.length > 0 && (
                  <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-4 py-3 dark:border-white/[0.08]">
                    <button
                      type="button"
                      onClick={handleClearNotifications}
                      className="text-xs font-semibold text-gray-500 transition hover:text-red-500 dark:text-gray-400"
                    >
                      {text.clear}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        navigate("/reports");
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400"
                    >
                      {text.viewReport}
                      <ChevronDown
                        size={14}
                        className="rotate-[-90deg]"
                      />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="hidden h-9 w-px bg-gray-200 dark:bg-white/10 sm:block" />

        {/* Admin Profile */}
        <div className="hidden items-center gap-2 rounded-xl px-2 py-1.5 sm:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
            A
          </div>

          <div className="hidden text-left lg:block">
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {text.administrator}
            </p>

            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {text.workspace}
            </p>
          </div>

          <ChevronDown size={16} className="text-gray-400" />
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          title={text.logout}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300 dark:hover:bg-red-400/20"
        >
          {isLoggingOut ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <LogOut size={17} />
          )}

          <span className="hidden md:inline">
            {isLoggingOut ? text.loggingOut : text.logout}
          </span>
        </button>
      </div>
    </header>
  );
}
