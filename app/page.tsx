"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupForm } from "@/components/auth/signup-form";
import { LoginForm } from "@/components/auth/login-form";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/context/auth-context";

export default function Home() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/profile");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-900 dark:text-zinc-50">Loading...</p>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>AbbieAuth</CardTitle>
          <CardDescription>
            {mode === "login" && "Login to your account"}
            {mode === "signup" && "Create a new account"}
            {mode === "forgot" && "Reset your password"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === "login" && <LoginForm onForgotPassword={() => setMode("forgot")} />}
          {mode === "signup" && <SignupForm />}
          {mode === "forgot" && <ForgotPasswordForm onBack={() => setMode("login")} />}
          
          {mode !== "forgot" && (
            <div className="text-center">
              <Button
                variant="link"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
              >
                {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Log in"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
