# Motif & Emotion Extraction System

## Overview

The motif and emotion extraction system uses advanced AI prompting to automatically identify patterns, symbols, emotions, and psychological elements in dream narratives.

## Endpoint

**POST** `/api/extract`

## Features

### 1. **Motif Detection**
Identifies recurring symbols and themes such as:
- Physical elements (water, fire, animals, buildings)
- Actions (flying, falling, running, climbing)
- Scenarios (chase, journey, transformation)
- Objects (keys, doors, mirrors, vehicles)

### 2. **Emotion Analysis**
Extracts primary emotions experienced:
- Basic emotions: fear, joy, sadness, anger, surprise, disgust
- Complex emotions: anxiety, excitement, confusion, peace, awe
- Emotional intensity scoring (1-10)

### 3. **Symbolic Interpretation**
Maps symbols to potential psychological meanings:
- Universal symbolism
- Cultural interpretations
- Personal significance indicators

### 4. **Archetype Identification**
Detects Jungian archetypes:
- Shadow (repressed aspects)
- Anima/Animus (inner feminine/masculine)
- Hero (journey and transformation)
- Trickster (chaos and change)
- Mother/Father (nurturing/authority)
- Wise Old Man/Woman (guidance)

### 5. **Lucidity Assessment**
Measures dream awareness level (0-10):
- 0: Complete non-lucidity
- 1-3: Low awareness/questioning
- 4-6: Partial lucidity
- 7-8: High lucidity with control
- 9-10: Full lucidity and dream control

## Prompt Design

### Structure

The extraction prompt is designed with:

1. **Clear Role Definition**
   - Expert dream analyst specialization
   - Focus on patterns and symbolism

2. **Structured Output Format**
   - JSON schema enforcement
   - Consistent field naming
   - Type validation

3. **Analysis Guidelines**
   - 3-8 motifs (quality over quantity)
   - 2-5 core emotions (avoid over-categorization)
   - Specific but concise descriptions
   - Universal symbols prioritized

4. **Low Temperature Setting**
   - Temperature: 0.3
   - Ensures consistent, reliable extraction
   - Reduces hallucination

5. **JSON Mode**
   - Forces structured output
   - Validates response format

### Prompt Components

```
1. Role & Expertise Definition
   └── "Expert dream analyst specializing in patterns"

2. Input Context
   ├── Dream title (optional)
   ├── Dream content (required)
   └── Existing tags (optional)

3. Output Requirements
   ├── Motifs (array)
   ├── Emotions (array)
   ├── Emotional intensity (1-10)
   ├── Primary theme (string)
   ├── Symbolism (array of objects)
   ├── Archetypes (array)
   └── Lucidity level (0-10)

4. Analysis Guidelines
   ├── Specificity requirements
   ├── Quantity constraints
   ├── Focus areas
   └── Formatting rules

5. JSON Schema Example
   └── Exact structure with examples
```

## API Usage

### Request

```typescript
POST /api/extract
{
  "dreamContent": "I was flying over a vast ocean...",
  "dreamTitle": "Ocean Flight",  // optional
  "existingTags": ["water", "flying"]  // optional
}
```

### Response

```typescript
{
  "success": true,
  "data": {
    "motifs": ["flying", "ocean", "freedom", "height"],
    "emotions": ["excitement", "fear", "awe"],
    "emotionalIntensity": 8,
    "primaryTheme": "A journey of liberation and confronting the unknown",
    "symbolism": [
      {
        "symbol": "ocean",
        "meaning": "vast unconscious, emotional depth, unknown possibilities"
      },
      {
        "symbol": "flying",
        "meaning": "freedom, transcendence, rising above limitations"
      }
    ],
    "archetypes": ["hero"],
    "lucidityLevel": 4
  },
  "usage": {
    "promptTokens": 250,
    "completionTokens": 180,
    "totalTokens": 430
  }
}
```

## Frontend Integration

### Composable Usage

```vue
<script setup>
import { useExtract } from '~/composables/useExtract';

const { extracting, error, extractMotifsAndEmotions } = useExtract();

const extract = async () => {
  const result = await extractMotifsAndEmotions({
    dreamContent: 'My dream content...',
    dreamTitle: 'Optional title',
    existingTags: ['tag1', 'tag2']
  });
  
  if (result) {
    console.log('Motifs:', result.motifs);
    console.log('Emotions:', result.emotions);
    console.log('Theme:', result.primaryTheme);
  }
};
</script>
```

### Demo Page

Visit `/extract` to see the full extraction interface with:
- Visual motif tags
- Emotion indicators
- Intensity bars
- Symbolism breakdown
- Archetype identification
- Lucidity meter

## Best Practices

### 1. **Input Quality**
- Provide detailed dream descriptions (100+ words ideal)
- Include sensory details
- Mention transitions and transformations

### 2. **Tag Refinement**
- Use extracted motifs to enhance dream tags
- Combine with user's intuitive tags
- Build a personal symbol dictionary

### 3. **Pattern Recognition**
- Track recurring motifs across dreams
- Monitor emotional trends
- Identify archetype patterns

### 4. **Interpretation**
- Use as a starting point, not absolute truth
- Combine with personal reflection
- Consider context and life events

## Technical Details

### Model
- **Primary**: Google Gemini 2.0 Flash Experimental (FREE)
- **Temperature**: 0.3 (consistency)
- **Max Tokens**: 1000
- **Cost**: FREE - No charges!

**Other free model options:**
- `google/gemini-2.0-flash-exp:free` (current)
- `meta-llama/llama-3.2-3b-instruct:free`
- `mistralai/mistral-7b-instruct:free`

### Performance
- Average response time: 2-4 seconds
- Token usage: ~400-500 tokens per extraction
- Cost: **FREE** - No charges with free model!

### Error Handling
- Input validation with Zod
- JSON parsing fallback
- Graceful degradation
- User-friendly error messages

## Future Enhancements

1. **Pattern Tracking**
   - Save extractions to database
   - Build personal motif library
   - Generate trend reports

2. **Multi-Dream Analysis**
   - Batch extraction
   - Cross-dream pattern detection
   - Timeline visualization

3. **Custom Symbolism**
   - User-defined symbol meanings
   - Cultural symbol libraries
   - Personal symbol evolution

4. **Integration**
   - Auto-tag dreams with extracted motifs
   - Emotion-based dream search
   - Archetype journey mapping
