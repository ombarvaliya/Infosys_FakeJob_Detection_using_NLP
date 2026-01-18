const nodemailer = require('nodemailer');

let transporter = null;

// Initialize transporter with Ethereal Email (free, no setup needed)
const initTransporter = async () => {
  if (!transporter) {
    try {
      // Create test account (free, no sign-up required)
      const testAccount = await nodemailer.createTestAccount();
      
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      
      console.log('✅ Ethereal Email initialized (no setup needed!)');
      console.log('   Test account:', testAccount.user);
      
      return transporter;
    } catch (error) {
      console.error('❌ Error initializing Ethereal Email:', error.message);
      throw error;
    }
  }
  return transporter;
};

// Function to send verification code
const sendVerificationEmail = async (email, code) => {
  try {
    console.log('📧 Attempting to send verification email via Ethereal Email...');
    console.log('   Recipient:', email);
    console.log('   Code:', code);
    
    const transporter = await initTransporter();
    
    // Send email
    const info = await transporter.sendMail({
      from: '"JobCheck" <noreply@jobcheck.dev>',
      to: email,
      subject: `JobCheck Email Verification - Code: ${code}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">JobCheck</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Email Verification</p>
          </div>
          <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 10px 10px;">
            <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
              Welcome to JobCheck! Please verify your email address to complete your registration.
            </p>
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">Your verification code is:</p>
              <p style="color: #667eea; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 0;">${code}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
              This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0 0;">
              © 2024 JobCheck. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `Your JobCheck verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`
    });
    
    console.log('✅ Email sent successfully via Ethereal!');
    console.log('   Message ID:', info.messageId);
    
    // Generate preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('   Preview URL:', previewUrl);
      console.log('   Open this link to see the email in your browser');
    }
    
    return { success: true, message: 'Verification code sent to your email' };
  } catch (error) {
    console.error('❌ Ethereal Email error:');
    console.error('   Error:', error.message);
    
    // Fallback to console logging
    console.log('\n📬 FALLBACK - DEVELOPMENT MODE VERIFICATION CODE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Code: ${code}`);
    console.log('⏰ Expires in 10 minutes');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return { 
      success: true, 
      message: 'Check server console for verification code' 
    };
  }
};

// Function to send password reset code
const sendPasswordResetEmail = async (email, code) => {
  try {
    console.log('📧 Attempting to send password reset email via Ethereal Email...');
    console.log('   Recipient:', email);
    console.log('   Code:', code);
    
    const transporter = await initTransporter();
    
    // Send email
    const info = await transporter.sendMail({
      from: '"JobCheck" <noreply@jobcheck.dev>',
      to: email,
      subject: `JobCheck Password Reset - Code: ${code}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">JobCheck</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Password Reset</p>
          </div>
          <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 10px 10px;">
            <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
              You requested to reset your password. Use the code below to create a new password.
            </p>
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">Your reset code is:</p>
              <p style="color: #667eea; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 0;">${code}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
              This code will expire in 10 minutes. If you didn't request this code, please ignore this email and your password will remain unchanged.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0 0;">
              © 2024 JobCheck. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `Your JobCheck password reset code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email and your password will remain unchanged.`
    });
    
    console.log('✅ Password reset email sent successfully via Ethereal!');
    console.log('   Message ID:', info.messageId);
    
    // Generate preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('   Preview URL:', previewUrl);
      console.log('   Open this link to see the email in your browser');
    }
    
    return { success: true, message: 'Password reset code sent to your email' };
  } catch (error) {
    console.error('❌ Ethereal Email error:');
    console.error('   Error:', error.message);
    
    // Fallback to console logging
    console.log('\n📬 FALLBACK - DEVELOPMENT MODE PASSWORD RESET CODE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Code: ${code}`);
    console.log('⏰ Expires in 10 minutes');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return { 
      success: true, 
      message: 'Check server console for password reset code' 
    };
  }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
