// utils/paginationHelper.js

export const paginate = async (model, options = {}) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const filters = options.filters || {};
  const sort = options.sort || { createdAt: -1 };
  const projection = options.projection || {};

  const skip = (page - 1) * limit;

  const [totalCount, items] = await Promise.all([
    model.countDocuments(filters),
    model.find(filters, projection).sort(sort).skip(skip).limit(limit),
  ]);

  return {
    items,
    pagination: { 
      total_records: totalCount,
      record_limit: limit,
      current_page: page,
    },
  };
};
