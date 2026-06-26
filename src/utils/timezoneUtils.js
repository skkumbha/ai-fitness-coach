/**
 * Browser timezone detection and curated IANA options for onboarding.
 */

export function detectBrowserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

const CURATED_TIMEZONES = [
  { id: 'UTC', label: 'UTC' },
  { id: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { id: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { id: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { id: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { id: 'America/Anchorage', label: 'Alaska' },
  { id: 'Pacific/Honolulu', label: 'Hawaii' },
  { id: 'America/Toronto', label: 'Toronto' },
  { id: 'America/Vancouver', label: 'Vancouver' },
  { id: 'America/Mexico_City', label: 'Mexico City' },
  { id: 'America/Sao_Paulo', label: 'São Paulo' },
  { id: 'Europe/London', label: 'London' },
  { id: 'Europe/Paris', label: 'Paris / Central Europe' },
  { id: 'Europe/Berlin', label: 'Berlin' },
  { id: 'Europe/Madrid', label: 'Madrid' },
  { id: 'Europe/Rome', label: 'Rome' },
  { id: 'Europe/Amsterdam', label: 'Amsterdam' },
  { id: 'Europe/Stockholm', label: 'Stockholm' },
  { id: 'Europe/Athens', label: 'Athens' },
  { id: 'Europe/Moscow', label: 'Moscow' },
  { id: 'Asia/Dubai', label: 'Dubai' },
  { id: 'Asia/Kolkata', label: 'India (Kolkata)' },
  { id: 'Asia/Singapore', label: 'Singapore' },
  { id: 'Asia/Tokyo', label: 'Tokyo' },
  { id: 'Asia/Seoul', label: 'Seoul' },
  { id: 'Asia/Shanghai', label: 'China (Shanghai)' },
  { id: 'Asia/Hong_Kong', label: 'Hong Kong' },
  { id: 'Australia/Sydney', label: 'Sydney' },
  { id: 'Australia/Melbourne', label: 'Melbourne' },
  { id: 'Pacific/Auckland', label: 'Auckland' }
];

/**
 * Returns timezone options for a select, with the browser-detected zone first when not in the list.
 */
export function buildTimezoneOptions(browserTimezone = detectBrowserTimezone()) {
  const options = [...CURATED_TIMEZONES];
  const detected = browserTimezone || 'UTC';

  if (!options.some((tz) => tz.id === detected)) {
    options.unshift({
      id: detected,
      label: `Your device (${detected})`
    });
  }

  return options;
}

export function formatTimezoneLabel(timezoneId, options) {
  const match = options.find((tz) => tz.id === timezoneId);
  return match ? match.label : timezoneId;
}
