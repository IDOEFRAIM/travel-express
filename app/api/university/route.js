import { NextResponse } from "next/server";
import createUniversityAction from "@/actions/university.actions";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const result = await createUniversityAction(formData);
    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
                console.log('result',result)

      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Error in /api/university:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
