const { consumeEvents } = require('../utils/rabbitMQ');
const config = require('../config');

async function processOrderEvent(event, routingKey) {
  console.log(`[ORDER SERVICE] Processing event: ${routingKey}`);
  console.log(`[ORDER SERVICE] Order ID: ${event.data.id}, Status: ${event.data.status}`);
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Here you would typically update a database, call other services, etc.
  console.log(`[ORDER SERVICE] Successfully processed order ${event.data.id}`);
}

async function startConsumer(retryCount = 0, maxRetries = 5) {
  try {
    console.log(`Attempting to connect to RabbitMQ (attempt ${retryCount + 1}/${maxRetries + 1})...`);
    
    await consumeEvents(
      config.rabbitMQ.queues.orders,
      [
        config.rabbitMQ.routingKeys.orderCreated,
        config.rabbitMQ.routingKeys.orderUpdated,
        config.rabbitMQ.routingKeys.orderCancelled
      ],
      processOrderEvent
    );
    
    console.log('Order consumer service started successfully');
  } catch (error) {
    console.error(`Failed to start order consumer (attempt ${retryCount + 1}/${maxRetries + 1}):`, error.message);
    
    if (retryCount < maxRetries) {
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Exponential backoff with max 30s
      console.log(`Retrying in ${retryDelay/1000} seconds...`);
      
      setTimeout(() => {
        startConsumer(retryCount + 1, maxRetries);
      }, retryDelay);
    } else {
      console.error('Maximum retry attempts reached. Exiting...');
      console.log('Please ensure RabbitMQ is running at:', config.rabbitMQ.url);
      process.exit(1);
    }
  }
}

startConsumer();