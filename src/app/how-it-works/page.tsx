import { permanentRedirect } from "next/navigation";

export default function HowItWorksRedirect() {
  permanentRedirect("/learn-more#overview");
}
