import * as SibApiV3Sdk from 'sib-api-v3-sdk'
import { emailTemplates } from './htmlEmails'

// Configuração da API do Brevo usando as credenciais SMTP corretas
const defaultClient = SibApiV3Sdk.ApiClient.instance

// Configure API key authorization: api-key
const apiKey = defaultClient.authentications['api-key']
apiKey.apiKey = process.env.BREVO_API_KEY || ''

// Verificar se as variáveis de ambiente estão configuradas
if (!process.env.BREVO_API_KEY) {
  console.error('BREVO_API_KEY não está configurada nas variáveis de ambiente')
}

if (!process.env.BREVO_SMTP_USER) {
  console.error('BREVO_SMTP_USER não está configurada nas variáveis de ambiente')
}

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()

export interface EmailData {
  to: string
  subject: string
  htmlContent: string
  senderName?: string
  senderEmail?: string
  cc?: string[]
  bcc?: string[]
  replyToEmail?: string
  replyToName?: string
}

export class EmailService {
  private static instance: EmailService

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

      sendSmtpEmail.to = [{ 
        email: emailData.to,
        name: emailData.to.split('@')[0] // Nome do usuário baseado no email
      }]
      sendSmtpEmail.subject = emailData.subject
      sendSmtpEmail.htmlContent = emailData.htmlContent
      
      // Usar as credenciais SMTP corretas
      sendSmtpEmail.sender = {
        name: emailData.senderName || 'Andre Paravela',
        email: emailData.senderEmail || 'marketing@globalizacontabil.com.br'
      }

      // Tipos adicionais do SDK não estão presentes na definição; uso narrow cast controlado
      const smtpAny: {
        cc?: Array<{ email: string; name?: string }>
        bcc?: Array<{ email: string; name?: string }>
        replyTo?: { email: string; name?: string }
      } = sendSmtpEmail as unknown as {
        cc?: Array<{ email: string; name?: string }>
        bcc?: Array<{ email: string; name?: string }>
        replyTo?: { email: string; name?: string }
      }
      if (emailData.cc && emailData.cc.length > 0) {
        smtpAny.cc = emailData.cc.map(ccEmail => ({
          email: ccEmail,
          name: ccEmail.split('@')[0]
        }))
      }

      if (emailData.bcc && emailData.bcc.length > 0) {
        smtpAny.bcc = emailData.bcc.map(bccEmail => ({
          email: bccEmail,
          name: bccEmail.split('@')[0]
        }))
      }

      if (emailData.replyToEmail) {
        smtpAny.replyTo = {
          email: emailData.replyToEmail,
          name: emailData.replyToName || emailData.replyToEmail.split('@')[0]
        }
      }

      console.log('Enviando email para:', emailData.to)
      console.log('Assunto:', emailData.subject)
      console.log('Remetente:', sendSmtpEmail.sender)

      const response = await apiInstance.sendTransacEmail(sendSmtpEmail)
      
      console.log('Email enviado com sucesso:', response)
      return true
    } catch (error) {
      console.error('Erro ao enviar email:', error)
      return false
    }
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const htmlContent = emailTemplates.welcome(userName)

    return this.sendEmail({
      to: userEmail,
      subject: 'Bem-vindo ao Globaliza Contabil',
      htmlContent
    })
  }

  async sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://globalizacontabil.com.br'}/adm/reset-password?token=${resetToken}`
    const htmlContent = emailTemplates.passwordReset(resetUrl)

    return this.sendEmail({
      to: userEmail,
      subject: 'Redefinição de Senha - Globaliza Contabil',
      htmlContent
    })
  }

  async sendNotificationEmail(userEmail: string, subject: string, message: string): Promise<boolean> {
    const htmlContent = emailTemplates.notification(subject, message)

    return this.sendEmail({
      to: userEmail,
      subject,
      htmlContent
    })
  }

  async sendAdminNotification(adminEmails: string[], newUserName: string, newUserEmail: string): Promise<boolean> {
    const subject = 'Novo Usuário Criado - Globaliza Contabil'
    const message = `
      <p>Um novo usuário foi criado no sistema:</p>
      <ul>
        <li><strong>Nome:</strong> ${newUserName}</li>
        <li><strong>Email:</strong> ${newUserEmail}</li>
        <li><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</li>
      </ul>
      <p>Você pode gerenciar este usuário através do painel administrativo.</p>
    `

    const htmlContent = emailTemplates.notification(subject, message)

    // Enviar para todos os administradores
    const emailPromises = adminEmails.map(email => 
      this.sendEmail({
        to: email,
        subject,
        htmlContent
      })
    )

    try {
      const results = await Promise.all(emailPromises)
      const successCount = results.filter(result => result).length
      console.log(`Notificação enviada para ${successCount}/${adminEmails.length} administradores`)
      return successCount > 0
    } catch (error) {
      console.error('Erro ao enviar notificação para administradores:', error)
      return false
    }
  }
}

export default EmailService.getInstance()
