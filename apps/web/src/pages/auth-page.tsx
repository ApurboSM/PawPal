import { useEffect, useState } from "react";
import { Redirect } from "wouter";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth, loginSchema, registerSchema, type RegisterData } from "@/hooks/use-auth";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { PawPrint } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthSkeleton } from "@/components/skeletons/page-skeletons";

function AuthFormFieldsSkeleton({ fields }: { fields: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      ))}
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  );
}

function getInitialAuthTab(): "login" | "register" {
  if (typeof window === "undefined") {
    return "login";
  }

  const tab = new URLSearchParams(window.location.search).get("tab");
  return tab === "register" ? "register" : "login";
}

export default function AuthPage() {
  const { user, loginMutation, registerMutation, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(getInitialAuthTab);
  const [isSwitchingTabs, setIsSwitchingTabs] = useState(false);
  const [showPawAnimation, setShowPawAnimation] = useState<{ login: boolean; register: boolean }>({ login: false, register: false });
  const isSubmitting = loginMutation.isPending || registerMutation.isPending;
  const isLoginBusy = loginMutation.isPending || showPawAnimation.login;
  const isRegisterBusy = registerMutation.isPending || showPawAnimation.register;

  useEffect(() => {
    if (!isSwitchingTabs) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsSwitchingTabs(false);
    }, 220);

    return () => window.clearTimeout(timer);
  }, [isSwitchingTabs]);

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    const nextTab = tab === "register" ? "register" : "login";
    if (nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
  }, [activeTab]);
  
  // Login form
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Registration form
  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      name: "",
      role: "user",
    },
  });

  const onLoginSubmit = (data: any) => {
    setShowPawAnimation({ ...showPawAnimation, login: true });
    setTimeout(() => {
      setShowPawAnimation({ ...showPawAnimation, login: false });
      loginMutation.mutate(data);
    }, 600);
  };

  const onRegisterSubmit = (data: RegisterData) => {
    setShowPawAnimation({ ...showPawAnimation, register: true });
    setTimeout(() => {
      setShowPawAnimation({ ...showPawAnimation, register: false });
      registerMutation.mutate(data);
    }, 600);
  };

  const onTabChange = (nextTab: string) => {
    if (nextTab === activeTab || isSubmitting) {
      return;
    }
    setIsSwitchingTabs(true);
    setActiveTab(nextTab);
  };

  // Redirect to home if user is already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  if (isAuthLoading) {
    return (
      <>
        <Helmet>
          <title>Login or Sign Up - PawPal</title>
          <meta name="description" content="Join PawPal to find your perfect pet companion. Login or sign up to access adoption applications, appointments, and more." />
        </Helmet>

        <Navbar />
        <main className="min-h-screen bg-neutral-100">
          <AuthSkeleton />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Login or Sign Up - PawPal</title>
        <meta name="description" content="Join PawPal to find your perfect pet companion. Login or sign up to access adoption applications, appointments, and more." />
      </Helmet>
      
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-pink-50 py-6 sm:py-10">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 gap-6 lg:gap-8 xl:grid-cols-12">
            {/* Auth Card */}
            <div className="w-full xl:col-span-5">
              <Tabs
                defaultValue="login"
                value={activeTab}
                onValueChange={onTabChange}
                className="w-full"
              >
                <TabsList className="mb-4 grid h-auto w-full grid-cols-2 rounded-xl border border-rose-100 bg-white p-1 shadow-sm">
                  <TabsTrigger value="login" className="rounded-lg py-2.5 text-sm font-semibold" disabled={isSubmitting}>Login</TabsTrigger>
                  <TabsTrigger value="register" className="rounded-lg py-2.5 text-sm font-semibold" disabled={isSubmitting}>Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <Card className="rounded-2xl border-rose-100/80 shadow-sm sm:shadow-md">
                    <CardHeader className="pb-3">
                      <CardTitle>Welcome Back!</CardTitle>
                      <CardDescription>
                        Login to your account to manage adoptions, appointments, and more.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isSwitchingTabs ? (
                        <AuthFormFieldsSkeleton fields={2} />
                      ) : (
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your username" className="h-11 rounded-xl" disabled={isLoginBusy} {...field} />
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
                                  <Input type="password" placeholder="Enter your password" className="h-11 rounded-xl" disabled={isLoginBusy} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className={`h-11 w-full rounded-xl bg-[#FF6B98] font-semibold hover:bg-[#FF4B78] ${showPawAnimation.login ? "animate-paw" : ""}`}
                            disabled={isLoginBusy}
                          >
                            {loginMutation.isPending ? (
                              <Skeleton className="h-4 w-20" />
                            ) : (
                              <><PawPrint className="mr-2 h-4 w-4" /> Login</>
                            )}
                          </Button>
                        </form>
                      </Form>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-center">
                      <p className="text-center text-sm text-neutral-600">
                        Don't have an account?{" "}
                        <button 
                          onClick={() => onTabChange("register")}
                          className="font-medium text-[#FF6B98] hover:underline"
                        >
                          Sign up
                        </button>
                      </p>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="register">
                  <Card className="rounded-2xl border-rose-100/80 shadow-sm sm:shadow-md">
                    <CardHeader className="pb-3">
                      <CardTitle>Create an Account</CardTitle>
                      <CardDescription>
                        Join PawPal to start your pet adoption journey.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isSwitchingTabs ? (
                        <AuthFormFieldsSkeleton fields={5} />
                      ) : (
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                          <FormField
                            control={registerForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your full name" className="h-11 rounded-xl" disabled={isRegisterBusy} {...field} />
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
                                  <Input type="email" placeholder="Enter your email" className="h-11 rounded-xl" disabled={isRegisterBusy} {...field} />
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
                                  <Input placeholder="Choose a username" className="h-11 rounded-xl" disabled={isRegisterBusy} {...field} />
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
                                  <Input type="password" placeholder="Create a password" className="h-11 rounded-xl" disabled={isRegisterBusy} {...field} />
                                </FormControl>
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
                                  <Input type="password" placeholder="Confirm your password" className="h-11 rounded-xl" disabled={isRegisterBusy} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className={`h-11 w-full rounded-xl bg-[#FF6B98] font-semibold hover:bg-[#FF4B78] ${showPawAnimation.register ? "animate-paw" : ""}`}
                            disabled={isRegisterBusy}
                          >
                            {registerMutation.isPending ? (
                              <Skeleton className="h-4 w-28" />
                            ) : (
                              <><PawPrint className="mr-2 h-4 w-4" /> Sign Up</>
                            )}
                          </Button>
                        </form>
                      </Form>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-center">
                      <p className="text-center text-sm text-neutral-600">
                        Already have an account?{" "}
                        <button 
                          onClick={() => onTabChange("login")}
                          className="font-medium text-[#FF6B98] hover:underline"
                        >
                          Login
                        </button>
                      </p>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Hero Section */}
            <div className="w-full xl:col-span-7">
              <div className="h-full rounded-2xl bg-[#FF6B98] p-5 text-white shadow-md sm:rounded-3xl sm:p-8 lg:p-10">
                <div className="mb-5 flex items-center">
                  <PawPrint className="mr-2 h-9 w-9 text-white sm:h-10 sm:w-10" />
                  <h2 className="text-2xl font-bold sm:text-3xl">PawPal</h2>
                </div>

                <h1 className="mb-3 text-2xl font-bold leading-tight sm:text-4xl">Find Your Forever Friend</h1>
                
                <p className="mb-5 text-sm text-white/95 sm:text-lg">
                  Creating connections between loving people and pets in need of homes. Join our community to:
                </p>
                
                <ul className="mb-6 space-y-3 sm:space-y-4">
                  <li className="flex items-start sm:items-center">
                    <div className="mr-3 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white sm:h-8 sm:w-8">
                      <span className="text-sm font-bold text-[#FF6B98] sm:text-base">1</span>
                    </div>
                    <span className="text-sm sm:text-base">Browse and save your favorite pets</span>
                  </li>
                  <li className="flex items-start sm:items-center">
                    <div className="mr-3 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white sm:h-8 sm:w-8">
                      <span className="text-sm font-bold text-[#FF6B98] sm:text-base">2</span>
                    </div>
                    <span className="text-sm sm:text-base">Submit adoption applications</span>
                  </li>
                  <li className="flex items-start sm:items-center">
                    <div className="mr-3 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white sm:h-8 sm:w-8">
                      <span className="text-sm font-bold text-[#FF6B98] sm:text-base">3</span>
                    </div>
                    <span className="text-sm sm:text-base">Schedule appointments for meet & greets</span>
                  </li>
                  <li className="flex items-start sm:items-center">
                    <div className="mr-3 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white sm:h-8 sm:w-8">
                      <span className="text-sm font-bold text-[#FF6B98] sm:text-base">4</span>
                    </div>
                    <span className="text-sm sm:text-base">Access exclusive pet care resources</span>
                  </li>
                </ul>
                
                <div className="rounded-xl bg-white/15 p-4 sm:mt-8">
                  <p className="text-sm italic text-white/95 sm:text-base">
                    "Adopting from PawPal was the best decision we ever made. The process was seamless, and now we can't imagine life without our furry family member!"
                  </p>
                  <p className="mt-2 text-sm font-semibold sm:text-base">— The Johnson Family</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}
