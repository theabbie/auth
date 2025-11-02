"use client"

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateAppSchema, UpdateAppInput } from "@/lib/validations/oauth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";

interface OAuthApp {
  appId: string;
  name: string;
  description: string;
  clientId: string;
  redirectUris: string[];
}

export default function EditAppPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const [app, setApp] = useState<OAuthApp | null>(null);
  const [loadingApp, setLoadingApp] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<UpdateAppInput>({
    resolver: zodResolver(updateAppSchema),
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && params.appId) {
      fetchApp();
    }
  }, [user, params.appId]);

  const fetchApp = async () => {
    try {
      const response = await fetch(`/api/oauth/apps/${params.appId}`);
      const data = await response.json();
      
      if (data.app) {
        setApp(data.app);
        form.reset({
          name: data.app.name,
          description: data.app.description,
          redirectUris: data.app.redirectUris,
        });
      }
    } catch (error) {
      console.error("Failed to fetch app:", error);
    } finally {
      setLoadingApp(false);
    }
  };

  const onSubmit = async (data: UpdateAppInput) => {
    try {
      setSubmitting(true);

      const response = await fetch(`/api/oauth/apps/${params.appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update app");
      }

      router.push("/apps");
    } catch (error: any) {
      alert(error.message);
      setSubmitting(false);
    }
  };

  const addRedirectUri = () => {
    const current = form.getValues("redirectUris") || [];
    form.setValue("redirectUris", [...current, ""]);
  };

  const removeRedirectUri = (index: number) => {
    const current = form.getValues("redirectUris") || [];
    form.setValue("redirectUris", current.filter((_, i) => i !== index));
  };

  if (loading || !user || loadingApp) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>App not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Edit OAuth App</h1>
            <p className="text-muted-foreground">Update your application settings</p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={() => router.push("/apps")}>
              Cancel
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>App Details</CardTitle>
            <CardDescription>Client ID: {app.clientId}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>App Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Awesome App" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="A brief description of your app" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Redirect URIs</FormLabel>
                  <FormDescription>
                    Add the URLs where users will be redirected after authorization
                  </FormDescription>
                  {(form.watch("redirectUris") || []).map((_, index) => (
                    <div key={index} className="flex gap-2">
                      <FormField
                        control={form.control}
                        name={`redirectUris.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder="https://example.com/callback"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {(form.watch("redirectUris") || []).length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removeRedirectUri(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addRedirectUri}
                    className="w-full"
                  >
                    Add Another URI
                  </Button>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Updating..." : "Update App"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
