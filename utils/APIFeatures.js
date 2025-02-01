class APIFeatures {
  constructor(query, querystring, model) {
    this.query = query;
    this.querystring = querystring;
  }

  filter() {
    let queryobj = { ...this.querystring };
    const excludedfeilds = ['page', 'sort', 'limit', 'feilds'];
    excludedfeilds.forEach((el) => delete queryobj[el]);

    let querystring = JSON.stringify(queryobj);
    querystring = querystring.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`,
    );
    // console.log(queryobj);
    this.query = this.query.find(JSON.parse(querystring));
    return this;
  }

  sort() {
    if (this.querystring.sort) {
      const sortby = this.querystring.sort.split(',').join(' ');
      this.query = this.query.sort(sortby);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFeilds() {
    if (this.querystring.feilds) {
      const feilds = this.querystring.feilds.split(',').join(' ');
      // console.log(feilds);
      this.query = this.query.select(feilds);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    const page = this.querystring.page * 1 || 1;
    const limit = this.querystring.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  lean() {
    this.query = this.query.lean({ virtuals: true });
    return this;
  }
}

module.exports = APIFeatures;
