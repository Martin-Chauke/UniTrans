import { redirect } from "next/navigation";

/** Old URL; line history lives at `/driver/lines`. */
export default function DriverTripsRedirectPage() {
  redirect("/driver/lines");
}
