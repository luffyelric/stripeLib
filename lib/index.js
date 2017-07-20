const stripe = require("stripe")("sk_test_32SF4oBMGK82jfOdaTf38dsj");

export async function createToken(cardData){
    const token = await stripe.tokens.create({
        card: {
            number: cardData.number,
            exp_month: cardData.exp_month,
            exp_year: cardData.exp_year,
            cvc: cardData.cvc
            //address_zip: cardData.address_zip  
        }
    });
    if(!token) return new Error("Token could not be created");
    return token;
}

export async function getCustomer(customerId){
    const customer = await stripe.customers.retrieve(customerId);
    if(!customer) return new Error("The customer does not exist");
    return customer;
}

export async function getCustomerDigestedCards(customerId){
    const cards = await stripe.customers.listCards(customerId);
    if(!cards) return new Error("The customer does not exist");
    if(cards.length == 0) return new Error("The customer does not have any card");
    return customer;
}

export async function createCustomerWithCard(cardToken, email){
    const customer = await stripe.customers.create({
        email: email,
        source: cardToken
    });
    if(!customer) return new Error("Customer could not be created");
    return customer;
}

export async function addCardToCustomer(customerId, cardToken){
    await stripe.customers.createCard(customerId, cardToken);
    return {};
}

export async function cardCharge(token, total, curr){
    const charge = await stripe.charges.create({
        amount: total,
        currency: curr,
        source: token
    });
    if(charge.status != 'succeeded') return new Error("Purchase could not be completed");
    return charge;
}

export async function customerCharge(customerId, total, curr){
    const charge = await stripe.charges.create({
        amount: total,
        currency: curr,
        customer: customerId
    });
    if(charge.status != 'succeeded' || !charge) return new Error("Purchase could not be completed");
    return charge;
}

export async function removeCardFromCustomer(customerId, cardId){
    await stripe.customers.deleteCard(customerId, cardId);
    return {};
}