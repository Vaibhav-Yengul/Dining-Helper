const mongoose = require('../database/db.js');

const Schema = new mongoose.Schema({
  userId: {type: String, unique: true},
  createdPollings: [String],
  sharedPollings: [String]
});

var user = mongoose.model('user', Schema);

/**
 * addUer - Create a new User.
 * @param   {String} userId
 */
const addUser = async userId => {
  var exist = await user.exists({'userId': userId});
  if(!exist) {
    await user.create({
      userId: userId,
      createdPollings: [],
      sharedPollings: []
    });
  }
}

/**
 * addCreatedPollingsToUser - add created pollings to user.
 * @param   {Array of String} pollings - pollingIds of new created pollings which add to the user.
 * @param   {String} userId - userId of that user.
 */
const addCreatedPollingsToUser = async (pollings, userId) => {
  var exist = await user.exists({'userId': userId});
  if(exist) {
    await user.updateOne({'userId': userId}, {$addToSet: {'createdPollings':{$each: pollings}}}).exec();
  } else {
    console.log("not exist");
    await user.create({
      userId: userId,
      createdPollings: pollings,
      sharedPollings: []
     });
  }
}

/**
 * addSharedPollingsToUser - add shared pollings to user.
 * @param   {Array of String} pollings - pollingIds of new shared pollings which add to the user.
 * @param   {String} userId - userId of that user.
 */
const addSharedPollingsToUser = async (pollings, userId) => {
  var exist = await user.exists({'userId': userId});
  if(exist) {
    await user.updateOne({'userId': userId}, {$addToSet: {'sharedPollings': {$each: pollings}}}).exec();
  } else {
    await user.create({
      userId: userId,
      createdPollings: [],
      sharedPollings: pollings
     });
  }
}

/**
 * deleteCreatedPollingsToUser - delete created pollings of specific user.
 * @param   {Array of String} pollings - pollingIds of new created pollings which add to the user.
 * @param   {String} userId - userId of that user.
 */
const deleteCreatedPollingsToUser = async (pollings, userId) => {
  var exist = await user.exists({'userId': userId});
  if(exist) {
     await user.updateOne({'userId': userId}, {$pull: {'createdPollings': {$in: pollings}}}).exec();
  }
}

/**
 * deleteSharedPollingsToUser - delete shared pollings of specific user.
 * @param   {Array of String} pollings - pollingIds of new shared pollings which add to the user.
 * @param   {String} userId - userId of that user.
 */
const deleteSharedPollingsToUser = async (pollings, userId) => {
  var exist = await user.exists({'userId': userId});
  if(exist) {
    await await user.updateOne({'userId': userId}, {$pull: {'sharedPollings': {$in: pollings}}}).exec();
  }
}

module.exports = user;
module.exports.addUser = addUser;
module.exports.addCreatedPollingsToUser = addCreatedPollingsToUser;
module.exports.addSharedPollingsToUser = addSharedPollingsToUser;
module.exports.deleteCreatedPollingsToUser = deleteCreatedPollingsToUser;
module.exports.deleteSharedPollingsToUser = deleteSharedPollingsToUser;
