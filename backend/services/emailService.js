import nodemailer from "nodemailer";

const smtpConfigured =
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

const send = async (mailOptions) => {
  if (!transporter) {
    console.log(`[email] SMTP not configured, skipping email to ${mailOptions.to}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      ...mailOptions,
    });
  } catch (error) {
    console.log(`[email] Failed to send to ${mailOptions.to}:`, error.message);
  }
};

export const sendWelcomeEmail = async (to, name) => {
  await send({
    to,
    subject: "Welcome!",
    html: `<p>Hi ${name},</p><p>Thanks for creating an account. Happy ordering!</p>`,
  });
};

export const sendOrderConfirmationEmail = async (to, order) => {
  const itemsList = order.items
    .map((item) => `<li>${item.name} x ${item.quantity}</li>`)
    .join("");
  await send({
    to,
    subject: `Order Confirmed - #${order._id}`,
    html: `<p>Your order has been confirmed and payment received.</p>
      <ul>${itemsList}</ul>
      <p>Total: $${order.amount}</p>`,
  });
};

export const sendOrderStatusEmail = async (to, order) => {
  await send({
    to,
    subject: `Order Update - #${order._id}`,
    html: `<p>Your order status is now: <b>${order.status}</b></p>`,
  });
};

export const sendOrderCancelledEmail = async (to, order) => {
  await send({
    to,
    subject: `Order Cancelled - #${order._id}`,
    html: `<p>Your order #${order._id} has been cancelled and refunded.</p>`,
  });
};
