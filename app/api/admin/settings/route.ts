import { NextResponse } from "next/server";

// Dummy settings data for demonstration. Replace with real DB query if needed.
const settings = {
  name: "Agence Université",
  email: "admin@agence.com",
  notifications: true,
  admins: [
    { id: 1, name: "Admin Principal", email: "admin@agence.com" },
  ],
};

export async function GET() {
  // Simulate async DB fetch if needed
  return NextResponse.json({ settings });
}
