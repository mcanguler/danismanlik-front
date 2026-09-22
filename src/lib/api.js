export const API_BASE_URL = `${
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "")
}/api`;

export class ApiError extends Error {
  constructor(message, status, errors = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

async function request(path, { method = "GET", body, token, headers } = {}) {
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined && !isFormData
          ? { "Content-Type": "application/json" }
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body:
        body !== undefined ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new ApiError(
      "Sunucuya ulaşılamadı. Bağlantınızı kontrol edin.",
      0
    );
  }

  let data = null;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    data = await response.json().catch(() => null);
  } else {
    data = await response.text().catch(() => null);
  }

  if (!response.ok) {
    throw new ApiError(
      data?.message ?? `İstek başarısız (${response.status})`,
      response.status,
      data?.errors ?? null
    );
  }

  return data;
}

export const api = {
  phoneExists(phone) {
    return request("/phone-exists", { method: "POST", body: { phone } });
  },
  forgotPassword(phone) {
    return request("/forgot-password", { method: "POST", body: { phone } });
  },
  resetPassword(payload) {
    return request("/reset-password", { method: "POST", body: payload });
  },
  updateProfile(token, payload) {
    return request("/v1/profile", { method: "PATCH", body: payload, token });
  },
  login(credentials) {
    return request("/login", { method: "POST", body: credentials });
  },
  register(payload) {
    return request("/register", { method: "POST", body: payload });
  },
  user(token) {
    return request("/user", { token });
  },
  logout(token) {
    return request("/logout", { method: "POST", token });
  },
  consultants(token, params = {}) {
    const search = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return request(`/v1/consultants${search ? `?${search}` : ""}`, { token });
  },
  consultant(token, id) {
    return request(`/v1/consultants/${id}`, { token });
  },
  createConsultant(token, payload) {
    return request("/v1/consultants", { method: "POST", body: payload, token });
  },
  updateConsultant(token, id, payload) {
    const isFormData =
      typeof FormData !== "undefined" && payload instanceof FormData;
    return request(`/v1/consultants/${id}`, {
      method: isFormData ? "POST" : "PUT",
      body: payload,
      token,
    });
  },
  deleteConsultant(token, id) {
    return request(`/v1/consultants/${id}`, { method: "DELETE", token });
  },
  customers(token, params = {}) {
    const search = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return request(`/v1/customers${search ? `?${search}` : ""}`, { token });
  },
  customer(token, id) {
    return request(`/v1/customers/${id}`, { token });
  },
  createCustomer(token, payload) {
    return request("/v1/customers", { method: "POST", body: payload, token });
  },
  updateCustomer(token, id, payload) {
    return request(`/v1/customers/${id}`, { method: "PUT", body: payload, token });
  },
  deleteCustomer(token, id) {
    return request(`/v1/customers/${id}`, { method: "DELETE", token });
  },
  serviceCategories(token, params = {}) {
    const search = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return request(`/v1/service-categories${search ? `?${search}` : ""}`, { token });
  },
  createServiceCategory(token, payload) {
    return request("/v1/service-categories", { method: "POST", body: payload, token });
  },
  updateServiceCategory(token, id, payload) {
    const isFormData =
      typeof FormData !== "undefined" && payload instanceof FormData;
    return request(`/v1/service-categories/${id}`, {
      method: isFormData ? "POST" : "PUT",
      body: payload,
      token,
    });
  },
  deleteServiceCategory(token, id) {
    return request(`/v1/service-categories/${id}`, { method: "DELETE", token });
  },
  services(token, params = {}) {
    const search = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return request(`/v1/services${search ? `?${search}` : ""}`, { token });
  },
  createService(token, payload) {
    return request("/v1/services", { method: "POST", body: payload, token });
  },
  updateService(token, id, payload) {
    const isFormData =
      typeof FormData !== "undefined" && payload instanceof FormData;
    return request(`/v1/services/${id}`, {
      method: isFormData ? "POST" : "PUT",
      body: payload,
      token,
    });
  },
  deleteService(token, id) {
    return request(`/v1/services/${id}`, { method: "DELETE", token });
  },
  consultantServices(token, params = {}) {
    const search = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return request(`/v1/consultant-services${search ? `?${search}` : ""}`, { token });
  },
  createConsultantService(token, payload) {
    return request("/v1/consultant-services", { method: "POST", body: payload, token });
  },
  updateConsultantService(token, id, payload) {
    return request(`/v1/consultant-services/${id}`, { method: "PUT", body: payload, token });
  },
  deleteConsultantService(token, id) {
    return request(`/v1/consultant-services/${id}`, { method: "DELETE", token });
  },
  workingHours(token, params = {}) {
    const search = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return request(`/v1/working-hours${search ? `?${search}` : ""}`, { token });
  },
  createWorkingHour(token, payload) {
    return request("/v1/working-hours", { method: "POST", body: payload, token });
  },
  updateWorkingHour(token, id, payload) {
    return request(`/v1/working-hours/${id}`, { method: "PUT", body: payload, token });
  },
  deleteWorkingHour(token, id) {
    return request(`/v1/working-hours/${id}`, { method: "DELETE", token });
  },
  breaks(token, params = {}) {
    const search = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return request(`/v1/breaks${search ? `?${search}` : ""}`, { token });
  },
  createBreak(token, payload) {
    return request("/v1/breaks", { method: "POST", body: payload, token });
  },
  updateBreak(token, id, payload) {
    return request(`/v1/breaks/${id}`, { method: "PUT", body: payload, token });
  },
  deleteBreak(token, id) {
    return request(`/v1/breaks/${id}`, { method: "DELETE", token });
  },
  blockedTimes(token, params = {}) {
    const search = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return request(`/v1/blocked-times${search ? `?${search}` : ""}`, { token });
  },
  createBlockedTime(token, payload) {
    return request("/v1/blocked-times", { method: "POST", body: payload, token });
  },
  updateBlockedTime(token, id, payload) {
    return request(`/v1/blocked-times/${id}`, { method: "PUT", body: payload, token });
  },
  deleteBlockedTime(token, id) {
    return request(`/v1/blocked-times/${id}`, { method: "DELETE", token });
  },
  consultantServicesForConsultant(token, consultantId) {
    return request(`/v1/consultants/${consultantId}/services`, { token });
  },
  availability(token, consultantId, params = {}) {
    const search = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return request(
      `/v1/consultants/${consultantId}/availability${search ? `?${search}` : ""}`,
      { token }
    );
  },
  appointments(token, params = {}) {
    const search = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return request(`/v1/appointments${search ? `?${search}` : ""}`, { token });
  },
  createAppointment(token, payload) {
    return request("/v1/appointments", { method: "POST", body: payload, token });
  },
  appointment(token, id) {
    return request(`/v1/appointments/${id}`, { token });
  },
  updateAppointment(token, id, payload) {
    return request(`/v1/appointments/${id}`, {
      method: "PATCH",
      body: payload,
      token,
    });
  },
  cancelAppointment(token, id) {
    return request(`/v1/appointments/${id}/cancel`, { method: "POST", token });
  },
  publicServicePackages(params = {}) {
    const search = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return request(`/service-packages${search ? `?${search}` : ""}`);
  },
  publicServicePackage(slug) {
    return request(`/service-packages/${slug}`);
  },
  servicePackages(token, params = {}) {
    const search = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return request(`/v1/service-packages${search ? `?${search}` : ""}`, { token });
  },
  servicePackage(token, id) {
    return request(`/v1/service-packages/${id}`, { token });
  },
  createServicePackage(token, payload) {
    return request("/v1/service-packages", { method: "POST", body: payload, token });
  },
  updateServicePackage(token, id, payload) {
    const isFormData =
      typeof FormData !== "undefined" && payload instanceof FormData;
    return request(`/v1/service-packages/${id}`, {
      method: isFormData ? "POST" : "PUT",
      body: payload,
      token,
    });
  },
  deleteServicePackage(token, id) {
    return request(`/v1/service-packages/${id}`, { method: "DELETE", token });
  },
  servicePackageCategories(token) {
    return request("/v1/service-package-categories", { token });
  },
  createServicePackageCategory(token, payload) {
    return request("/v1/service-package-categories", { method: "POST", body: payload, token });
  },
  updateServicePackageCategory(token, id, payload) {
    const isFormData =
      typeof FormData !== "undefined" && payload instanceof FormData;
    return request(`/v1/service-package-categories/${id}`, {
      method: isFormData ? "POST" : "PUT",
      body: payload,
      token,
    });
  },
  deleteServicePackageCategory(token, id) {
    return request(`/v1/service-package-categories/${id}`, { method: "DELETE", token });
  },
  customerServicePackages(token) {
    return request("/v1/customer-service-packages", { token });
  },
  myServicePackages(token) {
    return request("/v1/my/service-packages", { token });
  },
  myServicePackage(token, id) {
    return request(`/v1/my/service-packages/${id}`, { token });
  },
  orders(token) {
    return request("/v1/orders", { token });
  },
  order(token, id) {
    return request(`/v1/orders/${id}`, { token });
  },
  createOrder(token, payload) {
    return request("/v1/orders", { method: "POST", body: payload, token });
  },
  createOrderPayment(token, orderId) {
    return request(`/v1/orders/${orderId}/payments`, {
      method: "POST",
      token,
    });
  },
  adminOrders(token, params = {}) {
    const search = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return request(`/v1/admin/orders${search ? `?${search}` : ""}`, { token });
  },
  adminOrder(token, id) {
    return request(`/v1/admin/orders/${id}`, { token });
  },
  adminPayments(token, params = {}) {
    const search = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return request(`/v1/admin/payments${search ? `?${search}` : ""}`, { token });
  },
  adminPayment(token, id) {
    return request(`/v1/admin/payments/${id}`, { token });
  },
  paymentLogs(token, params = {}) {
    const search = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return request(`/v1/admin/payment-logs${search ? `?${search}` : ""}`, { token });
  },
};
