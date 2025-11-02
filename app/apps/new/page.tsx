"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAppSchema, CreateAppInput } from "@/lib/validations/oauth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Check, Copy } from "lucide-react";

export default function NewAppPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const form = useForm<CreateAppInput>({
    resolver: zodResolver(createAppSchema),
    defaultValues: {
      name: "",
      description: "",
      redirectUris: [""],
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const onSubmit = async (data: CreateAppInput) => {
    try {
      setSubmitting(true);

      const response = await fetch("/api/oauth/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create app");
      }

      setClientId(result.app.clientId);
      setClientSecret(result.clientSecret);
    } catch (error: any) {
      alert(error.message);
      setSubmitting(false);
    }
  };

  const addRedirectUri = () => {
    const current = form.getValues("redirectUris");
    form.setValue("redirectUris", [...current, ""]);
  };

  const removeRedirectUri = (index: number) => {
    const current = form.getValues("redirectUris");
    form.setValue("redirectUris", current.filter((_, i) => i !== index));
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const copyToClipboard = (text: string, type: 'id' | 'secret') => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  if (clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>App Created Successfully!</CardTitle>
            <CardDescription>
              Save your credentials now. The client secret won&apos;t be shown again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Client ID</p>
              <div className="relative">
                <code className="block bg-muted p-4 pr-12 rounded text-sm break-all">
                  {clientId}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(clientId!, 'id')}
                >
                  {copiedId ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Client Secret</p>
              <div className="relative">
                <code className="block bg-muted p-4 pr-12 rounded text-sm break-all">
                  {clientSecret}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(clientSecret, 'secret')}
                >
                  {copiedSecret ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button onClick={() => router.push("/apps")} className="w-full">
              Go to Apps
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Create OAuth App</h1>
            <p className="text-muted-foreground">Register a new OAuth application</p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={() => router.push("/apps")}>
              Cancel
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
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
                  {form.watch("redirectUris").map((_, index) => (
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
                      {form.watch("redirectUris").length > 1 && (
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
                  {submitting ? "Creating..." : "Create App"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
