import sql from "@/config/database";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest ) {
  const { searchParams } = new URL(req.url);
  const params = Object.fromEntries(searchParams.entries());
    try {
      if( params && params.friendId) {
        return await GET_BY_ID(params.friendId);

      }
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const res= await sql`SELECT h.* , u.* FROM friends0 f JOIN handles h on f.friend_id = h.id JOIN users u on f.friend_id = u.id WHERE f.id = ${user.id}`;
        return NextResponse.json(res, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error }, { status: 500 });
    }
}

async function GET_BY_ID( friendId : string ) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const res = await sql`SELECT u.username FROM friends0 f JOIN users u ON f.friend_id = u.id WHERE f.id = ${user.id} AND u.username = ${friendId}`;
        if (res.length === 0) {
            return NextResponse.json(false, { status: 200 });
        }
        return NextResponse.json(true, { status: 200 });
    }
    catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const username = body.username;
        const friendData=await sql`SELECT * FROM users WHERE username = ${username}`;
        if (friendData.length === 0) {
            return NextResponse.json({ message: "Friend not found" }, { status: 404 });
        }
        await sql`INSERT INTO friends0 (id, friend_id) VALUES (${user.id},${friendData[0].id}) ON CONFLICT DO NOTHING`;
        return NextResponse.json( { status: 204 });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
  const params = Object.fromEntries(searchParams.entries());
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const friendId = params.friendId;
        await sql`DELETE FROM friends0 WHERE id = ${user.id} AND friend_id = ${friendId}`;
        return NextResponse.json( { status: 204 });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}