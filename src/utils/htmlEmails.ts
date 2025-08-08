// Templates de email HTML para o Globaliza Contabil

export const emailTemplates = {
  // Template de boas-vindas
  welcome: (userName: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bem-vindo ao Globaliza Contabil</title>
    </head>
    <body style="font-family: Montserrat, sans-serif; margin: 0; padding: 0; background: linear-gradient(313deg, #013f71, #132433)!important; ">
      <div style="max-width: 600px; margin: 0 auto; background-color: #19354f; padding: 20px; border-radius: 4px!important; margin-bottom: 30px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 3px solid #013F71;">
         <img src="https://i.ibb.co/v6yJsW0n/default.png" alt="Globaliza Contabil" style="width: 100px; height: 100px;">
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #ffffff; margin-bottom: 20px;">Bem-vindo ao Globaliza Contabil!</h2>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px; color: #ffffff;">
            Olá <strong>${userName}</strong>,
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #ffffff; margin-bottom: 20px;">
            Seu cadastro foi realizado com sucesso no painel administrativo do Globaliza Contabil.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #ffffff; margin-bottom: 30px;">
            Agora você pode acessar o painel e gerenciar o conteúdo do site com total autonomia.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://globalizacontabil.com.br'}/adm" 
               style="background-color: #ff001a; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 4px!important; font-weight: bold; display: inline-block;">
              Acessar Painel Administrativo
            </a>
          </div>
          
          <p style="font-size: 14px; color: #ffffff; margin-top: 30px;">
            Se você tiver alguma dúvida, não hesite em entrar em contato conosco.
          </p>
        </div>
        
          <p style="margin: 0; color: #ffffff; font-size: 14px;">
            Atenciosamente,<br>
            <strong>Equipe Globaliza Contabil</strong>
          </p>
      </div>
    </body>
    </html>
  `,

  // Template de redefinição de senha
  passwordReset: (resetUrl: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redefinição de Senha - Globaliza Contabil</title>
    </head>
    <body style="font-family: Montserrat, sans-serif; margin: 0; padding: 0; background: linear-gradient(313deg, #013f71, #132433)!important; ">
      <div style="max-width: 600px; margin: 0 auto; background-color: #19354f; padding: 20px; border-radius: 4px!important; margin-bottom: 30px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 3px solid #013F71;">
         <img src="https://i.ibb.co/v6yJsW0n/default.png" alt="Globaliza Contabil" style="width: 100px; height: 100px;">
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #ffffff; margin-bottom: 20px;">Redefinição de Senha</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #ffffff; margin-bottom: 20px;">
            Você solicitou a redefinição de sua senha no painel administrativo.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #ffffff; margin-bottom: 30px;">
            Clique no botão abaixo para criar uma nova senha:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #ff001a; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 4px!important; font-weight: bold; display: inline-block;">
              Redefinir Senha
            </a>
          </div>
          
          <p style="font-size: 14px; color: #ffffff; margin-top: 30px;">
            Se você não solicitou esta redefinição, ignore este email.
          </p>
          
          <p style="font-size: 14px; color: #ffffff;">
            Este link é válido por 1 hora por questões de segurança.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="margin: 0; color: #ffffff; font-size: 14px;">
            Atenciosamente,<br>
            <strong>Equipe Globaliza Contabil</strong>
          </p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Template de notificação
  notification: (subject: string, message: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject} - Globaliza Contabil</title>
    </head>
    <body style="font-family: Montserrat, sans-serif; margin: 0; padding: 0; background: linear-gradient(313deg, #013f71, #132433)!important; ">
      <div style="max-width: 600px; margin: 0 auto; background-color: #19354f; padding: 20px; border-radius: 4px!important; margin-bottom: 30px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 3px solid #013F71;">
         <img src="https://i.ibb.co/v6yJsW0n/default.png" alt="Globaliza Contabil" style="width: 100px; height: 100px;">
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #ffffff; margin-bottom: 20px;">${subject}</h2>
          
          <div style="font-size: 16px; line-height: 1.6; color: #ffffff; margin-bottom: 30px;">
            ${message}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://globalizacontabil.com.br'}/adm" 
               style="background-color: #ff001a; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 4px!important; font-weight: bold; display: inline-block;">
              Acessar Painel Administrativo
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="margin: 0; color: #ffffff; font-size: 14px;">
            Atenciosamente,<br>
            <strong>Equipe Globaliza Contabil</strong>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}
