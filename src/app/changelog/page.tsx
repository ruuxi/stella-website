import { permanentRedirect } from "next/navigation";

export default function ChangelogRedirect() {
  permanentRedirect("/learn-more/whats-new");
}
