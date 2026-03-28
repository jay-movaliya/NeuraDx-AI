import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from email.mime.image import MIMEImage
from app.core.config import settings
import logging
import base64

logger = logging.getLogger(__name__)

async def send_report_email(
    to_email: str,
    patient_name: str,
    scan_type: str,
    confidence: float,
    findings: str,
    pdf_content: bytes = None,
    annotated_image: str = None,
    has_abnormality: bool = False,
    regions_detected: int = 0,
):
    """Send scan report via email with inline annotated image"""
    try:
        msg = MIMEMultipart('related')
        msg['From'] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        msg['To'] = to_email
        msg['Subject'] = f"NeuraDx AI Report — {patient_name} | {'⚠ Tumor Detected' if has_abnormality else '✓ No Abnormality'}"

        # Detection styles
        if has_abnormality:
            banner_bg   = '#ef4444'
            banner_text = '⚠ TUMOR DETECTED'
            badge_bg    = '#fef2f2'
            badge_color = '#ef4444'
            badge_border= '#fecaca'
        else:
            banner_bg   = '#10b981'
            banner_text = '✓ NO ABNORMALITY FOUND'
            badge_bg    = '#f0fdf4'
            badge_color = '#10b981'
            badge_border= '#bbf7d0'

        # Inline image section
        image_section = ''
        if annotated_image:
            image_section = f"""
            <div style="margin: 24px 0; border-radius: 12px; overflow: hidden; border: 2px solid #e5e7eb;">
                <div style="background: {banner_bg}; padding: 12px 20px; text-align: center;">
                    <span style="color: #fff; font-size: 15px; font-weight: 800; letter-spacing: 0.05em;">{banner_text}</span>
                </div>
                <div style="background: #000; text-align: center; padding: 0;">
                    <img src="cid:annotated_scan" alt="AI Annotated Scan"
                         style="max-width: 100%; height: auto; display: block; margin: 0 auto;" />
                </div>
                <div style="background: #f8f9fa; padding: 8px 16px; text-align: center;">
                    <span style="font-size: 11px; color: #6c757d;">
                        AI-Annotated Scan &nbsp;|&nbsp; {regions_detected} region(s) flagged &nbsp;|&nbsp; Confidence: {confidence}%
                    </span>
                </div>
            </div>
            """

        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
                <div style="max-width: 620px; margin: 0 auto; padding: 20px;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #3A8BFF, #4B83F6); padding: 30px; border-radius: 14px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">🧠 NeuraDx AI</h1>
                        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Medical Imaging Analysis Report</p>
                    </div>

                    <!-- Body -->
                    <div style="background: #f8f9fa; padding: 28px; margin-top: 20px; border-radius: 14px;">
                        <h2 style="color: #3A8BFF; margin-top: 0; font-size: 18px;">Scan Analysis Complete</h2>

                        <!-- Patient info -->
                        <div style="background: white; padding: 18px; border-radius: 10px; margin: 16px 0; border: 1px solid #e5e7eb;">
                            <p style="margin: 8px 0;"><strong>Patient:</strong> {patient_name}</p>
                            <p style="margin: 8px 0;"><strong>Scan Type:</strong> {scan_type}</p>
                            <p style="margin: 8px 0;"><strong>Confidence:</strong> {confidence}%</p>
                            <p style="margin: 8px 0;">
                                <strong>Result:</strong>
                                <span style="background:{badge_bg}; color:{badge_color}; border:1px solid {badge_border};
                                             padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 700;">
                                    {banner_text}
                                </span>
                            </p>
                        </div>

                        <!-- Annotated image -->
                        {image_section}

                        <!-- Findings -->
                        <div style="background: #e0f2ff; padding: 18px; border-radius: 10px; border-left: 4px solid #3A8BFF; margin: 16px 0;">
                            <h3 style="margin-top: 0; color: #3A8BFF; font-size: 14px;">Clinical Findings:</h3>
                            <p style="margin: 0; font-size: 14px;">{findings}</p>
                        </div>

                        <!-- Disclaimer -->
                        <div style="margin-top: 20px; padding: 16px; background: #fff3cd; border-radius: 10px; border-left: 4px solid #ffc107;">
                            <p style="margin: 0; font-size: 13px;">
                                <strong>Important:</strong> This is an AI-assisted analysis.
                                Always consult a qualified medical professional for diagnosis and treatment.
                            </p>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="text-align: center; margin-top: 24px; color: #9ca3af; font-size: 12px;">
                        <p style="margin: 4px 0;">© 2024 NeuraDx AI — Medical Imaging Platform</p>
                        <p style="margin: 4px 0;">This email contains confidential medical information.</p>
                    </div>
                </div>
            </body>
        </html>
        """

        # Attach HTML as alternative
        msg_alt = MIMEMultipart('alternative')
        msg_alt.attach(MIMEText(html_body, 'html'))
        msg.attach(msg_alt)

        # Attach annotated image as inline CID
        if annotated_image:
            try:
                b64 = annotated_image.split(',', 1)[1] if ',' in annotated_image else annotated_image
                img_bytes = base64.b64decode(b64)
                img_mime = MIMEImage(img_bytes)
                img_mime.add_header('Content-ID', '<annotated_scan>')
                img_mime.add_header('Content-Disposition', 'inline', filename='scan_analysis.jpg')
                msg.attach(img_mime)
            except Exception:
                pass

        # Attach PDF report
        if pdf_content:
            pdf_attachment = MIMEApplication(pdf_content, _subtype='pdf')
            pdf_attachment.add_header('Content-Disposition', 'attachment',
                                      filename=f'NeuraDx_Report_{patient_name.replace(" ", "_")}.pdf')
            msg.attach(pdf_attachment)

        # Send
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)

        logger.info(f"✅ Report email sent to {to_email}")
        return True

    except Exception as e:
        logger.error(f"❌ Failed to send email: {str(e)}")
        return False


async def send_password_reset_email(
    to_email: str,
    user_name: str,
    reset_link: str
):
    """Send password reset email"""
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        msg['To'] = to_email
        msg['Subject'] = "Password Reset Request - NeuraDx AI"
        
        # Email body
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #3A8BFF, #4B83F6); padding: 30px; border-radius: 10px; text-align: center;">
                        <h1 style="color: white; margin: 0;">NeuraDx AI</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Medical Imaging Platform</p>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 30px; margin-top: 20px; border-radius: 10px;">
                        <h2 style="color: #3A8BFF; margin-top: 0;">Password Reset Request</h2>
                        
                        <p style="font-size: 15px; color: #333; margin: 20px 0;">
                            Hi {user_name},
                        </p>
                        
                        <p style="font-size: 15px; color: #333; margin: 20px 0;">
                            We received a request to reset your password. Click the button below to create a new password:
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{reset_link}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #3A8BFF, #4B83F6); color: white; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 16px;">
                                Reset Password
                            </a>
                        </div>
                        
                        <p style="font-size: 14px; color: #666; margin: 20px 0;">
                            Or copy and paste this link into your browser:
                        </p>
                        <p style="font-size: 13px; color: #3A8BFF; word-break: break-all; background: #e0f2ff; padding: 12px; border-radius: 6px;">
                            {reset_link}
                        </p>
                        
                        <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                            <p style="margin: 0; font-size: 14px;">
                                <strong>Important:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
                            </p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; color: #6c757d; font-size: 12px;">
                        <p>© 2024 NeuraDx AI - Medical Imaging Platform</p>
                        <p>This is an automated email, please do not reply.</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        msg.attach(MIMEText(html_body, 'html'))
        
        # Send email
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"✅ Password reset email sent to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to send password reset email: {str(e)}")
        return False
