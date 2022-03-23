/**
 * @namespace Hello
 */

 var server = require('server');
 var URLUtils = require('dw/web/URLUtils');
 var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
 var ProductMgr = require('dw/catalog/ProductMgr');
 var productHelper = require('*/cartridge/scripts/helpers/productHelpers');


 function addLineItem(
  currentBasket,
  product,
  quantity,
  defaultShipment
) {
  var productLineItem = currentBasket.createProductLineItem(
      product,
      defaultShipment
  );

  productLineItem.setQuantityValue(quantity);
  return productLineItem;
}


 server.get(
   'Show',
   function (req, res, next) {
      //var giftcardform = server.forms.getForm('giftcard');
    var actionUrl = URLUtils.url('Giftcard-Handler');
    var giftcardForm = server.forms.getForm('giftcard');
    giftcardForm.clear();
    res.render('/giftcard/giftcard', {
      actionUrl: actionUrl,
      giftcardForm: giftcardForm
    });
    next();
    }
 );
 

server.post('Handler', function (req, res, next) {
  var BasketMgr = require('dw/order/BasketMgr');
  var Resource = require('dw/web/Resource');
  var URLUtils = require('dw/web/URLUtils');
  var Transaction = require('dw/system/Transaction');
  var CartModel = require('*/cartridge/models/cart');
  var ProductLineItemsModel = require('*/cartridge/models/productLineItems');
  var cartHelper = require('*/cartridge/scripts/cart/cartHelpers');
  var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
  var currentBasket = BasketMgr.getCurrentOrNewBasket();
  var previousBonusDiscountLineItems = currentBasket.getBonusDiscountLineItems();
  var productId = '123456';
  var message = req.form.message;
  var recipient = req.form.recipient;
  var sender = req.form.sender;

  var result;
  var pidsObj;
  var quantity = 1;

  function addGiftcardToCart(currentBasket, productId, quantity) {
    var availableToSell;
    var defaultShipment = currentBasket.defaultShipment;
    var perpetual = false;
    var ProductMgr = require('dw/catalog/ProductMgr');
    var product = ProductMgr.getProduct('123456');
    var productInCart;
    var productLineItems = currentBasket.productLineItems;
    var productQuantityInCart;
    var quantityToSet;
    //var optionModel = productHelper.getCurrentOptionModel(product.optionModel, options);
    var result = {
        error: false,
        message: Resource.msg('text.alert.addedtobasket', 'product', null)
    };

    var totalQtyRequested = 0;
    var canBeAdded = false;
    totalQtyRequested = quantity;
    perpetual = true;


        var productLineItem;
        productLineItem = addLineItem(
            currentBasket,
            product,
            quantity,
            defaultShipment
        );

        result.uuid = productLineItem.UUID;


    return result;
}


  if (currentBasket) {
      Transaction.wrap(function () {
          if (!req.form.pidsObj) {
            quantity = 1;
              result = addGiftcardToCart(
                  currentBasket,
                  productId,
                  quantity
              );
          } else {
              // product set
              pidsObj = JSON.parse(req.form.pidsObj);
              result = {
                  error: false,
                  message: Resource.msg('text.alert.addedtobasket', 'product', null)
              };

              pidsObj.forEach(function (PIDObj) {
              
                  quantity = parseInt(PIDObj.qty, 10);

                  var pidOptions = PIDObj.options ? JSON.parse(PIDObj.options) : {};

                  var PIDObjResult = cartHelper.addProductToCart(
                      currentBasket,
                      PIDObj.pid,
                      quantity,
                      pidOptions
                  );
                  if (PIDObjResult.error) {
                      result.error = PIDObjResult.error;
                      result.message = PIDObjResult.message;
                  }
              });
          }
          if (!result.error) {
              cartHelper.ensureAllShipmentsHaveMethods(currentBasket);
              basketCalculationHelpers.calculateTotals(currentBasket);
          }
      });
  }

  var quantityTotal = 1;
  var cartModel = new CartModel(currentBasket);

  var urlObject = {
      url: URLUtils.url('Cart-ChooseBonusProducts').toString(),
      configureProductstUrl: URLUtils.url('Product-ShowBonusProducts').toString(),
      addToCartUrl: URLUtils.url('Cart-AddBonusProducts').toString()
  };

  var reportingURL = cartHelper.getReportingUrlAddToCart(currentBasket, result.error);

  res.json({
      reportingURL: reportingURL,
      quantityTotal: quantityTotal,
      message: result.message,

      error: result.error,
      pliUUID: result.uuid,
  
  });

  next();
});

 module.exports = server.exports();

//  server.post(
//   'Handler',
//   server.middleware.https,
//   function (req, res, next) {
//     var newsletterForm = server.forms.getForm('giftcard');
//     var continueUrl = dw.web.URLUtils.url('NewsletterV1-Show');

//   // Perform any server-side validation before this point, and invalidate form accordingly
//     if (newsletterForm.valid) {
//       // Send back a success status, and a redirect to another route
//           res.render('/newsletter/newslettersuccess', {
//               continueUrl: continueUrl,
//             newsletterForm: newsletterForm
//           });
//     } else {
//       // Handle server-side validation errors here: this is just an example
//           res.render('/newsletter/newslettererror', {
//               errorMsg: dw.web.Resource.msg('error.crossfieldvalidation', 'newsletter', null),
//             continueUrl: continueUrl
//           });
//     }

//       next();
//   }
// );