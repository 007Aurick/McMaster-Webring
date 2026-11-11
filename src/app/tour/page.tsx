import type { Metadata } from "next";
import Tour from "@/components/Tour";
import { members } from "@/data/members";

export const metadata: Metadata = { title: "Tour | McMaster Webring" };

export default function TourPage() {
  return <Tour members={members} />;
}
