/** Prepare an email locally; this function does not send or persist anything. */
export function buildInquiry({
  name,
  email,
  company = "",
  product = "",
  topic,
  message,
}) {
  const subject = `QUYLIRE — ${topic}`;
  const body = [
    "Hello QUYLIRE,",
    "",
    message.trim(),
    "",
    "---",
    `Name: ${name.trim()}`,
    `Email: ${email.trim()}`,
    ...(company.trim() ? [`Company: ${company.trim()}`] : []),
    ...(product.trim() ? [`Product of interest: ${product.trim()}`] : []),
    `Inquiry: ${topic}`,
  ].join("\r\n");
  return {
    href: `mailto:contact@quylire.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    text: `To: contact@quylire.com\r\nSubject: ${subject}\r\n\r\n${body}`,
  };
}
