import { forwardRef, useEffect, useMemo, useState } from "react";
import { Redirect } from "wouter";
import { Helmet } from "react-helmet";
import { motion, useReducedMotion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth, loginSchema, registerSchema, type RegisterData } from "@/hooks/use-auth";
import { AuthSkeleton } from "@/components/skeletons/page-skeletons";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Loader2, PawPrint, ShieldCheck, CalendarHeart, HeartHandshake, BookOpen } from "lucide-react";

type AuthTab = "login" | "register";

function getInitialAuthTab(): AuthTab {
  if (typeof window === "undefined") {
    return "login";
  }

  const tab = new URLSearchParams(window.location.search).get("tab");
  return tab === "register" ? "register" : "login";
}

function updateAuthTabInUrl(nextTab: AuthTab) {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.set("tab", nextTab);
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

/**
 * Text input with a show/hide toggle. Forwards the ref and every prop FormControl
 * injects (id, aria-describedby, aria-invalid) down to the real input.
 */
const PasswordInput = forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<typeof Input>>(
  ({ className, disabled, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={isVisible ? "text" : "password"}
          disabled={disabled}
          className={cn("h-11 rounded-xl pr-12", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          aria-label={isVisible ? "Hide password" : "Show password"}
          aria-pressed={isVisible}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-muted-foreground transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
        >
          {isVisible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

const STRENGTH_LABELS = ["Too weak", "Weak", "Fair", "Strong"] as const;
const STRENGTH_COLORS = ["bg-destructive", "bg-orange-500", "bg-amber-500", "bg-emerald-500"] as const;

/** Mirrors the server password policy (8+ chars, a letter and a number) plus bonus points. */
function scorePassword(password: string): number {
  if (!password) return -1;

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-zA-Z]/.test(password) && /[0-9]/.test(password)) score += 1;
  if (password.length >= 12) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  return Math.min(score, 3);
}

function PasswordStrength({ password }: { password: string }) {
  const score = useMemo(() => scorePassword(password), [password]);

  if (score < 0) {
    return null;
  }

  return (
    <div className="pt-1">
      <div className="flex gap-1.5" aria-hidden="true">
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-300",
              index <= score ? STRENGTH_COLORS[score] : "bg-muted",
            )}
          />
        ))}
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground" aria-live="polite">
        Password strength: <span className="font-medium text-foreground">{STRENGTH_LABELS[score]}</span>
      </p>
    </div>
  );
}

const BENEFITS = [
  { icon: HeartHandshake, text: "Browse and save your favourite pets" },
  { icon: PawPrint, text: "Submit adoption applications in minutes" },
  { icon: CalendarHeart, text: "Schedule meet & greet appointments" },
  { icon: BookOpen, text: "Access exclusive pet care resources" },
];

export default function AuthPage() {
  const { user, loginMutation, registerMutation, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<AuthTab>(getInitialAuthTab);
  const prefersReducedMotion = useReducedMotion();

  const isSubmitting = loginMutation.isPending || registerMutation.isPending;

  useEffect(() => {
    const handlePopState = () => setActiveTab(getInitialAuthTab());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      name: "",
    },
  });

  const registerPassword = registerForm.watch("password");

  const onTabChange = (nextTab: string) => {
    if (nextTab === activeTab || isSubmitting) {
      return;
    }
    const normalizedTab: AuthTab = nextTab === "register" ? "register" : "login";
    setActiveTab(normalizedTab);
    updateAuthTabInUrl(normalizedTab);
  };

  // Redirect to home if user is already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const panelMotion = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <>
      <Helmet>
        <title>Login or Sign Up - PawPal</title>
        <meta
          name="description"
          content="Join PawPal to find your perfect pet companion. Login or sign up to access adoption applications, appointments, and more."
        />
      </Helmet>


      {isAuthLoading ? (
        <main className="min-h-screen bg-background">
          <AuthSkeleton />
        </main>
      ) : (
        <main className="min-h-screen bg-gradient-to-b from-background via-white to-muted py-8 sm:py-12">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-1 items-start gap-6 lg:gap-8 xl:grid-cols-12">
              {/* Auth card */}
              <div className="w-full xl:col-span-5">
                <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                  <TabsList className="mb-4 grid h-auto w-full grid-cols-2 rounded-2xl border border-primary/15 bg-white p-1 shadow-sm">
                    <TabsTrigger value="login" className="rounded-xl py-2.5 text-sm font-semibold" disabled={isSubmitting}>
                      Login
                    </TabsTrigger>
                    <TabsTrigger value="register" className="rounded-xl py-2.5 text-sm font-semibold" disabled={isSubmitting}>
                      Sign Up
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <motion.div key="login" {...panelMotion}>
                          <Card className="rounded-3xl border-primary/15 shadow-[0_18px_45px_-30px_rgba(255,105,180,0.7)]">
                            <CardHeader className="pb-3">
                              <CardTitle>Welcome Back!</CardTitle>
                              <CardDescription>
                                Login to your account to manage adoptions, appointments, and more.
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <Form {...loginForm}>
                                <form
                                  onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))}
                                  className="space-y-4"
                                  noValidate
                                >
                                  <FormField
                                    control={loginForm.control}
                                    name="username"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder="Enter your username"
                                            autoComplete="username"
                                            className="h-11 rounded-xl"
                                            disabled={loginMutation.isPending}
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={loginForm.control}
                                    name="password"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                          <PasswordInput
                                            autoComplete="current-password"
                                            placeholder="Enter your password"
                                            disabled={loginMutation.isPending}
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <Button
                                    type="submit"
                                    className="h-11 w-full rounded-xl font-semibold"
                                    disabled={loginMutation.isPending}
                                    aria-busy={loginMutation.isPending}
                                  >
                                    {loginMutation.isPending ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                                        Logging in…
                                      </>
                                    ) : (
                                      <>
                                        <PawPrint className="mr-2 h-4 w-4" aria-hidden="true" />
                                        Login
                                      </>
                                    )}
                                  </Button>
                                </form>
                              </Form>
                            </CardContent>
                            <CardFooter className="justify-center">
                              <p className="text-center text-sm text-muted-foreground">
                                Don't have an account?{" "}
                                <button
                                  type="button"
                                  onClick={() => onTabChange("register")}
                                  className="rounded font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                >
                                  Sign up
                                </button>
                              </p>
                            </CardFooter>
                          </Card>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="register">
                    <motion.div key="register" {...panelMotion}>
                          <Card className="rounded-3xl border-primary/15 shadow-[0_18px_45px_-30px_rgba(255,105,180,0.7)]">
                            <CardHeader className="pb-3">
                              <CardTitle>Create an Account</CardTitle>
                              <CardDescription>Join PawPal to start your pet adoption journey.</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <Form {...registerForm}>
                                <form
                                  onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))}
                                  className="space-y-4"
                                  noValidate
                                >
                                  <FormField
                                    control={registerForm.control}
                                    name="name"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder="Enter your full name"
                                            autoComplete="name"
                                            className="h-11 rounded-xl"
                                            disabled={registerMutation.isPending}
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={registerForm.control}
                                    name="email"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                          <Input
                                            type="email"
                                            inputMode="email"
                                            placeholder="Enter your email"
                                            autoComplete="email"
                                            className="h-11 rounded-xl"
                                            disabled={registerMutation.isPending}
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={registerForm.control}
                                    name="username"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder="Choose a username"
                                            autoComplete="username"
                                            className="h-11 rounded-xl"
                                            disabled={registerMutation.isPending}
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={registerForm.control}
                                    name="password"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                          <PasswordInput
                                            autoComplete="new-password"
                                            placeholder="Create a password"
                                            disabled={registerMutation.isPending}
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormDescription>
                                          At least 8 characters, including a letter and a number.
                                        </FormDescription>
                                        <PasswordStrength password={registerPassword} />
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={registerForm.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                          <PasswordInput
                                            autoComplete="new-password"
                                            placeholder="Confirm your password"
                                            disabled={registerMutation.isPending}
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <Button
                                    type="submit"
                                    className="h-11 w-full rounded-xl font-semibold"
                                    disabled={registerMutation.isPending}
                                    aria-busy={registerMutation.isPending}
                                  >
                                    {registerMutation.isPending ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                                        Creating account…
                                      </>
                                    ) : (
                                      <>
                                        <PawPrint className="mr-2 h-4 w-4" aria-hidden="true" />
                                        Sign Up
                                      </>
                                    )}
                                  </Button>
                                </form>
                              </Form>
                            </CardContent>
                            <CardFooter className="justify-center">
                              <p className="text-center text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <button
                                  type="button"
                                  onClick={() => onTabChange("login")}
                                  className="rounded font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                >
                                  Login
                                </button>
                              </p>
                            </CardFooter>
                          </Card>
                    </motion.div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Hero */}
              <motion.aside
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="w-full xl:col-span-7"
              >
                <div
                  className="h-full rounded-3xl bg-primary p-6 text-primary-foreground shadow-[0_25px_60px_-35px_rgba(255,105,180,0.9)] sm:p-8 lg:p-10"
                  style={{
                    backgroundImage:
                      "linear-gradient(150deg, hsl(var(--primary) / 0.97), hsl(var(--secondary) / 0.95)), url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.16'%3E%3Cpath d='M86 70c7 0 13 6 13 13s-6 13-13 13-13-6-13-13 6-13 13-13zm45 0c7 0 13 6 13 13s-6 13-13 13-13-6-13-13 6-13 13-13zm-22 17c18 0 33 15 33 33 0 10-8 18-18 18h-30c-10 0-18-8-18-18 0-18 15-33 33-33zm-45-35c6 0 10 5 10 11s-4 11-10 11-10-5-10-11 4-11 10-11zm90 0c6 0 10 5 10 11s-4 11-10 11-10-5-10-11 4-11 10-11z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                    backgroundSize: "cover, 240px",
                    backgroundPosition: "center, center",
                  }}
                >
                  <div className="mb-6 flex items-center gap-2">
                    <PawPrint className="h-9 w-9 sm:h-10 sm:w-10" aria-hidden="true" />
                    <span className="text-2xl font-bold sm:text-3xl">PawPal</span>
                  </div>

                  <h1 className="mb-3 text-3xl font-bold leading-tight sm:text-4xl">Find Your Forever Friend</h1>

                  <p className="mb-6 max-w-prose text-base leading-relaxed text-primary-foreground/95 sm:text-lg">
                    Creating connections between loving people and pets in need of homes. Join our community to:
                  </p>

                  <ul className="mb-8 space-y-3.5">
                    {BENEFITS.map(({ icon: Icon, text }) => (
                      <li key={text} className="flex items-center gap-3">
                        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="text-sm sm:text-base">{text}</span>
                      </li>
                    ))}
                  </ul>

                  <figure className="rounded-2xl bg-white/15 p-5">
                    <blockquote className="text-sm italic leading-relaxed text-primary-foreground/95 sm:text-base">
                      "Adopting from PawPal was the best decision we ever made. The process was seamless, and now we
                      can't imagine life without our furry family member!"
                    </blockquote>
                    <figcaption className="mt-2.5 text-sm font-semibold">— The Johnson Family</figcaption>
                  </figure>

                  <p className="mt-6 flex items-center gap-2 text-sm text-primary-foreground/90">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    Your details stay private and are never shared with third parties.
                  </p>
                </div>
              </motion.aside>
            </div>
          </div>
        </main>
      )}

    </>
  );
}
