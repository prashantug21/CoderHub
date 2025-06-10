import { NextRequest, NextResponse } from "next/server";
import sql from "@/config/database";

// GET /api/search?query=prefix
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.trim();

    if (!query) {
        return NextResponse.json([], { status: 200 });
    }

    try {
        
        const res= await sql`
            SELECT u.username, u.first, u.last, u.avatar, h.leetcode, h.codeforces, h.codechef, h.gfg
            FROM users u
            JOIN handles h ON u.id = h.id
            WHERE u.username ILIKE ${query + "%"}
                OR h.leetcode ILIKE ${query + "%"}
                OR h.codeforces ILIKE ${query + "%"}
                OR h.codechef ILIKE ${query + "%"}
                OR h.gfg ILIKE ${query + "%"}
            ORDER BY u.username
            LIMIT 10
        `;

        return NextResponse.json(res, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}