import { NextResponse } from "next/server";
import { AGENTS } from "@/lib/agents";

// Simply returns the static agent list.
// Future: could add probabilistic trait variation here.
export async function POST() {
    return NextResponse.json({ agents: AGENTS });
}
