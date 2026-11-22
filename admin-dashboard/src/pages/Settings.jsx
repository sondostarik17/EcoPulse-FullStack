
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Globe2,
  Check,
  Monitor,
} from "lucide-react";

import { useAppContext } from "../context/AppContext";

export default function Settings() {
  const {
    theme,
    toggleTheme,
    language,
    setLanguage,
  } = useAppContext();

  const isArabic = language === "ar";

  return (
    <div className="space-y-7" dir={isArabic ? "rtl" : "ltr"}>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-950 dark:text-white">
          {isArabic ? "الإعدادات" : "Settings"}
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {isArabic
            ? "خصصي إعدادات لوحة تحكم EcoPulse."
            : "Customize your EcoPulse Admin Dashboard experience."}
        </p>
      </div>

      {/* Preferences */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.08] dark:bg-gray-900">

        {/* Appearance */}
        <div className="flex flex-col gap-5 border-b border-gray-100 p-6 dark:border-white/[0.08] sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
              {theme === "light" ? (
                <Sun size={22} />
              ) : (
                <Moon size={22} />
              )}
            </div>

            <div>
              <h2 className="font-bold text-gray-950 dark:text-white">
                {isArabic ? "المظهر" : "Appearance"}
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {isArabic
                  ? "اختاري بين الوضع الفاتح والداكن."
                  : "Switch between light and dark mode."}
              </p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            {theme === "light" ? (
              <>
                <Sun size={17} />
                {isArabic ? "الوضع الفاتح" : "Light Mode"}
              </>
            ) : (
              <>
                <Moon size={17} />
                {isArabic ? "الوضع الداكن" : "Dark Mode"}
              </>
            )}
          </button>
        </div>

        {/* Language */}
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
              <Globe2 size={22} />
            </div>

            <div>
              <h2 className="font-bold text-gray-950 dark:text-white">
                {isArabic ? "اللغة" : "Language"}
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {isArabic
                  ? "اختاري لغة لوحة التحكم."
                  : "Choose your dashboard language."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setLanguage("en")}
              className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition ${
                language === "en"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
              }`}
            >
              {language === "en" && <Check size={16} />}
              English
            </button>

            <button
              onClick={() => setLanguage("ar")}
              className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition ${
                language === "ar"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
              }`}
            >
              {language === "ar" && <Check size={16} />}
              العربية
            </button>
          </div>
        </div>
      </div>

      {/* Current Preferences */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/[0.08] dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
            <SettingsIcon size={22} />
          </div>

          <div>
            <h2 className="font-bold text-gray-950 dark:text-white">
              {isArabic ? "تفضيلات لوحة التحكم" : "Admin Preferences"}
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {isArabic
                ? "إعداداتك الحالية."
                : "Your current dashboard preferences."}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">

          <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/[0.04]">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Monitor size={17} />
              <span className="text-xs font-semibold">
                {isArabic ? "المظهر الحالي" : "Current Theme"}
              </span>
            </div>

            <p className="mt-2 font-bold text-gray-900 dark:text-white">
              {theme === "light"
                ? isArabic ? "فاتح" : "Light"
                : isArabic ? "داكن" : "Dark"}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/[0.04]">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Globe2 size={17} />
              <span className="text-xs font-semibold">
                {isArabic ? "اللغة الحالية" : "Current Language"}
              </span>
            </div>

            <p className="mt-2 font-bold text-gray-900 dark:text-white">
              {language === "ar" ? "العربية" : "English"}
            </p>
          </div>

        </div>

        <p className="mt-5 text-xs text-gray-400 dark:text-gray-500">
          {isArabic
            ? "يتم حفظ تفضيلاتك حسب إعدادات التطبيق."
            : "Your preferences are managed by the application context."}
        </p>
      </div>
    </div>
  );
}