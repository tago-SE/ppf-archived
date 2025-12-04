import { Logger } from "drizzle-orm/logger";

export class DBLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    console.debug("SQL_Q", query, params);
  }
  write(message: string): void {
    console.debug("SQL_W:", message);
  }
}