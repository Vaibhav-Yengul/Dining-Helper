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
 * @param   {Array of String} pollings - created pollingIds to be added to the user.
 * @param   {String} userId - userId of that user.
 */
const addCreatedPollingsToUser = async (pollingIds, userId) => {
  var exist = await user.exists({'userId': userId});
  if(exist) {
    await user.updateOne({'userId': userId}, {$addToSet: {'createdPollings':{$each: pollingIds}}}).exec();
  } else {
    console.log("not exist");
    await user.create({
      userId: userId,
      createdPollings: pollingIds,
      sharedPollings: []
     });
  }
}

/**
 * addSharedPollingsToUser - add shared pollings to user.
 * @param   {Array of String} pollings - shared pollingIds to be added to the user.
 * @param   {String} userId - userId of that user.
 */
const addSharedPollingsToUser = async (pollingIds, userId) => {
  var exist = await user.exists({'userId': userId});
  if(exist) {
    await user.updateOne({'userId': userId}, {$addToSet: {'sharedPollings': {$each: pollingIds}}}).exec();
  } else {
    await user.create({
      userId: userId,
      createdPollings: [],
      sharedPollings: pollingIds
     });
  }
}

/**
 * deleteCreatedPollingsToUser - delete created pollings of specific user.
 * @param   {Array of String} pollings -  created pollingIds to delete from user.
 * @param   {String} userId - userId of that user.
 */
const deleteCreatedPollingsToUser = async (pollingIds, userId) => {
  var exist = await user.exists({'userId': userId});
  if(exist) {
     await user.updateOne({'userId': userId}, {$pull: {'createdPollings': {$in: pollingIds}}}).exec();
  }
}

/**
 * deleteSharedPollingsToUser - delete shared pollings of specific user.
 * @param   {Array of String} pollings - shared pollingIds to delete from user.
 * @param   {String} userId - userId of that user.
 */
const deleteSharedPollingsToUser = async (pollingIds, userId) => {
  var exist = await user.exists({'userId': userId});
  if(exist) {
    await await user.updateOne({'userId': userId}, {$pull: {'sharedPollings': {$in: pollingIds}}}).exec();
  }
}

/**
 * deleteAllSharedPollings - delete shared pollings from all users.
 * @param   {Array of String} pollings -shared pollingIds to delete from all users.
 */
const deleteAllSharedPollings = async (pollingIds) => {
    await user.updateMany({'sharedPollings': {$in: pollingIds}}, {$pull: {'sharedPollings': {$in: pollingIds}}}).exec();
}

module.exports = user;
module.exports.addUser = addUser;
module.exports.addCreatedPollingsToUser = addCreatedPollingsToUser;
module.exports.addSharedPollingsToUser = addSharedPollingsToUser;
module.exports.deleteCreatedPollingsToUser = deleteCreatedPollingsToUser;
module.exports.deleteSharedPollingsToUser = deleteSharedPollingsToUser;
module.exports.deleteAllSharedPollings = deleteAllSharedPollings;
