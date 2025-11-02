export async function handleRequest(endpoint: string, data?: any) {
  const response = await fetch(`/api${endpoint}`, {
    method: data ? "POST" : "GET",
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
  });
  return response.json();
}

export function createApiHandler(handlers: Record<string, Function>) {
  return async (request: Request) => {
    const url = new URL(request.url);
    const path = url.pathname.split("/").pop() || "";
    
    if (handlers[path]) {
      return handlers[path](request);
    }
    
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  };
}
