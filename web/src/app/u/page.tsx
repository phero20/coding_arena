import { redirect } from "next/navigation";

export default function UserProfileRedirectPage() {
  // Redirect to the home page if someone tries to access the raw /u route without a username
  redirect("/");
}
