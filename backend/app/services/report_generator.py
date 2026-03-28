from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch, mm
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph,
    Spacer, Image, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus.flowables import Flowable
from io import BytesIO
from datetime import datetime
import base64

# ── Brand colors ─────────────────────────────────────────────────────────────
BLUE        = colors.HexColor('#3A8BFF')
BLUE2       = colors.HexColor('#4B83F6')
BLUE_LIGHT  = colors.HexColor('#EFF6FF')
BLUE_MID    = colors.HexColor('#DBEAFE')
RED         = colors.HexColor('#EF4444')
RED_LIGHT   = colors.HexColor('#FEF2F2')
GREEN       = colors.HexColor('#10B981')
GREEN_LIGHT = colors.HexColor('#F0FDF4')
AMBER       = colors.HexColor('#F59E0B')
AMBER_LIGHT = colors.HexColor('#FFFBEB')
GRAY_DARK   = colors.HexColor('#1F2937')
GRAY_MID    = colors.HexColor('#6B7280')
GRAY_LIGHT  = colors.HexColor('#F9FAFB')
GRAY_BORDER = colors.HexColor('#E5E7EB')
WHITE       = colors.white

PAGE_W, PAGE_H = A4
MARGIN = 0.75 * inch
CONTENT_W = PAGE_W - 2 * MARGIN


# ── Solid color bar Flowable ──────────────────────────────────────────────────
class ColorBar(Flowable):
    def __init__(self, width, height, fill_color, radius=6):
        super().__init__()
        self.width  = width
        self.height = height
        self.fill   = fill_color
        self.radius = radius

    def draw(self):
        self.canv.setFillColor(self.fill)
        self.canv.roundRect(0, 0, self.width, self.height, self.radius, fill=1, stroke=0)


def _table_style(label_color=BLUE, label_bg=BLUE_LIGHT, row_alt=GRAY_LIGHT):
    return TableStyle([
        ('BACKGROUND',   (0, 0), (0, -1), label_bg),
        ('TEXTCOLOR',    (0, 0), (0, -1), label_color),
        ('FONTNAME',     (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME',     (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE',     (0, 0), (-1, -1), 10),
        ('TOPPADDING',   (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING',(0, 0), (-1, -1), 7),
        ('LEFTPADDING',  (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR',    (1, 0), (1, -1), GRAY_DARK),
        ('ALIGN',        (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN',       (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [label_bg, WHITE]),
        ('LINEBELOW',    (0, 0), (-1, -2), 0.5, GRAY_BORDER),
        ('LINEBELOW',    (0, -1),(-1, -1), 0.5, GRAY_BORDER),
        ('BOX',          (0, 0), (-1, -1), 0.5, GRAY_BORDER),
    ])


def generate_pdf_report(scan_data: dict) -> bytes:
    """Generate a premium-looking PDF report with annotated scan image"""

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN,  bottomMargin=MARGIN,
    )

    styles = getSampleStyleSheet()
    elements = []

    # ── ① HEADER BAR ─────────────────────────────────────────────────────────
    header_data = [[
        Paragraph(
            '<font color="white" size="20"><b>NeuraDx AI</b></font><br/>'
            '<font color="#BFDBFE" size="10">Medical Imaging Analysis Report</font>',
            ParagraphStyle('hdr', alignment=TA_LEFT, leading=24)
        ),
        Paragraph(
            f'<font color="#BFDBFE" size="9">Report Date</font><br/>'
            f'<font color="white" size="10"><b>{datetime.now().strftime("%d %b %Y, %I:%M %p")}</b></font>',
            ParagraphStyle('hdr_r', alignment=TA_RIGHT, leading=16)
        ),
    ]]
    header_tbl = Table(header_data, colWidths=[CONTENT_W * 0.65, CONTENT_W * 0.35])
    header_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BLUE),
        ('TOPPADDING',    (0, 0), (-1, -1), 16),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 16),
        ('LEFTPADDING',   (0, 0), (-1, -1), 18),
        ('RIGHTPADDING',  (0, 0), (-1, -1), 18),
        ('VALIGN',        (0, 0), (-1, -1), 'MIDDLE'),
        ('ROUNDEDCORNERS', [8]),
    ]))
    elements.append(header_tbl)
    elements.append(Spacer(1, 0.25 * inch))

    # ── ② DETECTION RESULT CALLOUT ────────────────────────────────────────────
    has_ab   = scan_data.get('has_abnormality', False)
    conf     = scan_data.get('confidence', 0)
    severity = scan_data.get('severity', 'none')
    regions  = scan_data.get('regions_detected', 0)

    if has_ab:
        result_bg     = RED_LIGHT
        result_border = RED
        result_label  = 'TUMOR DETECTED'
        result_icon   = '⚠'
        result_color  = RED
    else:
        result_bg     = GREEN_LIGHT
        result_border = GREEN
        result_label  = 'NO ABNORMALITY FOUND'
        result_icon   = '✓'
        result_color  = GREEN

    callout_data = [[
        Paragraph(
            f'<font size="22"><b>{result_icon}</b></font>',
            ParagraphStyle('icon', alignment=TA_CENTER)
        ),
        Paragraph(
            f'<font size="14"><b>{result_label}</b></font><br/>'
            f'<font size="10" color="#6B7280">Confidence: {conf}%  |  Severity: {severity.upper()}  |  Regions flagged: {regions}</font>',
            ParagraphStyle('callout_txt', leading=18)
        ),
    ]]
    callout_tbl = Table(callout_data, colWidths=[0.55 * inch, CONTENT_W - 0.55 * inch])
    callout_tbl.setStyle(TableStyle([
        ('BACKGROUND',    (0, 0), (-1, -1), result_bg),
        ('TEXTCOLOR',     (0, 0), (0, -1),  result_color),
        ('TEXTCOLOR',     (1, 0), (1, -1),  result_color),
        ('TOPPADDING',    (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING',   (0, 0), (-1, -1), 14),
        ('VALIGN',        (0, 0), (-1, -1), 'MIDDLE'),
        ('BOX',           (0, 0), (-1, -1), 1.5, result_border),
        ('LINEAFTER',     (0, 0), (0, -1),  1.5, result_border),
    ]))
    elements.append(callout_tbl)
    elements.append(Spacer(1, 0.3 * inch))

    # ── Section heading helper ────────────────────────────────────────────────
    def section_heading(text):
        return [
            Paragraph(
                f'<font color="#3A8BFF" size="12"><b>{text}</b></font>',
                ParagraphStyle('sh', spaceBefore=6, spaceAfter=6)
            ),
            HRFlowable(width=CONTENT_W, thickness=1.5, color=BLUE_MID, spaceAfter=8),
        ]

    # ── ③ PATIENT INFORMATION ─────────────────────────────────────────────────
    elements.extend(section_heading('Patient Information'))
    pat_rows = [
        ['Patient Name',  scan_data.get('patient_name', 'N/A')],
        ['Patient ID',    scan_data.get('patient_id', 'N/A')],
        ['Age',           f"{scan_data.get('age', 'N/A')} years"],
        ['Gender',        scan_data.get('gender', 'N/A')],
        ['Contact',       scan_data.get('contact_no', scan_data.get('phone', 'N/A'))],
        ['Email',         scan_data.get('email', 'N/A')],
    ]
    pat_tbl = Table(pat_rows, colWidths=[1.8 * inch, CONTENT_W - 1.8 * inch])
    pat_tbl.setStyle(_table_style())
    elements.append(pat_tbl)
    elements.append(Spacer(1, 0.2 * inch))

    # ── ④ SCAN INFORMATION ────────────────────────────────────────────────────
    elements.extend(section_heading('Scan Information'))
    try:
        ts = scan_data.get('timestamp', datetime.now())
        if isinstance(ts, str):
            ts = datetime.fromisoformat(ts)
        scan_date_str = ts.strftime('%B %d, %Y')
    except Exception:
        scan_date_str = 'N/A'

    scan_rows = [
        ['Scan Type',     scan_data.get('scan_type', 'N/A')],
        ['Scan Date',     scan_date_str],
        ['File Name',     scan_data.get('file_name', 'N/A')],
        ['Image Quality', scan_data.get('image_quality', 'N/A').upper()],
        ['Status',        scan_data.get('status', 'completed').upper()],
    ]
    scan_tbl = Table(scan_rows, colWidths=[1.8 * inch, CONTENT_W - 1.8 * inch])
    scan_tbl.setStyle(_table_style())
    elements.append(scan_tbl)
    elements.append(Spacer(1, 0.2 * inch))

    # ── ⑤ AI ANALYSIS RESULTS ────────────────────────────────────────────────
    elements.extend(section_heading('AI Analysis Results'))
    ai_rows = [
        ['Confidence Score',       f'{conf}%'],
        ['Abnormality Detected',   'YES' if has_ab else 'NO'],
        ['Severity Level',         severity.upper()],
        ['Regions Detected',       str(regions)],
        ['Image Quality',          scan_data.get('image_quality', 'N/A').upper()],
    ]
    ai_tbl = Table(ai_rows, colWidths=[1.8 * inch, CONTENT_W - 1.8 * inch])
    ai_style = _table_style(
        label_color=BLUE,
        label_bg=BLUE_LIGHT,
    )
    # Highlight the abnormality cell
    ab_row = 1  # 'Abnormality Detected' row
    ai_style.add('TEXTCOLOR',   (1, ab_row), (1, ab_row), RED if has_ab else GREEN)
    ai_style.add('FONTNAME',    (1, ab_row), (1, ab_row), 'Helvetica-Bold')
    ai_style.add('BACKGROUND',  (1, ab_row), (1, ab_row), RED_LIGHT if has_ab else GREEN_LIGHT)
    ai_tbl.setStyle(ai_style)
    elements.append(ai_tbl)
    elements.append(Spacer(1, 0.25 * inch))

    # ── ⑥ ANNOTATED SCAN IMAGE ───────────────────────────────────────────────
    annotated_b64 = scan_data.get('annotated_image', '')
    if annotated_b64:
        try:
            if ',' in annotated_b64:
                annotated_b64 = annotated_b64.split(',', 1)[1]
            img_bytes = base64.b64decode(annotated_b64)
            img_buf   = BytesIO(img_bytes)

            elements.extend(section_heading('AI-Annotated Scan Image'))

            # Detection banner row above image
            banner_bg   = RED   if has_ab else GREEN
            banner_text = '⚠  TUMOR DETECTED' if has_ab else '✓  NO ABNORMALITY FOUND'
            banner_data = [[Paragraph(
                f'<font color="white" size="11"><b>{banner_text}</b></font>',
                ParagraphStyle('ban', alignment=TA_CENTER)
            )]]
            banner_tbl = Table(banner_data, colWidths=[CONTENT_W])
            banner_tbl.setStyle(TableStyle([
                ('BACKGROUND',    (0, 0), (-1, -1), banner_bg),
                ('TOPPADDING',    (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 9),
                ('ALIGN',         (0, 0), (-1, -1), 'CENTER'),
            ]))

            # Scale image to fit page width
            rpt_img = Image(img_buf)
            ratio = rpt_img.imageHeight / rpt_img.imageWidth
            rpt_img.drawWidth  = CONTENT_W
            rpt_img.drawHeight = CONTENT_W * ratio

            # Caption row below image
            caption_data = [[Paragraph(
                f'<font color="#6B7280" size="8">'
                f'AI-annotated scan  |  {regions} region(s) flagged  |  Confidence: {conf}%'
                f'</font>',
                ParagraphStyle('cap', alignment=TA_CENTER)
            )]]
            caption_tbl = Table(caption_data, colWidths=[CONTENT_W])
            caption_tbl.setStyle(TableStyle([
                ('BACKGROUND',    (0, 0), (-1, -1), GRAY_LIGHT),
                ('TOPPADDING',    (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('BOX',           (0, 0), (-1, -1), 0.5, GRAY_BORDER),
            ]))

            # Wrap image in a black-bg table for contrast
            img_tbl = Table([[rpt_img]], colWidths=[CONTENT_W])
            img_tbl.setStyle(TableStyle([
                ('BACKGROUND',    (0, 0), (-1, -1), colors.black),
                ('ALIGN',         (0, 0), (-1, -1), 'CENTER'),
                ('TOPPADDING',    (0, 0), (-1, -1), 0),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
                ('LEFTPADDING',   (0, 0), (-1, -1), 0),
                ('RIGHTPADDING',  (0, 0), (-1, -1), 0),
            ]))

            elements.append(KeepTogether([banner_tbl, img_tbl, caption_tbl]))
            elements.append(Spacer(1, 0.25 * inch))

        except Exception:
            pass  # Silently skip if image decode fails

    # ── ⑦ CLINICAL FINDINGS ───────────────────────────────────────────────────
    elements.extend(section_heading('Clinical Findings'))
    findings_text = scan_data.get('findings', 'No findings available.')
    findings_style = ParagraphStyle(
        'findings', fontSize=10, textColor=GRAY_DARK,
        leading=15, spaceAfter=6,
        leftIndent=10, rightIndent=10,
    )
    findings_box = Table(
        [[Paragraph(findings_text, findings_style)]],
        colWidths=[CONTENT_W]
    )
    findings_box.setStyle(TableStyle([
        ('BACKGROUND',    (0, 0), (-1, -1), BLUE_LIGHT),
        ('BOX',           (0, 0), (-1, -1), 1, BLUE_MID),
        ('TOPPADDING',    (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING',   (0, 0), (-1, -1), 14),
        ('RIGHTPADDING',  (0, 0), (-1, -1), 14),
    ]))
    elements.append(findings_box)
    elements.append(Spacer(1, 0.2 * inch))

    # ── ⑧ RECOMMENDATIONS ────────────────────────────────────────────────────
    recs = scan_data.get('recommendations', [])
    if recs:
        elements.extend(section_heading('Clinical Recommendations'))
        rec_style = ParagraphStyle('rec', fontSize=10, textColor=GRAY_DARK, leading=14, spaceAfter=4)
        rec_rows  = [[Paragraph(f'{i}. {r}', rec_style)] for i, r in enumerate(recs, 1)]
        rec_tbl = Table(rec_rows, colWidths=[CONTENT_W])
        rec_tbl.setStyle(TableStyle([
            ('ROWBACKGROUNDS', (0, 0), (-1, -1), [WHITE, GRAY_LIGHT]),
            ('TOPPADDING',     (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING',  (0, 0), (-1, -1), 6),
            ('LEFTPADDING',    (0, 0), (-1, -1), 12),
            ('RIGHTPADDING',   (0, 0), (-1, -1), 12),
            ('BOX',            (0, 0), (-1, -1), 0.5, GRAY_BORDER),
            ('LINEBELOW',      (0, 0), (-1, -2), 0.5, GRAY_BORDER),
        ]))
        elements.append(rec_tbl)
        elements.append(Spacer(1, 0.2 * inch))

    # ── ⑨ RADIOLOGIST INFO ───────────────────────────────────────────────────
    elements.extend(section_heading('Analyzed By'))
    rad_rows = [
        ['Radiologist', scan_data.get('radiologist_name', 'N/A')],
        ['Email',       scan_data.get('radiologist_email', 'N/A')],
    ]
    rad_tbl = Table(rad_rows, colWidths=[1.8 * inch, CONTENT_W - 1.8 * inch])
    rad_tbl.setStyle(_table_style())
    elements.append(rad_tbl)
    elements.append(Spacer(1, 0.3 * inch))

    # ── ⑩ FOOTER / DISCLAIMER ────────────────────────────────────────────────
    HRFlowable(width=CONTENT_W, thickness=1, color=GRAY_BORDER, spaceAfter=8)
    disc_style = ParagraphStyle(
        'disc', fontSize=8, textColor=GRAY_MID,
        alignment=TA_CENTER, leading=12, spaceAfter=4,
    )
    footer_box = Table([[
        Paragraph(
            '<b>IMPORTANT DISCLAIMER:</b> This report is AI-assisted and must be used as a supplementary '
            'tool only. Final diagnosis and treatment decisions must be made by qualified medical professionals. '
            'This report does not replace professional medical advice.<br/><br/>'
            '© 2024 NeuraDx AI — Medical Imaging Platform',
            disc_style
        )
    ]], colWidths=[CONTENT_W])
    footer_box.setStyle(TableStyle([
        ('BACKGROUND',    (0, 0), (-1, -1), GRAY_LIGHT),
        ('BOX',           (0, 0), (-1, -1), 0.5, GRAY_BORDER),
        ('TOPPADDING',    (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING',   (0, 0), (-1, -1), 14),
        ('RIGHTPADDING',  (0, 0), (-1, -1), 14),
    ]))
    elements.append(footer_box)

    # ── Build ─────────────────────────────────────────────────────────────────
    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
