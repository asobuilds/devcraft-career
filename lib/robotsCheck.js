// lib/robotsCheck.js
// Checks a target URL against that site's robots.txt before any automated
// crawling is attempted. This only verifies crawling permission — it does
// NOT and cannot verify a site's Terms of Service. Before enabling scraping
// for any new site, a human must separately read that site's ToS and confirm
// automated access is allowed. Treat an "allowed" result here as necessary,
// not sufficient.

const ROBOTS_CACHE = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function parseRobotsTxt(robotsText) {
  const lines = robotsText.split('\n').map((line) => line.trim());
  const groups = [];
  let currentGroup = null;

  for (const rawLine of lines) {
    const line = rawLine.split('#')[0].trim();
    if (!line) continue;

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const field = line.slice(0, colonIndex).trim().toLowerCase();
    const value = line.slice(colonIndex + 1).trim();

    if (field === 'user-agent') {
      if (!currentGroup || currentGroup.rules.length > 0) {
        currentGroup = { agents: [value.toLowerCase()], rules: [] };
        groups.push(currentGroup);
      } else {
        currentGroup.agents.push(value.toLowerCase());
      }
    } else if (field === 'disallow' && currentGroup) {
      currentGroup.rules.push({ type: 'disallow', path: value });
    } else if (field === 'allow' && currentGroup) {
      currentGroup.rules.push({ type: 'allow', path: value });
    }
  }

  return groups;
}

function findApplicableGroup(groups, userAgent) {
  const lowerAgent = userAgent.toLowerCase();

  const specificMatch = groups.find((group) =>
    group.agents.some((agent) => agent !== '*' && lowerAgent.includes(agent))
  );
  if (specificMatch) return specificMatch;

  const wildcardMatch = groups.find((group) => group.agents.includes('*'));
  return wildcardMatch || null;
}

function pathMatchesRule(path, rulePath) {
  if (rulePath === '') return false;
  return path.startsWith(rulePath);
}

function isPathAllowed(group, path) {
  if (!group || group.rules.length === 0) return true;

  let bestMatch = null;
  let bestMatchLength = -1;

  for (const rule of group.rules) {
    if (pathMatchesRule(path, rule.path) && rule.path.length > bestMatchLength) {
      bestMatch = rule;
      bestMatchLength = rule.path.length;
    }
  }

  if (!bestMatch) return true;
  return bestMatch.type === 'allow';
}

async function fetchRobotsTxt(origin) {
  const cached = ROBOTS_CACHE.get(origin);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.groups;
  }

  try {
    const response = await fetch(origin + '/robots.txt', {
      headers: { 'User-Agent': 'DevCraftCareerBot/1.0 (+https://devcraft-career.vercel.app)' },
    });

    if (!response.ok) {
      ROBOTS_CACHE.set(origin, { groups: [], fetchedAt: Date.now() });
      return [];
    }

    const text = await response.text();
    const groups = parseRobotsTxt(text);
    ROBOTS_CACHE.set(origin, { groups: groups, fetchedAt: Date.now() });
    return groups;
  } catch (error) {
    console.error('Failed to fetch robots.txt for ' + origin + ': ' + error.message);
    return null;
  }
}

export async function isCrawlingAllowed(targetUrl, userAgent) {
  const agent = userAgent || 'DevCraftCareerBot';

  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrl);
  } catch (error) {
    return { allowed: false, reason: 'Invalid URL' };
  }

  const origin = parsedUrl.origin;
  const path = parsedUrl.pathname || '/';

  const groups = await fetchRobotsTxt(origin);

  if (groups === null) {
    return { allowed: false, reason: 'Could not verify robots.txt — failing safe (blocked).' };
  }

  if (groups.length === 0) {
    return { allowed: true, reason: 'No robots.txt restrictions found.' };
  }

  const applicableGroup = findApplicableGroup(groups, agent);
  const allowed = isPathAllowed(applicableGroup, path);

  return {
    allowed: allowed,
    reason: allowed
      ? 'Permitted by robots.txt for path ' + path
      : 'Disallowed by robots.txt for path ' + path,
  };
}