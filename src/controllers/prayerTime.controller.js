const { getPrayerTimes } = require("../utils/prayerTimes");
const PrayerTime = require("../models/PrayerTime");

exports.getPrayerTimes = async (req, res) => {
  const { date, latitude, longitude } = req.query;

  try {
    // First, check if there are custom prayer times set by an institution
    const customTimes = await PrayerTime.findOne({
      date: new Date(date),
    }).sort({ createdAt: -1 }); // Get the most recently created/updated times

    if (customTimes) {
      return res.json(customTimes);
    }

    // If no custom times, use the existing getPrayerTimes function
    const calculatedTimes = await getPrayerTimes(
      latitude,
      longitude,
      new Date(date)
    );
    res.json(calculatedTimes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching prayer times", error: error.message });
  }
};

exports.setCustomPrayerTimes = async (req, res) => {
  const { date, fajr, dhuhr, asr, maghrib, isha } = req.body;

  try {
    let prayerTime = await PrayerTime.findOne({
      institution: req.institutionId,
      date: new Date(date),
    });

    if (prayerTime) {
      // Update existing custom times
      prayerTime.fajr = fajr;
      prayerTime.dhuhr = dhuhr;
      prayerTime.asr = asr;
      prayerTime.maghrib = maghrib;
      prayerTime.isha = isha;
    } else {
      // Create new custom times
      prayerTime = new PrayerTime({
        institution: req.institutionId,
        date: new Date(date),
        fajr,
        dhuhr,
        asr,
        maghrib,
        isha,
        isCustom: true,
      });
    }

    await prayerTime.save();
    res.json(prayerTime);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error setting custom prayer times",
        error: error.message,
      });
  }
};
