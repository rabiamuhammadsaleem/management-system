const getHeaders = () => {
  const token = localStorage.getItem("ems_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = endpoint.startsWith("/api/")
    ? endpoint
    : endpoint.startsWith("/")
      ? `/api${endpoint}`
      : `/api/${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API error (${response.status})`);
    }

    return data;
  } catch (error) {
    console.error(`API Fetch Error [${url}]:`, error);
    throw error;
  }
};
