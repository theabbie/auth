"use client"

import { useState } from "react";
import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Check } from "lucide-react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

interface PhoneVerificationProps {
  control: Control<any>;
  initialPhone?: string;
  initialVerified?: boolean;
  onVerified: () => void;
}

export function PhoneVerification({ control, initialPhone, initialVerified, onVerified }: PhoneVerificationProps) {
  const [verificationId, setVerificationId] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(initialVerified || false);
  const [error, setError] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
  };

  const sendOTP = async (phone: string) => {
    if (!phone) {
      setError("Please enter a phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
      setVerificationId("pending");
      setError("OTP sent to your phone");
    } catch (error: any) {
      console.error("Send OTP error:", error);
      setError(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await confirmationResult.confirm(otp);
      setVerified(true);
      onVerified();
      setError("Phone verified successfully!");
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      setError(error.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div id="recaptcha-container"></div>
      
      <FormField
        control={control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number</FormLabel>
            <div className="flex gap-2">
              <FormControl>
                <Input
                  placeholder="+1234567890"
                  {...field}
                  disabled={verified}
                  className="flex-1"
                />
              </FormControl>
              {verified ? (
                <Button type="button" variant="outline" disabled className="gap-2">
                  <Check className="h-4 w-4" />
                  Verified
                </Button>
              ) : verificationId ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => sendOTP(field.value || "")}
                  disabled={loading}
                >
                  Resend
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => sendOTP(field.value || "")}
                  disabled={loading || !field.value}
                >
                  {loading ? "Sending..." : "Verify"}
                </Button>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {verificationId && !verified && (
        <div className="space-y-3">
          <FormLabel className="text-zinc-900 dark:text-zinc-50">Enter OTP</FormLabel>
          <div className="flex gap-2 items-center">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <Button
              type="button"
              onClick={verifyOTP}
              disabled={loading || otp.length !== 6}
            >
              Verify OTP
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className={`text-sm ${error.includes("success") || error.includes("sent") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {error}
        </p>
      )}
    </div>
  );
}
