import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Probando configuración SMTP...\n');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***' : '(vacío)');
console.log('\n⏳ Conectando...\n');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 10000,
});

// Verificar conexión
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ ERROR en SMTP:\n', error.message);
    console.error('\nPosibles soluciones:');
    console.error('1. Verifica que SMTP_USER y SMTP_PASS sean correctos en .env');
    console.error('2. Si usas Gmail, asegúrate de generar un "App Password" aquí:');
    console.error('   https://myaccount.google.com/apppasswords');
    console.error('3. Verifica que 2FA esté activado en tu cuenta de Gmail');
    process.exit(1);
  } else {
    console.log('✅ Conexión SMTP exitosa!\n');
    
    // Intentar enviar email de prueba
    const testMailOptions = {
      from: `"OnKey" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Enviar a la misma cuenta
      subject: '[TEST] OnKey - Prueba de SMTP',
      html: `
        <h2>✅ Prueba de Email</h2>
        <p>Si recibiste este email, SMTP está funcionando correctamente.</p>
        <p>Token de prueba: <code>test-token-${Date.now()}</code></p>
      `,
    };

    console.log('📧 Intentando enviar email de prueba a:', process.env.SMTP_USER);
    transporter.sendMail(testMailOptions, (error, info) => {
      if (error) {
        console.error('\n❌ ERROR al enviar email:\n', error.message);
        process.exit(1);
      } else {
        console.log('✅ Email de prueba enviado exitosamente!');
        console.log('   ID:', info.messageId);
        console.log('\n📝 Revisa tu bandeja de entrada (o spam) para confirmar.\n');
        process.exit(0);
      }
    });
  }
});
