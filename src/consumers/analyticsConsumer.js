const { consumeEvents } = require('../utils/rabbitMQ');
const config = require('../config');

// In-memory analytics store (in a real app, this would be a database)
const analytics = {
  totalOrders: 0,
  totalRevenue: 0,
  cancelledOrders: 0,
  ordersByStatus: {}
};

async function processAnalyticsEvent(event, routingKey) {
  console.log(`[ANALYTICS SERVICE] Processing event: ${routingKey}`);
  
  // Update analytics based on event type
  switch (routingKey) {
    case config.rabbitMQ.routingKeys.orderCreated:
      analytics.totalOrders++;
      analytics.totalRevenue += event.data.totalAmount;
      
      // Update status counts
      analytics.ordersByStatus[event.data.status] = 
        (analytics.ordersByStatus[event.data.status] || 0) + 1;
      break;
      
    case config.rabbitMQ.routingKeys.orderUpdated:
      // Update status counts
      analytics.ordersByStatus[event.data.status] = 
        (analytics.ordersByStatus[event.data.status] || 0) + 1;
      break;
      
    case config.rabbitMQ.routingKeys.orderCancelled:
      analytics.cancelledOrders++;
      analytics.totalRevenue -= event.data.totalAmount;
      
      // Update status counts
      analytics.ordersByStatus[event.data.status] = 
        (analytics.ordersByStatus[event.data.status] || 0) + 1;
      break;
  }
  
  // Log current analytics
  console.log('[ANALYTICS SERVICE] Current metrics:');
  console.log(JSON.stringify(analytics, null, 2));
}

async function startConsumer() {
  try {
    await consumeEvents(
      config.rabbitMQ.queues.analytics,
      [
        config.rabbitMQ.routingKeys.orderCreated,
        config.rabbitMQ.routingKeys.orderUpdated,
        config.rabbitMQ.routingKeys.orderCancelled
      ],
      processAnalyticsEvent
    );
    
    console.log('Analytics consumer service started');
  } catch (error) {
    console.error('Failed to start analytics consumer:', error);
    process.exit(1);
  }
}

startConsumer();