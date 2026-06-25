const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * Returns a UTC Date object that represents the start of the current IST hour.
 * Example: If current time is 22:15 IST (16:45 UTC), 
 * the start of the IST hour is 22:00 IST (16:30 UTC).
 */
const getCurrentSlot = (date = new Date()) => {
  // Convert UTC time to IST time
  const istTime = new Date(date.getTime() + IST_OFFSET_MS);
  
  // Set to the top of the hour in IST
  istTime.setUTCMinutes(0, 0, 0);
  
  // Convert back to UTC to store in database
  return new Date(istTime.getTime() - IST_OFFSET_MS);
};

/**
 * Returns a UTC Date object that represents the start of the previous IST hour.
 */
const getPreviousSlot = (date = new Date()) => {
  const currentSlot = getCurrentSlot(date);
  return new Date(currentSlot.getTime() - (60 * 60 * 1000));
};

module.exports = {
  getCurrentSlot,
  getPreviousSlot
};
