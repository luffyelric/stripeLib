# stripeLib
A library to make easier some simple requests to stripe.
Focused on the use of cards and the storage of users with cards assigned.

INSTALL THE MODULE:

    npm install stripe-lib

INITIALIZING:
    //First of all you'll have to initialize the API-KEY that stripe will be using for your management.
    //If you are working in a server private side you'll have to provide your secret API-KEY, but, if you are working on a public client side then you should provide the public API-KEY.

    var stripelib = require('stripe-lib');

    stripelib.init('YOUR-API-KEY');

    //If you don't initialize this parameter you won't be able to use neither the lib or stripe functions.

LIBRARY USAGE:

    PAYING WITH A RANDOM CARD:
    
    //first create a token for the card with the basic info
    const token = await stripelib.createToken({
        number: 'CARD-NUMBER-AS-A-STRING',
        exp_month: EXPIRATION-MONTH,
        exp_year: TWO-LAST-NUMBERS-OF-EXPIRATION-YEAR,
        cvc: CARD-CVC
    });

    const charge = await stripelib.cardCharge(
        token.id,
        AMOUNT-OF-CURRENCY,
        CURRENCY);
    //you can find the supported currency and their names here https://stripe.com/docs/currencies

    //WARNING: The amount of currency has to be of the currency's smallest unit
    //e.g: to charge $10 USD, provide an amount value of 1000 (i.e, 1000 cents).
    
    PAYING THROUGH A CUSTOMER'S CARD:

    //Creating a customer without anything

    const customer = await stripelib.createCustomer("CUSTOMER'S-EMAIL");

    //Creating a customer with a card

    const customer = await stripelib.createCustomerWithCard("CUSTOMER'S-EMAIL", CARD-TOKEN-GENERATED.id);

    //A customer with cards has always a default one which will receive the charge when charging the customer
    //You can add more cards to a customer and can change the default card

    await stripelib.addCardToCustomer(customer.id, CARD-TOKEN-GENERATED.id);


    await stripelib.updateDefaultCard(customer.id, NEW-DEFAULT-CARD.id);  

    //WARNING: The token of a card and the card are different things to see the id's of the different cards of a customer you can either get the customer or the digested information of their cards.

    const customerInfo = await stripelib.getCustomer(customer.id);


    const digestedCardsInfo = await stripelib.getCustomerDigestedCards(customer.id);


    Charging the customer
    //A customer can't pay if it has no cards

    const charge = await stripelib.customerCharge(
        customer.id,
        AMOUNT-OF-CURRENCY,
        CURRENCY
    );
    //you can find the supported currency and their names here https://stripe.com/docs/currencies

    //WARNING: The amount of currency has to be of the currency's smallest unit
    //e.g: to charge $10 USD, provide an amount value of 1000 (i.e, 1000 cents).


    //To get the info of a charge you only have to use the get function

    const chargeInfo = await stripelib.chargeInfo(charge.id);


    REMOVING

    Remove a card from a customer:

    await stripelib.removeCardFromCustomer(customer.id, card.id);

    Remove a customer:

    await stripelib.removeCustomer(customer.id);



    TESTS
    If on your own decide to make some changes over the code of the functions but want the output to keep it like right now you can alway run the verification output tests using:

    npm run jasmine



