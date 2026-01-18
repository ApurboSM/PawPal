import path from "path";
import { config } from "dotenv";

// Load apps/api/.env when running the API from its own workspace
config({ path: path.resolve(process.cwd(), ".env") });

