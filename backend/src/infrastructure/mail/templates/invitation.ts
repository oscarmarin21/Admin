interface InvitationTemplateParams {
  organizationName: string;
  invitedByName: string;
  acceptUrl: string;
  role: string;
  expiresAt: Date;
  locale: 'en' | 'es';
}

const formatDate = (date: Date, locale: 'en' | 'es') =>
  new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);

const getCopy = (locale: 'en' | 'es') =>
  locale === 'es'
    ? {
        subject: 'Te han invitado a Admin Platform',
        greeting: 'Hola',
        intro:
          'Has sido invitado a unirte a la organización <strong>{{organization}}</strong> en Admin Platform.',
        invitedBy: 'Invitado por',
        role: 'Rol asignado',
        cta: 'Unirme ahora',
        expiry: 'Este enlace caduca el',
        footer:
          'Si no estabas esperando esta invitación, puedes ignorar este mensaje de forma segura.',
      }
    : {
        subject: 'You have been invited to Admin Platform',
        greeting: 'Hello',
        intro:
          'You have been invited to join the <strong>{{organization}}</strong> organization in Admin Platform.',
        invitedBy: 'Invited by',
        role: 'Role assigned',
        cta: 'Join now',
        expiry: 'This link expires on',
        footer:
          'If you were not expecting this invitation, you can safely ignore this message.',
      };

export const renderInvitationEmail = (params: InvitationTemplateParams) => {
  const copy = getCopy(params.locale);
  const formattedExpiry = formatDate(params.expiresAt, params.locale);

  const intro = copy.intro.replace('{{organization}}', params.organizationName);

  const html = `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#0f172a;padding:40px 0;font-family:Arial,Helvetica,sans-serif;color:#f8fafc;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background:#111827;border-radius:16px;padding:32px;border:1px solid #1f2937;">
            <tr>
              <td style="text-align:left;">
                <h1 style="margin:0 0 16px;font-size:24px;color:#f8fafc;">${copy.greeting},</h1>
                <p style="margin:0 0 16px;font-size:16px;color:#e2e8f0;line-height:1.6;">${intro}</p>
                <p style="margin:0 0 16px;font-size:14px;color:#94a3b8;">
                  ${copy.invitedBy}: <strong style="color:#f8fafc;">${params.invitedByName}</strong><br/>
                  ${copy.role}: <strong style="color:#f8fafc;text-transform:capitalize;">${params.role}</strong>
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                  <tr>
                    <td>
                      <a href="${params.acceptUrl}" style="display:inline-block;background:#38bdf8;color:#0f172a;padding:14px 28px;border-radius:9999px;font-weight:600;text-decoration:none;">
                        ${copy.cta}
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 16px;font-size:14px;color:#94a3b8;">${copy.expiry} <strong style="color:#f8fafc;">${formattedExpiry}</strong>.</p>
                <p style="margin:0;font-size:13px;color:#64748b;">${copy.footer}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  const text =
    params.locale === 'es'
      ? `${copy.greeting},

${params.organizationName} te ha invitado a Admin Platform.
${copy.invitedBy}: ${params.invitedByName}
${copy.role}: ${params.role}

${copy.cta}: ${params.acceptUrl}
${copy.expiry} ${formattedExpiry}.

${copy.footer}`
      : `${copy.greeting},

${params.organizationName} has invited you to Admin Platform.
${copy.invitedBy}: ${params.invitedByName}
${copy.role}: ${params.role}

${copy.cta}: ${params.acceptUrl}
${copy.expiry} ${formattedExpiry}.

${copy.footer}`;

  return { html, text, subject: copy.subject };
};

