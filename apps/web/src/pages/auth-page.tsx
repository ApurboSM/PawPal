import { useState, useEffect } from "react";
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

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showPawAnimation, setShowPawAnimation] = useState<{ login: boolean; register: boolean }>({ login: false, register: false });
  
  // Loading animation at startup
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
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

  // Redirect to home if user is already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  if (isLoading) {
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
      
      <div className="min-h-screen bg-neutral-100 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 items-stretch max-w-6xl mx-auto">
            {/* Auth Card */}
            <div className="w-full lg:w-1/2">
              <Tabs
                defaultValue="login"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <Card>
                    <CardHeader>
                      <CardTitle>Welcome Back!</CardTitle>
                      <CardDescription>
                        Login to your account to manage adoptions, appointments, and more.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your username" {...field} />
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
                                  <Input type="password" placeholder="Enter your password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className={`w-full bg-[#FF6B98] hover:bg-[#FF4B78] ${showPawAnimation.login ? 'animate-paw' : ''}`}
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? (
                              <Skeleton className="h-4 w-20" />
                            ) : (
                              <><PawPrint className="mr-2 h-4 w-4" /> Login</>
                            )}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                      <p className="text-sm text-neutral-600">
                        Don't have an account?{" "}
                        <button 
                          onClick={() => setActiveTab("register")}
                          className="text-[#FF6B98] hover:underline font-medium"
                        >
                          Sign up
                        </button>
                      </p>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="register">
                  <Card>
                    <CardHeader>
                      <CardTitle>Create an Account</CardTitle>
                      <CardDescription>
                        Join PawPal to start your pet adoption journey.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                          <FormField
                            control={registerForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your full name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                                <Skeleton className="h-4 w-28" />
                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="Enter your email" {...field} />
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
                                  <Input placeholder="Choose a username" {...field} />
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
                                  <Input type="password" placeholder="Create a password" {...field} />
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
                                  <Input type="password" placeholder="Confirm your password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className={`w-full bg-[#FF6B98] hover:bg-[#FF4B78] ${showPawAnimation.register ? 'animate-paw' : ''}`}
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? (
                              <Skeleton className="h-4 w-28" />
                            ) : (
                              <><PawPrint className="mr-2 h-4 w-4" /> Sign Up</>
                            )}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                      <p className="text-sm text-neutral-600">
                        Already have an account?{" "}
                        <button 
                          onClick={() => setActiveTab("login")}
                          className="text-[#FF6B98] hover:underline font-medium"
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
            <div className="w-full lg:w-1/2 bg-[#FF6B98] rounded-xl p-8 flex flex-col justify-center text-white">
              <div className="mb-6 flex items-center">
                <PawPrint className="h-10 w-10 mr-2 text-white" />
                <h2 className="text-3xl font-bold">PawPal</h2>
              </div>
              
              <h1 className="text-4xl font-bold mb-4">Find Your Forever Friend</h1>
              
              <p className="text-lg mb-6">
                Creating connections between loving people and pets in need of homes. Join our community to:
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="font-bold text-[#FF6B98]">1</span>
                  </div>
                  <span>Browse and save your favorite pets</span>
                </li>
                <li className="flex items-center">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="font-bold text-[#FF6B98]">2</span>
                  </div>
                  <span>Submit adoption applications</span>
                </li>
                <li className="flex items-center">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="font-bold text-[#FF6B98]">3</span>
                  </div>
                  <span>Schedule appointments for meet & greets</span>
                </li>
                <li className="flex items-center">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="font-bold text-[#FF6B98]">4</span>
                  </div>
                  <span>Access exclusive pet care resources</span>
                </li>
              </ul>
              
              <div className="mt-auto">
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="italic text-white/90">
                    "Adopting from PawPal was the best decision we ever made. The process was seamless, and now we can't imagine life without our furry family member!"
                  </p>
                  <p className="mt-2 font-semibold">— The Johnson Family</p>
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
