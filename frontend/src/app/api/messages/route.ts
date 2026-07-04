import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, role, pairedUserId } = body as {
      text?: string;
      role?: string;
      pairedUserId?: string;
    };

    if (!text?.trim() || !role) {
      return NextResponse.json(
        { error: "text와 role은 필수입니다." },
        { status: 400 }
      );
    }

    if (role !== "user" && role !== "ai") {
      return NextResponse.json(
        { error: "role은 user 또는 ai여야 합니다." },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        text: text.trim(),
        role,
        pairedUserId: role === "ai" ? pairedUserId ?? null : null,
      },
    });

    return NextResponse.json({
      id: message.id,
      text: message.text,
      role: message.role,
      createdAt: message.createdAt,
      isBookmarked: message.isBookmarked,
    });
  } catch {
    return NextResponse.json(
      { error: "메시지 저장에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "asc" },
      take: 200,
    });

    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json(
      { error: "메시지 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await prisma.message.deleteMany();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "대화 초기화에 실패했습니다." },
      { status: 500 }
    );
  }
}
