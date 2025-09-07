import { hijriCalendar, HijriDateInfo, HijriCalendar } from './hijriDate';

export enum IbadahCategory {
  FASTING = 'fasting',
  PRAYER = 'prayer',
  QURAN = 'quran',
  EID = 'eid',
  HAJJ = 'hajj',
  TAKBEER = 'takbeer',
  ADHKAR = 'adhkar',
  RAMADAN = 'ramadan',
}

export interface IbadahEvent {
  id: string;
  title: string;
  titleArabic: string;
  description: string;
  descriptionArabic: string;
  category: IbadahCategory;
  date: Date;
  hijriDate: HijriDateInfo;
  isRecurring: boolean;
  isMultiDay: boolean;
  endDate?: Date;
  icon: string;
  isForbiddenDay?: boolean;
  reminderTimes?: string[]; // Times like '08:00', 'fajr', 'after_fard'
}

export class IbadahEventsCalculator {
  private calendar: HijriCalendar;

  constructor(calendar: HijriCalendar = hijriCalendar) {
    this.calendar = calendar;
  }

  getAllEventsForYear(year: number): IbadahEvent[] {
    const events: IbadahEvent[] = [];
    
    // Add all yearly Islamic events
    events.push(...this.getMuharramEvents(year));
    events.push(...this.getRamadanEvents(year));
    events.push(...this.getShawwalEvents(year));
    events.push(...this.getDhulHijjahEvents(year));
    events.push(...this.getShabanEvents(year));
    
    // Add recurring weekly events for the year
    events.push(...this.getWeeklyRecurringEvents(year));
    
    // Add monthly Ayyam al-Bidh events
    events.push(...this.getMonthlyAyyamAlBidhEvents(year));
    
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  getAllEventsForRange(startDate: Date, endDate: Date): IbadahEvent[] {
    const events: IbadahEvent[] = [];
    const startYear = this.calendar.getHijriYear(startDate);
    const endYear = this.calendar.getHijriYear(endDate);
    
    for (let year = startYear; year <= endYear; year++) {
      const yearEvents = this.getAllEventsForYear(year);
      events.push(...yearEvents.filter(event => 
        event.date >= startDate && event.date <= endDate
      ));
    }
    
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private getMuharramEvents(year: number): IbadahEvent[] {
    const events: IbadahEvent[] = [];
    
    // Day of Ashura (10 Muharram)
    const ashuraDate = this.calendar.hijriToGregorian(year, 1, 10);
    const ashuraHijri = this.calendar.gregorianToHijri(ashuraDate);
    
    events.push({
      id: `ashura-${year}`,
      title: 'Day of Ashura Fast',
      titleArabic: 'صيام يوم عاشوراء',
      description: 'Recommended fast on 10th Muharram, with optional 9th or 11th',
      descriptionArabic: 'صيام مستحب في العاشر من محرم، مع التاسع أو الحادي عشر',
      category: IbadahCategory.FASTING,
      date: ashuraDate,
      hijriDate: ashuraHijri,
      isRecurring: true,
      isMultiDay: false,
      icon: '🌙',
    });
    
    // Optional 9th Muharram
    const ninthMuharramDate = this.calendar.hijriToGregorian(year, 1, 9);
    events.push({
      id: `ninth-muharram-${year}`,
      title: '9th Muharram Fast (Optional)',
      titleArabic: 'صيام التاسع من محرم (اختياري)',
      description: 'Optional fast before Ashura',
      descriptionArabic: 'صيام اختياري قبل عاشوراء',
      category: IbadahCategory.FASTING,
      date: ninthMuharramDate,
      hijriDate: this.calendar.gregorianToHijri(ninthMuharramDate),
      isRecurring: true,
      isMultiDay: false,
      icon: '🌙',
    });
    
    return events;
  }

  private getRamadanEvents(year: number): IbadahEvent[] {
    const events: IbadahEvent[] = [];
    
    // Ramadan month
    const ramadanStart = this.calendar.hijriToGregorian(year, 9, 1);
    const daysInRamadan = this.calendar.getDaysInHijriMonth(year, 9);
    const ramadanEnd = this.calendar.hijriToGregorian(year, 9, daysInRamadan);
    
    events.push({
      id: `ramadan-${year}`,
      title: 'Ramadan',
      titleArabic: 'رمضان',
      description: 'Holy month of fasting',
      descriptionArabic: 'الشهر المبارك للصيام',
      category: IbadahCategory.RAMADAN,
      date: ramadanStart,
      hijriDate: this.calendar.gregorianToHijri(ramadanStart),
      isRecurring: true,
      isMultiDay: true,
      endDate: ramadanEnd,
      icon: '🌙',
      reminderTimes: ['20:00', 'fajr'],
    });
    
    // Last 10 nights of Ramadan (I'tikaf)
    const itikafStart = this.calendar.hijriToGregorian(year, 9, 21);
    events.push({
      id: `itikaf-${year}`,
      title: 'I\'tikaf (Last 10 Nights)',
      titleArabic: 'اعتكاف العشر الأواخر',
      description: 'Spiritual retreat in the mosque',
      descriptionArabic: 'الاعتكاف في المسجد',
      category: IbadahCategory.RAMADAN,
      date: itikafStart,
      hijriDate: this.calendar.gregorianToHijri(itikafStart),
      isRecurring: true,
      isMultiDay: true,
      endDate: ramadanEnd,
      icon: '🕌',
    });
    
    // Laylatul Qadr nights (21, 23, 25, 27, 29)
    [21, 23, 25, 27, 29].forEach(day => {
      const laylahDate = this.calendar.hijriToGregorian(year, 9, day);
      events.push({
        id: `laylatul-qadr-${day}-${year}`,
        title: `Laylatul Qadr (${day}th Night)`,
        titleArabic: `ليلة القدر (ليلة ${day})`,
        description: 'Night of Power - increased worship',
        descriptionArabic: 'ليلة القدر - إحياء الليل بالعبادة',
        category: IbadahCategory.RAMADAN,
        date: laylahDate,
        hijriDate: this.calendar.gregorianToHijri(laylahDate),
        isRecurring: true,
        isMultiDay: false,
        icon: '✨',
        reminderTimes: ['20:00'],
      });
    });
    
    return events;
  }

  private getShawwalEvents(year: number): IbadahEvent[] {
    const events: IbadahEvent[] = [];
    
    // Eid al-Fitr
    const eidFitrDate = this.calendar.hijriToGregorian(year, 10, 1);
    events.push({
      id: `eid-fitr-${year}`,
      title: 'Eid al-Fitr',
      titleArabic: 'عيد الفطر',
      description: 'Festival of Breaking the Fast - Prayer and celebration',
      descriptionArabic: 'عيد الفطر - صلاة العيد والاحتفال',
      category: IbadahCategory.EID,
      date: eidFitrDate,
      hijriDate: this.calendar.gregorianToHijri(eidFitrDate),
      isRecurring: true,
      isMultiDay: false,
      icon: '🎉',
      isForbiddenDay: true,
      reminderTimes: ['07:00'],
    });
    
    // Six days of Shawwal
    for (let day = 2; day <= 7; day++) {
      const sixDaysDate = this.calendar.hijriToGregorian(year, 10, day);
      events.push({
        id: `six-shawwal-${day}-${year}`,
        title: `Six Days of Shawwal (Day ${day - 1})`,
        titleArabic: `الأيام الستة من شوال (اليوم ${day - 1})`,
        description: 'Recommended fasting after Eid',
        descriptionArabic: 'صيام مستحب بعد العيد',
        category: IbadahCategory.FASTING,
        date: sixDaysDate,
        hijriDate: this.calendar.gregorianToHijri(sixDaysDate),
        isRecurring: true,
        isMultiDay: false,
        icon: '🌙',
      });
    }
    
    return events;
  }

  private getDhulHijjahEvents(year: number): IbadahEvent[] {
    const events: IbadahEvent[] = [];
    
    // First 10 days of Dhul-Hijjah
    const firstTenStart = this.calendar.hijriToGregorian(year, 12, 1);
    const firstTenEnd = this.calendar.hijriToGregorian(year, 12, 10);
    
    events.push({
      id: `first-ten-dhul-hijjah-${year}`,
      title: 'First 10 Days of Dhul-Hijjah',
      titleArabic: 'العشر الأوائل من ذي الحجة',
      description: 'Blessed days for increased worship',
      descriptionArabic: 'الأيام المباركة للعبادة والذكر',
      category: IbadahCategory.HAJJ,
      date: firstTenStart,
      hijriDate: this.calendar.gregorianToHijri(firstTenStart),
      isRecurring: true,
      isMultiDay: true,
      endDate: firstTenEnd,
      icon: '🕋',
    });
    
    // Day of Arafah (9 Dhul-Hijjah)
    const arafaDate = this.calendar.hijriToGregorian(year, 12, 9);
    events.push({
      id: `arafah-${year}`,
      title: 'Day of Arafah Fast',
      titleArabic: 'صيام يوم عرفة',
      description: 'Recommended fast for non-pilgrims',
      descriptionArabic: 'صيام مستحب لغير الحجاج',
      category: IbadahCategory.FASTING,
      date: arafaDate,
      hijriDate: this.calendar.gregorianToHijri(arafaDate),
      isRecurring: true,
      isMultiDay: false,
      icon: '🌙',
    });
    
    // Eid al-Adha (10 Dhul-Hijjah)
    const eidAdhaDate = this.calendar.hijriToGregorian(year, 12, 10);
    events.push({
      id: `eid-adha-${year}`,
      title: 'Eid al-Adha',
      titleArabic: 'عيد الأضحى',
      description: 'Festival of Sacrifice - Prayer and celebration',
      descriptionArabic: 'عيد الأضحى - صلاة العيد والاحتفال',
      category: IbadahCategory.EID,
      date: eidAdhaDate,
      hijriDate: this.calendar.gregorianToHijri(eidAdhaDate),
      isRecurring: true,
      isMultiDay: false,
      icon: '🎉',
      isForbiddenDay: true,
      reminderTimes: ['07:00'],
    });
    
    // Days of Tashreeq (11-13 Dhul-Hijjah) - Forbidden fasting days
    for (let day = 11; day <= 13; day++) {
      const tashreeqDate = this.calendar.hijriToGregorian(year, 12, day);
      events.push({
        id: `tashreeq-${day}-${year}`,
        title: `Day of Tashreeq (${day} Dhul-Hijjah)`,
        titleArabic: `أيام التشريق (${day} ذو الحجة)`,
        description: 'Days of eating, drinking, and remembrance - Fasting forbidden',
        descriptionArabic: 'أيام أكل وشرب وذكر - يحرم الصوم',
        category: IbadahCategory.HAJJ,
        date: tashreeqDate,
        hijriDate: this.calendar.gregorianToHijri(tashreeqDate),
        isRecurring: true,
        isMultiDay: false,
        icon: '🕋',
        isForbiddenDay: true,
      });
    }
    
    // Takbeer Tashreeq period (Fajr 9 Dhul-Hijjah to Asr 13 Dhul-Hijjah)
    const takbeerStart = this.calendar.hijriToGregorian(year, 12, 9);
    const takbeerEnd = this.calendar.hijriToGregorian(year, 12, 13);
    
    events.push({
      id: `takbeer-tashreeq-${year}`,
      title: 'Takbeer Tashreeq',
      titleArabic: 'تكبير التشريق',
      description: 'Takbeer after each Fard prayer from Fajr 9th to Asr 13th Dhul-Hijjah',
      descriptionArabic: 'التكبير بعد كل صلاة فرض من فجر التاسع إلى عصر الثالث عشر',
      category: IbadahCategory.TAKBEER,
      date: takbeerStart,
      hijriDate: this.calendar.gregorianToHijri(takbeerStart),
      isRecurring: true,
      isMultiDay: true,
      endDate: takbeerEnd,
      icon: '🔊',
      reminderTimes: ['after_fard'],
    });
    
    return events;
  }

  private getShabanEvents(year: number): IbadahEvent[] {
    const events: IbadahEvent[] = [];
    
    // Mid-Sha'ban (15th Sha'ban)
    const midShabanDate = this.calendar.hijriToGregorian(year, 8, 15);
    events.push({
      id: `mid-shaban-${year}`,
      title: 'Mid-Sha\'ban Fast',
      titleArabic: 'صيام منتصف شعبان',
      description: 'Recommended fast on 15th Sha\'ban',
      descriptionArabic: 'صيام مستحب في الخامس عشر من شعبان',
      category: IbadahCategory.FASTING,
      date: midShabanDate,
      hijriDate: this.calendar.gregorianToHijri(midShabanDate),
      isRecurring: true,
      isMultiDay: false,
      icon: '🌙',
    });
    
    return events;
  }

  private getWeeklyRecurringEvents(year: number): IbadahEvent[] {
    const events: IbadahEvent[] = [];
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);
    
    // Generate all Mondays and Thursdays in the Gregorian year
    for (let date = new Date(startOfYear); date <= endOfYear; date.setDate(date.getDate() + 1)) {
      const currentDate = new Date(date);
      
      if (this.calendar.isMondayOrThursday(currentDate)) {
        const dayName = currentDate.getDay() === 1 ? 'Monday' : 'Thursday';
        const dayNameArabic = currentDate.getDay() === 1 ? 'الاثنين' : 'الخميس';
        
        events.push({
          id: `sunnah-fast-${currentDate.toISOString().split('T')[0]}`,
          title: `Sunnah Fast (${dayName})`,
          titleArabic: `صيام سنة (${dayNameArabic})`,
          description: 'Recommended fast on Monday/Thursday',
          descriptionArabic: 'صيام مستحب يوم الاثنين والخميس',
          category: IbadahCategory.FASTING,
          date: currentDate,
          hijriDate: this.calendar.gregorianToHijri(currentDate),
          isRecurring: true,
          isMultiDay: false,
          icon: '🌙',
        });
      }
      
      if (this.calendar.isFriday(currentDate)) {
        events.push({
          id: `jummah-${currentDate.toISOString().split('T')[0]}`,
          title: 'Jumu\'ah Prayer',
          titleArabic: 'صلاة الجمعة',
          description: 'Friday congregational prayer, read Surah Kahf, make du\'a',
          descriptionArabic: 'صلاة الجمعة، قراءة سورة الكهف، الدعاء',
          category: IbadahCategory.PRAYER,
          date: currentDate,
          hijriDate: this.calendar.gregorianToHijri(currentDate),
          isRecurring: true,
          isMultiDay: false,
          icon: '🕌',
          reminderTimes: ['11:00'],
        });
      }
    }
    
    return events;
  }

  private getMonthlyAyyamAlBidhEvents(year: number): IbadahEvent[] {
    const events: IbadahEvent[] = [];
    
    // Add Ayyam al-Bidh for each Hijri month
    for (let month = 1; month <= 12; month++) {
      [13, 14, 15].forEach(day => {
        const ayyamDate = this.calendar.hijriToGregorian(year, month, day);
        events.push({
          id: `ayyam-al-bidh-${year}-${month}-${day}`,
          title: `Ayyam al-Bidh Fast (${day}th)`,
          titleArabic: `صيام الأيام البيض (${day})`,
          description: `White days fast - ${day}th of ${this.calendar.getHijriMonthName(month)}`,
          descriptionArabic: `صيام الأيام البيض - ${day} من ${this.calendar.getHijriMonthName(month, true)}`,
          category: IbadahCategory.FASTING,
          date: ayyamDate,
          hijriDate: this.calendar.gregorianToHijri(ayyamDate),
          isRecurring: true,
          isMultiDay: false,
          icon: '🌙',
        });
      });
    }
    
    return events;
  }
}

export const ibadahEventsCalculator = new IbadahEventsCalculator();