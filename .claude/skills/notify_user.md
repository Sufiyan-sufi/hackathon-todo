# Skill: notify_user

## Description
Send multi-channel notifications (Email, Push, SMS, Slack) to users.

## Instructions
This skill defines a notification system architecture that abstracts specific providers (like SendGrid, Twilio, or Firebase) behind a common interface, supporting templates and priority-based delivery.

## Notification Architecture

**Core Concept:** Decouple the notification trigger from the delivery mechanism. Use a "Notification Service" that routes messages based on user preferences and channel availability.

### 1. Unified Notification Service

```python
from enum import Enum
from typing import List, Dict, Optional
from abc import ABC, abstractmethod

class Channel(Enum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    SLACK = "slack"

class NotificationProvider(ABC):
    @abstractmethod
    async def send(self, recipient: str, title: str, body: str, metadata: Dict):
        pass

class NotificationManager:
    def __init__(self):
        self.providers: Dict[Channel, NotificationProvider] = {}

    def register_provider(self, channel: Channel, provider: NotificationProvider):
        self.providers[channel] = provider

    async def notify(self, user: Dict, title: str, body: str, channels: List[Channel]):
        """Sends notification to a user across specified channels."""
        for channel in channels:
            if channel in self.providers:
                recipient = user.get(channel.value) # e.g., user['email']
                if recipient:
                    await self.providers[channel].send(recipient, title, body, user.get('metadata', {}))
```

## Provider Implementations

### 1. Email (SendGrid Example)
```python
import sendgrid
from sendgrid.helpers.mail import Mail

class SendGridProvider(NotificationProvider):
    def __init__(self, api_key: str, from_email: str):
        self.sg = sendgrid.SendGridAPIClient(api_key=api_key)
        self.from_email = from_email

    async def send(self, recipient: str, title: str, body: str, metadata: Dict):
        message = Mail(
            from_email=self.from_email,
            to_emails=recipient,
            subject=title,
            plain_text_content=body
        )
        self.sg.send(message)
```

### 2. Push Notifications (Firebase FCM)
```python
from firebase_admin import messaging

class FirebaseProvider(NotificationProvider):
    async def send(self, token: str, title: str, body: str, metadata: Dict):
        message = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            token=token,
            data=metadata
        )
        messaging.send(message)
```

## Template Management

Avoid hardcoding strings in the application logic. Use a templating engine like Jinja2.

```python
from jinja2 import Template

TEMPLATES = {
    "task_due": {
        "title": "Task Reminder: {{ task_title }}",
        "body": "Hi {{ user_name }}, your task '{{ task_title }}' is due at {{ due_time }}."
    },
    "welcome": {
        "title": "Welcome to Todo-AI!",
        "body": "Hello {{ user_name }}, we're glad to have you here!"
    }
}

def render_notification(template_key: str, context: Dict):
    tpl = TEMPLATES[template_key]
    title = Template(tpl["title"]).render(context)
    body = Template(tpl["body"]).render(context)
    return title, body
```

## Integration with Event-Driven Architecture

In a production system, notifications should be handled by a background worker:

1. **Trigger:** Business logic publishes a `notification.requested` event to Kafka/Dapr.
2. **Consumer:** A Notification Microservice subscribes to the topic.
3. **Execution:** The service looks up user preferences, renders the template, and calls the `NotificationManager`.

## Best Practices

1. **User Preferences:** Always allow users to opt-in/out of specific channels (e.g., "SMS only for urgent tasks").
2. **Rate Limiting:** Guard against spamming users. Implement "batching" for non-urgent notifications.
3. **Audit Logging:** Maintain a database record of all sent notifications (timestamp, recipient, status, payload).
4. **Retry with Backoff:** If a provider (like SendGrid) is down, retry the sending operation.
5. **Personalization:** Use the user's name and local timezone in messages.

## Usage Example

```python
# API Logic
title, body = render_notification("task_due", {"user_name": "Alice", "task_title": "Buy Milk"})
await notification_manager.notify(user_profile, title, body, [Channel.EMAIL, Channel.PUSH])
```
