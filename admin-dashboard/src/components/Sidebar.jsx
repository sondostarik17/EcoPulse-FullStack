
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  BarChart3,
  Settings,
  ArrowUpRight,
  X,
  ShieldCheck,
} from "lucide-react";

import { useAppContext } from "../context/AppContext";

const USER_SITE_URL = "http://localhost:5175/";

function Sidebar({ mobileOpen, setMobileOpen }) {
  const { t, language, isArabic } = useAppContext();

  const menuItems = [
    { name: t("dashboard"), path: "/", icon: LayoutDashboard },
    { name: t("reports"), path: "/reports", icon: ClipboardList },
    { name: t("users"), path: "/users", icon: Users },
    { name: t("analytics"), path: "/analytics", icon: BarChart3 },
    { name: t("settings"), path: "/settings", icon: Settings },
  ];

  const closeSidebar = () => setMobileOpen(false);

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label={isArabic ? "إغلاق القائمة" : "Close sidebar"}
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-gray-950/40 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        dir={isArabic ? "rtl" : "ltr"}
        className={`
          fixed inset-y-0 z-50 flex h-screen w-[260px]
          flex-col border-gray-200 bg-white
          transition-transform duration-300
          dark:border-white/[0.08] dark:bg-[#111318]
          lg:sticky lg:top-0 lg:translate-x-0
          ${isArabic ? "right-0 border-l" : "left-0 border-r"}
          ${
            mobileOpen
              ? "translate-x-0"
              : isArabic
                ? "translate-x-full"
                : "-translate-x-full"
          }
        `}
      >
        {/* Brand */}
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-gray-100 px-5 dark:border-white/[0.07]">
          <NavLink
            to="/"
            onClick={closeSidebar}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <ShieldCheck size={21} strokeWidth={2} />
            </div>

            <div>
              <h1 className="text-[19px] font-bold tracking-tight text-gray-900 dark:text-white">
                Eco<span className="text-emerald-600">Pulse</span>
              </h1>

              <p className="mt-0.5 text-[10px] font-medium tracking-[1.5px] text-gray-400">
                {t("adminPanel")}
              </p>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={closeSidebar}
            aria-label={isArabic ? "إغلاق" : "Close"}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[1.5px] text-gray-400">
            {t("overview")}
          </p>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-lg px-3 py-3 text-[13px] font-semibold transition-colors ${
                      isActive
                        ? "bg-emerald-600 text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-white"
                    }`
                  }
                >
                  <Icon size={18} strokeWidth={1.9} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-100 p-4 dark:border-white/[0.07]">
          <a
            href={USER_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.05]"
          >
            <ArrowUpRight size={18} />
            <span>
              {isArabic ? "موقع المستخدم" : "User Website"}
            </span>
          </a>

          <div className="mt-3 flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-white/[0.04]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
              A
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                {isArabic ? "مدير النظام" : "Administrator"}
              </p>

              <p className="mt-0.5 text-[11px] text-gray-500">
                {isArabic ? "مساحة الإدارة" : "Admin workspace"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
