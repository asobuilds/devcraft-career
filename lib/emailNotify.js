import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

function buildLeadEmailHtml(fullName, jobs) {
  const jobRows = jobs
    .map(function (job) {
      return (
        '<tr>' +
        '<td style="padding:10px;border-bottom:1px solid #eee;">' +
        '<strong>' + job.title + '</strong><br/>' +
        '<span style="color:#666;">' + job.company + (job.location ? ' — ' + job.location : '') + '</span><br/>' +
        '<span style="color:#4f46e5;font-size:12px;">' + job.matchScore + '% match · via ' + job.source + '</span>'
        + '</td>' +
        '<td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">' +
        '<a href="' + job.url + '" style="background:#4f46e5;color:#fff;padding:8px 14px;border-radius:8px;text-decoration:none;font-size:12px;">Apply</a>'
        + '</td>' +
        '</tr>'
      );
    })
    .join('');

  return (
    '<div style="font-family:sans-serif;max-width:520px;margin:0 auto;">' +
    '<h2 style="color:#111;">New job matches for you, ' + fullName + '</h2>' +
    '<p style="color:#555;">DevCraft Career found ' + jobs.length + ' opportunity(ies) that match your skills.</p>' +
    '<table style="width:100%;border-collapse:collapse;">' + jobRows + '</table>' +
    '<p style="color:#999;font-size:12px;margin-top:20px;">You are receiving this because job alerts are enabled on your DevCraft Career account.</p>' +
    '</div>'
  );
}

export async function sendJobLeadEmail(toEmail, fullName, jobs) {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured — skipping email notification.');
    return { sent: false, reason: 'not_configured' };
  }

  if (!toEmail || jobs.length === 0) {
    return { sent: false, reason: 'no_recipient_or_jobs' };
  }

  const resend = new Resend(RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: 'DevCraft Career <onboarding@resend.dev>',
      to: toEmail,
      subject: jobs.length + ' new job match(es) found for you',
      html: buildLeadEmailHtml(fullName || 'there', jobs),
    });
    return { sent: true };
  } catch (error) {
    console.error('Failed to send lead email: ' + error.message);
    return { sent: false, reason: error.message };
  }
}