module.exports = (res, statusCode, statusMessage, data) => {
  res.status(statusCode).json({
    message: statusMessage,
    data,
  });
};
