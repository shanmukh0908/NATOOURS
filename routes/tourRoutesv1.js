const tourController = require('../controllers/tourController');

const router = express.Router();

router
  .route('/')
  .get(tourController.gettours)
  .post(tourController.checkBody, tourController.posttour);
router
  .route('/:id')
  .get(tourController.gettour)
  .patch(tourController.updatetour)
  .delete(tourController.deletetour);

module.exports = router;
