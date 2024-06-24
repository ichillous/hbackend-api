const User = require("../models/User");
const Event = require("../models/Event");

exports.search = async (req, res) => {
  const { query, type, sort, page, limit } = req.query;

  const searchQuery = {};
  if (query) searchQuery.$text = { $search: query };
  if (type) searchQuery.type = type;

  const sortOption = sort ? { [sort]: 1 } : { createdAt: -1 };

  const options = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 10,
    sort: sortOption,
  };

  try {
    let results;
    switch (type) {
      case "users":
        results = await User.paginate(searchQuery, options);
        break;
      case "events":
        results = await Event.paginate(searchQuery, options);
        break;
      // ... other types
      default:
        // Search across all types
        const userResults = await User.paginate(searchQuery, options);
        const eventResults = await Event.paginate(searchQuery, options);
        // Combine and sort results
        results = combineResults(userResults, eventResults);
    }

    res.json(results);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error performing search", error: error.message });
  }
};
