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
  adminCreateOrder(token, payload) {
    return request("/v1/admin/orders", { method: "POST", body: payload, token });
  },
  adminUpdateOrderStatus(token, id, payload) {
    return request(`/v1/admin/orders/${id}/status`, {
      method: "PATCH",
      body: payload,
      token,
    });
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
  adminCourses(token, params = {}) {
    const search = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return request(`/v1/admin/courses${search ? `?${search}` : ""}`, { token });
  },
  adminCourse(token, id) {
    return request(`/v1/admin/courses/${id}`, { token });
  },
  createCourse(token, payload) {
    return request("/v1/courses", { method: "POST", body: payload, token });
  },
  updateCourse(token, id, payload) {
    const isFormData =
      typeof FormData !== "undefined" && payload instanceof FormData;
    return request(`/v1/courses/${id}`, {
      method: isFormData ? "POST" : "PATCH",
      body: payload,
      token,
    });
  },
  deleteCourse(token, id) {
    return request(`/v1/courses/${id}`, { method: "DELETE", token });
  },
  createCourseSection(token, courseId, payload) {
    return request(`/v1/courses/${courseId}/sections`, {
      method: "POST",
      body: payload,
      token,
    });
  },
  updateCourseSection(token, id, payload) {
    return request(`/v1/course-sections/${id}`, {
      method: "PATCH",
      body: payload,
      token,
    });
  },
  deleteCourseSection(token, id) {
    return request(`/v1/course-sections/${id}`, { method: "DELETE", token });
  },
  createCourseLesson(token, sectionId, payload) {
    return request(`/v1/course-sections/${sectionId}/lessons`, {
      method: "POST",
      body: payload,
      token,
    });
  },
  updateCourseLesson(token, id, payload) {
    return request(`/v1/course-lessons/${id}`, {
      method: "PATCH",
      body: payload,
      token,
    });
  },
  deleteCourseLesson(token, id) {
    return request(`/v1/course-lessons/${id}`, { method: "DELETE", token });
  },
  bunnyVideos(token, params = {}) {
    const search = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return request(`/v1/bunny/videos${search ? `?${search}` : ""}`, { token });
  },
  uploadBunnyVideo(token, formData, onProgress) {
    return new Promise((resolve, reject) => {
      if (typeof XMLHttpRequest === "undefined") {
        resolve(
          request("/v1/bunny/videos", { method: "POST", body: formData, token })
        );
        return;
      }

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE_URL}/v1/bunny/videos`);
      xhr.responseType = "json";
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }
      xhr.setRequestHeader("Accept", "application/json");

      if (xhr.upload && onProgress) {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            onProgress(Math.round((event.loaded / event.total) * 100));
          }
        });
      }

      xhr.addEventListener("load", () => {
        const data = xhr.response ?? null;
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
          return;
        }
        reject(
          new ApiError(
            data?.message ?? `İstek başarısız (${xhr.status})`,
            xhr.status,
            data?.errors ?? null
          )
        );
      });
      xhr.addEventListener("error", () => {
        reject(
          new ApiError("Sunucuya ulaşılamadı. Bağlantınızı kontrol edin.", 0)
        );
      });
      xhr.addEventListener("abort", () => {
        reject(new ApiError("Yükleme iptal edildi.", 0));
      });

      xhr.send(formData);
    });
  },
  bunnyVideo(token, videoId) {
    return request(`/v1/bunny/videos/${videoId}`, { token });
  },
  deleteBunnyVideo(token, videoId) {
    return request(`/v1/bunny/videos/${videoId}`, { method: "DELETE", token });
  },
  courseUsers(token, courseId) {
    return request(`/v1/courses/${courseId}/users`, { token });
  },
  grantCourseAccess(token, courseId, payload) {
    return request(`/v1/courses/${courseId}/users`, {
      method: "POST",
      body: payload,
      token,
    });
  },
  revokeCourseAccess(token, courseId, userId) {
    return request(`/v1/courses/${courseId}/users/${userId}`, {
      method: "DELETE",
      token,
    });
  },
  adminProducts(token, params = {}) {
    const search = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return request(`/v1/admin/products${search ? `?${search}` : ""}`, { token });
  },
  adminProduct(token, id) {
    return request(`/v1/admin/products/${id}`, { token });
  },
  createProduct(token, payload) {
    return request("/v1/products", { method: "POST", body: payload, token });
  },
  updateProduct(token, id, payload) {
    const isFormData =
      typeof FormData !== "undefined" && payload instanceof FormData;
    return request(`/v1/products/${id}`, {
      method: isFormData ? "POST" : "PATCH",
      body: payload,
      token,
    });
  },
  deleteProduct(token, id) {
    return request(`/v1/products/${id}`, { method: "DELETE", token });
  },
  addProductGalleryImage(token, productId, formData) {
    return request(`/v1/products/${productId}/gallery`, {
      method: "POST",
      body: formData,
      token,
    });
  },
  updateProductGalleryImage(token, id, payload) {
    return request(`/v1/product-gallery/${id}`, {
      method: "PATCH",
      body: payload,
      token,
    });
  },
  deleteProductGalleryImage(token, id) {
    return request(`/v1/product-gallery/${id}`, { method: "DELETE", token });
  },
  createProductField(token, productId, payload) {
    return request(`/v1/products/${productId}/fields`, {
      method: "POST",
      body: payload,
      token,
    });
  },
  updateProductField(token, id, payload) {
    return request(`/v1/product-fields/${id}`, {
      method: "PATCH",
      body: payload,
      token,
    });
  },
  deleteProductField(token, id) {
    return request(`/v1/product-fields/${id}`, { method: "DELETE", token });
  },
  createProductFieldOption(token, fieldId, payload) {
    return request(`/v1/product-fields/${fieldId}/options`, {
      method: "POST",
      body: payload,
      token,
    });
  },
  updateProductFieldOption(token, id, payload) {
    return request(`/v1/product-field-options/${id}`, {
      method: "PATCH",
      body: payload,
      token,
    });
  },
  deleteProductFieldOption(token, id) {
    return request(`/v1/product-field-options/${id}`, {
      method: "DELETE",
      token,
    });
  },
  productVariations(token, productId) {
    return request(`/v1/products/${productId}/variations`, { token });
  },
  createProductVariation(token, productId, payload) {
    return request(`/v1/products/${productId}/variations`, {
      method: "POST",
      body: payload,
      token,
    });
  },
  updateProductVariation(token, id, payload) {
    return request(`/v1/product-variations/${id}`, {
      method: "PATCH",
      body: payload,
      token,
    });
  },
  deleteProductVariation(token, id) {
    return request(`/v1/product-variations/${id}`, { method: "DELETE", token });
  },
  productDownloads(token, productId) {
    return request(`/v1/products/${productId}/downloads`, { token });
  },
  uploadProductDownload(token, productId, formData, onProgress) {
    return new Promise((resolve, reject) => {
      if (typeof XMLHttpRequest === "undefined") {
        resolve(
          request(`/v1/products/${productId}/downloads`, {
            method: "POST",
            body: formData,
            token,
          })
        );
        return;
      }

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE_URL}/v1/products/${productId}/downloads`);
      xhr.responseType = "json";
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }
      xhr.setRequestHeader("Accept", "application/json");

      if (xhr.upload && onProgress) {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            onProgress(Math.round((event.loaded / event.total) * 100));
          }
        });
      }

      xhr.addEventListener("load", () => {
        const data = xhr.response ?? null;
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
          return;
        }
        reject(
          new ApiError(
            data?.message ?? `İstek başarısız (${xhr.status})`,
            xhr.status,
            data?.errors ?? null
          )
        );
      });
      xhr.addEventListener("error", () => {
        reject(
          new ApiError("Sunucuya ulaşılamadı. Bağlantınızı kontrol edin.", 0)
        );
      });
      xhr.addEventListener("abort", () => {
        reject(new ApiError("Yükleme iptal edildi.", 0));
      });

      xhr.send(formData);
    });
  },
  updateProductDownload(token, id, payload) {
    return request(`/v1/product-downloads/${id}`, {
      method: "PATCH",
      body: payload,
      token,
    });
  },
  deleteProductDownload(token, id) {
    return request(`/v1/product-downloads/${id}`, { method: "DELETE", token });
  },
  publicProducts(params = {}) {
    const search = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return request(`/v1/products${search ? `?${search}` : ""}`, { token: null });
  },
  publicProduct(id) {
    return request(`/v1/products/${id}`, { token: null });
  },
  productCategories(token = null, params = {}) {
    const search = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return request(`/v1/product-categories${search ? `?${search}` : ""}`, { token });
  },
  productCategory(token, id) {
    return request(`/v1/product-categories/${id}`, { token });
  },
  createProductCategory(token, payload) {
    return request("/v1/product-categories", { method: "POST", body: payload, token });
  },
  updateProductCategory(token, id, payload) {
    const isFormData =
      typeof FormData !== "undefined" && payload instanceof FormData;
    return request(`/v1/product-categories/${id}`, {
      method: isFormData ? "POST" : "PATCH",
      body: payload,
      token,
    });
  },
  deleteProductCategory(token, id) {
    return request(`/v1/product-categories/${id}`, { method: "DELETE", token });
  },
  publicCart(token) {
    return request("/v1/cart", { token });
  },
  createCartItem(token, payload) {
    return request("/v1/cart/items", { method: "POST", body: payload, token });
  },
  checkoutCart(token) {
    return request("/v1/cart/checkout", { method: "POST", token });
  },
  publicCourses(params = {}) {
    const search = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return request(`/v1/courses${search ? `?${search}` : ""}`, { token: null });
  },
  publicCourse(idOrSlug) {
    return request(`/v1/courses/${idOrSlug}`, { token: null });
  },
  courseDetail(token, id) {
    return request(`/v1/courses/${id}`, { token });
  },
  myCourses(token) {
    return request("/v1/my-courses", { token });
  },
  courseSections(token, courseId) {
    return request(`/v1/courses/${courseId}/sections`, { token });
  },
  lesson(token, lessonId) {
    return request(`/v1/lessons/${lessonId}`, { token });
  },
  lessonVideo(token, lessonId) {
    return request(`/v1/lessons/${lessonId}/video`, { token });
  },
  publicPages() {
    return request("/v1/pages", { token: null });
  },
  publicPage(slug) {
    return request(`/v1/pages/${slug}`, { token: null });
  },
  adminPages(token, params = {}) {
    const search = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return request(`/v1/admin/pages${search ? `?${search}` : ""}`, { token });
  },
  adminPage(token, id) {
    return request(`/v1/admin/pages/${id}`, { token });
  },
  createPage(token, payload) {
    return request("/v1/pages", { method: "POST", body: payload, token });
  },
  updatePage(token, id, payload) {
    return request(`/v1/pages/${id}`, { method: "PATCH", body: payload, token });
  },
  deletePage(token, id) {
    return request(`/v1/pages/${id}`, { method: "DELETE", token });
  },
  publicMenus() {
    return request("/v1/menus", { token: null });
  },
  publicMenu(slug) {
    return request(`/v1/menus/${slug}`, { token: null });
  },
  adminMenus(token) {
    return request("/v1/admin/menus", { token });
  },
  adminMenu(token, id) {
    return request(`/v1/admin/menus/${id}`, { token });
  },
  createMenu(token, payload) {
    return request("/v1/menus", { method: "POST", body: payload, token });
  },
  updateMenu(token, id, payload) {
    return request(`/v1/menus/${id}`, { method: "PATCH", body: payload, token });
  },
  deleteMenu(token, id) {
    return request(`/v1/menus/${id}`, { method: "DELETE", token });
  },
  adminMenuItems(token, menuId) {
    return request(`/v1/admin/menus/${menuId}/items`, { token });
  },
  createMenuItem(token, menuId, payload) {
    return request(`/v1/menus/${menuId}/items`, {
      method: "POST",
      body: payload,
      token,
    });
  },
  updateMenuItem(token, id, payload) {
    return request(`/v1/menu-items/${id}`, {
      method: "PATCH",
      body: payload,
      token,
    });
  },
  deleteMenuItem(token, id) {
    return request(`/v1/menu-items/${id}`, { method: "DELETE", token });
  },
  adminContactMessages(token, params = {}) {
    const search = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return request(`/v1/admin/contact-messages${search ? `?${search}` : ""}`, { token });
  },
  adminContactMessage(token, id) {
    return request(`/v1/admin/contact-messages/${id}`, { token });
  },
  markContactMessageRead(token, id, payload) {
    return request(`/v1/admin/contact-messages/${id}/read`, {
      method: "PATCH",
      body: payload,
      token,
    });
  },
  deleteContactMessage(token, id) {
    return request(`/v1/admin/contact-messages/${id}`, {
      method: "DELETE",
      token,
    });
  },
};
