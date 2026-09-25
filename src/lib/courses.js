import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api, ApiError } from "./api";
import { useAuthStore } from "./auth";

export const coursesQueryKey = ["courses"];
export const myCoursesQueryKey = ["my-courses"];
export const courseUsersQueryKey = ["course-users"];
export const bunnyVideosQueryKey = ["bunny-videos"];

export const COURSE_ACCESS_SOURCES = {
  PURCHASE: "PURCHASE",
  ADMIN: "ADMIN",
};

export const COURSE_ACCESS_SOURCE_LABELS = {
  [COURSE_ACCESS_SOURCES.PURCHASE]: "Satın Alma",
  [COURSE_ACCESS_SOURCES.ADMIN]: "Yönetici",
};

export const COURSE_ACCESS_SOURCE_BADGE_CLASSES = {
  [COURSE_ACCESS_SOURCES.PURCHASE]: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  [COURSE_ACCESS_SOURCES.ADMIN]: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

export const BUNNY_VIDEO_STATUS_LABELS = {
  0: "Oluşturuluyor",
  1: "Yükleniyor",
  2: "İşleniyor",
  3: "Hazır",
  4: "Hata",
  5: "Yükleme Başarısız",
  6: "Kota Aşıldı",
  7: "Önbellekte Değil",
  8: "Yükseltiliyor",
  9: "Yükseltildi",
};

function useToken() {
  return useAuthStore((state) => state.token);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function normalizeLesson(item) {
  if (!item || typeof item !== "object") return null;
  return {
    ...item,
    title: item.title ?? "",
    description: item.description ?? "",
    bunny_video_id: item.bunny_video_id ?? null,
    bunny_library_id:
      item.bunny_library_id != null ? String(item.bunny_library_id) : null,
    duration: item.duration ?? null,
    is_active: Boolean(item.is_active),
    sort_order: item.sort_order ?? 0,
  };
}

export function normalizeSection(item) {
  if (!item || typeof item !== "object") return null;
  const lessons = asArray(item.lessons)
    .map(normalizeLesson)
    .filter(Boolean);
  return {
    ...item,
    title: item.title ?? "",
    sort_order: item.sort_order ?? 0,
    lessons,
    lessonsCount: lessons.length,
  };
}

export function normalizeCourse(item) {
  if (!item || typeof item !== "object") return null;
  const sections = asArray(item.sections)
    .map(normalizeSection)
    .filter(Boolean);
  const lessonsCount = sections.reduce(
    (total, section) => total + section.lessonsCount,
    0
  );
  return {
    ...item,
    title: item.title ?? "",
    slug: item.slug ?? "",
    image: item.image ?? "",
    short_description: item.short_description ?? "",
    description: item.description ?? "",
    seo_title: item.seo_title ?? "",
    seo_description: item.seo_description ?? "",
    price: item.price ?? null,
    discount_price: item.discount_price ?? null,
    effective_price: item.effective_price ?? null,
    has_discount: Boolean(item.has_discount),
    is_active: Boolean(item.is_active),
    sort_order: item.sort_order ?? 0,
    sections,
    sectionsCount: sections.length,
    lessonsCount,
  };
}

export function normalizeCourseUser(item) {
  if (!item || typeof item !== "object") return null;
  return {
    ...item,
    source: item.source ?? COURSE_ACCESS_SOURCES.ADMIN,
    user: item.user ?? null,
    purchased_at: item.purchased_at ?? null,
    expires_at: item.expires_at ?? null,
  };
}

export function normalizeBunnyVideo(item) {
  if (!item || typeof item !== "object") return null;
  return {
    guid: item.guid ?? "",
    title: item.title ?? "",
    video_library_id:
      item.video_library_id != null ? String(item.video_library_id) : null,
    status: item.status ?? null,
    length: item.length ?? null,
    date_uploaded: item.date_uploaded ?? null,
    thumbnail_url: item.thumbnail_url ?? null,
    hls_url: item.hls_url ?? null,
    iframe_url: item.iframe_url ?? null,
  };
}

export function normalizeCourseDetail(payload) {
  const course = normalizeCourse(payload?.data ?? payload);
  if (!course) throw new ApiError("Beklenmeyen yanıt formatı");
  return course;
}

function normalizePaginated(payload, normalizeItem) {
  const data = payload?.data;
  const meta = payload?.meta ?? null;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return {
    items: data.map(normalizeItem).filter(Boolean),
    meta: meta
      ? {
          currentPage: meta.current_page ?? 1,
          lastPage: meta.last_page ?? 1,
          perPage: meta.per_page ?? data.length,
          total: meta.total ?? data.length,
        }
      : null,
  };
}

function normalizeCourseUserList(payload) {
  const data = payload?.data ?? payload;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return data.map(normalizeCourseUser).filter(Boolean);
}

export function normalizeBunnyVideoList(payload) {
  const result = normalizePaginated(payload, normalizeBunnyVideo);
  return {
    items: result.items,
    meta: result.meta
      ? {
          totalItems: payload?.meta?.total_items ?? result.meta.total,
          currentPage: payload?.meta?.current_page ?? result.meta.currentPage,
          perPage: payload?.meta?.per_page ?? result.meta.perPage,
        }
      : null,
  };
}

export function formatLessonDuration(seconds) {
  const total = Math.round(Number(seconds));
  if (!Number.isFinite(total) || total <= 0) return null;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export function courseDetailQueryKey(id) {
  return [...coursesQueryKey, "detail", String(id)];
}

export function courseUsersKey(courseId) {
  return [...courseUsersQueryKey, String(courseId)];
}

export function courseSectionsKey(courseId) {
  return ["course-sections", String(courseId)];
}

export function lessonKey(lessonId) {
  return ["lesson", String(lessonId)];
}

export function lessonVideoKey(lessonId) {
  return ["lesson-video", String(lessonId)];
}

export function useMyCoursesQuery(options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...myCoursesQueryKey],
    queryFn: async () =>
      normalizeCourseUserList(await api.myCourses(token)),
    enabled: options.enabled !== false && Boolean(token),
  });
}

export function usePublicCoursesQuery(options = {}) {
  return useQuery({
    queryKey: [...coursesQueryKey, "public"],
    queryFn: async () => {
      const payload = await api.publicCourses();
      const data = payload?.data;
      if (!Array.isArray(data)) {
        throw new ApiError("Beklenmeyen yanıt formatı");
      }
      return data.map(normalizeCourse).filter(Boolean);
    },
    enabled: options.enabled !== false,
  });
}

export function usePublicCourseQuery(idOrSlug, options = {}) {
  return useQuery({
    queryKey: [...coursesQueryKey, "public", "detail", String(idOrSlug)],
    queryFn: async () =>
      normalizeCourseDetail(await api.publicCourse(idOrSlug)),
    enabled: options.enabled !== false && Boolean(idOrSlug),
    retry: false,
  });
}

export function useCourseQuery(id, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...coursesQueryKey, "course", String(id)],
    queryFn: async () => normalizeCourseDetail(await api.courseDetail(token, id)),
    enabled: (options.enabled ?? true) !== false && Boolean(token && id),
    retry: false,
  });
}

export function useCourseSectionsQuery(courseId, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: courseSectionsKey(courseId),
    queryFn: async () => {
      const payload = await api.courseSections(token, courseId);
      const data = payload?.data;
      if (!Array.isArray(data)) {
        throw new ApiError("Beklenmeyen yanıt formatı");
      }
      return data.map(normalizeSection).filter(Boolean);
    },
    enabled: (options.enabled ?? true) !== false && Boolean(token && courseId),
    retry: false,
  });
}

export function useLessonQuery(lessonId, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: lessonKey(lessonId),
    queryFn: async () => {
      const payload = await api.lesson(token, lessonId);
      const lesson = normalizeLesson(payload?.data);
      if (!lesson) throw new ApiError("Beklenmeyen yanıt formatı");
      return lesson;
    },
    enabled: (options.enabled ?? true) !== false && Boolean(token && lessonId),
    retry: false,
    staleTime: 60 * 1000,
  });
}

export function normalizeLessonVideo(payload) {
  const data = payload?.data ?? payload;
  if (!data || typeof data !== "object") {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  const video = data.video && typeof data.video === "object" ? data.video : null;
  return {
    id: data.id ?? null,
    title: data.title ?? "",
    duration: data.duration ?? null,
    video: {
      videoId: video?.video_id ?? null,
      libraryId: video?.library_id ?? null,
      hlsUrl: video?.hls_url ?? null,
      thumbnailUrl: video?.thumbnail_url ?? null,
      iframeUrl: video?.iframe_url ?? null,
    },
  };
}

export function useLessonVideoQuery(lessonId, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: lessonVideoKey(lessonId),
    queryFn: async () =>
      normalizeLessonVideo(await api.lessonVideo(token, lessonId)),
    enabled: (options.enabled ?? true) !== false && Boolean(token && lessonId),
    retry: false,
    staleTime: 60 * 1000,
  });
}

export function useAdminCoursesQuery(params = {}, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...coursesQueryKey, "list", params],
    queryFn: async () =>
      normalizePaginated(await api.adminCourses(token, params), normalizeCourse),
    enabled: options.enabled !== false && Boolean(token),
    placeholderData: keepPreviousData,
  });
}

export function useAdminCourseQuery(id, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: courseDetailQueryKey(id),
    queryFn: async () => normalizeCourseDetail(await api.adminCourse(token, id)),
    enabled: options.enabled !== false && Boolean(token && id),
    retry: false,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: async (payload) =>
      normalizeCourseDetail(await api.createCourse(token, payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coursesQueryKey });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, payload }) => api.updateCourse(token, id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: coursesQueryKey });
      queryClient.invalidateQueries({ queryKey: courseDetailQueryKey(id) });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteCourse(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coursesQueryKey });
    },
  });
}

export function useCreateCourseSection() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ courseId, payload }) =>
      api.createCourseSection(token, courseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coursesQueryKey });
    },
  });
}

export function useUpdateCourseSection() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, payload }) =>
      api.updateCourseSection(token, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coursesQueryKey });
    },
  });
}

export function useDeleteCourseSection() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteCourseSection(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coursesQueryKey });
    },
  });
}

export function useCreateCourseLesson() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ sectionId, payload }) =>
      api.createCourseLesson(token, sectionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coursesQueryKey });
    },
  });
}

export function useUpdateCourseLesson() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, payload }) => api.updateCourseLesson(token, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coursesQueryKey });
    },
  });
}

export function useDeleteCourseLesson() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteCourseLesson(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coursesQueryKey });
    },
  });
}

export function useBunnyVideosQuery(params = {}, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...bunnyVideosQueryKey, params],
    queryFn: async () =>
      normalizeBunnyVideoList(await api.bunnyVideos(token, params)),
    enabled: options.enabled !== false && Boolean(token),
    placeholderData: keepPreviousData,
    retry: false,
  });
}

export function useBunnyVideoQuery(videoId, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...bunnyVideosQueryKey, "detail", String(videoId)],
    queryFn: async () => {
      const payload = await api.bunnyVideo(token, videoId);
      const video = normalizeBunnyVideo(payload?.data ?? payload);
      if (!video?.guid) throw new ApiError("Beklenmeyen yanıt formatı");
      return video;
    },
    enabled: (options.enabled ?? true) !== false && Boolean(token && videoId),
    retry: false,
    staleTime: 60 * 1000,
  });
}

export function useUploadBunnyVideo() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ formData, onProgress }) =>
      api.uploadBunnyVideo(token, formData, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bunnyVideosQueryKey });
    },
  });
}

export function useDeleteBunnyVideo() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (videoId) => api.deleteBunnyVideo(token, videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bunnyVideosQueryKey });
    },
  });
}

export function useCourseUsersQuery(courseId, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: courseUsersKey(courseId),
    queryFn: async () =>
      normalizeCourseUserList(await api.courseUsers(token, courseId)),
    enabled: options.enabled !== false && Boolean(token && courseId),
  });
}

export function useGrantCourseAccess(courseId) {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (payload) =>
      api.grantCourseAccess(token, courseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: courseUsersKey(courseId),
      });
    },
  });
}

export function useRevokeCourseAccess(courseId) {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (userId) => api.revokeCourseAccess(token, courseId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: courseUsersKey(courseId),
      });
    },
  });
}
