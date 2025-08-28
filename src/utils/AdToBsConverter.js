import NepaliDate from 'nepali-date-converter';
const nepaliDate = NepaliDate.default;

export function AdToBsDate(date) {
  // Step 1: parse input as AD UTC
  // const utcDate = new Date(date);
  console.log(date);

  // Step 2: add +5:45 offset (Nepal Time)
  // const nepalTime = new Date(utcDate.getTime() + (5 * 60 + 45) * 60 * 1000);
  const nepalTime = new Date(date);

  // Step 3: convert AD (Nepal Time) → BS
  const bsDate = nepaliDate.fromAD(nepalTime);

  // Step 4: format BS date (YYYY-MM-DD)
  return bsDate.format("YYYY-MM-DD hh:mm");

}