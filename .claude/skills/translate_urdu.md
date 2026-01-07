# Skill: translate_urdu

## Description
Translate to/from Urdu.

## Instructions
This skill handles translation between English and Urdu (اردو) for multilingual todo applications, supporting bidirectional translation, transliteration, and cultural localization.

## Urdu Language Overview

**Urdu (اردو):**
- **Script:** Perso-Arabic (Nastaliq style)
- **Direction:** Right-to-left (RTL)
- **Speakers:** ~230 million worldwide
- **Regions:** Pakistan, India, diaspora communities
- **Related:** Hindi (shares vocabulary, different scripts)

## Translation Strategies

### 1. API-Based Translation (Recommended)

#### Google Translate API
```python
from google.cloud import translate_v2 as translate
from typing import Optional

class GoogleTranslator:
    """Google Cloud Translation API."""

    def __init__(self, api_key: Optional[str] = None):
        self.client = translate.Client(api_key=api_key) if api_key else translate.Client()

    def translate_to_urdu(self, text: str) -> dict:
        """Translate English to Urdu."""
        result = self.client.translate(
            text,
            target_language='ur',
            source_language='en'
        )

        return {
            "original": text,
            "translated": result['translatedText'],
            "source_language": "en",
            "target_language": "ur",
            "confidence": None  # Google doesn't provide confidence
        }

    def translate_from_urdu(self, text: str) -> dict:
        """Translate Urdu to English."""
        result = self.client.translate(
            text,
            target_language='en',
            source_language='ur'
        )

        return {
            "original": text,
            "translated": result['translatedText'],
            "source_language": "ur",
            "target_language": "en",
            "confidence": None
        }

    def detect_language(self, text: str) -> str:
        """Detect language of text."""
        result = self.client.detect_language(text)
        return result['language']
```

#### Azure Translator
```python
import requests
from typing import Optional

class AzureTranslator:
    """Azure Cognitive Services Translator."""

    def __init__(self, key: str, region: str):
        self.key = key
        self.region = region
        self.endpoint = "https://api.cognitive.microsofttranslator.com"

    def translate(
        self,
        text: str,
        to_language: str,
        from_language: Optional[str] = None
    ) -> dict:
        """Translate text."""

        path = '/translate'
        constructed_url = self.endpoint + path

        params = {
            'api-version': '3.0',
            'to': to_language
        }
        if from_language:
            params['from'] = from_language

        headers = {
            'Ocp-Apim-Subscription-Key': self.key,
            'Ocp-Apim-Subscription-Region': self.region,
            'Content-type': 'application/json'
        }

        body = [{'text': text}]

        response = requests.post(
            constructed_url,
            params=params,
            headers=headers,
            json=body
        )

        result = response.json()[0]

        return {
            "original": text,
            "translated": result['translations'][0]['text'],
            "source_language": result.get('detectedLanguage', {}).get('language', from_language),
            "target_language": to_language,
            "confidence": result.get('detectedLanguage', {}).get('score')
        }
```

### 2. Open Source Models

#### MarianMT (Hugging Face)
```python
from transformers import MarianMTModel, MarianTokenizer
from typing import List

class MarianTranslator:
    """MarianMT translation model."""

    def __init__(self):
        # English to Urdu
        self.en_ur_model_name = 'Helsinki-NLP/opus-mt-en-ur'
        self.en_ur_tokenizer = MarianTokenizer.from_pretrained(self.en_ur_model_name)
        self.en_ur_model = MarianMTModel.from_pretrained(self.en_ur_model_name)

        # Urdu to English
        self.ur_en_model_name = 'Helsinki-NLP/opus-mt-ur-en'
        self.ur_en_tokenizer = MarianTokenizer.from_pretrained(self.ur_en_model_name)
        self.ur_en_model = MarianMTModel.from_pretrained(self.ur_en_model_name)

    def translate_to_urdu(self, text: str) -> str:
        """Translate English to Urdu."""
        inputs = self.en_ur_tokenizer(text, return_tensors="pt", padding=True)
        outputs = self.en_ur_model.generate(**inputs)
        translated = self.en_ur_tokenizer.decode(outputs[0], skip_special_tokens=True)
        return translated

    def translate_from_urdu(self, text: str) -> str:
        """Translate Urdu to English."""
        inputs = self.ur_en_tokenizer(text, return_tensors="pt", padding=True)
        outputs = self.ur_en_model.generate(**inputs)
        translated = self.ur_en_tokenizer.decode(outputs[0], skip_special_tokens=True)
        return translated

    def translate_batch(self, texts: List[str], to_urdu: bool = True) -> List[str]:
        """Translate multiple texts."""
        if to_urdu:
            tokenizer = self.en_ur_tokenizer
            model = self.en_ur_model
        else:
            tokenizer = self.ur_en_tokenizer
            model = self.ur_en_model

        inputs = tokenizer(texts, return_tensors="pt", padding=True, truncation=True)
        outputs = model.generate(**inputs)

        translated = [
            tokenizer.decode(output, skip_special_tokens=True)
            for output in outputs
        ]

        return translated
```

## Todo-Specific Translations

### Common Todo Phrases

```python
TODO_TRANSLATIONS = {
    # Actions
    "add": "شامل کریں",
    "create": "بنائیں",
    "delete": "حذف کریں",
    "update": "تازہ کریں",
    "complete": "مکمل کریں",
    "mark as done": "مکمل کے طور پر نشان زد کریں",

    # Status
    "pending": "زیر التواء",
    "in progress": "جاری",
    "completed": "مکمل",
    "cancelled": "منسوخ",

    # Priority
    "high priority": "اعلیٰ ترجیح",
    "medium priority": "درمیانی ترجیح",
    "low priority": "کم ترجیح",
    "urgent": "فوری",

    # Time
    "today": "آج",
    "tomorrow": "کل",
    "yesterday": "کل",
    "this week": "اس ہفتے",
    "next week": "اگلے ہفتے",
    "due date": "آخری تاریخ",

    # Common Phrases
    "task": "کام",
    "todo": "کرنے کے لیے",
    "list": "فہرست",
    "my tasks": "میرے کام",
    "show all": "سب دکھائیں",
    "filter": "چھان لیں",
    "search": "تلاش کریں",

    # Messages
    "Task added successfully": "کام کامیابی سے شامل کیا گیا",
    "Task completed": "کام مکمل ہو گیا",
    "Task deleted": "کام حذف کر دیا گیا",
    "No tasks found": "کوئی کام نہیں ملا",
}

def get_translation(key: str, reverse: bool = False) -> str:
    """Get translation for common phrase."""
    if reverse:
        # Urdu to English
        reverse_map = {v: k for k, v in TODO_TRANSLATIONS.items()}
        return reverse_map.get(key, key)
    else:
        # English to Urdu
        return TODO_TRANSLATIONS.get(key.lower(), key)
```

## Complete Translation Service

```python
from typing import Optional, Literal
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

class TranslationResult(BaseModel):
    """Translation result."""
    original: str
    translated: str
    source_language: str
    target_language: str
    confidence: Optional[float] = None
    method: str  # "api", "model", "dictionary"

class UrduTranslationService:
    """Complete Urdu translation service."""

    def __init__(
        self,
        primary_method: Literal["google", "azure", "marian"] = "marian",
        api_key: Optional[str] = None,
        region: Optional[str] = None
    ):
        self.primary_method = primary_method

        # Initialize translators
        if primary_method == "google" and api_key:
            self.translator = GoogleTranslator(api_key)
        elif primary_method == "azure" and api_key and region:
            self.translator = AzureTranslator(api_key, region)
        else:
            # Default to MarianMT (offline)
            self.translator = MarianTranslator()

    def translate(
        self,
        text: str,
        to_language: str = "ur",
        from_language: Optional[str] = None
    ) -> TranslationResult:
        """Translate text with fallback strategies."""

        # Detect language if not specified
        if not from_language:
            from_language = self._detect_language(text)

        # Strategy 1: Check common phrases dictionary
        if text.lower() in TODO_TRANSLATIONS:
            if to_language == "ur":
                translated = TODO_TRANSLATIONS[text.lower()]
                return TranslationResult(
                    original=text,
                    translated=translated,
                    source_language=from_language or "en",
                    target_language=to_language,
                    confidence=1.0,
                    method="dictionary"
                )

        # Strategy 2: Use primary translator
        try:
            if isinstance(self.translator, MarianTranslator):
                if to_language == "ur":
                    translated = self.translator.translate_to_urdu(text)
                else:
                    translated = self.translator.translate_from_urdu(text)

                return TranslationResult(
                    original=text,
                    translated=translated,
                    source_language=from_language or "en",
                    target_language=to_language,
                    method="model"
                )
            else:
                # API-based translator
                if to_language == "ur":
                    result = self.translator.translate_to_urdu(text)
                else:
                    result = self.translator.translate_from_urdu(text)

                return TranslationResult(**result, method="api")

        except Exception as e:
            logger.error(f"Translation failed: {e}")
            # Return original text if translation fails
            return TranslationResult(
                original=text,
                translated=text,
                source_language=from_language or "en",
                target_language=to_language,
                confidence=0.0,
                method="fallback"
            )

    def _detect_language(self, text: str) -> str:
        """Detect if text is Urdu or English."""
        # Simple heuristic: check for Arabic script
        urdu_chars = sum(1 for c in text if '\u0600' <= c <= '\u06FF')
        if urdu_chars > len(text) * 0.3:
            return "ur"
        return "en"

    def translate_todo_data(self, todo: dict, to_language: str = "ur") -> dict:
        """Translate todo object fields."""
        translated = todo.copy()

        # Translate specific fields
        if "title" in todo:
            result = self.translate(todo["title"], to_language)
            translated["title"] = result.translated

        if "description" in todo and todo["description"]:
            result = self.translate(todo["description"], to_language)
            translated["description"] = result.translated

        if "status" in todo:
            translated["status_display"] = get_translation(todo["status"])

        if "priority" in todo:
            translated["priority_display"] = get_translation(f"{todo['priority']} priority")

        return translated
```

## Frontend Integration

### React Component with Urdu Support

```typescript
import React, { useState } from 'react';
import axios from 'axios';

interface Todo {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
}

const UrduTodoList: React.FC = () => {
  const [language, setLanguage] = useState<'en' | 'ur'>('en');
  const [todos, setTodos] = useState<Todo[]>([]);

  const translateTodo = async (todo: Todo): Promise<Todo> => {
    const response = await axios.post('/api/translate', {
      data: todo,
      to_language: language
    });
    return response.data;
  };

  const toggleLanguage = async () => {
    const newLang = language === 'en' ? 'ur' : 'en';
    setLanguage(newLang);

    // Translate all todos
    const translated = await Promise.all(
      todos.map(todo => translateTodo(todo))
    );
    setTodos(translated);
  };

  return (
    <div dir={language === 'ur' ? 'rtl' : 'ltr'}>
      <button onClick={toggleLanguage}>
        {language === 'en' ? 'اردو' : 'English'}
      </button>

      <h1>{language === 'en' ? 'My Tasks' : 'میرے کام'}</h1>

      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <h3>{todo.title}</h3>
            <p>{todo.description}</p>
            <span>{todo.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

### CSS for RTL Support

```css
/* RTL (Right-to-Left) Support for Urdu */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

[dir="rtl"] .todo-item {
  padding-right: 1rem;
  padding-left: 0;
}

[dir="rtl"] button {
  margin-left: 0;
  margin-right: 0.5rem;
}

/* Urdu Font */
.urdu-text {
  font-family: 'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif;
  font-size: 1.1em;
  line-height: 1.8;
}
```

## API Endpoint

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Any

app = FastAPI()
translation_service = UrduTranslationService()

class TranslateRequest(BaseModel):
    text: Optional[str] = None
    data: Optional[dict] = None
    to_language: str = "ur"
    from_language: Optional[str] = None

@app.post("/api/translate")
async def translate_endpoint(request: TranslateRequest):
    """Translation endpoint."""

    if request.text:
        # Translate simple text
        result = translation_service.translate(
            text=request.text,
            to_language=request.to_language,
            from_language=request.from_language
        )
        return result

    elif request.data:
        # Translate structured data (e.g., todo object)
        translated = translation_service.translate_todo_data(
            todo=request.data,
            to_language=request.to_language
        )
        return translated

    else:
        raise HTTPException(status_code=400, detail="No text or data provided")

@app.get("/api/translations/common")
async def get_common_translations(language: str = "ur"):
    """Get common phrase translations."""
    if language == "ur":
        return TODO_TRANSLATIONS
    else:
        # Reverse mapping
        return {v: k for k, v in TODO_TRANSLATIONS.items()}
```

## Transliteration (Roman Urdu)

```python
class UrduTransliterator:
    """Convert between Urdu script and Roman Urdu."""

    # Simplified transliteration map
    URDU_TO_ROMAN = {
        'ا': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ٹ': 't',
        'ث': 's', 'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh',
        'د': 'd', 'ڈ': 'd', 'ذ': 'z', 'ر': 'r', 'ڑ': 'r',
        'ز': 'z', 'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's',
        'ض': 'z', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh',
        'ف': 'f', 'ق': 'q', 'ک': 'k', 'گ': 'g', 'ل': 'l',
        'م': 'm', 'ن': 'n', 'و': 'w', 'ہ': 'h', 'ھ': 'h',
        'ی': 'y', 'ے': 'e'
    }

    def urdu_to_roman(self, text: str) -> str:
        """Convert Urdu to Roman script."""
        result = []
        for char in text:
            result.append(self.URDU_TO_ROMAN.get(char, char))
        return ''.join(result)
```

## Testing

```python
import pytest

@pytest.fixture
def translator():
    return UrduTranslationService(primary_method="marian")

def test_english_to_urdu(translator):
    result = translator.translate("add task", to_language="ur")
    assert result.translated
    assert result.source_language == "en"
    assert result.target_language == "ur"

def test_urdu_to_english(translator):
    result = translator.translate("کام شامل کریں", to_language="en")
    assert result.translated
    assert result.source_language == "ur"
    assert result.target_language == "en"

def test_common_phrase_translation(translator):
    result = translator.translate("today", to_language="ur")
    assert result.translated == "آج"
    assert result.method == "dictionary"

def test_todo_translation(translator):
    todo = {
        "title": "Buy groceries",
        "description": "Get milk and bread",
        "status": "pending",
        "priority": "high"
    }

    translated = translator.translate_todo_data(todo, to_language="ur")
    assert translated["title"] != todo["title"]
    assert "status_display" in translated
```

## Best Practices

1. **Use caching** for common translations
2. **Handle RTL layout** properly in UI
3. **Choose appropriate fonts** for Urdu (Nastaliq)
4. **Test with native speakers** for accuracy
5. **Support mixed language** input (code-switching)
6. **Provide language toggle** in UI
7. **Store language preference** per user
8. **Graceful fallback** if translation fails
9. **Consider cultural context** in translations
10. **Use proper Unicode** handling (UTF-8)

## Notes

- Urdu script requires special fonts (Nastaliq style)
- RTL layout needs CSS adjustments
- MarianMT models work offline but require download
- API-based translation is more accurate but requires internet
- Consider caching for frequently translated phrases
- Test thoroughly with Urdu-speaking users
- Handle mixed English-Urdu content gracefully
