# Dream Analysis API

## OpenRouter Integration

The `/api/analyze` endpoint uses OpenRouter to provide AI-powered dream analysis.

### Setup

1. Get an API key from [OpenRouter](https://openrouter.ai/)
2. Add it to your `.env` file:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   ```

### Endpoint

**POST** `/api/analyze`

### Authentication

Requires authentication via JWT token cookie.

### Request Body

```json
{
  "dreamContent": "I was flying over a vast ocean...",
  "dreamTitle": "Flying Dream",  // optional
  "tags": ["flying", "water", "freedom"]  // optional
}
```

### Response

```json
{
  "success": true,
  "analysis": "Detailed AI-generated analysis...",
  "usage": {
    "promptTokens": 150,
    "completionTokens": 500,
    "totalTokens": 650
  }
}
```

### Frontend Usage

Use the `useAnalyze` composable:

```vue
<script setup>
const { analyzing, error, analyzeDream } = useAnalyze();

const analyze = async () => {
  const result = await analyzeDream({
    dreamContent: 'My dream content...',
    dreamTitle: 'Optional title',
    tags: ['tag1', 'tag2']
  });
  
  if (result) {
    console.log('Analysis:', result);
  }
};
</script>
```

### Model

Currently using: `google/gemini-2.0-flash-exp:free`

This is a **FREE model** - no charges applied! You can change the model in `/server/api/analyze.post.ts` to any model available on OpenRouter.

**Other free options:**
- `google/gemini-2.0-flash-exp:free` (recommended)
- `meta-llama/llama-3.2-3b-instruct:free`
- `mistralai/mistral-7b-instruct:free`

### Error Handling

- **400**: Invalid input data
- **401**: Unauthorized (not logged in)
- **500**: OpenRouter API key not configured or API error

### Features

- Interprets dream symbolism
- Identifies emotional themes
- Provides reflection suggestions
- Analyzes key dream symbols
