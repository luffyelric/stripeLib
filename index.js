var stripe;

var config = {
    initialized: false,
    API_USAGE_KEY: ''   
};

exports.init = function(APIkey){
    if(!APIkey) throw new Error('Please provide an APIkey');
    config.API_USAGE_KEY = APIkey;
    config.initialized = true;
    stripe = require("stripe")(config.API_USAGE_KEY);
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

exports.createToken = async function(cardData){
    if(!config.initialized) throw new Error('You must first initialize the API key that you will be using for stripe');

    const token = await stripe.tokens.create({
        card: {
            number: cardData.number,
            exp_month: cardData.exp_month,
            exp_year: cardData.exp_year,
            cvc: cardData.cvc
            //address_zip: cardData.address_zip  
        }
    });
    if(!token) throw new Error("Token could not be created");
    return token;
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
        amount: total*100,
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
        amount: total*100,
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