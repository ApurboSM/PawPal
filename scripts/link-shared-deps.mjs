import fs from "fs";
import path from "path";

const repoRoot = process.cwd();
const sharedNodeModules = path.resolve(repoRoot, "packages", "shared", "node_modules");
const apiNodeModules = path.resolve(repoRoot, "apps", "api", "node_modules");

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function removeIfExists(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

// We keep separate node_modules for apps/api and apps/web.
// But `packages/shared/schema.ts` imports drizzle/zod at typecheck-time, and TypeScript resolves those
// relative to `packages/shared`. To avoid duplicate drizzle instances (type conflicts) and to keep
// installs simple, we link `packages/shared/node_modules` to `apps/api/node_modules` on Windows.
try {
  ensureDir(path.dirname(sharedNodeModules));

  // If it's already a link/dir, leave it as-is.
  if (!fs.existsSync(sharedNodeModules)) {
    if (!fs.existsSync(apiNodeModules)) {
      console.warn(`[link-shared-deps] Missing ${apiNodeModules}. Run npm run install:all first.`);
      process.exit(0);
    }

    // Create a junction on Windows; regular symlink elsewhere.
    const type = process.platform === "win32" ? "junction" : "dir";
    fs.symlinkSync(apiNodeModules, sharedNodeModules, type);
    console.log(`[link-shared-deps] Linked ${sharedNodeModules} -> ${apiNodeModules}`);
  }
} catch (e) {
  // Never fail installs because of this helper.
  console.warn("[link-shared-deps] Skipped:", e?.message ?? e);
}

