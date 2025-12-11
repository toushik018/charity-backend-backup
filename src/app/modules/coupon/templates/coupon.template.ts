/**
 * @fileoverview Coupon email template generator.
 *
 * Provides a professionally designed HTML email template for donation
 * coupon notifications. The template is responsive and follows email
 * client best practices for maximum compatibility.
 *
 * @module modules/coupon/templates/coupon
 */

/**
 * Shop/Organization information for the email footer.
 *
 * @interface CouponEmailShopInfo
 * @property {string} name - Organization name
 * @property {string} [email] - Contact email
 * @property {string} [phone] - Contact phone
 * @property {string} [website] - Website URL
 * @property {object} [address] - Physical address
 */
export interface CouponEmailShopInfo {
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

/**
 * Parameters for generating a coupon email.
 *
 * @interface CouponEmailTemplateParams
 * @property {string} donorName - Name of the donor
 * @property {string} donorEmail - Email address of the donor
 * @property {string} couponCode - Generated coupon code
 * @property {number} donationAmount - Donation amount
 * @property {string} currency - Currency code (e.g., "USD")
 * @property {string} fundraiserTitle - Title of the fundraiser
 * @property {Date} donationDate - Date of the donation
 * @property {Date} expiresAt - Coupon expiration date
 * @property {CouponEmailShopInfo} shop - Organization information
 * @property {string} [logoUrl] - URL to organization logo
 * @property {string} [helpCenterUrl] - URL to help center
 * @property {string} [viewCouponUrl] - URL to view coupon details
 */
export interface CouponEmailTemplateParams {
  donorName: string;
  donorEmail: string;
  couponCode: string;
  donationAmount: number;
  currency: string;
  fundraiserTitle: string;
  donationDate: Date;
  expiresAt: Date;
  shop: CouponEmailShopInfo;
  logoUrl?: string;
  helpCenterUrl?: string;
  viewCouponUrl?: string;
}

/**
 * Format a number as currency.
 *
 * @param {number} value - The numeric value to format
 * @param {string} currency - The currency code (e.g., "USD")
 * @returns {string} Formatted currency string
 */
const formatCurrency = (value: number, currency: string): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(value ?? 0);
  } catch {
    return `$${(value ?? 0).toFixed(2)}`;
  }
};

/**
 * Format a date for display.
 *
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

/**
 * Build the coupon code display section.
 *
 * @param {string} couponCode - The coupon code to display
 * @returns {string} HTML string for the coupon code section
 */
const buildCouponCodeSection = (couponCode: string): string => {
  return `
    <div style="text-align:center;margin:32px 0;">
      <div style="display:inline-block;background:linear-gradient(135deg, #10b981 0%, #059669 100%);padding:24px 48px;border-radius:12px;box-shadow:0 4px 14px rgba(16, 185, 129, 0.3);">
        <div style="font-size:12px;color:rgba(255,255,255,0.9);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">Your Coupon Code</div>
        <div style="font-size:32px;font-weight:800;color:#ffffff;letter-spacing:4px;font-family:monospace;">${couponCode}</div>
      </div>
    </div>
  `;
};

/**
 * Build the donation details section.
 *
 * @param {Date} donationDate - Date of the donation
 * @param {number} amount - Donation amount
 * @param {string} currency - Currency code
 * @param {string} fundraiserTitle - Title of the fundraiser
 * @returns {string} HTML string for the donation details section
 */
const buildDonationDetailsSection = (
  donationDate: Date,
  amount: number,
  currency: string,
  fundraiserTitle: string
): string => {
  return `
    <table role="presentation" style="width:100%;border-collapse:collapse;border-top:1px solid #e4e4e7;border-bottom:1px solid #e4e4e7;margin-top:24px;">
      <tr>
        <td style="padding:16px 0;width:33%;vertical-align:top;">
          <div style="font-size:12px;color:#71717a;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">Donation Date</div>
          <div style="font-size:14px;color:#18181b;font-weight:700;">${formatDate(donationDate)}</div>
        </td>
        <td style="padding:16px 0;width:33%;vertical-align:top;">
          <div style="font-size:12px;color:#71717a;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">Amount</div>
          <div style="font-size:14px;color:#10b981;font-weight:700;">${formatCurrency(amount, currency)}</div>
        </td>
        <td style="padding:16px 0;width:33%;vertical-align:top;">
          <div style="font-size:12px;color:#71717a;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">Fundraiser</div>
          <div style="font-size:14px;color:#18181b;font-weight:700;line-height:1.4;">${fundraiserTitle}</div>
        </td>
      </tr>
    </table>
  `;
};

/**
 * Build the prize information section.
 *
 * @param {Date} expiresAt - Coupon expiration date
 * @returns {string} HTML string for the prize information section
 */
const buildPrizeInfoSection = (expiresAt: Date): string => {
  return `
    <div style="margin-top:32px;padding:24px;background-color:#fef3c7;border-radius:8px;border-left:4px solid #f59e0b;">
      <h3 style="margin:0 0 12px 0;color:#92400e;font-size:16px;font-weight:700;">
        🎉 You're Entered to Win!
      </h3>
      <p style="margin:0;color:#78350f;font-size:14px;line-height:1.6;">
        Your coupon code has been automatically entered into our prize draw.
        We'll randomly select winners from all active coupons. Keep this email safe –
        if your code is selected, we'll contact you at this email address!
      </p>
      <p style="margin:12px 0 0 0;color:#78350f;font-size:13px;">
        <strong>Valid until:</strong> ${formatDate(expiresAt)}
      </p>
    </div>
  `;
};

/**
 * Build the footer section.
 *
 * @param {CouponEmailShopInfo} shop - Organization information
 * @param {string} [helpCenterUrl] - URL to help center
 * @returns {string} HTML string for the footer section
 */
const buildFooter = (
  shop: CouponEmailShopInfo,
  helpCenterUrl?: string
): string => {
  const currentYear = new Date().getFullYear();

  return `
    <table role="presentation" style="width:100%;margin-top:48px;padding-top:32px;border-top:1px solid #e4e4e7;border-collapse:collapse;">
      <tr>
        <td style="text-align:center;vertical-align:middle;">
          ${
            helpCenterUrl
              ? `<div style="font-size:14px;color:#71717a;margin-bottom:16px;">
              Questions? Visit our <a href="${helpCenterUrl}" style="color:#10b981;text-decoration:underline;font-weight:600;">Help Center</a>
            </div>`
              : ''
          }
          <div style="font-size:13px;color:#a1a1aa;">
            © ${currentYear} ${shop.name}. All rights reserved.
          </div>
          ${
            shop.email
              ? `<div style="font-size:12px;color:#a1a1aa;margin-top:8px;">
              Contact: <a href="mailto:${shop.email}" style="color:#71717a;">${shop.email}</a>
            </div>`
              : ''
          }
        </td>
      </tr>
    </table>
  `;
};

/**
 * Build the view coupon button.
 *
 * @param {string} [url] - URL to view coupon details
 * @returns {string} HTML string for the button (empty if no URL)
 */
const buildViewCouponButton = (url?: string): string => {
  if (!url) return '';

  return `
    <div style="text-align:center;margin:32px 0;">
      <a
        href="${url}"
        style="display:inline-block;padding:14px 48px;background-color:#18181b;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;letter-spacing:0.5px;text-transform:uppercase;border-radius:8px;"
      >
        View My Coupon
      </a>
    </div>
  `;
};

/**
 * Generate the complete coupon email HTML template.
 *
 * Creates a professionally designed, responsive email that includes:
 * - Organization branding (logo or name)
 * - Personalized greeting
 * - Thank you message
 * - Prominent coupon code display
 * - Donation details summary
 * - Prize draw information
 * - Call-to-action button
 * - Footer with contact information
 *
 * @param {CouponEmailTemplateParams} params - Template parameters
 * @returns {string} Complete HTML email string
 *
 * @example
 * const html = couponEmailTemplate({
 *   donorName: 'John Doe',
 *   donorEmail: 'john@example.com',
 *   couponCode: 'FU-ABC123XY',
 *   donationAmount: 50,
 *   currency: 'USD',
 *   fundraiserTitle: 'Help Local School',
 *   donationDate: new Date(),
 *   expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
 *   shop: { name: 'FundsUs' },
 * });
 */
export const couponEmailTemplate = (
  params: CouponEmailTemplateParams
): string => {
  const {
    donorName,
    couponCode,
    donationAmount,
    currency,
    fundraiserTitle,
    donationDate,
    expiresAt,
    shop,
    logoUrl,
    helpCenterUrl,
    viewCouponUrl,
  } = params;

  const couponCodeSection = buildCouponCodeSection(couponCode);
  const donationDetailsSection = buildDonationDetailsSection(
    donationDate,
    donationAmount,
    currency,
    fundraiserTitle
  );
  const prizeInfoSection = buildPrizeInfoSection(expiresAt);
  const viewCouponButton = buildViewCouponButton(viewCouponUrl);
  const footer = buildFooter(shop, helpCenterUrl);

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Thank You for Your Donation!</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
        <div style="max-width:640px;margin:0 auto;padding:32px 24px;background-color:#ffffff;">

          <!-- Header / Logo -->
          ${
            logoUrl
              ? `<div style="text-align:center;margin-bottom:32px;">
              <img src="${logoUrl}" alt="${shop.name}" style="height:48px;display:inline-block;" />
            </div>`
              : `<div style="text-align:center;margin-bottom:32px;">
              <div style="font-size:28px;font-weight:800;color:#10b981;">${shop.name}</div>
            </div>`
          }

          <!-- Main Heading -->
          <h1 style="margin:0 0 16px 0;color:#18181b;font-size:28px;font-weight:700;line-height:1.3;text-align:center;">
            Thank You for Your Generosity! 💚
          </h1>

          <!-- Greeting -->
          <div style="text-align:center;margin-bottom:24px;">
            <p style="margin:0;color:#18181b;font-size:16px;font-weight:600;">
              Hello ${donorName || 'Generous Donor'},
            </p>
          </div>

          <!-- Thank You Message -->
          <p style="margin:0 0 24px 0;color:#71717a;font-size:15px;line-height:1.7;text-align:center;">
            Your donation to <strong style="color:#18181b;">"${fundraiserTitle}"</strong> has been received.
            As a token of our appreciation, here's your exclusive coupon code for our upcoming prize draw!
          </p>

          <!-- Coupon Code -->
          ${couponCodeSection}

          <!-- Donation Details -->
          ${donationDetailsSection}

          <!-- Prize Information -->
          ${prizeInfoSection}

          <!-- View Coupon Button -->
          ${viewCouponButton}

          <!-- Additional Message -->
          <div style="margin-top:32px;padding:20px;background-color:#f0fdf4;border-radius:8px;">
            <p style="margin:0;color:#166534;font-size:14px;line-height:1.6;text-align:center;">
              <strong>Every donation makes a difference.</strong><br/>
              Thank you for being part of our community and helping make the world a better place.
            </p>
          </div>

          <!-- Signature -->
          <div style="margin-top:32px;text-align:center;">
            <p style="margin:0;color:#18181b;font-size:16px;font-weight:600;">
              With gratitude,
            </p>
            <p style="margin:8px 0 0 0;color:#71717a;font-size:14px;">
              The ${shop.name} Team
            </p>
          </div>

          <!-- Footer -->
          ${footer}

        </div>
      </body>
    </html>
  `;
};

export default couponEmailTemplate;
