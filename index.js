"use strict";

let express = require('express');
let app = express();
const exphbs = require('express-handlebars');
const helpers = require('handlebars-helpers')();
const bodyParser = require('body-parser');
const handlebarSetup = exphbs({
  partialsDir: "./views/partials",
  viewPath: './views',
  layoutsDir: './views/layouts'
});

const moment = require('moment'); // require

// moment("timestamp").format("HH:mm");

const SettingsBill = require('./settings-bill');

const settingsBill = SettingsBill();

//make the style in ccs folder visible
app.use(express.static(__dirname + '/public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.engine('handlebars', handlebarSetup);
app.set('view engine', 'handlebars');

//Helper to round off 2 decimal place
helpers.toFixed = function (totals) {
  return (totals).toFixed(2);
}

//Helper to modify the timestamp
helpers.moment = function (totals) {
  return moment(totals).fromNow();
}

helpers.isdefined = function (totals) {
  return totals > 0;
}

// helpers.ifEq = function (totals) {
//   return settingsBill.hasReachedCriticalLevel;
// }




//reference the handlebar file: index.handlebars
app.get('/', function (req, res) {

  if (settingsBill.hasReachedCriticalLevel()) {
    res.render('index', {
      settings: settingsBill.getSettings(),
      totals: settingsBill.totals(),
      class: "danger"
    });

  } else if (settingsBill.hasReachedWarningLevel()) {
    res.render('index', {
      settings: settingsBill.getSettings(),
      totals: settingsBill.totals(),
      class: "warning"
    });

  } else {
    res.render('index', {
      settings: settingsBill.getSettings(),
      totals: settingsBill.totals(),
    });
  }


})


app.post('/settings', function (req, res) {

  settingsBill.setSettings({
    callCost: req.body.callCost,
    smsCost: req.body.smsCost,
    warningLevel: req.body.warningLevel,
    criticalLevel: req.body.criticalLevel,
  });

  // note that data can be sent to the template
  res.redirect('/');
});

//add section of the code, pay attention to bill type
app.post('/action', function (req, res) {

  settingsBill.recordAction(req.body.actionType)
  res.redirect('/');
});

//to display all the actions
app.get('/actions', function (req, res) {

  res.render('actions', { actions: settingsBill.actions() });

});


app.get('/actions/:actiontype', function (req, res) {
  const actionType = req.params.actiontype;
  res.render('actions', { actions: settingsBill.actionsFor(actionType) });
});


let PORT = process.env.PORT || 3011;

app.listen(PORT, function () {
  console.log('App starting at port:', PORT);
});
