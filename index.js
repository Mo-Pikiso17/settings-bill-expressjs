let express = require('express');
let app = express();
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const handlebarSetup = exphbs({
  partialsDir: "./views/partials",
  viewPath: './views',
  layoutsDir: './views/layouts'
});

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


//reference the handlebar file: index.handlebars
app.get('/', function (req, res) {

  res.render('index', {
    settings: settingsBill.getSettings(),
    totals: settingsBill.totals(),
    totals: settingsBill.totalClass()

  });

});

app.post('/className', function (req, res) {

  settingsBill.totalClass({
    callTotalSettings: req.body.callTotalSettings,
    smsTotalSettings: req.body.smsTotalSettings,
    totalSettings: req.body.totalSettings
  })

  res.redirect('/');
});




app.post('/settings', function (req, res) {

  settingsBill.setSettings({
    callCost: req.body.callCost,
    smsCost: req.body.smsCost,
    warningLevel: req.body.warningLevel,
    criticalLevel: req.body.criticalLevel
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
