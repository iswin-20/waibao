declare module 'nodemailer' {
  interface Transporter {
    sendMail(options: Record<string, unknown>): Promise<unknown>;
  }

  interface Nodemailer {
    createTransport(options: Record<string, unknown>): Transporter;
  }

  const nodemailer: Nodemailer;
  export default nodemailer;
}
