# RabbitMQ Event-Driven Architecture Demo

A demonstration of event-driven architecture using RabbitMQ as a message broker. This project showcases how multiple services can communicate asynchronously through events, enabling loose coupling and independent scaling.

## Architecture Overview

This demo implements a simple event-driven system with the following components:

### Components

1. **Publisher**: Generates order events (creation, updates, cancellations) and publishes them to RabbitMQ.

2. **RabbitMQ**: Acts as the message broker, receiving events from publishers and routing them to appropriate queues based on routing keys.

3. **Consumers**:
   - **Order Consumer**: Processes order events, simulating an order management service.
   - **Notification Consumer**: Listens for order events and sends appropriate notifications.
   - **Analytics Consumer**: Records all events for analytics purposes.

### Event Flow

![Event Flow Diagram](https://mermaid.ink/img/pako:eNqNkkFvgyAUx78Keed2iXrzsGRpva4122nawxu8KpmCQUjWtP3uw6idS40rB-C9_x9-POAMXAuCGAqDTcnet7livu2zvfusZFuSObD1-vmijSDzxA2hJXFhSZZ88xJVQYdhwcTlGjG47jWOilNVTdS-T-YoaZDtukzLUkduRCVzqDSY2eeXNcpLsDB71VYeJUcrtXqEGS4zw_-ZUfaisDpZyR_hRcu8aMpLg87FNsMVso0vydX-OQc57OW_Rd-5ot41PebNAivwQ41S-O9z7hbkYEuqKYfYTwWarxxydfU-dFa_nRSH2BpHKzDaFSXER6xaH_UFbiX6P1jfsg2qD63H-PoD4pfbdQ)

1. Publisher creates an order → `order.created` event
2. Publisher updates an order → `order.updated` event
3. Publisher cancels an order → `order.cancelled` event

### Routing

- Events are published to a topic exchange
- Each consumer binds its queue to the exchange with specific routing keys
- This allows selective consumption of events

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [pnpm](https://pnpm.io/) (or npm/yarn)
- [RabbitMQ](https://www.rabbitmq.com/) (v3.8 or higher)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/rabbitmq-event-driven-demo.git
   cd rabbitmq-event-driven-demo
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env` file in the root directory:
   ```
   RABBITMQ_URL=amqp://localhost:5672
   ```

## Running RabbitMQ

### Using Docker
```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management
```
This will start RabbitMQ with the management plugin enabled. You can access the management interface at http://localhost:15672/ (default credentials: guest/guest).

### Using a Local Installation

- **macOS**: `brew install rabbitmq && brew services start rabbitmq`
- **Ubuntu/Debian**: `sudo apt-get install rabbitmq-server && sudo service rabbitmq-server start`
- **Windows**: Download and install from the [RabbitMQ website](https://www.rabbitmq.com/download.html)

## Running the Demo

1. Start the consumers (in separate terminal windows):

   ```bash
   # Start the order consumer
   pnpm run start:order-consumer
   
   # Start the notification consumer
   pnpm run start:notification-consumer
   
   # Start the analytics consumer
   pnpm run start:analytics-consumer
   ```

   Alternatively, start all consumers at once:

   ```bash
   pnpm run start:all-consumers
   ```

2. Run the publisher to generate events:

   ```bash
   pnpm run start:publisher
   ```

### my local terminal running all the consumers and publisher

<img width="1452" alt="Screenshot 2025-03-08 at 3 47 45 PM" src="https://github.com/user-attachments/assets/8acc43ab-84a8-4853-932d-3398d29adae3" />


## Access RabbitMQ UI
 - You should be able to access the UI at http://localhost:15672/ ( guest /guest - default credential for localhost)
 - Once the consumers are up and running, they creates bindings between its queue and the exchange, you should be able to see all the queue in the UI

![Screenshot 2025-03-08 at 3 47 30 PM](https://github.com/user-attachments/assets/b7299a2e-b501-4989-9ebf-e5e8de5e7217)

   

## Project Structure

```bash
├── src/
│ ├── config.js # Configuration settings
│ ├── publisher.js # Event publisher
│ ├── consumers/
│ │ ├── orderConsumer.js # Order processing service
│ │ ├── notificationConsumer.js # Notification service
│ │ └── analyticsConsumer.js # Analytics service
│ └── utils/
│ └── rabbitMQ.js # RabbitMQ utility functions
├── .env # Environment variables
└── package.json # Project metadata and scripts
```

## Key Concepts Demonstrated

1. **Decoupled Services**: Services communicate through events without direct dependencies.
2. **Message Routing**: Events are routed to appropriate services based on routing keys.
3. **Resilient Consumers**: Consumers implement retry logic for handling connection issues.
4. **Acknowledgments**: Messages are acknowledged only after successful processing.
5. **Topic-Based Routing**: Using topic exchange for flexible message routing.

## Production Considerations

For a production deployment, consider:

- Running RabbitMQ in a cluster for high availability
- Implementing proper monitoring and alerting
- Securing connections with TLS
- Implementing dead letter queues for failed messages
- Setting up proper logging and tracing

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
