import sql from "@/config/database";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {

    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const res= await sql`SELECT * FROM handles WHERE id = ${user.id}`;
        return NextResponse.json(res, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const {leetcode,codeforces,codechef,gfg} = await req.json();
        await sql`UPDATE handles SET leetcode = ${leetcode}, codeforces = ${codeforces}, codechef = ${codechef}, gfg = ${gfg} WHERE id = ${user.id}`;
        return NextResponse.json( { status: 204 });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}