import { NextApiRequest, NextApiResponse } from 'next'
import emailService from '../../../utils/emailService'
import { emailTemplates } from '../../../utils/htmlEmails'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { name, email, phone, subject, message, _honeypot } = req.body || {}

    // Honeypot simples para bots
    if (_honeypot) {
      return res.status(200).json({ message: 'OK' })
    }

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Nome, email e mensagem são obrigatórios' })
    }

    const safe = (val?: string) => String(val || '').toString().slice(0, 5000)

    const adminSubject = safe(subject) || `Novo contato do site - ${safe(name)}`
    const adminToEnv = process.env.CONTACT_TO || 'marketing@globalizacontabil.com.br'
    const adminRecipients = adminToEnv.split(',').map(s => s.trim()).filter(Boolean)
    const primaryTo = adminRecipients[0]
    const ccList = adminRecipients.slice(1)

    const htmlContent = emailTemplates.contactAdminNotification(
      safe(name),
      safe(email),
      safe(phone),
      adminSubject,
      safe(message)
    )

    // Envia para o principal com CC para os demais e reply-to do cliente
    const sent = await emailService.sendEmail({
      to: primaryTo,
      subject: adminSubject,
      htmlContent,
      cc: ccList,
      replyToEmail: safe(email),
      replyToName: safe(name),
    })

    if (!sent) {
      return res.status(500).json({ message: 'Erro ao enviar sua mensagem. Tente novamente.' })
    }

    // Confirmação para o usuário
    const confirmationHtml = emailTemplates.contactConfirmation(safe(name))
    await emailService.sendEmail({
      to: safe(email),
      subject: 'Recebemos sua mensagem - Globaliza Contabil',
      htmlContent: confirmationHtml,
    })

    return res.status(200).json({ message: 'Mensagem enviada com sucesso. Obrigado pelo contato!' })
  } catch (error) {
    console.error('Erro ao processar contato:', error)
    return res.status(500).json({ message: 'Erro interno do servidor' })
  }
}


