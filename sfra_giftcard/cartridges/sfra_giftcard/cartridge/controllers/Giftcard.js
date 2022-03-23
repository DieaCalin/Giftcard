/**
 * @namespace Hello
 */

 var server = require('server');
 server.get('Show', function (req, res, next) {
    //var giftcardform = server.forms.getForm('giftcard');
   res.render('/giftcard/giftcard');

   var viewData = res.getViewData();
   next();
   res.setViewData(viewData);
 });
 
 module.exports = server.exports();

