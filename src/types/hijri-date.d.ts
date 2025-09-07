declare module 'hijri-date' {
  export class HijriDate {
    constructor(date?: Date | string | number);
    
    getHijriYear(): number;
    getHijriMonth(): number;
    getHijriDay(): number;
    
    setHijriFullYear(year: number, month?: number, day?: number): void;
    
    toGregorian(): Date;
    
    static fromHijri(year: number, month: number, day: number): HijriDate;
  }
}

declare module 'hijri-date/lib/safe' {
  export default class HijriDate {
    constructor(date?: Date | string | number);
    
    getHijriYear(): number;
    getHijriMonth(): number;
    getHijriDay(): number;
    
    setHijriFullYear(year: number, month?: number, day?: number): void;
    
    toGregorian(): Date;
    
    static fromHijri(year: number, month: number, day: number): HijriDate;
  }
  
  export function toHijri(date: Date): { hy: number; hm: number; hd: number };
}