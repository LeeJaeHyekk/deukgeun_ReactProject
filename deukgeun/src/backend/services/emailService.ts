import nodemailer from "nodemailer"
import { config } from "../config/env"
import { logger } from '@backend/utils/logger'
import { EmailServiceConfig, EmailContent } from "../types"

class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private isConfigured = false

  constructor() {
    this.initializeTransporter()
  }

  private initializeTransporter() {
    // Check if email configuration is available
    const emailConfig = this.getEmailConfig()

    if (emailConfig) {
      this.transporter = nodemailer.createTransport(emailConfig)
      this.isConfigured = true
      logger.info("Email service initialized successfully")
    } else {
      logger.warn("Email service not configured - using mock mode")
      this.isConfigured = false
    }
  }

  private getEmailConfig(): EmailServiceConfig | null {
    // Check for email configuration in environment variables
    const host = process.env.EMAIL_HOST
    const port = process.env.EMAIL_PORT
    const user = process.env.EMAIL_USER
    const pass = process.env.EMAIL_PASS

    if (host && port && user && pass) {
      return {
        host,
        port: parseInt(port),
        secure: process.env.EMAIL_SECURE === "true",
        auth: { user, pass },
      }
    }

    return null
  }

  private async sendEmail(emailContent: EmailContent): Promise<boolean> {
    try {
      if (!this.isConfigured || !this.transporter) {
        // Mock email sending for development
        logger.info(
          `[MOCK EMAIL] To: ${emailContent.to}, Subject: ${emailContent.subject}`
        )
        logger.info(
          `[MOCK EMAIL] Content: ${emailContent.text || emailContent.html}`
        )
        return true
      }

      const result = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || "noreply@gymapp.com",
        to: emailContent.to,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      })

      logger.info(
        `Email sent successfully to ${emailContent.to}: ${result.messageId}`
      )
      return true
    } catch (error) {
      logger.error("Failed to send email:", error)
      return false
    }
  }

  async sendVerificationCode(
    email: string,
    code: string,
    type: "find_id" | "reset_password",
    nickname?: string
  ): Promise<boolean> {
    const subject =
      type === "find_id"
        ? "[GymApp] 아이디 찾기 인증 코드"
        : "[GymApp] 비밀번호 재설정 인증 코드"

    const html = this.generateVerificationEmailHTML(code, type, nickname)
    const text = this.generateVerificationEmailText(code, type, nickname)

    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
    })
  }

  async sendPasswordResetLink(
    email: string,
    resetToken: string,
    nickname?: string
  ): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

    const subject = "[GymApp] 비밀번호 재설정 링크"
    const html = this.generatePasswordResetEmailHTML(resetUrl, nickname)
    const text = this.generatePasswordResetEmailText(resetUrl, nickname)

    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
    })
  }

  async sendIdFoundEmail(email: string, nickname: string): Promise<boolean> {
    const subject = "[GymApp] 아이디 찾기 결과"
    const html = this.generateIdFoundEmailHTML(email, nickname)
    const text = this.generateIdFoundEmailText(email, nickname)

    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
    })
  }

  private generateVerificationEmailHTML(
    code: string,
    type: "find_id" | "reset_password",
    nickname?: string
  ): string {
    const action = type === "find_id" ? "아이디 찾기" : "비밀번호 재설정"

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GymApp 인증 코드</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .code { background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #667eea; margin: 20px 0; border-radius: 5px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>GymApp</h1>
            <p>${action} 인증 코드</p>
          </div>
          <div class="content">
            ${nickname ? `<p>안녕하세요, <strong>${nickname}</strong>님!</p>` : "<p>안녕하세요!</p>"}
            <p>GymApp ${action}를 위한 인증 코드를 발송드립니다.</p>
            
            <div class="code">${code}</div>
            
            <p><strong>인증 코드는 10분간 유효합니다.</strong></p>
            
            <div class="warning">
              <strong>⚠️ 보안 주의사항:</strong>
              <ul>
                <li>본인이 요청하지 않은 경우 이 이메일을 무시하세요.</li>
                <li>인증 코드를 다른 사람과 공유하지 마세요.</li>
                <li>의심스러운 활동이 발견되면 즉시 고객센터에 연락하세요.</li>
              </ul>
            </div>
            
            <p>감사합니다.<br>GymApp 팀</p>
          </div>
          <div class="footer">
            <p>본 이메일은 GymApp 계정 보안을 위해 발송되었습니다.</p>
            <p>© 2024 GymApp. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private generateVerificationEmailText(
    code: string,
    type: "find_id" | "reset_password",
    nickname?: string
  ): string {
    const action = type === "find_id" ? "아이디 찾기" : "비밀번호 재설정"

    return `
GymApp ${action} 인증 코드

${nickname ? `안녕하세요, ${nickname}님!` : "안녕하세요!"}

GymApp ${action}를 위한 인증 코드를 발송드립니다.

인증 코드: ${code}

인증 코드는 10분간 유효합니다.

⚠️ 보안 주의사항:
- 본인이 요청하지 않은 경우 이 이메일을 무시하세요.
- 인증 코드를 다른 사람과 공유하지 마세요.
- 의심스러운 활동이 발견되면 즉시 고객센터에 연락하세요.

감사합니다.
GymApp 팀

---
본 이메일은 GymApp 계정 보안을 위해 발송되었습니다.
© 2024 GymApp. All rights reserved.
    `
  }

  private generatePasswordResetEmailHTML(
    resetUrl: string,
    nickname?: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GymApp 비밀번호 재설정</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>GymApp</h1>
            <p>비밀번호 재설정</p>
          </div>
          <div class="content">
            ${nickname ? `<p>안녕하세요, <strong>${nickname}</strong>님!</p>` : "<p>안녕하세요!</p>"}
            <p>GymApp 계정의 비밀번호 재설정을 요청하셨습니다.</p>
            
            <p>아래 버튼을 클릭하여 새로운 비밀번호를 설정하세요:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">비밀번호 재설정</a>
            </div>
            
            <p>또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
            <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px;">${resetUrl}</p>
            
            <div class="warning">
              <strong>⚠️ 보안 주의사항:</strong>
              <ul>
                <li>본인이 요청하지 않은 경우 이 이메일을 무시하세요.</li>
                <li>이 링크는 1시간간 유효합니다.</li>
                <li>의심스러운 활동이 발견되면 즉시 고객센터에 연락하세요.</li>
              </ul>
            </div>
            
            <p>감사합니다.<br>GymApp 팀</p>
          </div>
          <div class="footer">
            <p>본 이메일은 GymApp 계정 보안을 위해 발송되었습니다.</p>
            <p>© 2024 GymApp. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private generatePasswordResetEmailText(
    resetUrl: string,
    nickname?: string
  ): string {
    return `
GymApp 비밀번호 재설정

${nickname ? `안녕하세요, ${nickname}님!` : "안녕하세요!"}

GymApp 계정의 비밀번호 재설정을 요청하셨습니다.

아래 링크를 클릭하여 새로운 비밀번호를 설정하세요:

${resetUrl}

⚠️ 보안 주의사항:
- 본인이 요청하지 않은 경우 이 이메일을 무시하세요.
- 이 링크는 1시간간 유효합니다.
- 의심스러운 활동이 발견되면 즉시 고객센터에 연락하세요.

감사합니다.
GymApp 팀

---
본 이메일은 GymApp 계정 보안을 위해 발송되었습니다.
© 2024 GymApp. All rights reserved.
    `
  }

  private generateIdFoundEmailHTML(email: string, nickname: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GymApp 아이디 찾기 결과</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .id-box { background: #fff; border: 2px solid #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>GymApp</h1>
            <p>아이디 찾기 결과</p>
          </div>
          <div class="content">
            <p>안녕하세요, <strong>${nickname}</strong>님!</p>
            <p>요청하신 아이디 찾기 결과를 알려드립니다.</p>
            
            <div class="id-box">
              <h3>회원님의 아이디</h3>
              <p style="font-size: 18px; font-weight: bold; color: #667eea;">${email}</p>
            </div>
            
            <p>로그인 페이지에서 위 아이디로 로그인하실 수 있습니다.</p>
            
            <p>감사합니다.<br>GymApp 팀</p>
          </div>
          <div class="footer">
            <p>본 이메일은 GymApp 계정 보안을 위해 발송되었습니다.</p>
            <p>© 2024 GymApp. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private generateIdFoundEmailText(email: string, nickname: string): string {
    return `
GymApp 아이디 찾기 결과

안녕하세요, ${nickname}님!

요청하신 아이디 찾기 결과를 알려드립니다.

회원님의 아이디: ${email}

로그인 페이지에서 위 아이디로 로그인하실 수 있습니다.

감사합니다.
GymApp 팀

---
본 이메일은 GymApp 계정 보안을 위해 발송되었습니다.
© 2024 GymApp. All rights reserved.
    `
  }
}

export const emailService = new EmailService()
