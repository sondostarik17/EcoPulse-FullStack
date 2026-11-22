
import { useEffect, useMemo, useState } from "react";
import {
  Users as UsersIcon,
  UserCheck,
  Mail,
  Search,
  RefreshCw,
  CalendarDays,
  Phone,
  AlertCircle,
} from "lucide-react";

import { useAppContext } from "../context/AppContext";
import { apiRequest } from "../services/api";

export default function Users() {
  const { t, language } = useAppContext();
  const isArabic = language === "ar";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadUsers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await apiRequest("/admin/users");

      if (!data.success) {
        throw new Error(
          data.message || "Unable to load users."
        );
      }

      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (err) {
      console.error("Load users error:", err);
      setError(
        err.message ||
          (isArabic
            ? "تعذر تحميل المستخدمين."
            : "Unable to load users.")
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const activeUsers = users.filter(
    (user) => user.isActive === true
  ).length;

  const inactiveUsers = users.length - activeUsers;

  const filteredUsers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return users;

    return users.filter((user) => {
      const name = `${user.firstName || ""} ${user.lastName || ""}`;

      return (
        name.toLowerCase().includes(value) ||
        (user.email || "").toLowerCase().includes(value) ||
        (user.phone || "").toLowerCase().includes(value)
      );
    });
  }, [users, search]);

  const stats = [
    {
      title: isArabic ? "إجمالي المستخدمين" : "Total Users",
      value: users.length,
      icon: UsersIcon,
      description: isArabic
        ? "جميع الحسابات المسجلة"
        : "All registered accounts",
    },
    {
      title: isArabic ? "المستخدمون النشطون" : "Active Users",
      value: activeUsers,
      icon: UserCheck,
      description: isArabic
        ? "الحسابات النشطة"
        : "Currently active accounts",
    },
    {
      title: isArabic ? "المستخدمون غير النشطين" : "Inactive Users",
      value: inactiveUsers,
      icon: Mail,
      description: isArabic
        ? "الحسابات غير النشطة"
        : "Inactive accounts",
    },
  ];

  const formatDate = (dateValue) => {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString(
      isArabic ? "ar-EG" : "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="space-y-7" dir={isArabic ? "rtl" : "ltr"}>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-950 dark:text-white">
            {t("users")}
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {isArabic
              ? "إدارة ومتابعة مستخدمي مجتمع EcoPulse."
              : "Manage and monitor EcoPulse community users."}
          </p>
        </div>

        <button
          onClick={() => loadUsers(true)}
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
              onClick={() => loadUsers()}
              className="mt-2 font-bold underline"
            >
              {isArabic ? "إعادة المحاولة" : "Try Again"}
            </button>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg dark:border-white/[0.08] dark:bg-gray-900"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Icon size={23} />
                </div>
              </div>

              <p className="mt-5 text-sm font-medium text-gray-500 dark:text-gray-400">
                {item.title}
              </p>

              <h2 className="mt-2 text-3xl font-extrabold text-gray-950 dark:text-white">
                {loading ? "..." : item.value}
              </h2>

              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.08] dark:bg-gray-900">

        {/* Table Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 p-5 dark:border-white/[0.08]">
          <div>
            <h2 className="text-lg font-bold text-gray-950 dark:text-white">
              {isArabic ? "إدارة المستخدمين" : "User Management"}
            </h2>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {isArabic
                ? `${filteredUsers.length} مستخدم`
                : `${filteredUsers.length} users found`}
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search
              size={17}
              className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${
                isArabic ? "right-3" : "left-3"
              }`}
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                isArabic
                  ? "ابحث بالاسم أو البريد أو الهاتف..."
                  : "Search name, email or phone..."
              }
              className={`h-11 w-full rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none transition focus:border-emerald-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-white ${
                isArabic ? "pr-10 pl-3" : "pl-10 pr-3"
              }`}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">

            <thead>
              <tr className="bg-gray-50 text-gray-500 dark:bg-white/[0.03] dark:text-gray-400">
                <th className="px-6 py-4 text-start">
                  {isArabic ? "المستخدم" : "User"}
                </th>

                <th className="px-6 py-4 text-start">
                  {isArabic ? "البريد الإلكتروني" : "Email"}
                </th>

                <th className="px-6 py-4 text-start">
                  {isArabic ? "رقم الهاتف" : "Phone"}
                </th>

                <th className="px-6 py-4 text-start">
                  {isArabic ? "تاريخ التسجيل" : "Joined Date"}
                </th>

                <th className="px-6 py-4 text-start">
                  {isArabic ? "الحالة" : "Status"}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.06]">

              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-14 text-center text-gray-500"
                  >
                    <RefreshCw
                      size={24}
                      className="mx-auto animate-spin text-emerald-600"
                    />

                    <p className="mt-3">
                      {isArabic
                        ? "جاري تحميل المستخدمين..."
                        : "Loading users..."}
                    </p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-14 text-center">
                    <UsersIcon
                      size={38}
                      className="mx-auto text-emerald-500"
                    />

                    <p className="mt-3 font-bold text-gray-900 dark:text-white">
                      {isArabic ? "لا توجد نتائج" : "No users found"}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {isArabic
                        ? "جربي البحث بكلمة أخرى."
                        : "Try another search term."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="transition hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                  >

                    {/* User */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-extrabold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                          {(user.firstName || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            ID: {user._id?.slice(-8) || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Mail size={15} className="shrink-0 text-gray-400" />
                        {user.email || "—"}
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Phone size={15} className="shrink-0 text-gray-400" />
                        {user.phone || "—"}
                      </div>
                    </td>

                    {/* Created At */}
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <CalendarDays
                          size={15}
                          className="shrink-0 text-gray-400"
                        />

                        {formatDate(user.createdAt)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          user.isActive
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                        }`}
                      >
                        {user.isActive
                          ? isArabic
                            ? "نشط"
                            : "Active"
                          : isArabic
                            ? "غير نشط"
                            : "Inactive"}
                      </span>
                    </td>

                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
