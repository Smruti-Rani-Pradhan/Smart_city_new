import smtplib
from email.mime.text import MIMEText
from app.config.settings import settings

def _send_email(subject: str, body: str, to_email: str):
    if not settings.EMAIL_USER or not settings.EMAIL_PASS:
        raise RuntimeError("Email configuration is missing")
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to_email
    with smtplib.SMTP("smtp.gmail.com", 587, timeout=15) as server:
        server.starttls()
        server.login(settings.EMAIL_USER, settings.EMAIL_PASS)
        server.send_message(msg)

def send_alert_email(description: str, lat: float | None, lon: float | None):
    subject = "SafeLive Alert"
    body = f"""
Issue Detected

Description: {description}
Latitude: {lat}
Longitude: {lon}

Login to dashboard for details.
"""
    _send_email(subject, body, settings.EMAIL_ALERT_TO)

def send_password_reset_email(to_email: str, reset_link: str):
    subject = "SafeLive Password Reset"
    body = f"""
You requested a password reset.

Use this link to reset your password:
{reset_link}

If you did not request this, you can ignore this email.
"""
    _send_email(subject, body, to_email)

def send_ticket_update_email(to_email: str, title: str, status: str):
    subject = "SafeLive Ticket Update"
    body = f"""
Your ticket has been updated.

Title: {title}
Status: {status}

Login to dashboard for details.
"""
    _send_email(subject, body, to_email)
