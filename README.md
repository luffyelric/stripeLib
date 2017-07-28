stripeLib
---

A library to make easier some simple requests to stripe.
Focused on the use of cards and the storage of users with cards assigned.

## Installation

```
npm install stripe-lib
```

## Initialize

### Server


```
const stripeLib = require('stripe-lib');

stripeLib.init({
    apiKey: "..." // private key
});
```


### Client

(browser, mobile apps, etc)


```
const stripeLib = require('stripe-lib');

stripeLib.init({
    publishableKey: "..."
});
```

To use the token generation request which should be used from a client side, you must provide your PUBLISHABLE-API-KEY due to not giving away any of your private information.

The rest of the functions are server centered so you'll need to provide the private also.

If you don't initialize this parameters you won't be able to use neither the lib or stripe functions wholly.



## Client side API

### createTokenFromCard

Signature: `createTokenFromCard(number, month, year, cvc)`

Used to get a token from the minimum card information.

```
const token = await stripelib.createTokenFromCard({
    number: 'CARD-NUMBER-AS-A-STRING',
    month: EXPIRATION-MONTH,
    year: TWO-LAST-NUMBERS-OF-EXPIRATION-YEAR,
    cvc: CARD-CVC
});
```


## Server side API

## Paying with a random card:

First of all you'll have to create a token as showed above.

Once you have the token you can directly charge the card.

```
const charge = await stripelib.cardCharge(
    token.id,
    AMOUNT-OF-CURRENCY,
    CURRENCY);
//you can find the supported currency and their names here https://stripe.com/docs/currencies
```

WARNING: The amount of currency has to be of the currency's smallest unit
e.g: to charge $10 USD, provide an amount value of 1000 (i.e, 1000 cents).
    
## Paying through a customer's card:

### createCustomer

Signature: `createCustomer(email)`

```
const customer = await stripelib.createCustomer("CUSTOMER'S-EMAIL");
```

### createCustomerWithCard

Signature: `createCustomerWithCard(email, cardToken)`

```
const customer = await stripelib.createCustomerWithCard("CUSTOMER'S-EMAIL", CARD-TOKEN-GENERATED.id);
```

A customer with cards has always a default one which will receive the charge when charging the customer.

You can add more cards to a customer and can change the default card


### addCardToCustomer

Signature: `addCardToCustomer(customerId, cardToken)`

```
await stripelib.addCardToCustomer(customer.id, CARD-TOKEN-GENERATED.id);
```

### updateDefaultCard

Signature: `updateDefaultCard(customerId, cardId)`

```
await stripelib.updateDefaultCard(customer.id, NEW-DEFAULT-CARD.id);  
```
    
WARNING: The token of a card and the card are different things to see the id's of the different cards of a customer you can either get the customer or the digested information of their cards.


### getCustomer

Signature: `getCustomer(customerId)`

```
const customerInfo = await stripelib.getCustomer(customer.id);
```


### getCustomerDigestedCards

Signature: `getCustomerDigestedCards(customerId)`

```
const digestedCardsInfo = await stripelib.getCustomerDigestedCards(customer.id);
```

WARNING: A customer can't pay if it has no cards


### customerCharge

Signature: `customerCharge(customerId, amount, currency)`

```
const charge = await stripelib.customerCharge(
    customer.id,
    AMOUNT-OF-CURRENCY,
    CURRENCY
);
//You can find the supported currency and their names here https://stripe.com/docs/currencies
```

WARNING: The amount of currency has to be of the currency's smallest unit
e.g: to charge $10 USD, provide an amount value of 1000 (i.e, 1000 cents).


To get the info of a charge you only have to use the get function

### chargeInfo

Signature: `chargeInfo(chargeId)`

```
const chargeInfo = await stripelib.chargeInfo(CREATED-GHARGE.id);
```


## Removing

### removeCardFromCustomer

Signature: `removeCardFromCustomer(customerId, cardId)`

```
await stripelib.removeCardFromCustomer(customer.id, card.id);
```


### removeCustomer

Signature: `removeCustomer(customerId)`

```
await stripelib.removeCustomer(customer.id);
```


## Tests

If on your own decide to make some changes over the code of the functions but want the output to keep it like right now you can alway run the verification output tests using:

```
npm run jasmine
```


