// ============================================================================
// Email Service
// ============================================================================

export class EmailService {
  static async sendVerificationEmail(
    email: string,
    token: string
  ): Promise<boolean> {
    // 이메일 발송 로직 (간단한 구현)
    console.log(`Verification email sent to ${email} with token: ${token}`)
    return true
  }

  static async sendPasswordResetEmail(
    email: string,
    token: string
  ): Promise<boolean> {
    // 비밀번호 재설정 이메일 발송 로직 (간단한 구현)
    console.log(`Password reset email sent to ${email} with token: ${token}`)
    return true
  }
}
