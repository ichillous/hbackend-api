exports.paginateResults = async (model, query, page, limit) => {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skipNum = (pageNum - 1) * limitNum;
    
    const results = await model.find(query)
      .skip(skipNum)
      .limit(limitNum);
    
    const total = await model.countDocuments(query);
    
    return {
      results,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalResults: total
    };
  };