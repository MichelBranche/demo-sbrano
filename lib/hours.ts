/** real opening hours of SBRANO, Piazza Santa Giulia (Torino) */
export const HOURS = [
  ["Lunedì", "Chiuso."],
  ["Mar - Gio", "12:00–15:00 • 19:00–23:30"],
  ["Ven - Sab", "12:00–15:00 • 19:00–01:00"],
  ["Domenica", "12:00–23:00"],
];
/** HOURS in minutes from midnight, by JS weekday (0 = Sunday). An end past 1440 spills into the next day. */
export const SCHEDULE: Record<number, [number, number][]> = {
  0: [[720, 1380]],
  1: [],
  2: [[720, 900], [1140, 1410]], 3: [[720, 900], [1140, 1410]], 4: [[720, 900], [1140, 1410]],
  5: [[720, 900], [1140, 1500]], 6: [[720, 900], [1140, 1500]],
};
const WD: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
/** open right now in Torino (Europe/Rome), whatever the visitor's timezone. Call it client-side only. */
export function isOpenNow(d = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = WD[get("weekday")] ?? 0;
  const min = Number(get("hour")) * 60 + Number(get("minute"));
  const prev = (day + 6) % 7;
  return SCHEDULE[day].some(([a, b]) => min >= a && min < b) || SCHEDULE[prev].some(([, b]) => b > 1440 && min + 1440 < b);
}

/** the same hours split in two columns (lunch, dinner) for the reviews/map block table */
export const HOURS_TABLE: [string, string, string][] = [
  ["Lunedì", "", "Chiuso"],
  ["Mar – Gio", "12:00 – 15:00", "19:00 – 23:30"],
  ["Ven – Sab", "12:00 – 15:00", "19:00 – 01:00"],
  ["Domenica", "", "12:00 – 23:00"],
];
export const ADDRESS = "Piazza Santa Giulia, 10124 Torino";
export const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Piazza+Santa+Giulia+10124+Torino";
