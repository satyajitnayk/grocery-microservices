const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const amqplib = require('amqplib');

const {
  APP_SECRET,
  QUEUE_NAME,
  MESSAGE_BROKER_URL,
  EXCHANGE_NAME,
  CUSTOMER_BINDING_KEY,
} = require('../config');

//Utility functions
(module.exports.GenerateSalt = async () => {
  return await bcrypt.genSalt();
}),
  (module.exports.GeneratePassword = async (password, salt) => {
    return await bcrypt.hash(password, salt);
  });

module.exports.ValidatePassword = async (
  enteredPassword,
  savedPassword,
  salt
) => {
  return (await this.GeneratePassword(enteredPassword, salt)) === savedPassword;
};

(module.exports.GenerateSignature = async (payload) => {
  return jwt.sign(payload, APP_SECRET, { expiresIn: '1d' });
}),
  (module.exports.ValidateSignature = async (req) => {
    const signature = req.get('Authorization');

    console.log(signature);

    if (signature) {
      const payload = await jwt.verify(signature.split(' ')[1], APP_SECRET);
      req.user = payload;
      return true;
    }

    return false;
  });

module.exports.FormatData = (data) => {
  if (data) {
    return { data };
  } else {
    throw new Error('Data Not found!');
  }
};

/* ========= message broker ============*/

// create a channel
module.exports.CreateChannel = async () => {
  try {
    const connection = await amqplib.connect(MESSAGE_BROKER_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, 'direct', false);
    return channel;
  } catch (error) {
    throw error;
  }
};

// Publish messages
module.exports.PublishMessage = async (channel, binding_key, message) => {
  try {
    await channel.publish(EXCHANGE_NAME, binding_key, Buffer.from(message));
  } catch (error) {
    throw error;
  }
};

// subscribe messages
module.exports.SubscribeMessage = async (channel, service) => {
  try {
    const appQueue = await channel.assertQueue(QUEUE_NAME);

    channel.bindQueue(appQueue.queue, EXCHANGE_NAME, CUSTOMER_BINDING_KEY);

    channel.consume(appQueue.queue, (data) => {
      console.log('received data');
      console.log(data.content.toString());
      channel.ack(data);
    });
  } catch (error) {
    throw error;
  }
};
