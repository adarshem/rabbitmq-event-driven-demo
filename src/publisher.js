const { v4: uuidv4 } = require('uuid');
const { publishEvent } = require('./utils/rabbitMQ');
const config = require('./config');

// Simulate order creation
async function createOrder() {
  const orderId = uuidv4();
  const order = {
    id: orderId,
    customerId: `customer_${Math.floor(Math.random() * 1000)}`,
    items: [
      { productId: `prod_${Math.floor(Math.random() * 100)}`, quantity: Math.floor(Math.random() * 5) + 1 }
    ],
    totalAmount: Math.random() * 1000,
    status: 'created',
    createdAt: new Date().toISOString()
  };
  
  await publishEvent(config.rabbitMQ.routingKeys.orderCreated, {
    eventId: uuidv4(),
    eventType: 'OrderCreated',
    timestamp: new Date().toISOString(),
    data: order
  });
  
  return order;
}

// Simulate order update
async function updateOrder(order) {
  const updatedOrder = {
    ...order,
    status: Math.random() > 0.7 ? 'shipped' : 'processing',
    updatedAt: new Date().toISOString()
  };
  
  await publishEvent(config.rabbitMQ.routingKeys.orderUpdated, {
    eventId: uuidv4(),
    eventType: 'OrderUpdated',
    timestamp: new Date().toISOString(),
    data: updatedOrder
  });
  
  return updatedOrder;
}

// Simulate order cancellation
async function cancelOrder(order) {
  const cancelledOrder = {
    ...order,
    status: 'cancelled',
    cancelledAt: new Date().toISOString()
  };
  
  await publishEvent(config.rabbitMQ.routingKeys.orderCancelled, {
    eventId: uuidv4(),
    eventType: 'OrderCancelled',
    timestamp: new Date().toISOString(),
    data: cancelledOrder
  });
  
  return cancelledOrder;
}

// Simulate a flow of events
async function simulateOrderFlow() {
  try {
    console.log('Creating a new order...');
    const order = await createOrder();
    
    // Wait a bit before updating
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`Updating order ${order.id}...`);
    const updatedOrder = await updateOrder(order);
    
    // Randomly cancel some orders
    if (Math.random() > 0.7) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Cancelling order ${updatedOrder.id}...`);
      await cancelOrder(updatedOrder);
    }
    
    console.log('Order flow completed');
  } catch (error) {
    console.error('Error in order flow:', error.message);
  }
}

// Run the simulation every few seconds
async function startSimulation() {
  console.log('Starting event publisher simulation...');
  
  // Run immediately once
  await simulateOrderFlow();
  
  // Then run periodically
  setInterval(simulateOrderFlow, 5000);
}

startSimulation().catch(err => {
  console.error('Fatal error in publisher:', err);
  process.exit(1);
});