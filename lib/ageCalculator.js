/**
 * Age calculation and related helpers (zodiac, Chinese zodiac, next birthday).
 * Pure JS, no dependencies.
 */

export function calculateAge(birthDate, toDate) {
  const birth = new Date(birthDate);
  const to = new Date(toDate);

  let years = to.getFullYear() - birth.getFullYear();
  let months = to.getMonth() - birth.getMonth();
  let days = to.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const diffMs = to - birth;
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = years * 12 + months;
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    totalMonths,
    totalHours,
    totalMinutes,
  };
}

const ZODIAC_SIGNS = [
  { name: "Capricorn", symbol: "♑", end: [1, 19] },
  { name: "Aquarius", symbol: "♒", end: [2, 18] },
  { name: "Pisces", symbol: "♓", end: [3, 20] },
  { name: "Aries", symbol: "♈", end: [4, 19] },
  { name: "Taurus", symbol: "♉", end: [5, 20] },
  { name: "Gemini", symbol: "♊", end: [6, 20] },
  { name: "Cancer", symbol: "♋", end: [7, 22] },
  { name: "Leo", symbol: "♌", end: [8, 22] },
  { name: "Virgo", symbol: "♍", end: [9, 22] },
  { name: "Libra", symbol: "♎", end: [10, 22] },
  { name: "Scorpio", symbol: "♏", end: [11, 21] },
  { name: "Sagittarius", symbol: "♐", end: [12, 21] },
];

export function getZodiacSign(month, day) {
  const m = Number(month);
  const d = Number(day);
  for (const s of ZODIAC_SIGNS) {
    if (m < s.end[0] || (m === s.end[0] && d <= s.end[1])) return s;
  }
  return ZODIAC_SIGNS[0];
}

const CHINESE_ANIMALS = [
  "Rat",
  "Ox",
  "Tiger",
  "Rabbit",
  "Dragon",
  "Snake",
  "Horse",
  "Goat",
  "Monkey",
  "Rooster",
  "Dog",
  "Pig",
];
const CHINESE_EMOJIS = ["🐀", "🐂", "🐯", "🐰", "🐲", "🐍", "🐴", "🐑", "🐒", "🐓", "🐕", "🐖"];

export function getChineseZodiac(year) {
  const y = Number(year);
  const idx = ((y - 1900) % 12 + 12) % 12;
  return { animal: CHINESE_ANIMALS[idx], emoji: CHINESE_EMOJIS[idx] };
}

export function getGeneration(year) {
  const y = Number(year);
  if (y < 1946) return "Silent";
  if (y <= 1964) return "Baby Boomer";
  if (y <= 1980) return "Gen X";
  if (y <= 1996) return "Millennial";
  if (y <= 2012) return "Gen Z";
  return "Gen Alpha";
}

export function getNextBirthday(birthDate, fromDate) {
  const birth = new Date(birthDate);
  const from = new Date(fromDate);
  let nextBirthday = new Date(from.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBirthday <= from) {
    nextBirthday.setFullYear(from.getFullYear() + 1);
  }
  const daysUntil = Math.ceil((nextBirthday - from) / (1000 * 60 * 60 * 24));
  const weekday = nextBirthday.toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = nextBirthday.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return { daysUntil, weekday, dateStr };
}

export function formatNumber(n) {
  return Number(n).toLocaleString();
}
