/**
 * Client-side copy of the server's generic message layout
 * (`mls-server/src/templates/layouts/message.hbs`), used only for the live
 * preview on the Emails page. The server renders the real email: when that
 * file changes, copy the change here so the preview stays faithful.
 */

const HEADER_IMAGE_URL =
  "https://cdn.statically.io/gh/thekiwidev/main-site@main/mail-header.png";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export interface MessagePreviewInput {
  subject: string;
  bodyHtml: string;
  preheader?: string;
  /** Where the footer links point; the preview disables them anyway. */
  baseUrl?: string;
}

/** The full email document, as the server will send it. */
export function renderMessagePreview({
  subject,
  bodyHtml,
  preheader,
  baseUrl = "#",
}: MessagePreviewInput): string {
  const preheaderBlock = preheader
    ? `      <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #eef2f7; opacity: 0;">
        ${escapeHtml(preheader)}&#8203;&#847;&nbsp;&#8203;&#847;&nbsp;&#8203;&#847;&nbsp;&#8203;&#847;&nbsp;&#8203;&#847;&nbsp;&#8203;&#847;&nbsp;
      </div>
`
    : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${escapeHtml(subject)}</title>
    <!--[if mso]>
      <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
    <![endif]-->
    <style>
      :root { color-scheme: light; }
      body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
      table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      .mls-body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.65; color: #3f4650; }
      .mls-body h1, .mls-body h2, .mls-body h3 { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #12263f; line-height: 1.3; margin: 0 0 16px; }
      .mls-body h1 { font-size: 26px; }
      .mls-body h2 { font-size: 21px; }
      .mls-body h3 { font-size: 17px; }
      .mls-body p { margin: 0 0 18px; }
      .mls-body ul, .mls-body ol { margin: 0 0 18px; padding-left: 22px; }
      .mls-body li { margin: 0 0 6px; }
      .mls-body a { color: #0763b0; text-decoration: underline; }
      .mls-body img { max-width: 100%; height: auto; }
      .mls-body hr { border: 0; border-top: 1px solid #e3e8ef; margin: 28px 0; }
      .mls-body blockquote { margin: 0 0 18px; padding: 12px 18px; border-left: 4px solid #fcb417; background: #fff8e6; color: #5a4a1a; }
      .mls-body table { width: 100%; margin: 0 0 18px; }
      .mls-body th, .mls-body td { padding: 8px 10px; border-bottom: 1px solid #e3e8ef; text-align: left; font-size: 15px; }
      .mls-body th { color: #12263f; background: #f4f7fb; }
      .mls-body .btn, .mls-body a.btn { display: inline-block; padding: 13px 28px; background: #0763b0; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; }
      .mls-body > :last-child { margin-bottom: 0; }
      @media only screen and (max-width: 620px) {
        .mls-container { width: 100% !important; }
        .mls-pad { padding-left: 24px !important; padding-right: 24px !important; }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #eef2f7;">
${preheaderBlock}    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #eef2f7;">
      <tr>
        <td align="center" style="padding: 32px 12px;">
          <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
          <table role="presentation" class="mls-container" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 600px; max-width: 600px; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 6px 18px rgba(18, 38, 63, 0.08);">
            <!-- Header -->
            <tr>
              <td align="center" style="background-color: #0763b0; padding: 0;">
                <a href="${baseUrl}" target="_blank" style="display: block; text-decoration: none;">
                  <img src="${HEADER_IMAGE_URL}" width="600" alt="Momentum Logistics Services" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0; color: #ffffff; font-family: Helvetica, Arial, sans-serif; font-size: 20px; font-weight: bold;" />
                </a>
              </td>
            </tr>
            <!-- Brand accent -->
            <tr>
              <td style="height: 5px; line-height: 5px; font-size: 0; background-color: #fcb417;">&nbsp;</td>
            </tr>
            <!-- Body: any HTML the caller passes -->
            <tr>
              <td class="mls-pad mls-body" style="padding: 40px 44px 36px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.65; color: #3f4650;">
                ${bodyHtml}
              </td>
            </tr>
            <!-- Sign-off -->
            <tr>
              <td class="mls-pad" style="padding: 0 44px 40px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #3f4650;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="border-top: 1px solid #e3e8ef; padding-top: 22px;">
                      Kind regards,<br />
                      <strong style="color: #12263f;">The Momentum Logistics Services team</strong>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td class="mls-pad" align="center" style="background-color: #f4f7fb; padding: 26px 44px 30px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; line-height: 1.6; color: #6b7684;">
                <p style="margin: 0 0 10px;">
                  <a href="${baseUrl}" target="_blank" style="color: #0763b0; text-decoration: none; font-weight: bold;">Website</a>
                  <span style="color: #c3cad4;">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                  <a href="${baseUrl}/track-shipment" target="_blank" style="color: #0763b0; text-decoration: none; font-weight: bold;">Track a shipment</a>
                  <span style="color: #c3cad4;">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                  <a href="${baseUrl}/contact" target="_blank" style="color: #0763b0; text-decoration: none; font-weight: bold;">Contact support</a>
                </p>
                <p style="margin: 0;">&copy; ${new Date().getFullYear()} Momentum Logistics Services. All rights reserved.</p>
              </td>
            </tr>
          </table>
          <!--[if mso]></td></tr></table><![endif]-->
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}
