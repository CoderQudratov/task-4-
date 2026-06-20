export function getVerifyUrl(token: string): string {
  return `${process.env.APP_BASE_URL}/verify/${token}`;
}
