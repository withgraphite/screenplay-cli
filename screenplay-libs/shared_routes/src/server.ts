const CURRENT_API_LOCAL_PORT = process.env.NODE_PORT
  ? process.env.NODE_PORT
  : "8000";
export const PROD_API_SERVER = "https://api.screenplay.dev/v1";
export function localhostApiServerWithPort(port: string) {
  return `http://localhost:${port}/v1`;
}
export const API_SERVER =
  process.env.NODE_ENV === "development"
    ? localhostApiServerWithPort(CURRENT_API_LOCAL_PORT)
    : PROD_API_SERVER;
