const express = require('express');
const router = express.Router();
const passport = require('passport');
const passportConf = require('../passport');

const { validateBody, schemas } = require('../helpers/routeHelpers');
const UsersController = require('../controllers/users');

router.route('/register').post(validateBody(schemas.authSchema),UsersController.register);
router.route('/login').post(validateBody(schemas.authSchema),passport.authenticate('local',{ session:false }),UsersController.login);
router.route('/getData').get(passport.authenticate('jwt',{ session : false }),UsersController.getData);
router.route('/getToken').get(passport.authenticate('jwt',{ session : false }),UsersController.refresh);
router.route('/addRIG').post(validateBody(schemas.addRIG),passport.authenticate('jwt',{ session : false }),UsersController.addRIG);
router.route('/delRIG').post(validateBody(schemas.delRIG),passport.authenticate('jwt',{ session : false }),UsersController.delRIG);
router.route('/getRIG').get(passport.authenticate('jwt',{ session : false }),UsersController.getRIG);
router.route('/updateRIG').post(validateBody(schemas.updateRIG),passport.authenticate('jwt',{ session : false }),UsersController.updateRIG);

module.exports = router;