import nodemailer from "nodemailer";

function getSmtpPort(): number {
  return Number(process.env.SMTP_PORT ?? 465);
}

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: getSmtpPort(),
  secure: getSmtpPort() === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function getPasswordResetUrl(email: string): string {
  const resetUrl =
    process.env.PASSWORD_RESET_URL ??
    `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/admin/reset-password`;
  const url = new URL(resetUrl);

  url.searchParams.set("email", email);

  return url.toString();
}

export async function sendPasswordResetOtp(params: {
  to: string;
  otp: string;
}) {
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  const passwordResetUrl = getPasswordResetUrl(params.to);

  if (!from) {
    throw new Error("SMTP_FROM or SMTP_USER is not defined");
  }

  await transporter.sendMail({
    from,
    to: params.to,
    subject: "Al-Manara Cars - Password Reset OTP",
    html: `
  <div style="
    background-color:#F9FAFB;
    padding:40px 20px;
    font-family:Arial, sans-serif;
  ">
    <div style="
      max-width:500px;
      margin:0 auto;
      background:white;
      border-radius:12px;
      overflow:hidden;
      box-shadow:0 10px 25px rgba(0,0,0,0.05);
    ">

      <!-- HEADER -->
      <div style="
        background:#E11D2E;
        padding:20px;
        text-align:center;
        color:white;
        font-size:20px;
        font-weight:bold;
      ">
        Password Reset
      </div>

      <!-- BODY -->
      <div style="padding:30px; color:#1F2937;">

        <p style="margin-bottom:10px;">
          You requested to reset your password.
        </p>

        <p style="margin-bottom:25px;">
          Use the following OTP code:
        </p>

        <!-- OTP BOX -->
        <div style="
          background:#F9FAFB;
          border:2px dashed #E11D2E;
          padding:20px;
          text-align:center;
          font-size:32px;
          font-weight:bold;
          letter-spacing:5px;
          color:#E11D2E;
          border-radius:10px;
          margin-bottom:25px;
        ">
          ${params.otp}
        </div>

        <!-- CTA BUTTON -->
        <div style="text-align:center; margin-bottom:25px;">
          <a
            href="${passwordResetUrl}"
            style="
              display:inline-block;
              background:#E11D2E;
              color:white;
              text-decoration:none;
              font-size:16px;
              font-weight:bold;
              padding:14px 24px;
              border-radius:8px;
            "
          >
            Reset password
          </a>
        </div>

        <!-- INFO -->
        <p style="
          font-size:14px;
          color:#6B7280;
          margin-bottom:10px;
        ">
          This code will expire in <b>10 minutes</b>.
        </p>

        <p style="
          font-size:14px;
          color:#6B7280;
        ">
          If you didn't request this, please ignore this email.
        </p>

      </div>

      <!-- FOOTER -->
      <div style="
        background:#1F2937;
        color:white;
        padding:15px;
        text-align:center;
        font-size:12px;
      ">
        Secure Admin System
      </div>

    </div>
  </div>
`,
  });
}
