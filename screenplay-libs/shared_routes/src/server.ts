const API_LOCAL_PORT = process.env.NODE_PORT ? process.env.NODE_PORT : "8000";
export const API_SERVER =
  process.env.NODE_ENV === "development"
    ? `http://localhost:${API_LOCAL_PORT}/v1`
    : "https://api.screenplay.dev/v1";
