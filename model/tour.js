const mongoose = require('../util/database');

const tourSchema = mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true,
      required: [true, 'A Tour must required a Id'],
    },
    name: { type: String, required: [true, 'A tour must have a Name'] },
    duration: {
      type: Number,
      default: 10,
      required: [true, 'A Tour must required a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour must required a max group size'],
    },
    ratingsAverage: { type: Number },
    ratingsQuantity: { type: Number },
    price: { type: Number, required: [true, 'A Tour must required a '] },
    priceDiscount: { type: Number, default: 0 },
    summary: { type: String, required: [true, 'A summary is required'] },
    description: { type: String },
    imageCover: {
      type: String,
      required: [true, 'A Tour must required a Image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [String],
    visible: Boolean,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

const tours = mongoose.model('tour', tourSchema);

module.exports = tours;
