class APIFeatures {

    constructor(query, queryString) {
      this.query = query;
      this.queryString = queryString;
    }
    filter() {
      let queryObj = { ...this.queryString };
      const excludeField = ['limit', 'page', 'sort', 'fields'];
      excludeField.forEach((el) => delete queryObj[el]);
      // const query = await Tours.find()  // these are the query functions by mongoose
      // .where('difficulty')
      // .equals('easy')
      // .where('price')
      // .lte(400);
      
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(
        /\b(gt|gte|lt|lte|eq)\b/g,
        (match) => `$${match}`
      );
      queryObj = JSON.parse(queryStr);
      // console.log(this.queryString);
      // console.log(queryObj);
      this.query = this.query.find(queryObj); //this is the one way to filter our data
      return this;
    }
    sort() {
      if (this.queryString.sort) {
        let sortBy = this.queryString.sort.split(',').join(' ');
        this.query.sort(sortBy);
      } else {
        this.query.sort('-id');
      }
      return this;
    }
    fields() {
      if (this.queryString.fields) {
        console.log(this.queryString.fields);
        let field = this.queryString.fields.split(',').join(' ');
        console.log(field);
        this.query.select(field);
      } else {
        this.query.select('-__v'); //with - we could remove the certain fields from our query
      }
      return this;
    }
    limit() {
      const page = this.queryString.page * 1 || 1;  //default pagination   this.queryString.page *1 to convert string to int
      const limit = this.queryString.limit * 1 || 5; // default limit
      let itemToSkip = 0;
      if (page === 1 || page === 0) {
        itemToSkip = 0;
      } else {
        itemToSkip = (page - 1) * limit;
      }
      this.query.skip(itemToSkip).limit(limit);
      return this;
    }
  }
  
  module.exports = APIFeatures;









  /*
  let queryObj = { ...req.query };
  const excludeField = ['limit', 'page', 'sort', 'fields'];
  excludeField.forEach((el) => delete queryObj[el]);
  // const query = await Tours.find()  // these are the query functions by mongoose
  // .where('difficulty')
  // .equals('easy')
  // .where('price')
  // .lte(400);
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|eq)\b/g,
    (match) => `$${match}`
  );
  queryObj = JSON.parse(queryStr);
  console.log(req.query);
  const query = Tours.find(queryObj); //this is the one way to filter our data
  */
  // if (req.query.sort) {
  // let sortBy = req.query.sort.split(',').join(' ');
  // query.sort(sortBy);
  // } else {
  // query.sort('-id');
  // }
  // if (req.query.fields) {
  // console.log(req.query.fields);
  // let field = req.query.fields.split(',').join(' ');
  // console.log(field);
  // query.select(field);
  // } else {
  // query.select('-__v');
  // }
  // const page = req.query.page * 1 || 1;
  // const limit = req.query.limit * 1 || 5;
  // let itemToSkip = 0;
  // if (page === 1 || page === 0) {
  // itemToSkip = 0;
  // } else {
  // itemToSkip = (page - 1) * limit;
  // }
  // query.skip(itemToSkip).limit(limit);
  // if (req.query.page) {
  // const numOfTours = await Tours.countDocuments();
  // if (itemToSkip >= numOfTours) {
  // throw new Error('Exceed the page limit');
  // }
  // }
