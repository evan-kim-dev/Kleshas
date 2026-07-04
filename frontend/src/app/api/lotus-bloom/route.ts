import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body as { message?: string };

    const record = await prisma.lotusBloom.create({
      data: {
        message: message?.trim() || "연꽃 만개 기록",
      },
    });

    return NextResponse.json({ id: record.id, createdAt: record.createdAt });
  } catch {
    return NextResponse.json(
      { error: "만개 기록 저장에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const blooms = await prisma.lotusBloom.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return NextResponse.json({ blooms });
  } catch {
    return NextResponse.json(
      { error: "만개 기록 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}
