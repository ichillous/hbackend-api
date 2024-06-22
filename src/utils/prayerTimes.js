const axios = require('axios');

const getPrayerTimes = async (latitude, longitude, date) => {
  try {
    // Make sure this is working. I confirmed it uses lat and long
    const response = await axios.get('http://api.aladhan.com/v1/timingsByAddress/:date', {
      params: {
        latitude,
        longitude,
        method: 2, // ISNA calculation method
        date: date.toISOString().split('T')[0]
      }
    });

    const timings = response.data.data.timings;
    return {
      fajr: timings.Fajr,
      dhuhr: timings.Dhuhr,
      asr: timings.Asr,
      maghrib: timings.Maghrib,
      isha: timings.Isha
    };
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    throw error;
  }
};

module.exports = { getPrayerTimes };