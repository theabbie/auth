"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { Check, Copy, ArrowRight, ExternalLink } from "lucide-react";
import { OAUTH_SCOPES } from "@/lib/oauth/scopes";
import { PROFILE_CATEGORIES, getFieldsByCategory } from "@/lib/profile-fields";

export default function DocsPage() {
  const [clientId, setClientId] = useState("your_client_id");
  const [clientSecret, setClientSecret] = useState("your_client_secret");
  const [redirectUri, setRedirectUri] = useState("https://example.com/callback");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["profile:email"]);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://abbieauth.vercel.app";

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const scopeString = selectedScopes.join(" ");
  const authUrl = `${baseUrl}/oauth/consent?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopeString)}&state=random_state_string`;

  const toggleScope = (scopeKey: string) => {
    if (scopeKey === "profile:email") return;
    setSelectedScopes(prev => 
      prev.includes(scopeKey) 
        ? prev.filter(s => s !== scopeKey)
        : [...prev, scopeKey]
    );
  };

  const toggleCategoryScopes = (categoryScopes: any[]) => {
    const scopeKeys = categoryScopes.map(s => s.key).filter(k => k !== "profile:email");
    const allSelected = scopeKeys.every(k => selectedScopes.includes(k));
    
    if (allSelected) {
      setSelectedScopes(prev => prev.filter(s => !scopeKeys.includes(s)));
    } else {
      setSelectedScopes(prev => [...new Set([...prev, ...scopeKeys])]);
    }
  };

  const isCategorySelected = (categoryScopes: any[]) => {
    const scopeKeys = categoryScopes.map(s => s.key).filter(k => k !== "profile:email");
    return scopeKeys.length > 0 && scopeKeys.every(k => selectedScopes.includes(k));
  };

  const scopesByCategory = Object.entries(PROFILE_CATEGORIES).map(([key, categoryName]) => {
    const fields = getFieldsByCategory(categoryName);
    const scopes = fields.map(field => {
      const scopeKey = `profile:${field.key}`;
      return OAUTH_SCOPES[scopeKey];
    }).filter(Boolean);
    return { category: categoryName, scopes };
  }).filter(cat => cat.scopes.length > 0);

  const codeExamples = {
    button: `<a href="${authUrl}" class="oauth-button">
  Sign in with AbbieAuth
</a>`,
    
    tokenExchange: `fetch('${baseUrl}/api/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: authorizationCode,
    client_id: '${clientId}',
    client_secret: '${clientSecret}',
    redirect_uri: '${redirectUri}'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Access Token:', data.access_token);
  console.log('Refresh Token:', data.refresh_token);
});`,

    userInfo: `fetch('${baseUrl}/api/oauth/userinfo', {
  headers: {
    'Authorization': 'Bearer ' + accessToken
  }
})
.then(res => res.json())
.then(user => {
  console.log('User:', user);
});`,

    refreshToken: `fetch('${baseUrl}/api/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: '${clientId}',
    client_secret: '${clientSecret}'
  })
})
.then(res => res.json())
.then(data => {
  console.log('New Access Token:', data.access_token);
});`,

    nodeExample: `const express = require('express');
const session = require('express-session');
const crypto = require('crypto');

const app = express();
app.use(session({ secret: 'your-secret', resave: false, saveUninitialized: true }));

const CLIENT_ID = '${clientId}';
const CLIENT_SECRET = '${clientSecret}';
const REDIRECT_URI = '${redirectUri}';
const AUTH_URL = '${baseUrl}/oauth/consent';
const TOKEN_URL = '${baseUrl}/api/oauth/token';
const USERINFO_URL = '${baseUrl}/api/oauth/userinfo';

app.get('/login', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthState = state;
  
  const authUrl = new URL(AUTH_URL);
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'profile:email profile:name');
  authUrl.searchParams.set('state', state);
  
  res.redirect(authUrl.toString());
});

app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  
  if (state !== req.session.oauthState) {
    return res.status(400).send('Invalid state');
  }
  
  const tokenResponse = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI
    })
  });
  
  const { access_token, refresh_token } = await tokenResponse.json();
  
  const userResponse = await fetch(USERINFO_URL, {
    headers: { 'Authorization': \`Bearer \${access_token}\` }
  });
  
  const user = await userResponse.json();
  
  req.session.user = user;
  req.session.refreshToken = refresh_token;
  
  res.redirect('/dashboard');
});

app.listen(3000);`,
  };

  const CodeBlock = ({ code, index, language = "javascript" }: { code: string; index: number; language?: string }) => (
    <div className="relative">
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2"
        onClick={() => copyToClipboard(code, index)}
      >
        {copiedIndex === index ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">AbbieAuth Documentation</h1>
            <p className="text-muted-foreground mt-2">
              Integrate OAuth 2.0 authentication in minutes
            </p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={() => window.location.href = "/apps"}>
              Manage Apps
            </Button>
          </div>
        </div>

        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Your Credentials</CardTitle>
            <CardDescription>
              Enter your app credentials to see personalized code examples
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientId">Client ID</Label>
                <Input
                  id="clientId"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="your_client_id"
                />
              </div>
              <div>
                <Label htmlFor="clientSecret">Client Secret</Label>
                <Input
                  id="clientSecret"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="your_client_secret"
                  type="password"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="redirectUri">Redirect URI</Label>
              <Input
                id="redirectUri"
                value={redirectUri}
                onChange={(e) => setRedirectUri(e.target.value)}
                placeholder="https://example.com/callback"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Don&apos;t have credentials yet?{" "}
              <a href="/apps/new" className="text-primary hover:underline">
                Create an app
              </a>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Scopes</CardTitle>
            <CardDescription>
              Choose which data fields you want to request. Email is always required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {scopesByCategory.map(({ category, scopes }) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm flex-1">{category}</h3>
                  <button
                    type="button"
                    onClick={() => toggleCategoryScopes(scopes)}
                    className="text-xs px-2 py-1 rounded border hover:bg-muted transition-colors"
                  >
                    {isCategorySelected(scopes) ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {scopes.map((scope) => (
                    <div
                      key={scope.key}
                      className={`px-3 py-2 rounded-lg border whitespace-nowrap cursor-pointer transition-all ${
                        selectedScopes.includes(scope.key)
                          ? "bg-primary text-primary-foreground border-primary shadow-md"
                          : "bg-card hover:bg-muted border-border"
                      } ${scope.required ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => toggleScope(scope.key)}
                    >
                      <div className="text-sm">
                        <code className="text-xs font-mono opacity-90">{scope.key}</code>
                        <p className="font-medium">{scope.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="pt-2">
              <Label className="text-sm font-medium">Selected Scopes ({selectedScopes.length})</Label>
              <div className="mt-2 p-3 bg-muted rounded-lg">
                <code className="text-xs break-all">{scopeString}</code>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Quick Start Guide</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Register App", desc: "Create OAuth app" },
                { step: "2", title: "Add Button", desc: "Sign in button" },
                { step: "3", title: "Get Token", desc: "Exchange code" },
                { step: "4", title: "Fetch Data", desc: "Access user info" },
              ].map((item, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-2">
                      {item.step}
                    </div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  1
                </span>
                Add Sign In Button
              </CardTitle>
              <CardDescription>
                Add this button to your login page. Users will be redirected to AbbieAuth for authentication.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CodeBlock code={codeExamples.button} index={0} language="html" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowRight className="h-4 w-4" />
                <span>User clicks button and is redirected to consent page</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  2
                </span>
                Handle Callback & Exchange Code
              </CardTitle>
              <CardDescription>
                After user authorizes, they&apos;re redirected to your callback URL with an authorization code.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Callback URL receives:</h4>
                <CodeBlock
                  code={`${redirectUri}?code=AUTHORIZATION_CODE&state=random_state_string`}
                  index={1}
                  language="text"
                />
              </div>
              <div>
                <h4 className="font-semibold mb-2">Exchange code for tokens:</h4>
                <CodeBlock code={codeExamples.tokenExchange} index={2} />
              </div>
              <div>
                <h4 className="font-semibold mb-2">Response:</h4>
                <CodeBlock
                  code={`{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}`}
                  index={3}
                  language="json"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  3
                </span>
                Fetch User Information
              </CardTitle>
              <CardDescription>
                Use the access token to retrieve user data based on granted scopes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CodeBlock code={codeExamples.userInfo} index={4} />
              <div>
                <h4 className="font-semibold mb-2">Response:</h4>
                <CodeBlock
                  code={`{
  "sub": "user_id_12345",
  "email": "user@example.com",
  "name": "John Doe"
}`}
                  index={5}
                  language="json"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  4
                </span>
                Refresh Access Token
              </CardTitle>
              <CardDescription>
                Access tokens expire after 1 hour. Use refresh token to get a new one.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CodeBlock code={codeExamples.refreshToken} index={6} />
              <div>
                <h4 className="font-semibold mb-2">Response:</h4>
                <CodeBlock
                  code={`{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}`}
                  index={7}
                  language="json"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Complete Node.js Example</CardTitle>
              <CardDescription>
                Full Express.js implementation with session management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock code={codeExamples.nodeExample} index={8} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Available Scopes</CardTitle>
              <CardDescription>
                Complete list of data fields you can request access to. Organized by category.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {scopesByCategory.map(({ category, scopes }) => (
                <div key={category}>
                  <h3 className="font-semibold mb-3">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {scopes.map((scope) => (
                      <div key={scope.key} className="p-3 rounded-lg border">
                        <code className="text-xs font-mono text-primary">{scope.key}</code>
                        <p className="text-sm font-medium mt-1">{scope.label}</p>
                        <p className="text-xs text-muted-foreground">{scope.description}</p>
                        {scope.required && (
                          <span className="text-xs text-primary font-medium">Required</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-xs font-mono">
                    GET
                  </span>
                  <code className="text-sm">/oauth/consent</code>
                </div>
                <p className="text-sm text-muted-foreground ml-14">
                  Authorization endpoint - redirect users here to start OAuth flow
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs font-mono">
                    POST
                  </span>
                  <code className="text-sm">/api/oauth/token</code>
                </div>
                <p className="text-sm text-muted-foreground ml-14">
                  Token endpoint - exchange authorization code or refresh token
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-xs font-mono">
                    GET
                  </span>
                  <code className="text-sm">/api/oauth/userinfo</code>
                </div>
                <p className="text-sm text-muted-foreground ml-14">
                  Resource endpoint - fetch user data with access token
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Always use HTTPS in production</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Store client secret securely (never in client-side code)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Use state parameter to prevent CSRF attacks</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Validate redirect URI matches registered URIs</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Request minimal scopes (only data you need)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Implement token refresh logic before expiry</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardContent className="pt-6 text-center">
              <h3 className="text-xl font-bold mb-2">Need Help?</h3>
              <p className="text-muted-foreground mb-4">
                Check out example implementations or manage your apps
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => window.open("http://github.com/theabbie/auth", "_blank")}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Examples
                </Button>
                <Button onClick={() => window.location.href = "/apps"}>
                  Manage Apps
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
