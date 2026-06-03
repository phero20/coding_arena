import { redirect } from "next/navigation";

export default function ArenaMatchRedirectPage() {
  // Redirect the user back to the main arena page if they try to access the raw /arena/match route
  redirect(`/arena`);
}
