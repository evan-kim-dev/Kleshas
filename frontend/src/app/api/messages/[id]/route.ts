import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const message = await prisma.message.findUnique({ where: { id } });
    if (!message) {
      return NextResponse.json(
        { error: "메시지를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const deletedIds: string[] = [id];

    if (message.role === "user") {
      const aiReplies = await prisma.message.findMany({
        where: { pairedUserId: id },
        select: { id: true },
      });
      deletedIds.push(...aiReplies.map((m) => m.id));

      await prisma.message.deleteMany({ where: { pairedUserId: id } });
    }

    await prisma.message.delete({ where: { id } });

    return NextResponse.json({ ok: true, deletedIds });
  } catch {
    return NextResponse.json(
      { error: "메시지 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
