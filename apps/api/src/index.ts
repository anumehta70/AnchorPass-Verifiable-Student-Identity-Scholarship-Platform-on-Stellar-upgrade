import "dotenv/config";
import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import * as Sentry from "@sentry/node";
import { initSentry } from "./lib/monitoring.js";
import { userRouter } from "./routes/user.routes.js";
import { scholarshipRouter } from "./routes/scholarship.routes.js";
import { credentialRouter } from "./routes/credential.routes.js";
import { feedbackRouter, analyticsRouter } from "./routes/misc.routes.js";

initSentry();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/users", userRouter);
app.use("/api/scholarships", scholarshipRouter);
app.use("/api/credentials", credentialRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/analytics", analyticsRouter);

// Sentry error handler must be registered after routes, before any other error middleware.
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// Final error handler
app.use(
  (
    err: Error & { statusCode?: number },
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    const statusCode = err.statusCode ?? 500;
    res.status(statusCode).json({
      error: err.message ?? "Internal server error",
    });
  }
);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`AnchorPass API listening on port ${port}`);
});
