/**
 * apiClient — Cliente HTTP tipado para la API REST del backend.
 * Usa rutas relativas; el servidor Next.js las redirige al backend
 * mediante rewrites configurados en next.config.mjs.
 * Lanza ApiClientError con el mensaje del servidor en errores HTTP.
 */

import type {
  FilterParams,
  TrendFilterParams,
  KpiSummaryResponse,
  RevenueTrendResponse,
  ProductRankingResponse,
  ApiErrorResponse,
} from "@/types";

class ApiClientError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function request<T>(path: string, params?: Record<string, string | undefined>): Promise<T> {
  let url = path;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams.set(key, value);
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url);

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as ApiErrorResponse;
      message = body.error || message;
    } catch {
      // ignore parse error
    }
    throw new ApiClientError(res.status, message);
  }

  return res.json() as Promise<T>;
}

function buildFilterParams(filters: FilterParams): Record<string, string | undefined> {
  return {
    from: filters.from,
    to: filters.to,
    customer_state: filters.customer_state,
    order_status: filters.order_status,
    category: filters.category,
  };
}

export const apiClient = {
  getKpis(filters: FilterParams = {}): Promise<KpiSummaryResponse> {
    return request<KpiSummaryResponse>("/kpis", buildFilterParams(filters));
  },

  getRevenueTrend(filters: TrendFilterParams = {}): Promise<RevenueTrendResponse> {
    return request<RevenueTrendResponse>("/trend/revenue", {
      ...buildFilterParams(filters),
      grain: filters.grain,
    });
  },

  getTopProducts(
    filters: FilterParams & { metric?: "gmv" | "revenue"; limit?: number } = {},
  ): Promise<ProductRankingResponse> {
    return request<ProductRankingResponse>("/rankings/products", {
      ...buildFilterParams(filters),
      metric: filters.metric,
      limit: filters.limit !== undefined ? String(filters.limit) : undefined,
    });
  },
};

export { ApiClientError };
