export const aggregatePaginateHelper = async (
  model,
  matchQuery,
  page = 1,
  limit = 10,
  message = "Data fetched successfully"
) => {
  const pipeline = [
    { $match: matchQuery },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        password: 0,
        refreshToken: 0,
        resetOTP: 0,
        resetOTPExpire: 0,
      },
    },
  ];

  const options = {
    page,
    limit,
    customLabels: {
      totalDocs: "totalRecords",
      docs: "items",
      limit: "limit",
      page: "currentPage",
      totalPages: "totalPages",
    },
  };

  const result = await model.aggregatePaginate(model.aggregate(pipeline), options);

  return {
    users: result.items,
    pagination: {
      limit: result.limit,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalRecords: result.totalRecords,
    },
  };
};
