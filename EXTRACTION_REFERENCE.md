# Motif & Emotion Extraction - Quick Reference

## Extraction Pipeline

```
User Input (Dream Description)
           ↓
    Validation Layer
    - Min length check
    - Format validation
           ↓
    Prompt Construction
    - Role definition
    - Context injection
    - Schema specification
           ↓
    OpenRouter API
    - Model: Gemini 2.0 Flash (FREE)
    - Temperature: 0.3
    - JSON output requested
           ↓
    Response Processing
    - JSON parsing
    - Field validation
    - Type checking
           ↓
    Structured Output
    ├── Motifs (3-8 items)
    ├── Emotions (2-5 items)
    ├── Intensity (1-10)
    ├── Theme (narrative)
    ├── Symbolism (meanings)
    ├── Archetypes (Jungian)
    └── Lucidity (0-10)
```

## Output Categories

### 🌟 Motifs
Common dream motifs detected:
- **Nature**: water, fire, earth, sky, plants, animals
- **Architecture**: house, building, door, window, stairs, bridge
- **Action**: flying, falling, running, chasing, climbing, swimming
- **Objects**: key, mirror, vehicle, phone, book, weapon
- **People**: stranger, family, friend, authority, child, crowd

### 💫 Emotions
Primary emotions extracted:
- **Primary**: fear, joy, sadness, anger, surprise, disgust
- **Secondary**: anxiety, excitement, confusion, peace, awe, shame, pride
- **Complex**: nostalgia, anticipation, determination, vulnerability

### 🎯 Themes
Dream narrative patterns:
- Journey and transformation
- Confrontation and conflict
- Loss and search
- Achievement and failure
- Connection and isolation
- Freedom and constraint

### 🔮 Symbolism
Universal symbolic meanings:
- **Water**: emotions, unconscious, cleansing, life
- **Flight**: freedom, escape, transcendence, aspiration
- **Fall**: loss of control, failure, vulnerability
- **Chase**: avoidance, fear, pursuit of goals
- **Death**: transformation, endings, rebirth
- **Birth**: new beginnings, creativity, potential

### 🏛️ Archetypes
Jungian psychological patterns:
- **Shadow**: repressed aspects, dark side
- **Anima/Animus**: inner feminine/masculine
- **Hero**: journey, challenge, growth
- **Trickster**: chaos, change, humor
- **Wise Old Man/Woman**: guidance, wisdom
- **Mother**: nurturing, protection
- **Father**: authority, structure

### ✨ Lucidity Levels
```
0     Non-lucid dream
│
1-3   Low awareness
│     - Questioning reality
│     - Brief moments of clarity
│
4-6   Partial lucidity
│     - Aware of dreaming
│     - Limited control
│
7-8   High lucidity
│     - Full awareness
│     - Good control
│
9-10  Complete lucidity
      - Total dream control
      - Maintained awareness
```

## Prompt Engineering Strategy

### Temperature Selection
```
0.0-0.3  ← Consistent extraction (USED)
0.4-0.6  ← Balanced creativity
0.7-1.0  ← Creative interpretation
```

### Token Allocation
```
Prompt:      ~250 tokens
Completion:  ~180 tokens
Buffer:      ~570 tokens
────────────────────────
Total:       ~1000 tokens
```

### JSON Schema Enforcement
```json
{
  "motifs": ["array", "of", "strings"],
  "emotions": ["validated", "emotions"],
  "emotionalIntensity": 7,
  "primaryTheme": "single sentence description",
  "symbolism": [
    {
      "symbol": "element name",
      "meaning": "interpretation"
    }
  ],
  "archetypes": ["jungian", "types"],
  "lucidityLevel": 5
}
```

## Usage Example

### Input
```javascript
{
  dreamContent: "I was in a massive library with endless shelves reaching into darkness. I could fly between them, searching for a specific book. The librarian was my grandmother who passed away. I felt both excited and sad.",
  dreamTitle: "The Infinite Library",
  existingTags: ["library", "grandmother"]
}
```

### Output
```javascript
{
  motifs: ["library", "flying", "searching", "books", "darkness", "deceased loved one"],
  emotions: ["excitement", "sadness", "nostalgia", "curiosity"],
  emotionalIntensity: 7,
  primaryTheme: "A quest for knowledge and connection with the past",
  symbolism: [
    {
      symbol: "library",
      meaning: "accumulated knowledge, memory, life's experiences"
    },
    {
      symbol: "flying",
      meaning: "freedom of thought, elevated perspective"
    },
    {
      symbol: "grandmother",
      meaning: "wisdom, guidance from the past, ancestral connection"
    },
    {
      symbol: "darkness",
      meaning: "unknown aspects, hidden knowledge, the unconscious"
    }
  ],
  archetypes: ["wise old woman", "hero"],
  lucidityLevel: 6
}
```

## Integration Points

### With Dream Storage
```typescript
// Save extraction results with dream
const dream = await createDream({
  title: "...",
  content: "...",
  tags: extractedMotifs,  // Use motifs as tags
  metadata: {
    emotions: extraction.emotions,
    intensity: extraction.emotionalIntensity,
    archetypes: extraction.archetypes,
    lucidity: extraction.lucidityLevel
  }
});
```

### With Analysis
```typescript
// Combine extraction with full analysis
const extraction = await extractMotifsAndEmotions(dream);
const analysis = await analyzeDream({
  ...dream,
  tags: extraction.motifs  // Inform analysis with extracted motifs
});
```

### With Search
```typescript
// Enable motif-based search
const dreams = await searchDreams({
  motifs: ["water", "flying"],
  emotions: ["fear"],
  intensityMin: 7
});
```
