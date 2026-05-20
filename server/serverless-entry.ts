import type { IncomingMessage, ServerResponse } from "http";
import type { Express } from "express";
import { createApp } from "./app";

let cachedApp: Express | null = null;
let initializing: Promise<Express> | null = null;

async function getApp(): Promise<Express> {
  if (cachedApp) return cachedApp;
  if (!initializing) {
    initializing = createApp().then((app) => {
      cachedApp = app;
      return app;
    });
  }
  return initializing;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const app = await getApp();
  return (app as any)(req, res);
}
