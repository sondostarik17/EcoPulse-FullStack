import { useApp } from "../context/AppContext";

function StatusBadge({ status }) {
  const { t } = useApp();

  const statusStyles = {
    pending:
      "bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20",

    "in-progress":
      "bg-blue-50 text-blue-700 ring-blue-600/15 dark:bg-blue-400/10 dark:text-blue-300 dark:ring-blue-400/20",

    completed:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20",

    rejected:
      "bg-red-50 text-red-700 ring-red-600/15 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-400/20",
  };

  const labels = {
    pending: t("pending"),
    "in-progress": t("inProgress"),
    completed: t("completed"),
    rejected: t("rejected"),
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        statusStyles[status] || statusStyles.pending
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />

      {labels[status] || t("pending")}
    </span>
  );
}

export default StatusBadge;