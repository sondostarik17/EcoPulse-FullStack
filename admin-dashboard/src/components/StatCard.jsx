import { useApp } from "../context/AppContext";

function StatCard({ title, value, subtitle, icon: Icon, color = "green" }) {
  const { language } = useApp();

  const colorStyles = {
    green:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
    amber:
      "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
    blue:
      "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300",
    red:
      "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-300",
  };

  return (
    <div
      className={`group rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-900/[0.04] dark:border-white/[0.08] dark:bg-gray-900/80 dark:hover:shadow-black/20 sm:p-6 ${
        language === "ar" ? "text-right" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>

          <p className="mt-3 text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white sm:text-4xl">
            {value}
          </p>

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${
            colorStyles[color]
          }`}
        >
          <Icon size={21} strokeWidth={1.9} />
        </div>
      </div>
    </div>
  );
}

export default StatCard;