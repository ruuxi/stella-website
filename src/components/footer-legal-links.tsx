export const SUPPORT_EMAIL = "contact@fromyou.ai";

export function FooterLegalLinks() {
  const year = new Date().getFullYear();
  return (
    <>
      <p className="footer-operator">&copy; {year} FromYou, LLC</p>
      <ul className="legal-links">
        <li>
          <a href="/privacy">Privacy Policy</a>
        </li>
        <li>
          <a href="/terms">Terms of Service</a>
        </li>
        <li>
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </li>
      </ul>
    </>
  );
}
