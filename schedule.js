/* ============================================================================
   AVAILABILITY CALENDAR  —  edit this file to update the popup. That's it.

   You only change the two lists below. Keep the quotes and commas as shown.
   After you save/commit on GitHub, the website updates within ~1 minute.

   ----------------------------------------------------------------------------
   1) MONTHS  — which months the calendar shows.
        Format: "YYYY-MM"  (year-month).  Example: "2026-08" is August 2026.
        You can list one, two, or more months.

   2) TRIPS   — the days you are AWAY from Seoul.
        Each line is one trip:
            { place: "Busan", from: "2026-07-06", to: "2026-07-12" },
        - place : "Busan" or "Jeju"   (these get their own colours)
        - from  : first day,  format "YYYY-MM-DD"
        - to    : last day,   format "YYYY-MM-DD"   (this day is included)
        Every day that is NOT inside a trip is shown as Seoul automatically.
        If you have no trips, leave it like this:   trips: []

   Tip: to add another trip, copy a whole line, paste it on a new line,
        and change the place/dates. Keep the comma at the end of each line.
   ============================================================================ */

window.SCHEDULE = {

  months: ["2026-06", "2026-07"],

  trips: [
    { place: "Busan", from: "2026-07-06", to: "2026-07-12" },
    { place: "Jeju",  from: "2026-07-20", to: "2026-07-26" },
  ],

};
