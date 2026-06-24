import { NextRequest, NextResponse } from "next/server";
import { AGENTS } from "@/lib/agents";
import { guard } from "@/lib/apiGuard";

// Returns the static agent list. Guarded so it can't be used as an
// unauthenticated probe of the beta gate.
export async function POST(req: NextRequest) {
    const gate = await guard(req);
    if (!gate.ok) return gate.response;
    return NextResponse.json({ agents: AGENTS });
}
