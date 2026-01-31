import dotenv from "dotenv";

let loaded = false;

export function loadEnv(): void {
  if (!loaded) {
    dotenv.config();
    loaded = true;
  }
}
