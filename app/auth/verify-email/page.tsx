"use client"

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/lib/context/auth-context";
import { setPasswordSchema } from "@/lib/validations/user";
import * as z from "zod";

type SetPasswordInput = z.infer<typeof setPasswordSchema>;

function VerifyEmailContent() {
  const [status, setStatus] = useState<"verifying" | "set_password" | "success" | "error">("verifying");
  const [message, setMessage] = useState("Verifying your email...");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  const form = useForm<SetPasswordInput>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (auth.currentUser) {
          setUserEmail(auth.currentUser.email || "");
          setStatus("set_password");
          setMessage("Email verified! Please set your password.");
          return;
        }

        if (!isSignInWithEmailLink(auth, window.location.href)) {
          setStatus("error");
          setMessage("Invalid verification link");
          return;
        }

        let email = searchParams.get("email");
        if (!email) {
          email = window.localStorage.getItem("emailForSignIn");
        }

        if (!email) {
          setStatus("error");
          setMessage("Email not found. Please try signing up again.");
          return;
        }

        await signInWithEmailLink(auth, email, window.location.href);
        
        window.localStorage.removeItem("emailForSignIn");
        
        setUserEmail(email);
        setStatus("set_password");
        setMessage("Email verified! Please set your password.");
      } catch (error: any) {
        console.error("Verification error:", error);
        
        if (error.code === "auth/email-already-in-use" || error.code === "auth/invalid-action-code") {
          if (auth.currentUser) {
            setUserEmail(auth.currentUser.email || "");
            setStatus("set_password");
            setMessage("Email verified! Please set your password.");
            return;
          }
        }
        
        setStatus("error");
        setMessage(error.message || "Verification failed");
      }
    };

    verifyEmail();
  }, [searchParams, router, refreshUser]);

  async function onSubmitPassword(values: SetPasswordInput) {
    setLoading(true);
    setMessage("");

    try {
      const { updatePassword } = await import("firebase/auth");
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error("No authenticated user");
      }

      if (currentUser.email !== userEmail) {
        throw new Error("Email mismatch. Please try signing up again.");
      }

      await updatePassword(currentUser, values.password);
      
      const idToken = await currentUser.getIdToken(true);
      
      await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: currentUser.uid, email: userEmail }),
      });
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, password: values.password, idToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create session");
      }

      await refreshUser();
      setStatus("success");
      setMessage("Password set successfully! Redirecting...");
      
      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    } catch (error: any) {
      setMessage(error.message || "Failed to set password");
    } finally {
      setLoading(false);
    }
  }

  if (status === "set_password") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Set Your Password</CardTitle>
            <CardDescription>
              Create a secure password for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitPassword)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <PasswordInput 
                          autoComplete="new-password"
                          placeholder="••••••••" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <PasswordInput 
                          autoComplete="new-password"
                          placeholder="••••••••" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Setting password..." : "Set Password"}
                </Button>
              </form>
            </Form>
            {message && (
              <p className={`text-sm mt-4 ${message.includes("verified") || message.includes("success") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {message}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>
            {status === "verifying" && "Please wait while we verify your email..."}
            {status === "success" && "Your email has been verified!"}
            {status === "error" && "Verification failed"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className={`text-sm ${status === "error" ? "text-red-600 dark:text-red-400" : "text-zinc-600 dark:text-zinc-400"}`}>
            {message}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Email Verification</CardTitle>
            <CardDescription>Loading...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
