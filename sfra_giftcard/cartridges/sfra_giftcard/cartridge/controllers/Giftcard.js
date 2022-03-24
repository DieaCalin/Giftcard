/**
 * @namespace Hello
 */

 var server = require('server');
 var URLUtils = require('dw/web/URLUtils');
 var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
 var ProductMgr = require('dw/catalog/ProductMgr');

 server.get(
   'Show',
   function (req, res, next) {
      //var giftcardform = server.forms.getForm('giftcard');
    var actionUrl = URLUtils.url('Giftcard-Handler');
    var giftcardForm = server.forms.getForm('giftcard');
    // giftcardForm.clear();
    res.render('/giftcard/giftcard', {
      actionUrl: actionUrl,
      giftcardForm: giftcardForm
    });
    next();
    }
 );

 server.post(
  'Handler',
  server.middleware.https,
  function (req, res, next) {
      var BasketMgr = require('dw/order/BasketMgr');
      var Transaction = require('dw/system/Transaction');
      var currentSite = require('dw/system/Site').getCurrent();
      var CartModel = require('*/cartridge/models/cart');
      var ProductLineItemsModel = require('*/cartridge/models/productLineItems');
      var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
      var cartHelper = require('*/cartridge/scripts/cart/cartHelpers');
      var Money = require('dw/value/Money');
      var formatMoney = require('dw/util/StringUtils').formatMoney;
      var currentBasket = BasketMgr.getCurrentOrNewBasket();
      if (!currentBasket) {
          res.json({
              success: false
          });
          return next();
      }
      

      //validate form !!!
 
      var productId = 'gift-card-25';

      var giftcard = server.forms.getForm('giftcard');
      var quantity = 1;
      var addToCartResult;
      var recipientName = giftcard.sender.value
      var senderName = giftcard.recipient
      var gcMessage = giftcard.message
      var giftCardJson;

      giftCardJson = {
          recipientName: recipientName,
          senderName: senderName,
          gcMessage: gcMessage
      };
      Transaction.wrap(function () {
          if (productId) {
              addToCartResult = cartHelper.addGiftCardProductToCart(
                  currentBasket,
                  productId,
                  quantity,
                  req,
                  giftCardJson
              );
          }
          if (!addToCartResult.error) {
              cartHelper.ensureAllShipmentsHaveMethods(currentBasket);
              basketCalculationHelpers.calculateTotals(currentBasket);
          }
      });
      var quantityTotal = ProductLineItemsModel.getTotalQuantity(currentBasket.productLineItems);
      var cartModel = new CartModel(currentBasket);
      // res.render('/giftcard/giftcardsuccess', {
      //   continueUrl:  dw.web.URLUtils.url('Giftcard-Success')
      // })
      res.json({
          myJson: giftCardJson,
          cartLink: '<a href="' + URLUtils.https('Cart-Show') + '">' + '</a>',
          success: true,
          quantityTotal: quantityTotal,
          message: 'it works',
          cart: cartModel,
          error: addToCartResult.error,
          pliUUID: addToCartResult.uuid,
      });
    next();
  }
);

server.get(
  'Success',
  server.middleware.https,
  function (req, res, next) {
      res.render('/giftcard/giftcardsuccess', {
          continueUrl: URLUtils.url('Giftcard-Success'),
      });
      next();
  }
);

 module.exports = server.exports();

