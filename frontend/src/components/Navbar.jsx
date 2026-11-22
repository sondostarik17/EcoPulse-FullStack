
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { apiRequest } from "../services/api";

import {
  Home,
  Leaf,
  MapPinned,
  ClipboardList,
  UserRound,
  Globe2,
  Sun,
  Moon,
  Menu,
  X,
  LogIn,
  LogOut,
  Recycle,
  Bell,
  CheckCheck,
} from "lucide-react";

// Navigation items
const navItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "Awareness", path: "/awareness", icon: Leaf },
  { name: "Map & Report", path: "/report", icon: MapPinned, protected: true },
  { name: "Track Reports", path: "/track", icon: ClipboardList, protected: true },
  { name: "Profile", path: "/profile", icon: UserRound, protected: true },
];

// Available languages
const languages = [
  { name: "English", code: "en" },
  { name: "العربية", code: "ar" },
  { name: "Français", code: "fr" },
  { name: "Español", code: "es" },
  { name: "Deutsch", code: "de" },
  { name: "Italiano", code: "it" },
  { name: "Português", code: "pt" },
  { name: "Русский", code: "ru" },
  { name: "Türkçe", code: "tr" },
  { name: "中文", code: "zh-CN" },
  { name: "日本語", code: "ja" },
  { name: "한국어", code: "ko" },
  { name: "हिन्दी", code: "hi" },
  { name: "اردو", code: "ur" },
  { name: "فارسی", code: "fa" },
  { name: "Nederlands", code: "nl" },
  { name: "Polski", code: "pl" },
  { name: "Українська", code: "uk" },
  { name: "Ελληνικά", code: "el" },
  { name: "Svenska", code: "sv" },
  { name: "ไทย", code: "th" },
  { name: "Tiếng Việt", code: "vi" },
  { name: "Indonesia", code: "id" },
  { name: "বাংলা", code: "bn" },
  { name: "עברית", code: "iw" },
  { name: "Română", code: "ro" },
  { name: "Čeština", code: "cs" },
  { name: "Dansk", code: "da" },
  { name: "Suomi", code: "fi" },
  { name: "Norsk", code: "no" },
  { name: "Bahasa Melayu", code: "ms" },
  { name: "Kiswahili", code: "sw" },
];

// RTL languages
const isRTL = (code) => ["ar", "ur", "fa", "iw"].includes(code);

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Theme state
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");

    return savedTheme
      ? savedTheme === "dark"
      : document.documentElement.classList.contains("dark");
  });

  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Menu states
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Language state
  const [selectedLanguage, setSelectedLanguage] = useState(
    () =>
      localStorage.getItem("selectedLang") ||
      localStorage.getItem("siteLanguage") ||
      "en"
  );

  const isArabic = selectedLanguage === "ar";

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  // Apply theme globally
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Check authentication from backend
  useEffect(() => {
    let isMounted = true;

    const syncAuth = async () => {
      try {
        const data = await apiRequest("/auth/me");

        if (isMounted) {
          setIsLoggedIn(Boolean(data?.user));
        }
      } catch (error) {
        if (isMounted) {
          setIsLoggedIn(false);
        }
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    };

    syncAuth();

    const handleAuthChanged = () => {
      syncAuth();
    };

    window.addEventListener("authChanged", handleAuthChanged);

    return () => {
      isMounted = false;
      window.removeEventListener("authChanged", handleAuthChanged);
    };
  }, [location.pathname]);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!isLoggedIn) {
      setNotifications([]);
      return;
    }

    try {
      setNotificationsLoading(true);

      const data = await apiRequest("/notifications");

      const list = Array.isArray(data?.notifications)
        ? data.notifications
        : Array.isArray(data?.data?.notifications)
        ? data.data.notifications
        : [];

      setNotifications(list);
    } catch (error) {
      console.error("Notifications Error:", error);
    } finally {
      setNotificationsLoading(false);
    }
  }, [isLoggedIn]);

  // Load notifications and refresh every 30 seconds
  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
      return;
    }

    loadNotifications();

    const intervalId = window.setInterval(() => {
      if (!document.hidden) {
        loadNotifications();
      }
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [isLoggedIn, loadNotifications]);

  // Close menus after navigation
  useEffect(() => {
    setMenuOpen(false);
    setLanguageOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  // Initialize Google Translate
  useEffect(() => {
    window.gtranslateSettings = {
      default_language: "en",
      languages: languages.map((language) => language.code),
      wrapper_selector: ".gtranslate_wrapper",
    };

    const existingScript = document.querySelector(
      'script[data-ecopulse-gtranslate="true"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");

      script.src =
        "https://cdn.gtranslate.net/widgets/latest/dropdown.js";

      script.async = true;
      script.dataset.ecopulseGtranslate = "true";

      document.body.appendChild(script);
    }

    document.documentElement.lang = selectedLanguage;

    document.documentElement.dir = isRTL(selectedLanguage)
      ? "rtl"
      : "ltr";
  }, []);

  // Mark one notification as read
  const markAsRead = async (notificationId) => {
    try {
      await apiRequest(`/notifications/${notificationId}/read`, {
        method: "PATCH",
      });

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Mark Notification Error:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await apiRequest("/notifications/read-all", {
        method: "PATCH",
      });

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error("Mark All Notifications Error:", error);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    setNotificationsOpen(false);
    navigate("/track");
  };

  // Toggle theme
  const toggleTheme = () => {
    setIsDark((current) => !current);
  };

  // Check whether user can access a protected page
  const handleNavigation = (event, item) => {
    if (item.protected && (authLoading || !isLoggedIn)) {
      event.preventDefault();

      setMenuOpen(false);
      setLanguageOpen(false);
      setNotificationsOpen(false);

      navigate("/login", {
        state: { from: item.path },
      });

      return;
    }

    setMenuOpen(false);
    setLanguageOpen(false);
    setNotificationsOpen(false);
  };

  // Change language
  const changeLanguage = (code) => {
    setSelectedLanguage(code);

    localStorage.setItem("selectedLang", code);
    localStorage.setItem("siteLanguage", code);

    document.documentElement.lang = code;
    document.documentElement.dir = isRTL(code) ? "rtl" : "ltr";

    // Google Translate language cookie
    if (code === "en") {
      document.cookie =
        "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    } else {
      document.cookie = `googtrans=/en/${code}; path=/; SameSite=Lax`;
    }

    setLanguageOpen(false);

    // Reload to apply translation
    window.location.reload();
  };

  // Login / Logout
  const handleAuth = async () => {
    if (authLoading) return;

    if (!isLoggedIn) {
      navigate("/login");
      setMenuOpen(false);
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to log out?"
    );

    if (!confirmed) return;

    try {
      await apiRequest("/auth/logout", {
        method: "POST",
      });

      setIsLoggedIn(false);
      setNotifications([]);

      // Remove old authentication data
      const oldKeys = [
        "token",
        "ecopulseUser",
        "isLoggedIn",
        "Role",
        "Firstname",
        "Lastname",
        "Email",
        "Phone",
        "userProfilePic",
        "profileImage",
      ];

      oldKeys.forEach((key) => {
        localStorage.removeItem(key);
      });

      // Notify other components
      window.dispatchEvent(new Event("authChanged"));

      setMenuOpen(false);
      setLanguageOpen(false);
      setNotificationsOpen(false);

      navigate("/login", { replace: true });
    } catch (error) {
      alert(error.message || "Logout failed. Please try again.");
    }
  };

  // Active navigation link
  const isActive = (path) => {
    return (
      location.pathname === path ||
      (path !== "/" && location.pathname.startsWith(`${path}/`))
    );
  };

  // Navigation link styling
  const getNavClass = (path) => {
    return `group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
      isActive(path)
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
    }`;
  };

  // Login / Logout button styling
  const authButtonClass = isLoggedIn
    ? "border border-red-500/20 bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/30"
    : "border border-emerald-500/20 bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500/30";

  // Icon button styling
  const baseIconButton =
    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2";

  const iconButtonClass = `${baseIconButton} border-gray-200 bg-white text-gray-700 hover:border-emerald-500/40 hover:bg-emerald-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-200 dark:hover:bg-white/[0.09] focus:ring-emerald-500/30`;

  return (
    <>
      {/* Google Translate widget */}
      <div
        className="gtranslate_wrapper fixed -left-[9999px] top-0"
        aria-hidden="true"
      />

      <header className="sticky top-3 z-50 mx-auto w-[calc(100%-1rem)] max-w-[1600px] rounded-2xl border border-gray-200/80 bg-white/95 shadow-[0_8px_35px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition-colors duration-300 dark:border-white/10 dark:bg-gray-950/95 dark:shadow-[0_8px_35px_rgba(0,0,0,0.25)]">

        <div className="flex min-h-[76px] items-center justify-between gap-3 px-3 py-3 sm:px-5 lg:gap-5 lg:px-6 xl:px-7">

          {/* Logo */}
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="group flex shrink-0 items-center gap-2"
            aria-label="EcoPulse Home"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <Recycle size={22} />
            </div>

            <div>
              <span className="block text-[19px] font-extrabold leading-tight tracking-[-0.7px] text-gray-950 dark:text-white sm:text-[22px]">
                Eco<span className="text-emerald-600">Pulse</span>
              </span>

              <span className="mt-1 hidden text-[9px] font-bold uppercase tracking-[1.7px] text-gray-500 dark:text-gray-400 min-[390px]:block sm:text-[10px]">
                Make Every Street Clean
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden flex-1 items-center justify-center gap-1 xl:flex"
            aria-label="Main navigation"
          >
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={getNavClass(item.path)}
                  onClick={(event) => handleNavigation(event, item)}
                  aria-current={
                    isActive(item.path) ? "page" : undefined
                  }
                >
                  <Icon size={16} strokeWidth={1.9} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">

            {/* Language */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setLanguageOpen((current) => !current);
                  setMenuOpen(false);
                  setNotificationsOpen(false);
                }}
                className={iconButtonClass}
                aria-label="Choose language"
                aria-expanded={languageOpen}
                title="Choose language"
              >
                <Globe2 size={19} className="text-emerald-600" />
              </button>

              {languageOpen && (
                <div className="absolute right-0 top-[calc(100%+12px)] z-[70] w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl shadow-black/10 dark:border-white/10 dark:bg-gray-950 dark:shadow-black/40 sm:w-60">

                  <div className="flex items-center justify-between border-b border-gray-100 px-3 pb-3 pt-2 dark:border-white/10">
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        Website Language
                      </p>

                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Select your language
                      </p>
                    </div>

                    <Globe2 size={18} className="text-emerald-600" />
                  </div>

                  <div className="mt-2 max-h-72 space-y-1 overflow-y-auto pr-1">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        type="button"
                        onClick={() => changeLanguage(language.code)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                          selectedLanguage === language.code
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
                            : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-gray-200 dark:hover:bg-emerald-400/10 dark:hover:text-emerald-300"
                        }`}
                      >
                        <span>{language.name}</span>

                        {selectedLanguage === language.code && (
                          <span className="text-xs font-bold">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            {isLoggedIn && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen((current) => !current);
                    setLanguageOpen(false);
                    setMenuOpen(false);

                    if (!notificationsOpen) {
                      loadNotifications();
                    }
                  }}
                  className={`${iconButtonClass} relative`}
                  aria-label="Notifications"
                  aria-expanded={notificationsOpen}
                  title="Notifications"
                >
                  <Bell size={19} className="text-emerald-600" />

                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold text-white dark:border-gray-950">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-[calc(100%+12px)] z-[80] w-[min(350px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-gray-950">

                    {/* Notification Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 dark:border-white/10">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                          {isArabic ? "الإشعارات" : "Notifications"}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {unreadCount}{" "}
                          {isArabic ? "غير مقروء" : "unread"}
                        </p>
                      </div>

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllAsRead}
                          className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                          <CheckCheck size={15} />
                          {isArabic ? "قراءة الكل" : "Mark all read"}
                        </button>
                      )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[350px] overflow-y-auto">

                      {notificationsLoading && notifications.length === 0 ? (
                        <p className="p-6 text-center text-sm text-gray-500">
                          {isArabic
                            ? "جاري تحميل الإشعارات..."
                            : "Loading notifications..."}
                        </p>
                      ) : notifications.length === 0 ? (
                        <div className="px-4 py-10 text-center">
                          <Bell
                            size={30}
                            className="mx-auto mb-3 text-gray-400"
                          />

                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            {isArabic
                              ? "لا توجد إشعارات حتى الآن"
                              : "No notifications yet"}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {isArabic
                              ? "ستظهر التحديثات هنا"
                              : "Updates will appear here"}
                          </p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <button
                            key={notification._id}
                            type="button"
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                            className={`flex w-full gap-3 border-b border-gray-100 p-4 text-left transition-colors hover:bg-gray-50 dark:border-white/[0.06] dark:hover:bg-white/[0.04] ${
                              !notification.isRead
                                ? "bg-emerald-50/60 dark:bg-emerald-400/[0.06]"
                                : ""
                            }`}
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                              <Recycle size={19} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {notification.title}
                              </p>

                              <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-gray-400">
                                {notification.message}
                              </p>

                              <p className="mt-2 text-[10px] text-gray-400">
                                {notification.createdAt
                                  ? new Date(
                                      notification.createdAt
                                    ).toLocaleString(
                                      isArabic ? "ar-EG" : "en-US"
                                    )
                                  : ""}
                              </p>
                            </div>

                            {!notification.isRead && (
                              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Theme */}
            <button
              type="button"
              onClick={toggleTheme}
              className={iconButtonClass}
              aria-label={
                isDark ? "Switch to light mode" : "Switch to dark mode"
              }
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? (
                <Sun
                  size={19}
                  strokeWidth={1.9}
                  className="text-amber-400"
                />
              ) : (
                <Moon
                  size={19}
                  strokeWidth={1.9}
                  className="text-gray-700"
                />
              )}
            </button>

            {/* Desktop Login / Logout */}
            <button
              type="button"
              onClick={handleAuth}
              disabled={authLoading}
              className={`hidden min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 disabled:cursor-wait disabled:opacity-60 xl:inline-flex ${authButtonClass}`}
            >
              {isLoggedIn ? (
                <>
                  <LogOut size={16} />
                  <span>Logout</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Login</span>
                </>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => {
                setMenuOpen((current) => !current);
                setLanguageOpen(false);
                setNotificationsOpen(false);
              }}
              className={`${iconButtonClass} xl:hidden`}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="border-t border-gray-200/80 px-3 pb-4 pt-3 dark:border-white/10 sm:px-5 xl:hidden">

            <div className="mb-3 flex items-center gap-2 rounded-xl bg-emerald-50/80 p-3 dark:bg-emerald-400/[0.07]">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Recycle size={19} />
              </div>

              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  EcoPulse
                </p>

                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  Cleaner streets, better future
                </p>
              </div>
            </div>

            <nav
              className="grid grid-cols-1 gap-1 min-[480px]:grid-cols-2"
              aria-label="Mobile navigation"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={(event) => handleNavigation(event, item)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/[0.06]"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon size={18} />

                    <span>{item.name}</span>

                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-3 border-t border-gray-200/80 pt-3 dark:border-white/10">
              <button
                type="button"
                onClick={handleAuth}
                disabled={authLoading}
                className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-wait disabled:opacity-60 ${
                  isLoggedIn
                    ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/30"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500/30"
                }`}
              >
                {isLoggedIn ? (
                  <>
                    <LogOut size={17} />
                    <span>Logout</span>
                  </>
                ) : (
                  <>
                    <LogIn size={17} />
                    <span>Login</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}