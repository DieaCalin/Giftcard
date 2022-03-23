/**
 * @namespace Hello
 */

 var server = require('server');
 server.get('Show', function (req, res, next) {
   res.render('ceva');
   var viewData = res.getViewData();
   next();
   res.setViewData(viewData);
 });
 
 module.exports = server.exports();

