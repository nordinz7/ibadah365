import HijriDate, { toHijri } from "hijri-date/lib/safe";

export interface HijriDateInfo {
  hijriYear: number;
  hijriMonth: number;
  hijriDay: number;
  gregorianDate: Date;
}

export interface HijriMonthInfo {
  name: string;
  nameArabic: string;
  number: number;
}

export const HIJRI_MONTHS: HijriMonthInfo[] = [
  { name: "Muharram", nameArabic: "محرم", number: 1 },
  { name: "Safar", nameArabic: "صفر", number: 2 },
  { name: "Rabi' al-Awwal", nameArabic: "ربيع الأول", number: 3 },
  { name: "Rabi' al-Thani", nameArabic: "ربيع الثاني", number: 4 },
  { name: "Jumada al-Awwal", nameArabic: "جمادى الأول", number: 5 },
  { name: "Jumada al-Thani", nameArabic: "جمادى الثاني", number: 6 },
  { name: "Rajab", nameArabic: "رجب", number: 7 },
  { name: "Sha'ban", nameArabic: "شعبان", number: 8 },
  { name: "Ramadan", nameArabic: "رمضان", number: 9 },
  { name: "Shawwal", nameArabic: "شوال", number: 10 },
  { name: "Dhul-Qi'dah", nameArabic: "ذو القعدة", number: 11 },
  { name: "Dhul-Hijjah", nameArabic: "ذو الحجة", number: 12 },
];

export class HijriCalendar {
  private offset: number = 0;

  constructor(offset: number = 0) {
    this.offset = offset;
  }

  setOffset(offset: number): void {
    this.offset = offset;
  }

  getOffset(): number {
    return this.offset;
  }

  gregorianToHijri(date: Date): HijriDateInfo {
    const adjustedDate = new Date(date);
    adjustedDate.setDate(adjustedDate.getDate() + this.offset);

    const hijriDate = toHijri(adjustedDate) as any;

    return {
      hijriYear: hijriDate._year,
      hijriMonth: hijriDate._month,
      hijriDay: hijriDate._date,
      gregorianDate: adjustedDate,
    };
  }

  hijriToGregorian(year: number, month: number, day: number): Date {
    const hijriDate = new (HijriDate as any)(year, month, day);
    const gregorianDate = new Date(hijriDate.toGregorian());

    gregorianDate.setDate(gregorianDate.getDate() - this.offset);

    return gregorianDate;
  }

  getTodayHijri(): HijriDateInfo {
    return this.gregorianToHijri(new Date());
  }

  getHijriMonthName(monthNumber: number, inArabic: boolean = false): string {
    const month = HIJRI_MONTHS.find((m) => m.number === monthNumber);
    return month ? (inArabic ? month.nameArabic : month.name) : "";
  }

  isLastTenNightsOfRamadan(hijriDate: HijriDateInfo): boolean {
    return hijriDate.hijriMonth === 9 && hijriDate.hijriDay >= 21;
  }

  isAyyamAlBidh(hijriDate: HijriDateInfo): boolean {
    return [13, 14, 15].includes(hijriDate.hijriDay);
  }

  isMondayOrThursday(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 1 || dayOfWeek === 4; // Monday = 1, Thursday = 4
  }

  isFriday(date: Date): boolean {
    return date.getDay() === 5;
  }

  getDaysInHijriMonth(year: number, month: number): number {
    const firstDayOfMonth = this.hijriToGregorian(year, month, 1);
    const firstDayOfNextMonth =
      month === 12
        ? this.hijriToGregorian(year + 1, 1, 1)
        : this.hijriToGregorian(year, month + 1, 1);

    const diffTime = firstDayOfNextMonth.getTime() - firstDayOfMonth.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getHijriYear(date?: Date): number {
    const targetDate = date || new Date();
    return this.gregorianToHijri(targetDate).hijriYear;
  }
}

export const hijriCalendar = new HijriCalendar();
