import { subSeconds, subMinutes, subHours, subDays, subYears, subMonths, subWeeks } from 'date-fns';

const timeAgoRegexp = /\bago/i;
const todayRegexp = /\btoday([\s,]*|$)/i;
const tomorrowRegexp = /\btomorrow([\s,]*|$)/i;
const yesterdayRegexp = /\byesterday([\s,]*|$)/i;
const missingYearRegexp = /^(\d{1,2}-\d{1,2})(\s|$)/;
const missingYearRegexp2 = /^(\d{1,2}\s+\w{3})\s+(\d{1,2}\:\d{1,2}.*)$/;

export function fromUnknown(value: string) {
  const str = value.trim();
  if (str.toLowerCase().includes('now')) {
    return new Date();
  }

  const match = timeAgoRegexp.exec(str);
  if (match !== null) {
    return fromTimeAgo(str);
  }

  // TODO: not this
  return new Date();
}

export function fromTimeAgo(strTimeAgo: string) {
  let str = strTimeAgo.toLowerCase();

  if (str.includes('now')) {
    return new Date();
  }

  str = str.replace(',', '');
  str = str.replace('ago', '');
  str = str.replace('and', '');

  const regex = /\s*?([\d\.]+)\s*?([^\d\s\.]+)\s*?/gi;
  let m;
  let timeAgo = new Date();

  // tslint:disable-next-line:no-conditional-assignment
  while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    const val = Number(m[1].trim());
    const unit = m[2].trim();

    // months not supported by ms
    if (unit.includes('sec') || unit === 's') {
      timeAgo = subSeconds(timeAgo, val);
    } else if (unit.includes('min') || unit === 'm') {
      timeAgo = subMinutes(timeAgo, val);
    } else if (unit.includes('hour') || unit.includes('hr') || unit === 'h') {
      timeAgo = subHours(timeAgo, val);
    } else if (unit.includes('day') || unit === 'd') {
      timeAgo = subDays(timeAgo, val);
    } else if (unit.includes('week') || unit.includes('wk') || unit === 'w') {
      timeAgo = subWeeks(timeAgo, val);
    } else if (unit.includes('month') || unit === 'mo') {
      timeAgo = subMonths(timeAgo, val);
    } else if (unit.includes('year') || unit === 'y') {
      timeAgo = subYears(timeAgo, val);
    } else {
      throw new Error('TimeAgo parsing failed, unknown unit: ' + unit);
    }
  }
  return timeAgo;
}
