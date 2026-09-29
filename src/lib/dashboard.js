import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "./api";
import { useAuthStore } from "./auth";

export const adminDashboardQueryKey = ["admin-dashboard"];

export const ADMIN_DASHBOARD_STALE_TIME = 60 * 1000;

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeAmount(value) {
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
}

function normalizeRevenueSeries(value) {
  return asArray(value)
    .map((row) => ({
      date: row?.date ?? "",
      amount: normalizeAmount(row?.amount),
    }))
    .filter((row) => row.date);
}

function normalizeTopProducts(value) {
  return asArray(value).map((row) => ({
    id: row?.product?.id ?? null,
    title: row?.product?.title ?? "",
    slug: row?.product?.slug ?? "",
    salesCount: Number(row?.sales_count ?? 0),
    revenue: normalizeAmount(row?.revenue),
  }));
}

function normalizeTopCourses(value) {
  return asArray(value).map((row) => ({
    id: row?.course?.id ?? null,
    title: row?.course?.title ?? "",
    slug: row?.course?.slug ?? "",
    salesCount: Number(row?.sales_count ?? 0),
    revenue: normalizeAmount(row?.revenue),
  }));
}

function normalizeTopServices(value) {
  return asArray(value).map((row) => ({
    id: row?.service?.id ?? null,
    title: row?.service?.name ?? "",
    salesCount: Number(row?.booking_count ?? 0),
    revenue: normalizeAmount(row?.revenue),
  }));
}

function normalizeTopPackages(value) {
  return asArray(value).map((row) => ({
    id: row?.package?.id ?? null,
    title: row?.package?.name ?? "",
    slug: row?.package?.slug ?? "",
    salesCount: Number(row?.sales_count ?? 0),
    revenue: normalizeAmount(row?.revenue),
  }));
}

export function normalizeAdminDashboard(payload) {
  const data = payload?.data ?? payload;
  if (!data || typeof data !== "object") {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }

  const stats = data.stats ?? {};
  const revenue = data.revenue ?? {};
  const alerts = data.alerts ?? {};

  return {
    stats: {
      appointmentsToday: Number(stats.appointments_today ?? 0),
      appointmentsThisMonth: Number(stats.appointments_this_month ?? 0),
      revenueThisMonth: normalizeAmount(stats.revenue_this_month),
      newCustomers: Number(stats.new_customers ?? 0),
      pendingOrders: Number(stats.pending_orders ?? 0),
      pendingPayments: Number(stats.pending_payments ?? 0),
    },
    revenue: {
      last7Days: normalizeRevenueSeries(revenue.last_7_days),
      last30Days: normalizeRevenueSeries(revenue.last_30_days),
    },
    appointments: asArray(data.appointments).map((item) => ({
      id: item?.id ?? null,
      customerName: item?.customer?.name ?? "",
      consultantName: item?.consultant?.name ?? "",
      service: item?.service ?? "",
      startAt: item?.start_at ?? null,
      status: item?.status ?? "",
    })),
    topProducts: normalizeTopProducts(data.top_products),
    topCourses: normalizeTopCourses(data.top_courses),
    topServices: normalizeTopServices(data.top_services),
    topPackages: normalizeTopPackages(data.top_packages),
    recentOrders: asArray(data.recent_orders).map((order) => ({
      id: order?.id ?? null,
      orderNo: order?.order_no ?? "",
      customerName: order?.customer?.name ?? "",
      total: normalizeAmount(order?.total),
      status: order?.status ?? "",
      createdAt: order?.created_at ?? null,
    })),
    newCustomers: asArray(data.new_customers).map((customer) => ({
      id: customer?.id ?? null,
      name: customer?.name ?? "",
      phone: customer?.phone ?? "",
      email: customer?.email ?? "",
      createdAt: customer?.created_at ?? null,
    })),
    alerts: {
      pendingAppointments: Number(alerts.pending_appointments ?? 0),
      failedPayments: Number(alerts.failed_payments ?? 0),
      unreadContactMessages: Number(alerts.unread_contact_messages ?? 0),
      pendingBlogComments: Number(alerts.pending_blog_comments ?? 0),
      lowStockProducts: asArray(alerts.low_stock_products).map((product) => ({
        id: product?.id ?? null,
        title: product?.title ?? "",
        stock: Number(product?.stock ?? 0),
      })),
    },
  };
}

function useToken() {
  return useAuthStore((state) => state.token);
}

export function useAdminDashboardQuery(options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: adminDashboardQueryKey,
    queryFn: async () =>
      normalizeAdminDashboard(await api.adminDashboard(token)),
    enabled: options.enabled !== false && Boolean(token),
    staleTime: ADMIN_DASHBOARD_STALE_TIME,
  });
}
