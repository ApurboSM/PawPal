import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  plugins: {
    tailwindcss: {
      // Ensure Tailwind loads the config from apps/web even when commands are run from repo root
      config: path.resolve(__dirname, "tailwind.config.ts"),
    },
    autoprefixer: {},
  },
};
