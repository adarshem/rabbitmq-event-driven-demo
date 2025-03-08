const amqp = require('amqplib');
const config = require('../config');

// Connection singleton
let connection = null;
let channel = null;

async function getConnection() {
  if (connection) return connection;
  
  try {
    connection = await amqp.connect(config.rabbitMQ.url);
    console.log('Connected to RabbitMQ');
    
    // Handle connection close
    connection.on('close', () => {
      console.log('RabbitMQ connection closed');
      connection = null;
      setTimeout(getConnection, 5000);
    });
    
    return connection;
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error.message);
    setTimeout(getConnection, 5000);
  }
}

async function getChannel() {
  if (channel) return channel;
  
  const conn = await getConnection();
  try {
    channel = await conn.createChannel();
    console.log('Channel created');
    
    // Setup exchange
    await channel.assertExchange(
      config.rabbitMQ.exchange,
      config.rabbitMQ.exchangeType,
      { durable: true }
    );
    
    // Handle channel close
    channel.on('close', () => {
      console.log('Channel closed');
      channel = null;
    });
    
    return channel;
  } catch (error) {
    console.error('Error creating channel:', error.message);
    throw error;
  }
}

async function publishEvent(routingKey, message) {
  try {
    const ch = await getChannel();
    const success = ch.publish(
      config.rabbitMQ.exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
    
    if (success) {
      console.log(`Event published: ${routingKey}`);
      return true;
    } else {
      console.error(`Failed to publish event: ${routingKey}`);
      return false;
    }
  } catch (error) {
    console.error(`Error publishing event: ${error.message}`);
    throw error;
  }
}

async function consumeEvents(queue, routingKeys, onMessage) {
  try {
    const ch = await getChannel();
    
    // Assert queue
    await ch.assertQueue(queue, { durable: true });
    
    // Bind queue to exchange with routing keys
    for (const key of routingKeys) {
      await ch.bindQueue(queue, config.rabbitMQ.exchange, key);
    }
    
    // Set prefetch to 1 to ensure fair dispatch
    await ch.prefetch(1);
    
    // Consume messages
    await ch.consume(queue, async (msg) => {
      if (!msg) return;
      
      try {
        const content = JSON.parse(msg.content.toString());
        await onMessage(content, msg.fields.routingKey);
        ch.ack(msg);
      } catch (error) {
        console.error(`Error processing message: ${error.message}`);
        // Reject and requeue if it's a processing error
        ch.nack(msg, false, true);
      }
    });
    
    console.log(`Consumer started for queue: ${queue}`);
  } catch (error) {
    console.error(`Error setting up consumer: ${error.message}`);
    throw error;
  }
}

module.exports = {
  getConnection,
  getChannel,
  publishEvent,
  consumeEvents
};