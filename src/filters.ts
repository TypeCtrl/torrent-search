/**
 * do not attempt to rename these functions
 * they are the same name found in definitions
 */
import filenamify from 'filenamify';
import { parse } from 'date-fns';
import { trim as ltrim } from 'lodash';

export function regexp(str: string, regExpStr: string): string {
  const exp = new RegExp(regExpStr);
  const res = str.match(exp);
  return res ? res[1] : '';
}

export function toupper(str: string) {
  return str.toUpperCase();
}

export function prepend(str: string, arg: string) {
  return `${arg}${str}`;
}

export function append(str: string, arg: string | number) {
  return `${str}${arg}`;
}

export function validfilename(str: string, replacement = '_'): string {
  return filenamify(str, { replacement });
}

export function urlencode(str: string) {
  return encodeURI(str);
}

export function re_replace(str: string, searchValue: string, replaceValue: string) {
  const reg = new RegExp(searchValue);
  return str.replace(reg, replaceValue);
}

export function replace(str: string, searchValue: string, replaceValue: string) {
  return str.replace(searchValue, replaceValue);
}

export function split(str: string, searchValue: string, position: number) {
  return str.split(searchValue)[position];
}

export function trim(str: string, char?: string) {
  return ltrim(str, char);
}

export function dateparse(str: string, layout: string) {
  const trimmed = str.trim();
  let pattern = layout;

  // year
  pattern = pattern.replace('2006', 'yyyy');
  pattern = pattern.replace('06', 'yy');

  // month
  pattern = pattern.replace('January', 'MMMM');
  pattern = pattern.replace('Jan', 'MMM');
  pattern = pattern.replace('01', 'MM');

  // day
  pattern = pattern.replace('Monday', 'dddd');
  pattern = pattern.replace('Mon', 'ddd');
  pattern = pattern.replace('02', 'dd');
  //pattern = pattern.replace("_2", ""); // space padding not supported nativly by C#?
  pattern = pattern.replace('2', 'd');

  // hours/minutes/seconds
  pattern = pattern.replace('05', 'ss');

  pattern = pattern.replace('15', 'HH');
  pattern = pattern.replace('03', 'hh');
  pattern = pattern.replace('3', 'h');

  pattern = pattern.replace('04', 'mm');
  pattern = pattern.replace('4', 'm');

  pattern = pattern.replace('5', 's');

  // month again
  pattern = pattern.replace('1', 'M');

  // fractional seconds
  pattern = pattern.replace('.0000', 'ffff');
  pattern = pattern.replace('.000', 'fff');
  pattern = pattern.replace('.00', 'ff');
  pattern = pattern.replace('.0', 'f');

  pattern = pattern.replace('.9999', 'FFFF');
  pattern = pattern.replace('.999', 'FFF');
  pattern = pattern.replace('.99', 'FF');
  pattern = pattern.replace('.9', 'F');

  // AM/PM
  pattern = pattern.replace('PM', 'tt');
  pattern = pattern.replace('pm', 'tt'); // not sure if this works

  // timezones
  // these might need further tuning
  //pattern = pattern.replace("MST", "");
  //pattern = pattern.replace("Z07:00:00", "");
  pattern = pattern.replace('Z07:00', "'Z'zzz");
  pattern = pattern.replace('Z07', "'Z'zz");
  //pattern = pattern.replace("Z070000", "");
  //pattern = pattern.replace("Z0700", "");
  pattern = pattern.replace('Z07:00', "'Z'zzz");
  pattern = pattern.replace('Z07', "'Z'zz");
  //pattern = pattern.replace("-07:00:00", "");
  pattern = pattern.replace('-07:00', 'zzz');
  //pattern = pattern.replace("-0700", "zz");
  pattern = pattern.replace('-07', 'zz');
  try {
    const result = parse(trimmed, pattern, new Date());
    if ((result as any) === 'Invalid Date') {
      throw new Error(`Error while parsing date ${str} using ${layout}`);
    }
    return result;
  } catch {
    throw new Error(`Error while parsing date ${str} using ${layout}`);
  }
}
