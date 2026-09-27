/** IPv4 合法性校验。 */
export function isValidIpv4(value) {
  const v = String(value ?? '').trim();
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(v);
  if (!m) return false;
  return m.slice(1).every((seg) => Number(seg) <= 255);
}
