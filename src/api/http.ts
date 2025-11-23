import axios, { type AxiosRequestConfig } from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

interface HttpOptions extends AxiosRequestConfig {
  query?: Record<string, string | number | undefined>;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

function sanitizeQuery(query?: HttpOptions['query']) {
  if (!query) {
    return undefined;
  }

  return Object.entries(query).reduce<Record<string, string | number>>(
    (acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = value;
      }
      return acc;
    },
    {},
  );
}

export async function http<TResponse>(
  path: string,
  options: HttpOptions = {},
): Promise<TResponse> {
  const { query, ...rest } = options;

  const response = await apiClient.request<TResponse>({
    url: path,
    params: sanitizeQuery(query),
    ...rest,
  });

  return response.data;
}

