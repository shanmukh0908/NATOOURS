const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
);

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price)
    return res.status(400).json({
      status: 'error',
      message: 'both name and price are required in the body',
    });
  next();
};

exports.checkId = (req, res, next, val) => {
  // console.log(`id : ${val}`);
  const tour = tours.find((el) => el.id === Number(val));
  req.tour = tour;
  if (!tour)
    return res.status(404).json({ status: 'fail', message: 'invalid id' });
  next();
};

exports.gettours = (req, res) => {
  // console.log(req.requestedAt);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestedAt,
    data: { tours },
  });
};

exports.posttour = (req, res) => {
  const newid = tours[tours.length - 1].id + 1;
  const tour = Object.assign({ id: newid }, req.body);

  tours.push(tour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      // console.log(err);
    },
  );
  res.status(201).json({ status: 'success', data: { tour } });
};

exports.gettour = (req, res) => {
  res.status(200).json({ status: 'success', data: { tour: req.tour } });
};

exports.updatetour = (req, res) => {
  res
    .status(200)
    .json({ status: 'success', data: { ...req.tour, ...req.body } });
};

exports.deletetour = (req, res) => {
  res.status(204).json({ status: 'success', data: { tour: null } });
};
