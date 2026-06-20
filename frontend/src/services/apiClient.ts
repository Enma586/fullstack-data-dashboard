/* =============================================================================
   services/apiClient.ts — Cliente HTTP para la API de Olist Dashboard
   ============================================================================= */

import type {
  FilterParams,
  TrendFilterParams,
  KpiSummaryResponse,
  RevenueTrendResponse,
  ProductRankingResponse,
  ApiErrorResponse,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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
  const url = new URL(path, BASE_URL);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, value);
      }
    });
  }

  const res = await fetch(url.toString());

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
