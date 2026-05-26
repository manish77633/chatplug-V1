const { sendEmail } = require('./email');

const sendWelcomeEmail = async (user) => {
  const plan = user.plan.type.charAt(0).toUpperCase() + user.plan.type.slice(1);
  const limits = user.limits;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
      <div style="text-align: center; padding: 20px 0;">
        <h1 style="color: #6366f1; margin: 0;">ChatPlug</h1>
      </div>
      
      <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px;">
        <h2 style="margin-top: 0;">Hi ${user.name},</h2>
        <p>Welcome to ChatPlug! We're thrilled to have you on board. Your account has been successfully created.</p>
        
        <div style="background-color: #fff; padding: 20px; border-radius: 6px; border: 1px solid #e5e7eb; margin: 25px 0;">
          <h3 style="margin-top: 0; color: #4f46e5;">Your Current Plan: ${plan}</h3>
          <p style="margin-bottom: 10px;">Here are the details of what's included in your plan:</p>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Max Chatbots</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${limits.maxChatbots}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Max Documents</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${limits.maxDocuments}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Max Messages/Day</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${limits.maxMessagesPerDay}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0;"><strong>Max Tokens/Month</strong></td>
              <td style="padding: 10px 0; text-align: right;">${limits.maxTokens.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 35px 0;">
          <a href="${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/dashboard" 
             style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; text-align: center; margin-bottom: 0;">
          If you have any questions, feel free to reply to this email.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Welcome to ChatPlug!',
    html,
  });
};

const sendChatbotCreatedEmail = async (user, chatbot, usedChatbotsCount) => {
  const plan = user.plan?.type ? (user.plan.type.charAt(0).toUpperCase() + user.plan.type.slice(1)) : 'Free';
  const maxChatbots = user.limits?.maxChatbots || 3;
  const remaining = maxChatbots - usedChatbotsCount;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
      <div style="text-align: center; padding: 20px 0;">
        <h1 style="color: #6366f1; margin: 0;">ChatPlug</h1>
      </div>
      
      <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px;">
        <h2 style="margin-top: 0;">Hi ${user.name},</h2>
        <p>Success! Your new chatbot <strong>"${chatbot.name}"</strong> has been created.</p>
        
        <div style="background-color: #fff; padding: 20px; border-radius: 6px; border: 1px solid #e5e7eb; margin: 25px 0;">
          <h3 style="margin-top: 0; color: #4f46e5;">Plan Usage: ${plan} Plan</h3>
          <p style="margin-bottom: 10px;">You are currently using <strong>${usedChatbotsCount} out of ${maxChatbots}</strong> available chatbots in your plan.</p>
          ${remaining > 0 ? `<p style="font-size: 14px; color: #10b981;">You have ${remaining} chatbot slot(s) remaining.</p>` : `<p style="font-size: 14px; color: #ef4444;">You have reached the limit of chatbots for your current plan. Upgrade to create more.</p>`}
        </div>

        <div style="margin: 25px 0;">
          <h3 style="color: #374151;">Next Steps to Get Started:</h3>
          <ol style="padding-left: 20px; margin-top: 10px;">
            <li style="margin-bottom: 8px;"><strong>Add Documents:</strong> Upload your knowledge base (PDFs, TXT, DOCX) so the bot can learn your content.</li>
            <li style="margin-bottom: 8px;"><strong>Customize Settings:</strong> Give your bot a unique personality and adjust the colors to match your brand.</li>
            <li style="margin-bottom: 8px;"><strong>Embed Widget:</strong> Copy the integration code and add it to your website to go live.</li>
          </ol>
        </div>

        <div style="text-align: center; margin: 35px 0;">
          <a href="${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/dashboard/bots/${chatbot._id}" 
             style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Configure your chatbot
          </a>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `Your new chatbot "${chatbot.name}" is ready!`,
    html,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendChatbotCreatedEmail,
};
