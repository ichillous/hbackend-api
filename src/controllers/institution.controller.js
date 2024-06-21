const User = require('../models/User');

exports.getNearestMosque = async (req, res) => {
    try {
      const { longitude, latitude } = req.query;
      const mosque = await User.findOne({
        role: 'institution',
        organizationType: 'mosque',
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            }
          }
        }
      }).select('name address prayerTimes');
      
      if (!mosque) {
        // If no mosque is found, return default prayer times
        const defaultPrayerTimes = await getPrayerTimes(latitude, longitude, new Date());
        return res.json({ 
          message: 'No mosques found nearby. Showing default prayer times.',
          prayerTimes: defaultPrayerTimes 
        });
      }
      
      res.json(mosque);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

exports.updatePrayerTimes = async (req, res) => {
  try {
    const institution = await User.findById(req.user.userId);
    if (!institution || institution.role !== 'institution' || institution.organizationType !== 'mosque') {
      return res.status(403).json({ message: 'Only mosques can update prayer times' });
    }

    institution.prayerTimes = req.body.prayerTimes;
    await institution.save();

    res.json({ message: 'Prayer times updated successfully', prayerTimes: institution.prayerTimes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add other institution-specific operations as needed