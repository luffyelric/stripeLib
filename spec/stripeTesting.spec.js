
const stripeLib = require('../index');
var cb = {};

describe("StripeLib tests", () => {

  it("should deny using functions without initializing", async () => {
    try{
      const response = await stripeLib.createCustomer({
        email: "sdjkabsdasda@asjfblasa.com"
      });
    }
    catch(err){
      expect(err+"").toEqual('Error: You must first initialize the API key that you will be using for stripe')
    }
  });

  it("should complain about initializing without an API key", async () => {
    try{
      await stripeLib.init();
    }
    catch(err){
      expect(err+"").toEqual('Error: Please provide an APIkey')
    }
  });

  it("should initialize api key and let create a customer", async () => {
    await stripeLib.init("sk_test_32SF4oBMGK82jfOdaTf38dsj");

    const response = await stripeLib.createCustomer("sdjkabsdasda@asjfblasa.com");

    cb.noCardsCustomer = response.id;

    expect(response.email).toEqual("sdjkabsdasda@asjfblasa.com");   
  });

  it("should complain about trying to get cards from a customer without", async () => {
    try{
      const response = await stripeLib.getCustomer(cb.noCardsCustomer);
    }
    catch(err){
      expect(err + "").toEqual("Error: The customer does not have any card")
    }
  });

  it("should create a new token", async () => {
    const response = await stripeLib.createToken({
      number: "4242424242424242",
      exp_month: 12,
      exp_year: 22,
      cvc: 135
    });

    cb.token = response.id;
    expect(response.card.last4).toEqual('4242');
    expect(response.card.exp_month).toEqual(12); 
    expect(response.card.exp_year).toEqual(2022); 
  });

  it("should create a customer with a card", async () => {
    const response = await stripeLib.createCustomerWithCard("asdfghjklñ@zxcvbnm.com", cb.token);
    cb.customer = response.id;

    expect(response.email).toEqual("asdfghjklñ@zxcvbnm.com");
    expect(response.sources.data[0].last4).toEqual('4242');
    expect(response.sources.data[0].exp_month).toEqual(12);
    expect(response.sources.data[0].exp_year).toEqual(2022);
  });

  it("should retrieve the customer's digested card", async () => {
    const response = await stripeLib.getCustomerDigestedCards(cb.customer);

    expect(response[0].last4).toEqual('4242');
    expect(response[0].exp_month).toEqual(12);
    expect(response[0].exp_year).toEqual(2022);
  });

  it("should add a card to the customer", async () => {
    const token = await stripeLib.createToken({
      number: "4012888888881881",
      exp_month: 9,
      exp_year: 56,
      cvc: 427
    });

    const response = await stripeLib.addCardToCustomer(cb.customer, token.id);

    expect(response).toBe(undefined);
  });

  it("should retrieve the customer's digested cards", async () => {
    const response = await stripeLib.getCustomerDigestedCards(cb.customer);

    cb.card1 = response[0].id;
    cb.card2 = response[1].id;

    expect(response[0].last4).toEqual('4242');
    expect(response[0].exp_month).toEqual(12);
    expect(response[0].exp_year).toEqual(2022);
    expect(response[1].last4).toEqual('1881');
    expect(response[1].exp_month).toEqual(9);
    expect(response[1].exp_year).toEqual(2056);
  });

  it("should retrieve the customer's information", async () => {
    const response = await stripeLib.getCustomer(cb.customer);
    
    expect(response.default_source).toEqual(cb.card1);
    expect(response.sources.data[0].last4).toEqual('4242');
    expect(response.sources.data[0].exp_month).toEqual(12);
    expect(response.sources.data[0].exp_year).toEqual(2022);
    expect(response.sources.data[1].last4).toEqual('1881');
    expect(response.sources.data[1].exp_month).toEqual(9);
    expect(response.sources.data[1].exp_year).toEqual(2056);
  });

  it("should change the default card of the customer", async () => {
    const response = await stripeLib.updateDefaultCard(cb.customer, cb.card2);
    
    expect(response.default_source).toEqual(cb.card2);
    expect(response.sources.data[1].last4).toEqual('4242');
    expect(response.sources.data[1].exp_month).toEqual(12);
    expect(response.sources.data[1].exp_year).toEqual(2022);
    expect(response.sources.data[0].last4).toEqual('1881');
    expect(response.sources.data[0].exp_month).toEqual(9);
    expect(response.sources.data[0].exp_year).toEqual(2056);
  });

  it("should charge a customer's default card with 50 euros", async () => {
    const response = await stripeLib.customerCharge(cb.customer, 5000, "eur");
    
    cb.charge1 = response.id;

    expect(response.amount).toEqual(5000);
    expect(response.source.id).toEqual(cb.card2);
    expect(response.source.last4).toEqual('1881');
    expect(response.source.exp_month).toEqual(9);
    expect(response.source.exp_year).toEqual(2056);
    expect(response.status).toEqual('succeeded');
  });

  it("should charge a random card with 50 euros", async () => {
    const token = await stripeLib.createToken({
      number: "5555555555554444",
      exp_month: 4,
      exp_year: 26,
      cvc: 978
    });

    cb.card3 = token.card;

    const response = await stripeLib.cardCharge(token.id, 5000, "eur");
    
    cb.charge2 = response.id;

    expect(response.amount).toEqual(5000);
    expect(response.source.id).toEqual(cb.card3.id);
    expect(response.source.last4).toEqual('4444');
    expect(response.source.exp_month).toEqual(4);
    expect(response.source.exp_year).toEqual(2026);
    expect(response.status).toEqual('succeeded');
  });

  it("should get the info from the past charge", async () => {
    const response = await stripeLib.chargeInfo(cb.charge2);
    
    expect(response.amount).toEqual(5000);
    expect(response.source.id).toEqual(cb.card3.id);
    expect(response.source.last4).toEqual('4444');
    expect(response.source.exp_month).toEqual(4);
    expect(response.source.exp_year).toEqual(2026);
    expect(response.status).toEqual('succeeded');
  });

  it("should remove the actual default card from the customer", async () => {
    const response = await stripeLib.removeCardFromCustomer(cb.customer, cb.card2);
    
    expect(response).toBe(undefined);

    const customer = await stripeLib.getCustomer(cb.customer);
    
    expect(customer.default_source).toEqual(cb.card1);
    expect(customer.sources.data.length).toEqual(1);
    expect(customer.sources.data[0].last4).toEqual('4242');
    expect(customer.sources.data[0].exp_month).toEqual(12);
    expect(customer.sources.data[0].exp_year).toEqual(2022);
  });

  it("should remove the customer and give an error when trying to get their info after", async () => {
    const response = await stripeLib.removeCustomer(cb.customer);
    
    expect(response).toBe(undefined);

    try{
      const customer = await stripeLib.getCustomer(cb.customer);
    }
    catch(err){
      expect(err+"").toEqual("Error: The customer does not exist")
    }
  });
});
