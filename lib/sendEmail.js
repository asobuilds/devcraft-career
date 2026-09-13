const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.NOTIFY_FROM_EMAIL || 'DevCraft Career <onboarding@resend.dev>';

export async function sendEmail(toEmail, subject, htmlBody) {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured — skipping email send.');
    return { sent: false, reason: 'Resend API key not configured' };
  }

  if (!toEmail) {
    return { sent: false, reason: 'No recipient email provided' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [toEmail],
        subject: subject,
        html: htmlBody,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend send failed: ' + errorText);
      return { sent: false, reason: 'Resend API error: ' + response.status };
    }

    return { sent: true };
  } catch (error) {
    console.error('Email send exception: ' + error.message);
    return { sent: false, reason: error.message };
  }
}

export function buildJobLeadEmailHtml(fullName, jobs) {
  const jobRows = jobs.map(function (job) {
    return (
      '<div style="padding:12px 0;border-bottom:1px solid #333;">' +
      '<p style="margin:0;font-weight:bold;color:#ffffff;">' + job.title + '</p>' +
      '<p style="margin:2px 0;color:#aaaaaa;font-size:13px;">' + job.company + (job.location ? ' — ' + job.location : '') + '</p>' +
      '<p style="margin:2px 0;color:#888888;font-size:12px;">Match: ' + job.matchScore + '% • Source: ' + job.source + '</p>' +
      '<a href="' + job.url + '" style="color:#818cf8;font-size:13px;">View and apply →</a>' +
      '</div>'
    );
  }).join('');

  return (
    '<div style="background:#0f172a;padding:24px;font-family:sans-serif;">' +
    '<h2 style="color:#ffffff;">Hi ' + (fullName || 'there') + ',</h2>' +
    '<p style="color:#cbd5e1;">We found ' + jobs.length + ' job' + (jobs.length === 1 ? '' : 's') + ' that match your skills:</p>' +
    jobRows +
    '<p style="color:#64748b;font-size:12px;margin-top:20px;">You are receiving this because job lead alerts are enabled on your DevCraft Career account.</p>' +
    '</div>'
  );
}