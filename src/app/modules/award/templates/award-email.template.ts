/**
 * @fileoverview HTML email template for award announcements.
 *
 * Provides a celebratory, responsive layout that highlights the winning donor,
 * their coupon code, donation impact, and links back to the fundraiser.
 */

export interface AwardEmailTemplateParams {
  donorName: string;
  couponCode: string;
  fundraiserTitle: string;
  donationAmount: number;
  currency: string;
  announcedAt: Date;
  selectedAt: Date;
  brandName: string;
  brandLogoUrl?: string;
  fundraiserUrl?: string;
  supportEmail?: string;
  notes?: string;
}

const formatCurrency = (value: number, currency: string): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(value ?? 0);
  } catch {
    return `€${(value ?? 0).toFixed(2)}`;
  }
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const awardAnnouncementEmailTemplate = ({
  donorName,
  couponCode,
  fundraiserTitle,
  donationAmount,
  currency,
  announcedAt,
  selectedAt,
  brandName,
  brandLogoUrl,
  fundraiserUrl,
  supportEmail,
  notes,
}: AwardEmailTemplateParams): string => {
  const formattedDonation = formatCurrency(donationAmount, currency);
  const announcedDate = formatDate(announcedAt);
  const selectedDate = formatDate(selectedAt);

  const primaryColor = '#0EA5E9';
  const secondaryColor = '#F59E0B';

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>You’re an official ${brandName} award winner!</title>
      </head>
      <body style="margin:0;padding:32px 0;background-color:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <div style="max-width:640px;margin:0 auto;background:#FFFFFF;border-radius:28px;overflow:hidden;box-shadow:0 25px 65px rgba(15,23,42,0.08);">
          <div style="padding:36px 32px 24px;background:linear-gradient(135deg, ${primaryColor}, #2563EB);color:#fff;text-align:center;">
            ${
              brandLogoUrl
                ? `<img src="${brandLogoUrl}" alt="${brandName}" style="height:42px;margin-bottom:18px;" />`
                : `<div style="font-size:26px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;">${brandName}</div>`
            }
            <p style="margin:0;font-size:15px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.75);">Award Announcement</p>
            <h1 style="margin:12px 0 0;font-size:32px;font-weight:800;">Congratulations, ${donorName || 'Champion'}! 🎉</h1>
          </div>

          <div style="padding:32px;">
            <p style="font-size:16px;color:#0F172A;line-height:1.6;">
              We're thrilled to let you know that your coupon <strong>${couponCode}</strong> was
              selected as a prize winner for <strong>${fundraiserTitle}</strong>.
              Your generosity of ${formattedDonation} made a direct impact, and this award is a small way for us to celebrate you.
            </p>

            <div style="margin:32px 0;padding:24px;border-radius:20px;background:linear-gradient(135deg,#F0F9FF,#ECFEFF);border:1px solid rgba(14,165,233,0.2);text-align:center;">
              <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:0.4em;color:${primaryColor};">Winning Coupon</p>
              <div style="margin-top:12px;font-size:42px;font-weight:800;font-family:'JetBrains Mono','SFMono-Regular',Menlo,monospace;color:#0F172A;letter-spacing:0.35em;">${couponCode}</div>
            </div>

            <div style="display:flex;flex-wrap:wrap;gap:16px;margin-bottom:32px;">
              <div style="flex:1;min-width:160px;padding:20px;border-radius:18px;background:#F8FAFC;border:1px solid #E2E8F0;">
                <p style="margin:0 0 6px;font-size:12px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.2em;">Donation Amount</p>
                <p style="margin:0;font-size:20px;font-weight:700;color:#0F172A;">${formattedDonation}</p>
              </div>
              <div style="flex:1;min-width:160px;padding:20px;border-radius:18px;background:#F8FAFC;border:1px solid #E2E8F0;">
                <p style="margin:0 0 6px;font-size:12px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.2em;">Selected On</p>
                <p style="margin:0;font-size:16px;font-weight:600;color:#0F172A;">${selectedDate}</p>
              </div>
              <div style="flex:1;min-width:160px;padding:20px;border-radius:18px;background:#F8FAFC;border:1px solid #E2E8F0;">
                <p style="margin:0 0 6px;font-size:12px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.2em;">Announced</p>
                <p style="margin:0;font-size:16px;font-weight:600;color:#0F172A;">${announcedDate}</p>
              </div>
            </div>

            ${
              fundraiserUrl
                ? `<div style="text-align:center;margin-bottom:28px;">
                    <a href="${fundraiserUrl}"
                      style="display:inline-flex;align-items:center;gap:10px;padding:14px 36px;border-radius:999px;background:${secondaryColor};color:#0F172A;font-weight:700;text-decoration:none;font-size:14px;text-transform:uppercase;letter-spacing:0.15em;">
                      View Fundraiser
                    </a>
                  </div>`
                : ''
            }

            ${
              notes
                ? `<div style="margin-bottom:28px;padding:20px;border-left:4px solid ${secondaryColor};background:#FFFBEB;border-radius:0 18px 18px 0;">
                    <p style="margin:0;color:#78350F;font-size:14px;line-height:1.5;">
                      <strong>Special note from our team:</strong><br/>${notes}
                    </p>
                  </div>`
                : ''
            }

            <div style="padding:28px;border-radius:18px;background:#0F172A;color:#E2E8F0;text-align:center;">
              <p style="margin:0;font-size:15px;line-height:1.7;">
                Thank you for believing in meaningful causes. Your kindness fuels change, and we're honored to celebrate you today.
              </p>
              <p style="margin:18px 0 0;font-size:16px;font-weight:600;color:#fff;">— The ${brandName} Team</p>
            </div>

            <p style="margin:28px 0 0;font-size:12px;color:#94A3B8;text-align:center;line-height:1.5;">
              Need help? ${
                supportEmail
                  ? `Contact us at <a href="mailto:${supportEmail}" style="color:${primaryColor};text-decoration:none;">${supportEmail}</a>`
                  : 'Reply to this email and we’ll get back to you shortly.'
              }
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export default awardAnnouncementEmailTemplate;
