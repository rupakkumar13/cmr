import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_USER || 'mock_user',
      pass: process.env.SMTP_PASS || 'mock_pass',
    },
  });

  // Define email options
  const mailOptions = {
    from: process.env.SMTP_FROM || 'CRM System <noreply@crm.com>',
    to: options.email,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  // Send email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Email delivery failed: ${error.message}`);
    console.log('--- FALLBACK EMAIL CONTENT ---');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body:\n${options.text}`);
    console.log('------------------------------');
    // We don't want to throw error and fail signup if email fails in local testing, but we can throw or just log.
    // Let's log it so it is non-blocking for local setup.
    return { success: false, fallback: true };
  }
};

export default sendEmail;
