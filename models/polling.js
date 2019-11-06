const mongoose = require('../database/db.js');

const Schema = new mongoose.Schema({
  creator: String,
  subject: String,
  pollingEndTime: Date,
  placeMode: {type: Boolean, default: 0},
  multichoice: {type: Boolean, default: 0},
  options: [{
    content: String,
    creator: String,
    votedUser: [String]
  }],
  relatedUsersInfo:[{
    userId: String,
    availableTimeFrom: Date,
    availableTimeTo:Date,
    startPoint: String
  }]
});

const polling = mongoose.model('polling', Schema);

/**
 * startPolling - start a new polling
 * @param   {String} userId - who start the polling.
 * @param   {String} subject - subject of the polling.
 * @param   {Date} pollingEndTime - end time of the polling.
 * @param   {Boolean} placeMode - if this polling uses place mode, 1 represents yes, 0 represents not.
 * @param   {Boolean} multichoice - if this polling is multichoice, 1 represents yes, 0 represents not.
 * @param   {Array of Objects} options - options of the pollings.
 * @param   {Array of Objects} relatedUsersInfo - relatedUsersInfo of the pollings.
 */
const startPolling = async (userId, subject, pollingEndTime, placeMode, multichoice, options, relatedUsersInfo) => {
  await polling.create({
     creator: userId,
     subject: subject,
     pollingEndTime: pollingEndTime,
     placeMode: placeMode,
     multichoice: multichoice,
     options: options,
     relatedUsersInfo: relatedUsersInfo
   });
}

/**
 * addOptions - add options to specific polling.
 * @param   {String} pollingId - which polling.
 * @param   {Array of Objects} options - options add to the polling
 */
const addOptions = async (pollingId, options) => {
  options.forEach((item,index) => {
    polling.updateOne({'_id': pollingId, 'options.content': {$ne: item.content}}, {$push:{options: item}}).exec();
  });
}

/**
 * updateOptions - update option content to specific polling.
 * @param   {String} pollingId - which polling.
 * @param   {Array of String} oldContents - old contents to specify options.
 * @param   {Array of String} newContents - new contents that changed to.
 */
const updateOptions = async (pollingId, oldContents, newContents) => {
  newContents.forEach( async (item, index) => {
    var exist = await polling.exists({'_id': pollingId, 'options.content':item});
    if(!exist) {
      await polling.updateOne({'_id': pollingId, 'options.content': oldContents[index]}, {$set:{'options.$.content': item}}).exec();
    }
  });
}

/**
 * deleteOptions - delete options of specific polling.
 * @param   {String} pollingId - which polling.
 * @param   {Array of String} oldContents - old contents to specify options.
 */
const deleteOptions = async (pollingId, oldContents) => {
  oldContents.forEach(async (item, index) => {
    await polling.updateOne({'_id': pollingId, 'options.content': item}, {$set: {'options.$': ''}}).exec();
    await polling.updateOne({'_id': pollingId}, {$pull: {options: ''}}).exec();
  });
}

/**
 * voteOptions - user votes options.
 * @param   {String} userId - - who start the polling.
 * @param   {String} pollingId - which polling.
 * @param   {Array of Number} contents - contents to specify which options to vote.
 */
const voteOptions = async (userId, pollingId, contents) => {
  contents.forEach((item, index) => {
    polling.updateOne({'_id': pollingId, 'options.content': item}, {$addToSet: {'options.$.votedUser': userId}}).exec();
  });
}

/**
 * addUsersInfo - add related user Infos to specific polling.
 * @param   {String} pollingId - which polling.
 * @param   {Array of Object} relatedUsersInfo - related user Infos for the polling.
 */
const addUsersInfo = async (pollingId, relatedUsersInfo) => {
  relatedUsersInfo.forEach((item,index) => {
    polling.updateOne({'_id': pollingId, 'relatedUsersInfo.userId': {$ne: item.userId}}, {$push:{relatedUsersInfo:item}}).exec();
  });
}

/**
 * changeAvaliableTimes - change available times for corresponding users to specific polling.
 * @param   {String} pollingId - which polling.
 * @param   {Array of String} - which users to change
 * @param   {Array of Date} availableTimes - what availableTimeFroms for those users to change.
 * @param   {Array of Date} availableTimes - what availableTimeTos for those users to change.
 */
const changeAvaliableTimes = async (pollingId, userIds, availableTimeFroms, availableTimeTos) => {
  userIds.forEach((item, index) => {
    polling.updateOne({'_id': pollingId, 'relatedUsersInfo.userId': item},
    {$set:{'relatedUsersInfo.$.availableTimeFrom': availableTimeFroms[index], 'relatedUsersInfo.$.availableTimeTo': availableTimeTos[index]}}).exec();
  });
}

/**
 * changeStartPoints - change start points for corresponding users to specific polling.
 * @param   {String} pollingId - which polling.
 * @param   {Array of String} - which users to change
 * @param   {Array of String} startPoints - what start points for those users to change.
 */
const changeStartPoints = async (pollingId, userIds, startPoints) => {
  userIds.forEach((item, index) => {
    polling.updateOne({'_id': pollingId, 'relatedUsersInfo.userId': item}, {$set:{'relatedUsersInfo.$.startPoint': startPoints[index]}}).exec();
  });
}

/**
 * deleteUsersInfo - delete related user Infos for corresponding users to specific polling.
 * @param   {String} pollingId - which polling.
 * @param   {Array of String} userIds - which users to delete user infos for the polling.
 */
const deleteUsersInfo = async (pollingId, userIds) => {
    await polling.updateOne({'_id': pollingId}, {$pull: {'relatedUsersInfo': {'userId': {$in: userIds} } } }).exec();
}

module.exports = polling;
module.exports.startPolling = startPolling;
module.exports.addOptions = addOptions;
module.exports.updateOptions = updateOptions;
module.exports.deleteOptions = deleteOptions;
module.exports.voteOptions = voteOptions;
module.exports.addUsersInfo = addUsersInfo;
module.exports.changeAvaliableTimes = changeAvaliableTimes;
module.exports.changeStartPoints = changeStartPoints;
module.exports.deleteUsersInfo = deleteUsersInfo;
