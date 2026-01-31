const bACCKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(`${bACCKEND_URL}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: body.query }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Error from backend" }), {
        status: 500,
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: response.status });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
