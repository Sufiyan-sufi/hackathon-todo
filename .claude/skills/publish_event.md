# Skill: publish_event

## Description
Publish events to Kafka or Dapr sidecars for event-driven architectures.

## Instructions
This skill provides patterns and code for publishing messages to event streams and message brokers, specifically targeting Kafka (via `confluent-kafka`) and Dapr (via the Dapr SDK or HTTP API).

## Kafka Integration (Direct)

**Core Concept:** Use Kafka for high-throughput, horizontally scalable event streaming.

### 1. Kafka Producer Configuration

```python
from confluent_kafka import Producer
import json
import logging

class KafkaEventPublisher:
    def __init__(self, bootstrap_servers: str):
        conf = {
            'bootstrap.servers': bootstrap_servers,
            'client.id': 'todo-app-producer',
            'acks': 'all',  # Wait for full replication
            'retries': 5
        }
        self.producer = Producer(conf)

    def delivery_report(self, err, msg):
        """Called once for each message produced to indicate delivery result."""
        if err is not None:
            logging.error(f"Message delivery failed: {err}")
        else:
            logging.info(f"Message delivered to {msg.topic()} [{msg.partition()}]")

    def publish(self, topic: str, key: str, event_data: dict):
        """Publish a JSON event to a Kafka topic."""
        try:
            self.producer.produce(
                topic,
                key=key,
                value=json.dumps(event_data).encode('utf-8'),
                callback=self.delivery_report
            )
            # Flush to ensure delivery
            self.producer.poll(0)
        except BufferError:
            logging.error("Local producer queue is full")
        except Exception as e:
            logging.error(f"Error publishing to Kafka: {e}")

    def flush(self):
        self.producer.flush()
```

## Dapr Integration (Service Mesh / Sidecar)

**Core Concept:** Use Dapr to abstract the message broker. Code against the Dapr API, and Dapr handles the connection to Kafka, RabbitMQ, or Redis.

### 1. Dapr Pub/Sub (via SDK)

```python
from dapr.clients import DaprClient

class DaprEventPublisher:
    def __init__(self, pubsub_name: str = "pubsub"):
        self.pubsub_name = pubsub_name

    def publish(self, topic: str, event_data: dict):
        """Publish an event via Dapr Sidecar."""
        with DaprClient() as client:
            client.publish_event(
                pubsub_name=self.pubsub_name,
                topic_name=topic,
                data=json.dumps(event_data),
                data_content_type='application/json'
            )
            print(f"✅ Published event to Dapr topic: {topic}")
```

### 2. Dapr Pub/Sub (via HTTP API - No SDK required)

```python
import requests

def publish_via_http(topic: str, data: dict, dapr_port: int = 3500):
    url = f"http://localhost:{dapr_port}/v1.0/publish/pubsub/{topic}"
    response = requests.post(url, json=data)
    if response.status_code == 204:
        print("✅ Event published successfully via CloudEvents")
    else:
        print(f"❌ Failed to publish: {response.status_code}")
```

## Event Schema (CloudEvents Standard)

It is highly recommended to follow the [CloudEvents](https://cloudevents.io/) specification:

```python
import uuid
from datetime import datetime

def create_cloud_event(event_type: str, source: str, data: dict):
    return {
        "specversion": "1.0",
        "type": event_type,
        "source": source,
        "id": str(uuid.uuid4()),
        "time": datetime.utcnow().isoformat() + "Z",
        "datacontenttype": "application/json",
        "data": data
    }
```

## Best Practices

1. **Idempotency:** Ensure consumers can handle the same event multiple times (use unique event IDs).
2. **Schema Registry:** Use Avro or Protobuf for production Kafka to enforce message schemas.
3. **Dead Letter Queues (DLQ):** Configure the broker to move failed messages to a separate queue for inspection.
4. **Retry Logic:** Use exponential backoff for transient network issues.
5. **Security:** Always use SASL/SSL for Kafka connections outside of local development.
6. **Graceful Shutdown:** Always `flush()` the Kafka producer before the application exits to avoid data loss.

## Usage in FastAPI

```python
@app.post("/tasks")
async def create_task(task: TaskSchema):
    # Save to DB
    new_task = await db.save(task)

    # Fire and Forget Event
    event = create_cloud_event("task.created", "/tasks/api", {"task_id": new_task.id})
    publisher.publish("task_events", str(new_task.id), event)

    return new_task
```
