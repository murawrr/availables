/* ============================================================================
   AVAILABILITY CALENDAR  —  edit this file to update the popup calendar.

   After you save/commit on GitHub, the website updates within ~1 minute.

   ----------------------------------------------------------------------------
   1) MONTHS  — which months the calendar shows.  Format "YYYY-MM".

   2) DATES   — your available appointment days. Each one becomes a coloured,
                clickable day on the calendar. Clicking it opens the booking
                page with that date already filled into the form.

        { date: "2026-07-07", place: "Busan", time: "18:00" },

        - date  : the day,  format "YYYY-MM-DD"
        - place : "Seoul", "Busan" or "Jeju"   (each has its own colour)
        - time  : OPTIONAL. Leave it out for all-day. Put any text you like,
                  e.g. "18:00"  or  "12:00 / 18:00".

   To add a day: copy a line, paste it, change the date/place/time.
   To remove a day: delete its line.
   ============================================================================ */

window.SCHEDULE = {

  months: ["2026-06", "2026-07"],

  dates: [
    // ----- Seoul -----
    { date: "2026-06-23", place: "Seoul" },
    { date: "2026-06-24", place: "Seoul" },
    { date: "2026-06-27", place: "Seoul" },
    { date: "2026-07-01", place: "Seoul" },
    { date: "2026-07-03", place: "Seoul" },
    { date: "2026-07-14", place: "Seoul" },
    { date: "2026-07-15", place: "Seoul" },
    { date: "2026-07-17", place: "Seoul" },
    { date: "2026-07-18", place: "Seoul" },
    { date: "2026-07-28", place: "Seoul" },
    { date: "2026-07-29", place: "Seoul" },
    { date: "2026-07-31", place: "Seoul" },

    // ----- Busan (July) -----
    { date: "2026-07-07", place: "Busan", time: "18:00" },
    { date: "2026-07-10", place: "Busan", time: "18:00" },
    { date: "2026-07-11", place: "Busan", time: "12:00 / 18:00" },
    { date: "2026-07-12", place: "Busan", time: "12:00" },

    // ----- Jeju (July) -----
    { date: "2026-07-21", place: "Jeju" },
    { date: "2026-07-22", place: "Jeju" },
    { date: "2026-07-23", place: "Jeju" },
    { date: "2026-07-24", place: "Jeju" },
    { date: "2026-07-25", place: "Jeju" },
  ],

};
