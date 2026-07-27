import { NextResponse } from "next/server";

interface PlantCareRequest {
  prompt?: unknown;
}

export async function POST(request: Request) {
  const body = (await request.json()) as PlantCareRequest;

  if (typeof body.prompt !== "string" || !body.prompt.trim()) {
    return NextResponse.json(
      { error: "متن درخواست الزامی است" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    reply:
      "برای بررسی این مشکل، ابتدا رطوبت خاک و باز بودن زهکش گلدان را کنترل کنید. نور روشن و غیرمستقیم برای بیشتر گیاهان آپارتمانی مناسب است و بهتر است آبیاری تنها پس از خشک شدن سطح خاک انجام شود.",
  });
}
