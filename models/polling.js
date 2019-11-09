const mongoose = require('../database/db.js');
const user = require('./user');

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
 * @returns {String} _id - pollingId returned.
 */
const startPolling = async (userId, subject, pollingEndTime, placeMode, multichoice, options, relatedUsersInfo) => {
  var pollingId;
  var doc = await polling.create({
     creator: userId,
     subject: subject,
     pollingEndTime: pollingEndTime,
     placeMode: placeMode,
     multichoice: multichoice,
     options: options,
     relatedUsersInfo: relatedUsersInfo
   });
   pollingId = doc._id;
   await user.addCreatedPollingsToUser([pollingId], userId);
   return pollingId;
}

/**
 * deletePolling - delete polling.
 * @param   {String} userId - check the user who wants to delete polling.
 * @param   {String} pollingId - which polling to delete.
 */
const deletePolling = async (userId, pollingId) => {
  var doc = await polling.findOne({'_id': pollingId}).exec();
  if(userId === doc.creator) {
    await polling.deleteOne({'_id': pollingId}).exec();
    await user.deleteCreatedPollingsToUser([pollingId], userId);
    await user.deleteAllSharedPollings([pollingId]);
  }
}

/**
 * addOptions - add options to specific polling.
 * @param   {String} pollingId - which polling.
 * @param   {Array of Objects} options - options add to the polling
 */
const addOptions = async (pollingId, options) => {
  return new Promise((resolve, reject) => {
    options.forEach( async (item, index, array) => {
      await polling.updateOne({'_id': pollingId, 'options.content': {$ne: item.content}}, {$push:{options: item}}).exec();
      if(index === array.length-1) resolve();
    });
  });
}

/**
 * updateOptions - update option content to specific polling.
 * @param   {String} pollingId - which polling.
 * @param   {Array of String} oldContents - old contents to specify options.
 * @param   {Array of String} newContents - new contents that changed to.
 */
const updateOptions = async (pollingId, oldContents, newContents) => {
  return new Promise((resolve, reject) => {
    newContents.forEach( async (item, index, array) => {
      var exist = await polling.exists({'_id': pollingId, 'options.content':item});
      if(!exist) {
        await polling.updateOne({'_id': pollingId, 'options.content': oldContents[index]}, {$set:{'options.$.content': item}}).exec();
      }
      if(index === array.length-1) resolve();
    });
  });
}

/**
 * deleteOptions - delete options of specific polling.
 * @param   {String} pollingId - which polling.
 * @param   {Array of String} oldContents - old contents to specify options.
 */
const deleteOptions = async (pollingId, oldContents) => {
  return new Promise((resolve, reject) => {
    oldContents.forEach( async (item, index, array) => {
      await polling.updateOne({'_id': pollingId, 'options.content': item}, {$set: {'options.$': ''}}).exec();
      await polling.updateOne({'_id': pollingId}, {$pull: {options: ''}}).exec();
      if(index === array.length-1) resolve();
    });
  });
}

/**
 * voteOptions - user votes options.
 * @param   {String} userId - - who start the polling.
 * @param   {String} pollingId - which polling.
 * @param   {Array of Number} contents - contents to specify which options to vote.
 */
const voteOptions = async (userId, pollingId, contents) => {
  return new Promise((resolve, reject) => {
    contents.forEach( async (item, index, array) => {
      await polling.updateOne({'_id': pollingId, 'options.content': item}, {$addToSet: {'options.$.votedUser': userId}}).exec();
      if(index === array.length-1) resolve();
    });
  });
}

/**
 * addUsersInfo - add related user Infos to specific polling.
 * @param   {String} pollingId - which polling.
 * @param   {Array of Object} relatedUsersInfo - related user Infos for the polling.
 */
const addUsersInfo = async (pollingId, relatedUsersInfo) => {
  return new Promise((resolve, reject) => {
    relatedUsersInfo.forEach( async (item, index, array) => {
      await polling.updateOne({'_id': pollingId, 'relatedUsersInfo.userId': {$ne: item.userId}}, {$push:{relatedUsersInfo:item}}).exec();
      if(index === array.length-1) resolve();
    });
  });
}

/**
 * deleteUsersInfo - delete related user Infos for corresponding users to specific polling.
 * @param   {String} pollingId - which polling.
 * @param   {Array of String} userIds - which users to delete user infos for the polling.
 */
const deleteUsersInfo = async (pollingId, userIds) => {
    await polling.updateOne({'_id': pollingId}, {$pull: {'relatedUsersInfo': {'userId': {$in: userIds}}}}).exec();
}

/**
 * changeAvaliableTimes - change available times for corresponding users to specific polling.
 * @param   {String} pollingId - which polling.
 * @param   {Array of String} - which users to change
 * @param   {Array of Date} availableTimes - what availableTimeFroms for those users to change.
 * @param   {Array of Date} availableTimes - what availableTimeTos for those users to change.
 */
const changeAvaliableTimes = async (pollingId, userIds, availableTimeFroms, availableTimeTos) => {
  return new Promise((resolve, reject) => {
    userIds.forEach( async (item, index, array) => {
      await polling.updateOne({'_id': pollingId, 'relatedUsersInfo.userId': item},
      {$set:{'relatedUsersInfo.$.availableTimeFrom': availableTimeFroms[index], 'relatedUsersInfo.$.availableTimeTo': availableTimeTos[index]}}).exec();
      if(index === array.length-1) resolve();
    });
  });
}

/**
 * changeStartPoints - change start points for corresponding users to specific polling.
 * @param   {String} pollingId - which polling.
 * @param   {Array of String} - which users to change
 * @param   {Array of String} startPoints - what start points for those users to change.
 */
const changeStartPoints = async (pollingId, userIds, startPoints) => {
  return new Promise((resolve, reject) => {
    userIds.forEach( async (item, index, array) => {
      await polling.updateOne({'_id': pollingId, 'relatedUsersInfo.userId': item}, {$set:{'relatedUsersInfo.$.startPoint': startPoints[index]}}).exec();
      if(index === array.length-1) resolve();
    });
  });
}

module.exports = polling;
module.exports.startPolling = startPolling;
module.exports.deletePolling = deletePolling;
module.exports.addOptions = addOptions;
module.exports.updateOptions = updateOptions;
module.exports.deleteOptions = deleteOptions;
module.exports.voteOptions = voteOptions;
module.exports.addUsersInfo = addUsersInfo;
module.exports.deleteUsersInfo = deleteUsersInfo;
module.exports.changeAvaliableTimes = changeAvaliableTimes;
module.exports.changeStartPoints = changeStartPoints;
