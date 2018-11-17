const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;

function Rate(weight, price) {
  this.weight = weight;
  this.price = price;
}
var rates = {
  "Letters Stamped": [  new Rate(1, 0.50), new Rate(2, 0.71), new Rate(3.5, 1.13) ] // letters stamped
  ,"Letters Metered": [ new Rate(1, 0.47), new Rate(2, 0.89), new Rate(3.5, 1.10) ] // letters metered
  ,"Large Enevelopes (Flats)": [
      new Rate (1, 1.00) , new Rate(2, 1.21), new Rate(3, 1.42), new Rate(4, 1.63)
      , new Rate(5, 1.84), new Rate(6, 2.05), new Rate(7, 2.26), new Rate(8, 2.47)
      , new Rate(9, 2.68), new Rate(10, 2.89), new Rate(11, 3.10), new Rate(12, 3.31)
      , new Rate(13, 3.52)
  ] // large envelopes
  ,"First-Class Package Service -- Retail": [
    new Rate (4, 3.50) , new Rate(8, 3.75), new Rate(9, 4.10), new Rate(10, 4.45)
      , new Rate(11, 4.80), new Rate(12, 5.15), new Rate(13, 5.50)
  ] // first class package
}

function calculateRate(mailType, weight) {
  let typeRates = rates[mailType];
  console.log("weight is ", weight, " rates are ", typeRates);
  let rate = typeRates.find(tr => {
    if (weight <= tr.weight) {
      return true;
    }
    return false;
  });
  if (!rate) {
    throw new Error("Weight for this mailing type is too large");
  }
  return rate.price;
}

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  // .get('/shipping', (req, res) => res.render('pages/shipping'))
  .get('/getRate', (req, res) => {
    let mailType =req.query.type;
    let weight = +req.query.weight;

    try {
      if (isNaN(weight) || weight <= 0) {
        throw new Error("You sent an invalid weight.  It must be a valid number greater than 0.");
      }
      if (!rates[mailType]) {
        throw new Error("You sent an invalid mail type");
      }
      let data = {
        cost: calculateRate(mailType, weight)
        ,type: mailType
        ,weight: weight
      };
      res.render('pages/getRate', data);
    }
    catch (error) {
      console.error(error.message);
      res.render("pages/error", {message: error.message});
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
