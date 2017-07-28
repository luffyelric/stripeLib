var stripe;
var axios = require('axios');

var config = {
    initialized: false,
    API_SECRET_KEY: '',
    API_PUBLISHABLE_KEY: ''
};

exports.init = function({apiKey, publishableKey}){
    if(!apiKey && !publishableKey) throw new Error('Please provide an APIkey');
    config.API_PUBLISHABLE_KEY = publishableKey;
    if(!apiKey) return;
    config.initialized = true;
    config.API_SECRET_KEY = apiKey;
    stripe = require("stripe")(config.API_SECRET_KEY);
}

exports.getCustomer = async function(customerId){
    if(!config.initialized) throw new Error('You must first initialize the API key that you will be using for stripe');

    const customer = await stripe.customers.retrieve(customerId);
    if(!customer || customer.deleted == true) throw new Error("The customer does not exist");
    return customer;
}

exports.getCustomerDigestedCards = async function(customerId){
    if(!config.initialized) throw new Error('You must first initialize the API key that you will be using for stripe');

    const cards = await stripe.customers.listCards(customerId);
    if(!cards) throw new Error("The customer does not exist");
    if(cards.data.length == 0) throw new Error("The customer does not have any card");
    const digestedCards = cards.data.map(card => {
        return {
            id: card.id,
            brand: card.brand,
            exp_month: card.exp_month,
            exp_year: card.exp_year,
            last4: card.last4
        }
    })
    return digestedCards;
}

exports.createTokenFromCard = async function ({number, month, year, cvc}) {
    if(!config.API_PUBLISHABLE_KEY) throw new Error("Please provide a publishable API KEY");
    var response = await axios({
        method: "post",
        url: "https://api.stripe.com/v1/tokens",
        data: `card[number]=${number}&card[exp_month]=${month}&card[exp_year]=${year}&card[cvc]=${cvc}`,
        headers: {
        "Content-type": "application/x-www-form-urlencoded",
        Authorization: "Bearer " + config.API_PUBLISHABLE_KEY
        }
    })
    if (!response || !response.data || typeof response.data != "object")
    throw new Error("No se puede conectar con Stripe");
    else return response.data;
    
}

exports.createCustomer = async function(email){
    if(!config.initialized) throw new Error('You must first initialize the API key that you will be using for stripe');

    const customer = await stripe.customers.create({
        email: email
    });
    if(!customer) throw new Error("Customer could not be created");
    return customer;
}

exports.createCustomerWithCard = async function(email, cardToken){
    if(!config.initialized) throw new Error('You must first initialize the API key that you will be using for stripe');

    const customer = await stripe.customers.create({
        email: email,
        source: cardToken
    });
    if(!customer) throw new Error("Customer could not be created");
    return customer;
}

exports.addCardToCustomer = async function(customerId, cardToken){
    if(!config.initialized) throw new Error('You must first initialize the API key that you will be using for stripe');

    const card = await stripe.customers.createCard(customerId, {card: cardToken});
    if(!card) throw new Error("The card could not be added");
    return;
}

exports.updateDefaultCard = async function(customerId, cardId){
    if(!config.initialized) throw new Error('You must first initialize the API key that you will be using for stripe');

    const customer = await stripe.customers.update(customerId, {default_source: cardId});
    if(!customer) throw new Error("The default_source could not be modified");
    return customer;
}

exports.cardCharge = async function(token, total, curr){
    if(!config.initialized) throw new Error('You must first initialize the API key that you will be using for stripe');

    const charge = await stripe.charges.create({
        amount: total,
        currency: curr,
        source: token
    });
    if(charge.status != 'succeeded') throw new Error("Purchase could not be completed");
    return charge;
}

exports.chargeInfo = async function(chargeId){
    if(!config.initialized) throw new Error('You must first initialize the API key that you will be using for stripe');

    const charge = await stripe.charges.retrieve(chargeId);
    if(!charge) throw new Error("The charge could not be found");
    return charge;
}

exports.customerCharge = async function(customerId, total, curr){
    if(!config.initialized) throw new Error('You must first initialize the API key that you will be using for stripe');

    const charge = await stripe.charges.create({
        amount: total,
        currency: curr,
        customer: customerId
    });
    if(charge.status != 'succeeded' || !charge) throw new Error("Purchase could not be completed");
    return charge;
}

exports.removeCardFromCustomer = async function(customerId, cardId){
    if(!config.initialized) throw new Error('You must first initialize the API key that you will be using for stripe');

    const delCard = await stripe.customers.deleteCard(customerId, cardId);
    if(delCard.deleted == true) return;
    else throw new Error('The card could not be deleted');
}

exports.removeCustomer = async function(customerId){
    if(!config.initialized) throw new Error('You must first initialize the API key that you will be using for stripe');

    const delCustomer = await stripe.customers.del(customerId);
    if(delCustomer.deleted == true ) return;
    else throw new Error('The customer could not be deleted');
}