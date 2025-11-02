"use client"

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signupSchema } from "@/lib/validations/user";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { sendSignInLinkToEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

type SignupInput = {
  email: string;
};

export function SignupForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: SignupInput) {
    setLoading(true);
    setMessage("");

    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/auth/verify-email?email=${encodeURIComponent(values.email)}`,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, values.email, actionCodeSettings);
      
      window.localStorage.setItem("emailForSignIn", values.email);

      setMessage("Verification email sent! Please check your inbox.");
      if (onSuccess) onSuccess();
    } catch (error: any) {
      setMessage(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    autoComplete="username email"
                    placeholder="email@example.com" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending verification email..." : "Sign Up"}
          </Button>
        </form>
      </Form>
      {message && (
        <p className={`text-sm ${message.includes("sent") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
