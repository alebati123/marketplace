const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // O el proveedor que vayas a usar
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendVerificationEmail = async (toEmail, token) => {
    const appUrl = process.env.BASE_URL || 'http://localhost:3000';
    const verificationUrl = `${appUrl}/api/auth/verify/${token}`;

    const mailOptions = {
        from: `"MarketPlace Lambertucci" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Verifica tu cuenta en MarketPlace',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #0b192c; color: #fff; padding: 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">LAMBERTUCCI</h1>
                    <p style="margin: 5px 0 0; color: #ff6b6b; letter-spacing: 2px; font-size: 12px;">Compra & Venta</p>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <h2 style="color: #0b192c;">¡Bienvenido/a!</h2>
                    <p style="color: #333333; line-height: 1.6;">Gracias por registrarte en nuestra plataforma. Para poder publicar tus artículos y comprar con seguridad, necesitamos verificar que este es tu correo electrónico.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" style="background-color: #ff6b6b; color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Verificar Mi Cuenta</a>
                    </div>
                    <p style="color: #666666; font-size: 12px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                    <p style="color: #ff6b6b; font-size: 12px; word-break: break-all;">${verificationUrl}</p>
                </div>
                <div style="background-color: #f5f5f5; color: #888888; padding: 15px; text-align: center; font-size: 12px;">
                    <p style="margin: 0;">Este es un correo automático, por favor no lo respondas.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo de verificación enviado a', toEmail);
    } catch (error) {
        console.error('Error enviando correo de verificación:', error);
        throw new Error('No se pudo enviar el correo de verificación');
    }
};

module.exports = { sendVerificationEmail };
