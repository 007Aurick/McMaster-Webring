import type { Metadata } from "next";
import Tour from "@/components/Tour";
import { members } from "@/data/members";

export const metadata: Metadata = { title: "Tour | mcmaster.network" };

export default function TourPage() {
  return <Tour members={members} />;
}
