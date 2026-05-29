import { redirect } from "next/navigation";

export default function LearnIndexPage() {
  // Automatically redirect the user to the first topic in the curriculum
  // when they navigate to /systemdesign/learn
  redirect("/systemdesign/learn/what-is-system-design");
}
