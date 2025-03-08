require('dotenv').config();

module.exports = {
  rabbitMQ: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost',
    exchange: 'events_exchange',
    exchangeType: 'topic',
    queues: {
      orders: 'orders_queue',
      notifications: 'notifications_queue',
      analytics: 'analytics_queue'
    },
    routingKeys: {
      orderCreated: 'order.created',
      orderUpdated: 'order.updated',
      orderCancelled: 'order.cancelled'
    }
  }
};