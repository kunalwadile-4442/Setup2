export const aggregatePaginateHelper = async (model, pipeline, req, message = "Data fetched successfully") => {
  const page = parseInt(req.body.page) || 1; // Or req.query.page if you prefer query params
  const limit = parseInt(req.body.limit) || 10;

  const options = {
    page,
    limit,
    customLabels: {
      totalDocs: "totalRecords", // ✅ Rename to totalRecords
      docs: "items",
      limit: "limit",
      page: "currentPage"
    }
  };

  const result = await model.aggregatePaginate(model.aggregate(pipeline), options);

  return {
    success: true,
    message,
    data: result.items,
    pagination: {
      limit: result.limit,
      currentPage: result.currentPage,
      totalRecords: result.totalRecords
    }
  };
};