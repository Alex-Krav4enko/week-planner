const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

interface HttpOptions extends RequestInit {
  query?: Record<string, string | number | undefined>;
}

function buildUrl(path: string, query?: HttpOptions['query']) {
  const url = new URL(path, API_BASE_URL);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  return url;
}

export async function http<TResponse>(
  path: string,
  options: HttpOptions = {},
): Promise<TResponse> {
  const { query, headers, ...rest } = options;
  const url = buildUrl(path, query);

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...rest,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Request failed with ${response.status}: ${response.statusText}. ${errorBody}`,
    );
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

