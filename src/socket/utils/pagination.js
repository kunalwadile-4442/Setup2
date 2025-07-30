export const buildPagination = async (model, query, page = 1, limit = 10) => {
  const totalDocs = await model.countDocuments(query)

  return {
    currentPage: page,
    totalPages: Math.ceil(totalDocs / limit),
    totalDocs,
    hasNext: page < Math.ceil(totalDocs / limit),
    hasPrev: page > 1,
  }
}
