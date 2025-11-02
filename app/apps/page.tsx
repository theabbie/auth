"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

interface OAuthApp {
  appId: string;
  name: string;
  description: string;
  clientId: string;
  redirectUris: string[];
  createdAt: string;
}

export default function AppsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [apps, setApps] = useState<OAuthApp[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchApps();
    }
  }, [user]);

  const fetchApps = async () => {
    try {
      const response = await fetch("/api/oauth/apps");
      const data = await response.json();
      if (data.apps) {
        setApps(data.apps);
      }
    } catch (error) {
      console.error("Failed to fetch apps:", error);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleDeleteApp = async (appId: string) => {
    if (!confirm("Are you sure you want to delete this app? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/oauth/apps/${appId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setApps(apps.filter((app) => app.appId !== appId));
      }
    } catch (error) {
      console.error("Failed to delete app:", error);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">OAuth Applications</h1>
            <p className="text-muted-foreground">Manage your OAuth apps</p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={() => router.push("/docs")}>
              Documentation
            </Button>
            <Button variant="outline" onClick={() => router.push("/profile")}>
              Back to Profile
            </Button>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => router.push("/apps/new")}>
            Create New App
          </Button>
        </div>

        {loadingApps ? (
          <p>Loading apps...</p>
        ) : apps.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No apps yet. Create your first OAuth application to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {apps.map((app) => (
              <Card key={app.appId}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{app.name}</CardTitle>
                      <CardDescription>{app.description || "No description"}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/apps/${app.appId}`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteApp(app.appId)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">Client ID</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{app.clientId}</code>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Redirect URIs</p>
                    <ul className="text-xs space-y-1">
                      {app.redirectUris.map((uri, idx) => (
                        <li key={idx} className="text-muted-foreground">{uri}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
