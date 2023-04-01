const mongoose = require('mongoose');

module.exports = (db_name) => {
  mongoose.connect(`mongodb://localhost:27017/${db_name}`, {
      useNewUrlParser: true
    })
    .then(() => {
      console.log('Connected to database!');
    })
    .catch((error) => {
      console.error('Failed to connect to database!', error);
    });

  // mongoose.connect(`${process.env.DB_URI}`,{
  //     useNewUrlParser: true
  //   })
  //   .then(() => {
  //     console.log('Connected to database!');
  //   })
  //   .catch((error) => {
  //     console.error('Failed to connect to database!', error);
  //   });
  // return mongoose.connect(
  //   `${process.env.DB_URI}`,
  //   () => {
  //     console.log("MongoDB Connection Successful");
  //   },
  //   (e) => console.error(e)
  // );
};