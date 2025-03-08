const { consumeEvents } = require('../utils/rabbitMQ');
const config = require('../config');

async function processNotificationEvent(event, routingKey) {
  console.log(`[NOTIFICATION SERVICE] Processing event: ${routingKey}`);
  
  // Different notification templates based on event type
  let notificationMessage = '';
  
  switch (routingKey) {
    case config.rabbitMQ.routingKeys.orderCreated:
      notificationMessage = `New order created: ${event.data.id}. Thank you for your purchase!`;
      break;
    case config.rabbitMQ.routingKeys.orderUpdated:
      notificationMessage = `Your order ${event.data.id} has been updated to: ${event.data.status}`;
      break;
    case config.rabbitMQ.routingKeys.orderCancelled:
      notificationMessage = `Your order ${event.data.id} has been cancelled.`;
      break;
    default:
      notificationMessage = `Update on your order ${event.data.id}`;
  }
  
  // Simulate sending notification
  console.log(`[NOTIFICATION SERVICE] Sending to customer ${event.data.customerId}: ${notificationMessage}`);
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 300));
  
  console.log(`[NOTIFICATION SERVICE] Notification sent for order ${event.data.id}`);
}

async function startConsumer() {
  try {
    await consumeEvents(
      config.rabbitMQ.queues.notifications,
      [
        config.rabbitMQ.routingKeys.orderCreated,
        config.rabbitMQ.routingKeys.orderUpdated,
        config.rabbitMQ.routingKeys.orderCancelled
      ],
      processNotificationEvent
    );
    
    console.log('Notification consumer service started');
  } catch (error) {
    console.error('Failed to start notification consumer:', error);
    process.exit(1);
  }
}

startConsumer();