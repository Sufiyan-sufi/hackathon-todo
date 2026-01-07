# Skill: subscribe_topic

## Description
Subscribe to topics and process events from Kafka or Dapr pub/sub components.

## Instructions
This skill provides patterns for building resilient event consumers. It covers Kafka consumer groups (via `confluent-kafka`) and Dapr's declarative subscription model.

## Kafka Consumer (Direct)

**Core Concept:** Use Kafka Consumer Groups for load-balanced, distributed event processing.

### 1. Kafka Consumer Implementation

```python
from confluent_kafka import Consumer, KafkaError, KafkaException
import json
import logging

class KafkaEventSubscriber:
    def __init__(self, bootstrap_servers: str, group_id: str):
        self.conf = {
            'bootstrap.servers': bootstrap_servers,
            'group.id': group_id,
            'auto.offset.reset': 'earliest',
            'enable.auto.commit': False  # Manual commit for reliability
        }
        self.consumer = Consumer(self.conf)

    def subscribe(self, topics: list, handler_func):
        """Subscribe to topics and start the polling loop."""
        try:
            self.consumer.subscribe(topics)
            print(f"📡 Subscribed to topics: {topics}")

            while True:
                msg = self.consumer.poll(timeout=1.0)
                if msg is None: continue

                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        continue
                    else:
                        raise KafkaException(msg.error())

                # Process message
                try:
                    payload = json.loads(msg.value().decode('utf-8'))
                    handler_func(payload)
                    # Commit offset only after successful processing
                    self.consumer.commit(asynchronous=False)
                except Exception as e:
                    logging.error(f"Error processing message: {e}")
                    # Decide here whether to commit or retry

        finally:
            self.consumer.close()
```

## Dapr Subscription (Sidecar)

**Core Concept:** Dapr uses a "push" model to your application. You expose an endpoint, and Dapr calls it when a message is published.

### 1. Declarative Subscription (subscription.yaml)
Place this in your Dapr components folder ($HOME/.dapr/components or /components).

```yaml
apiVersion: dapr.io/v1alpha1
kind: Subscription
metadata:
  name: task-subscription
spec:
  pubsubname: pubsub
  topic: task_events
  route: /events/task-handler
scopes:
- todo-service
```

### 2. FastAPI Subscriber Endpoint

```python
from fastapi import FastAPI, Body

app = FastAPI()

@app.post("/events/task-handler")
async def handle_task_event(event: dict = Body(...)):
    """Dapr pushes events to this endpoint."""
    print(f"📥 Received event: {event['type']}")
    data = event.get('data', {})

    # Process the business logic
    # ...

    # Return 200 (or 204) to acknowledge receipt to Dapr
    return {"status": "SUCCESS"}
```

## Error Handling Patterns

### Dead Letter Queues (DLQ)
For messages that repeatedly fail processing:
1. Catch the exception.
2. Publish the failed message to a `.dead-letter` topic.
3. Commit the original offset to continue the stream.

### Resilient Processing
- **Exponential Backoff:** If an external service (like a DB) is down, pause the consumer and wait before retrying.
- **Graceful Shutdown:** Handle `SIGTERM` to close consumers cleanly and avoid re-processing delays.

## Best Practices

1. **Consumer Groups:** Always use unique `group.id` for different logical services.
2. **Commit Strategy:** Use manual commits after processing logic to ensure "At-Least-Once" delivery.
3. **Idempotency:** Designing handlers to be idempotent is critical, as networking issues can cause duplicate deliveries.
4. **Monitoring:** Track "Consumer Lag" (the gap between latest produced message and consumed message) to detect scaling needs.

## Usage Example

```python
def my_business_logic(event):
    print(f"Processing task update: {event['task_id']}")

subscriber = KafkaEventSubscriber("localhost:9092", "analytics-group")
subscriber.subscribe(["task_events"], my_business_logic)
```
