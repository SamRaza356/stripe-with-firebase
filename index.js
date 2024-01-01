const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const cors = require("cors")({ origin: true });

// For Sending Emails using nodemailer

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "youremail",
    pass: "yourpass",
  },
});
exports.sendEmail = functions.https.onRequest((req, res) => {
  console.log(
    "from sendEmail function. The request object is:",
    JSON.stringify(req.body)
  );
  cors(req, res, () => {
    const email = req.body.data1.email;
    const message = req.body.data1.message;
    const mailOptions = {
      from: "youremail",
      to: email,
      subject: "New message from the shareadventureandgear",
      html: `${message}`,
    };
    return transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).send({
          data: {
            status: 500,
            message: error.toString(),
          },
        });
      }
      return res.status(200).send({
        data: {
          status: 200,
          message: "sent",
        },
      });
    });
  });
});

// Implementing Stripe Functions having stripeConnectAccount, stripeCheckout, stripeTransferPayment, refundStripe

const stripe = require("stripe")(
  "LIVE_KEY"
);
exports.stripeConnectAccount = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const authCode = req.body.data1;
    if (authCode) {
      try {
          const response = stripe.oauth.token({
            grant_type: "authorization_code",
            code: authCode,
          }).then((data)=>{
            res.status(200).send(data);
          }).catch((err)=>{
            res.status(400).send({message:err.message})
          })
      } catch (error) {
        res.status(400).send({message:error});
      }
    } else {
      res.status(500).send({message:"Authorization code isn't provided"});
    }
  });
});
exports.stripeCheckout = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    try {
      token = req.body.stripeToken;
      amount = req.body.amount;
      const customer = stripe.customers
        .create({
          email: req.body.email,
          source: token.id,
        })
        .then((customer) => {
          return stripe.charges.create({
            amount: amount * 100,
            description: "Purchase Product",
            currency: "USD",
            customer: customer.id,
          });
        })
        .then((charge) => {
          const customer_Id = charge.source.customer;
          const receipt_url = charge.receipt_url;
          if(charge){
            return res.json({
              data:"success",
              paymentObject:charge
            })
          }
        })
        .catch((err) => {
          res.status(400).send({message:err.message});
        });
      return true;
    } catch (error) {
      res.status(400).send({message:error});
    }
});
});

exports.stripeTransferPayment = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const account_id = req.body.account_id;
    const amount = req.body.amount
    if (account_id) {
      try {
          const transfer =  stripe.transfers.create({
            amount: amount * 100,
            currency: "usd",
            destination: account_id,
            description: "Rented Product And Transferring amount"
          }).then((data)=>{
            res.status(200).send(data);
          }).catch((err)=>{
            res.status(400).send({message:err.message});
          })
      } catch (error) {
        res.status(400).send({message:error});
      }

    } else {
      res.status(500).send({message:"Account Id is not provided"});
    }
  });
});
exports.refundStripe = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const charge_id = req.body.charge_id;
    const amount = req.body.amount;
    if (charge_id) {
      try {
          const refund = stripe.refunds.create({
            charge: charge_id,
            amount:amount
          }).then((refundData)=>{
              res.status(200).send(refund);
          }).catch((error)=>{
            res.status(400).send({message:error.message})
          })
      } catch (error) {
        res.staus(400).send({message:error});
      }
    } else {
      res.status(500).send("Internal Server Error");
    }
  });
});
