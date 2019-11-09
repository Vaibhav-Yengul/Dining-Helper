var mongoose = require('mongoose');

const uri = "mongodb+srv://Team_using:Team5@cluster0-pby0b.gcp.mongodb.net/DiningHelper?retryWrites=true&w=majority";
mongoose.connect(uri, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  bufferMaxEntries: 0,
  autoReconnect: true,
  poolSize: 5
});

//when connection meets error
mongoose.connection.on("error", err => {
  console.error("connecting failed "+ err);
});

//when connection succeeds
mongoose.connection.on("open", () => {
  console.log("connecting succeeded");
});

//when connection goes down
mongoose.connection.on("disconnected", () => {
  console.log("connection disconnected");
});

module.exports = mongoose;
