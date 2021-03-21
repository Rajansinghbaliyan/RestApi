const Tours = require('../model/tour');
const APIFeatures = require('../util/apiFeatures');
const respond = require('../services/respond');

exports.checkParamId = (req, res, next, val) => {
  console.log('The param method is called');
  console.log(`The value of the param Id is ${val}`);
  next();
};

exports.getAllTours = async (req, res, next) => {
  try {
    const features = new APIFeatures(Tours.find(), req.query);

    features.filter().sort().fields().limit();
    const tour = await features.query;

    // res.status(200).json({
    //   status: 'success',
    //   requestedAt: req.requestTime,
    //   data: { tour },
    // });
    respond(res,201,'success',tour);
  } catch (err) {
    console.log(err);
    //const errMessage = err.message;
    return res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getTopFiveTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price,-ratingAverage';
  console.log(req.query);
  next();
};

exports.checkBody = (req, res, next) => {
  const data = req.body;
  console.log(data);
  if (!data.name || !data.price)
    return res.status(400).json({
      status: 'fail',
      message: 'Bad Request',
    });
  next();
};

exports.createTour = async (req, res, next) => {
  try {
    const tour = await Tours.create(req.body);

    // res.status(201).json({
    //   status: 'success',
    //   message: 'Request is successful',
    //   data: { tour },
    // });
    respond(res,201,'success',tour);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Not created',
      data: { err },
    });
  }
};

exports.getTour = (req, res, next) => {
  const id = parseInt(req.params.id);
  Tours.findOne({ id: id })
    .then((tour) => {
      // return res.status(200).json({
      //   status: 'success',
      //   data: { tour },
      // });
      respond(res,200,'success',tour);
    })
    .catch((err) => {
      return res.status(400).json({
        status: 'fail',
        message: 'No tour found',
        data: { err },
      });
    });
};

exports.updateTour = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const tour = await Tours.findOneAndUpdate({ id: id }, req.body, {
      new: true,
    });
    // res.status(200).json({
    //   status: 'success',
    //   message: 'updated successfully',
    //   data: { tour },
    // });
    respond(res,200,'success',tour);
  } catch (err) {
    return res.status(400).json({
      status: 'fail',
      message: 'No tour found',
      data: { err },
    });
  }
};

exports.deleteTour = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    console.log(req.body);
    const tour = await Tours.findOneAndUpdate({ id: id }, req.body, {
      new: true,
    });
    //console.log(tour);
    // return res.status(200).json({
    //   status: 'success',
    //   data: { tour },
    // });
    respond(res,200,'success',tour);
  } catch (err) {
    return res.status(400).json({
      status: 'fail',
      message: 'No tour found',
      data: { err },
    });
  }
};

exports.getToursStats = async (req, res, next) => {
  try {
    const stats = await Tours.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: '$difficulty', //group for each and every difficulty
          numTours: { $sum: 1 }, //it will add 1 to sum for each record passed into it
          countRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          maxPrice: { $max: '$price' },
          minPrice: { $min: '$price' },
        },
      },
      {
        $sort: {
          avgPrice: 1,
        },
      },
    ]);

    console.log(stats);
    // return res.status(200).json({
    //   status: 'success',
    //   data: { stats },
    // });
    return respond(res,200,'success',stats);
  } catch (err) {
    return res.status(400).json({
      status: 'fail',
      message: 'No tour found',
      data: { err },
    });
  }
};
