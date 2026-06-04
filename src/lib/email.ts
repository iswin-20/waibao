import nodemailer from 'nodemailer';

function getTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) throw new Error('SMTP_USER 或 SMTP_PASS 未配置');

  return {
    user,
    transporter: nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.163.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: Number(process.env.SMTP_PORT || 465) === 465,
      auth: { user, pass },
    }),
  };
}

export async function sendVerificationEmail(to: string, token: string) {
  const { user, transporter } = getTransporter();
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const verifyUrl = `${appUrl}/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"歪宝小窝" <${user}>`,
    to,
    subject: '验证你的邮箱 - 歪宝小窝',
    html: `
      <div style="max-width:600px;margin:0 auto;padding:40px 20px;font-family:'PingFang SC','Microsoft YaHei',sans-serif;background:#FFF8F0;border-radius:16px;">
        <div style="text-align:center;margin-bottom:30px;">
          <div style="width:60px;height:60px;margin:0 auto 12px;background:linear-gradient(135deg,#FF9B9B,#FFC3A0);border-radius:16px;display:flex;align-items:center;justify-content:center;">
            <span style="font-size:28px;">🏠</span>
          </div>
          <h1 style="color:#4A3728;font-size:22px;margin:0;">欢迎来到歪宝小窝</h1>
          <p style="color:#9C8B7A;font-size:14px;margin:8px 0 0;">你被看见、被记得、被爱着</p>
        </div>

        <div style="background:white;border-radius:12px;padding:30px;text-align:center;">
          <p style="color:#4A3728;font-size:16px;margin:0 0 20px;">
            请点击下方按钮验证你的邮箱地址
          </p>

          <a href="${verifyUrl}"
             style="display:inline-block;background:linear-gradient(135deg,#FF9B9B,#FFC3A0);color:white;text-decoration:none;padding:14px 40px;border-radius:50px;font-size:16px;font-weight:bold;">
            验证邮箱
          </a>

          <p style="color:#9C8B7A;font-size:13px;margin:20px 0 0;">
            如果按钮无法点击，请复制以下链接到浏览器打开：<br>
            <span style="color:#FF9B9B;word-break:break-all;">${verifyUrl}</span>
          </p>

          <p style="color:#9C8B7A;font-size:12px;margin:20px 0 0;border-top:1px solid #f0ebe4;padding-top:16px;">
            此链接有效期24小时<br>
            如果你没有注册歪宝小窝，请忽略此邮件
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendRegisterCodeEmail(to: string, code: string) {
  const { user, transporter } = getTransporter();

  await transporter.sendMail({
    from: `"歪宝小窝" <${user}>`,
    to,
    subject: '注册验证码 - 歪宝小窝',
    html: `
      <div style="max-width:560px;margin:0 auto;padding:36px 20px;font-family:'PingFang SC','Microsoft YaHei',sans-serif;background:#FFF8F0;border-radius:16px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#4A3728;font-size:22px;margin:0;">歪宝小窝注册验证码</h1>
          <p style="color:#9C8B7A;font-size:14px;margin:8px 0 0;">把这串数字填回注册页就可以创建账号啦</p>
        </div>
        <div style="background:white;border-radius:14px;padding:30px;text-align:center;">
          <div style="letter-spacing:8px;font-size:34px;font-weight:800;color:#FF8FA3;margin:6px 0 18px;">${code}</div>
          <p style="color:#9C8B7A;font-size:13px;margin:0;">验证码 10 分钟内有效。若不是你本人操作，请忽略这封邮件。</p>
        </div>
      </div>
    `,
  });
}
