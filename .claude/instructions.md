You are an expert React Native developer.
Build a **cross-platform mobile app** (React Native + Expo) called **"ibadah365"** that provides Muslims with a yearly ibadah reminder & calendar.

---

### Core Features

#### 1. 📅 Calendar of Ibadah Events

The app must calculate and show, without a backend, all key Islamic events:

- **Sunnah Fasts**

  - Mondays & Thursdays
  - Ayyam al-Bidh (13th, 14th, 15th of each Hijri month)

- **Special Fasts**

  - Ashura (10 Muharram, plus optional 9th or 11th)
  - Arafah (9 Dhul-Hijjah)
  - Six Days of Shawwal
  - Sha‘ban voluntary fasts (esp. mid-Sha‘ban)

- **Ramadan**

  - Full month highlight
  - Daily fasting reminder
  - Taraweeh reminder
  - I‘tikaf (last 10 nights)
  - Laylatul Qadr reminders (21, 23, 25, 27, 29 nights)

- **Eid & Hajj Season**

  - Eid al-Fitr prayer reminder
  - Eid al-Adha prayer reminder
  - Dhul-Hijjah first 10 days
  - Day of Arafah fast
  - **Takbeer Tashreeq** reminders after each Fard prayer
    - Start: Fajr 9 Dhul-Hijjah → End: Asr 13 Dhul-Hijjah

- **Weekly / Daily Acts**

  - Jumu‘ah reminders (Surah Kahf, du‘a, Ghusl)
  - Sunnah prayers (Duha, Tahajjud, Witr, Rawatib)
  - Daily Adhkar (morning & evening)
  - Optional weekly sadaqah reminder

- **Forbidden Days**
  - Eid al-Fitr (1 Shawwal)
  - Eid al-Adha (10 Dhul-Hijjah)
  - Days of Tashreeq (11–13 Dhul-Hijjah)

---

#### 2. ⏰ Notifications

- Local notifications only (Expo Notifications).
- Schedule reminders for each event.
- Handle **multi-day events**:
  - Ramadan → daily reminders
  - Last 10 nights → nightly reminders
  - Takbeer Tashreeq → reminders after every Fard prayer

---

#### 3. 🌙 Hijri/Gregorian Calendar

- Use a local Islamic date calculation library (`hijri-date` or custom converter).
- **User-adjustable Hijri date offset** (+1 or -1 days) in **Settings** to match local moon sighting.
- Store preferences in **AsyncStorage** so adjustments persist.

---

#### 4. ⚙️ Settings Page

- Toggle which categories of reminders to enable (fasting, prayers, adhkar, Ramadan, Eid, Takbeer, etc.).
- Adjust **Hijri offset (+/- days)** for local moon sighting.
- Adjust **reminder times** (e.g., 8PM night before, Fajr morning, etc.).
- Language toggle (English/Arabic).
- Dark mode toggle.

---

#### 5. 🕌 Tech Stack

- **React Native + Expo** (monolith, single repo).
- **Expo Notifications** for local push.
- **AsyncStorage** for user settings & overrides.
- No backend, no external DB.

---

#### 6. UI / UX

- Simple, modern Islamic design.
- Calendar view (month) + List view (upcoming events).
- Icons for categories:
  - 🌙 fasting
  - 🕌 prayer
  - 📖 Qur’an
  - 🎉 Eid
  - 🕋 Hajj
  - 🔊 Takbeer

---

### Deliverables

- A single Expo project with:
  - Calendar screen with all events
  - Notification scheduling logic
  - Settings screen for user adjustments
- README with setup instructions.
