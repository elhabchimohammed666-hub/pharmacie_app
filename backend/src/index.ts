import "dotenv/config";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";

const port = Number(process.env.PORT ?? 5000);

async function start() {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    throw new Error("MONGODB_URI et JWT_SECRET doivent être définis");
  }
  await connectDatabase(process.env.MONGODB_URI);
  app.listen(port, () => console.log(`API listening on port ${port}`));
}

start().catch((error: unknown) => {
  console.error("API startup failed", error);
  process.exitCode = 1;
});
