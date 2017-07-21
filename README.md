# stripeLib
A library to make easier some simple requests to stripe.

GETTING STARTED:
First of all you'll need to provide the private or the public keys of your API depending on whether you'll be using it in server or browser respectively.
To initialize that parameter, you'll have to use the init() function.

{

    var StripeLib = require('stripeLib');

    stripeLib.init('APIkey');

}

If you don't initialize this parameter you won't be able to use any of the lib functions.