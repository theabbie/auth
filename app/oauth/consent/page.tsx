"use client"

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { OAUTH_SCOPES } from "@/lib/oauth/scopes";

function ConsentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const [appName, setAppName] = useState<string>("");
  const [requestedScopes, setRequestedScopes] = useState<string[]>([]);
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const scope = searchParams.get("scope");
  const state = searchParams.get("state");
  const responseType = searchParams.get("response_type");

  useEffect(() => {
    if (!loading && !user) {
      const loginUrl = new URL("/", window.location.origin);
      loginUrl.searchParams.set("redirect", window.location.href);
      router.push(loginUrl.toString());
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!clientId || !redirectUri || responseType !== "code") {
      setError("Invalid authorization request");
      return;
    }

    fetch(`/api/oauth/apps/client?clientId=${clientId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setAppName(data.app?.name || "Unknown App");
        }
      })
      .catch(() => setError("Failed to load app details"));

    const scopes = scope ? scope.split(" ") : ["profile:email"];
    const validScopes = scopes.filter((s) => s in OAUTH_SCOPES);
    
    if (!validScopes.includes("profile:email")) {
      validScopes.unshift("profile:email");
    }

    setRequestedScopes(validScopes);
    setSelectedScopes(validScopes);
  }, [clientId, redirectUri, scope, responseType]);

  const handleScopeToggle = (scopeKey: string) => {
    if (scopeKey === "profile:email") return;

    setSelectedScopes((prev) =>
      prev.includes(scopeKey)
        ? prev.filter((s) => s !== scopeKey)
        : [...prev, scopeKey]
    );
  };

  const handleAuthorize = async () => {
    try {
      setSubmitting(true);
      setError("");

      const response = await fetch("/api/oauth/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          redirect_uri: redirectUri,
          scope: requestedScopes.join(" "),
          state,
          response_type: "code",
          approvedScopes: selectedScopes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authorization failed");
      }

      window.location.href = data.redirectUrl;
    } catch (error: any) {
      setError(error.message);
      setSubmitting(false);
    }
  };

  const handleDeny = () => {
    if (redirectUri) {
      const url = new URL(redirectUri);
      url.searchParams.set("error", "access_denied");
      if (state) {
        url.searchParams.set("state", state);
      }
      window.location.href = url.toString();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authorization Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <Button onClick={() => router.push("/profile")} className="w-full mt-4">
              Back to Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authorize {appName}</CardTitle>
          <CardDescription>
            {appName} is requesting access to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm font-medium">This app would like to:</p>
            {requestedScopes.map((scopeKey) => {
              const scopeInfo = OAUTH_SCOPES[scopeKey];
              const isRequired = "required" in scopeInfo && scopeInfo.required;
              const isSelected = selectedScopes.includes(scopeKey);

              return (
                <div key={scopeKey} className="flex items-start space-x-3">
                  <Checkbox
                    id={scopeKey}
                    checked={isSelected}
                    disabled={isRequired}
                    onCheckedChange={() => handleScopeToggle(scopeKey)}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={scopeKey}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {scopeInfo.label}
                      {isRequired && (
                        <span className="text-muted-foreground ml-1">(required)</span>
                      )}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {scopeInfo.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleDeny}
              variant="outline"
              className="flex-1"
              disabled={submitting}
            >
              Deny
            </Button>
            <Button
              onClick={handleAuthorize}
              className="flex-1"
              disabled={submitting}
            >
              {submitting ? "Authorizing..." : "Authorize"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConsentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <ConsentPageContent />
    </Suspense>
  );
}
