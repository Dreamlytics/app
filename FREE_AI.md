# 🆓 Free AI Features - No Cost!

## You Won't Be Charged! 💰

Both the dream analysis and motif extraction features use **completely FREE models** from OpenRouter. You can use them as much as you want without any charges!

## Current Free Model

**Model**: `google/gemini-2.0-flash-exp:free`

This is Google's latest Gemini 2.0 Flash Experimental model, available for free on OpenRouter.

## Features Using Free AI

### 1. Dream Analysis (`/api/analyze`)
- ✅ **FREE** - No charges
- ✅ Full interpretation
- ✅ Symbol meanings
- ✅ Emotional themes
- ✅ Reflection suggestions

### 2. Motif & Emotion Extraction (`/api/extract`)
- ✅ **FREE** - No charges
- ✅ Motif detection
- ✅ Emotion analysis
- ✅ Symbolism mapping
- ✅ Archetype identification
- ✅ Lucidity assessment

## Other Free Model Options

You can switch to these free alternatives in the API files:

```typescript
// In server/api/analyze.post.ts or server/api/extract.post.ts
model: 'google/gemini-2.0-flash-exp:free'  // Current (recommended)
model: 'meta-llama/llama-3.2-3b-instruct:free'  // Alternative
model: 'mistralai/mistral-7b-instruct:free'  // Alternative
```

## How to Check Current Model

1. Open `/server/api/analyze.post.ts` - line ~65
2. Open `/server/api/extract.post.ts` - line ~85
3. Look for the `model:` field
4. Make sure it ends with `:free`

## Rate Limits

OpenRouter's free models have reasonable rate limits:
- ~20 requests per minute
- More than enough for personal use
- No cost, ever!

## Want Paid Models?

If you need more advanced models (like Claude 3.5 Sonnet or GPT-4), you can:
1. Add credits to your OpenRouter account
2. Change the model name in the API files
3. Remove the `:free` suffix

But for dream tracking, the free Gemini model works great! 🌙✨
