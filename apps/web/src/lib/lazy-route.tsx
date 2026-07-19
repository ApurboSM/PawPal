import { lazy, type ComponentType } from "react";

export type LazyRoute = ComponentType & {
  /** Loads the chunk and caches the component for synchronous rendering. */
  preload: () => Promise<void>;
  /** True once preload has resolved — rendering will not suspend. */
  isReady: () => boolean;
};

type ModuleShape = { default: ComponentType };

/**
 * A route component that renders synchronously once its chunk has been loaded.
 *
 * React.lazy always resolves through a promise, so even a chunk that is already
 * in memory suspends for one commit — long enough to paint the Suspense
 * fallback. That single frame of skeleton on every navigation is what makes an
 * SPA feel like it is reloading.
 *
 * Here the resolved module is cached in a closure. After preload() the wrapper
 * returns the real component directly and never suspends; before that it falls
 * back to a normal lazy component so first-visit and deep-link still work.
 */
export function createLazyRoute(loader: () => Promise<unknown>): LazyRoute {
  let Loaded: ComponentType | null = null;
  let inFlight: Promise<void> | null = null;

  const Fallback = lazy(loader as () => Promise<ModuleShape>);

  const Route = ((props: Record<string, unknown>) => {
    const Component = Loaded ?? Fallback;
    return <Component {...props} />;
  }) as LazyRoute;

  Route.preload = () => {
    if (Loaded) return Promise.resolve();
    if (inFlight) return inFlight;

    inFlight = (loader() as Promise<ModuleShape>)
      .then((mod) => {
        Loaded = mod.default;
      })
      .catch(() => {
        // Leave Loaded null; the lazy fallback will surface the error on render.
      })
      .finally(() => {
        inFlight = null;
      });

    return inFlight;
  };

  Route.isReady = () => Loaded !== null;

  return Route;
}
