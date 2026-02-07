import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging
from dotenv import load_dotenv

load_dotenv()

# Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SMTP_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("EMAIL_PORT", "587"))
SMTP_USER = os.getenv("EMAIL_USER")
SMTP_PASS = os.getenv("EMAIL_PASS")

def send_invitation_email(to_email: str, workspace_name: str, invite_link: str):
    """Sends an invitation email."""
    if not SMTP_USER or not SMTP_PASS:
        logger.warning(f"SMTP credentials not found. Mocking email to {to_email}")
        logger.info(f"Invite Link: {invite_link}")
        return True

    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = to_email
        msg['Subject'] = f"Invitation to join {workspace_name} on Campus Agent"

        body = f"""
        <html>
          <body>
            <h2>Join {workspace_name}!</h2>
            <p>You have been invited to collaborate on the <b>{workspace_name}</b> workspace.</p>
            <p>Click the link below to accept the invitation:</p>
            <a href="{invite_link}" style="background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Join Workspace
            </a>
            <p>Or copy this link: {invite_link}</p>
          </body>
        </html>
        """
        
        msg.attach(MIMEText(body, 'html'))

        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        text = msg.as_string()
        server.sendmail(SMTP_USER, to_email, text)
        server.quit()
        logger.info(f"Invitation sent to {to_email}")
        return True
    
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False
