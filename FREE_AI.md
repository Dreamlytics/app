# 🆓 Free AI Features - No Cost!

## You Won't Be Charged! 💰

Both the dream analysis and motif extraction features use **completely FREE models** from OpenRouter. You can use them as much as you want without any charges!

## Current Free Model

**Model**: `meta-llama/llama-3.2-3b-instruct:free`

This is Meta's Llama 3.2 3B model, available for free on OpenRouter with better rate limits than Gemini.

**Why Llama 3.2?**
- ✅ Higher rate limits (better for multiple requests)
- ✅ Consistent quality
- ✅ Fast responses
- ✅ Good at following instructions
- ✅ Completely free

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
model: 'meta-llama/llama-3.2-3b-instruct:free'  // Current (recommended - best rate limits)
model: 'google/gemini-2.0-flash-exp:free'  // Alternative (may hit rate limits faster)
model: 'mistralai/mistral-7b-instruct:free'  // Alternative
model: 'nousresearch/hermes-3-llama-3.1-405b:free'  // Alternative (large model)
```

## Rate Limits & Error Handling

### What are rate limits?
Free models have limits on how many requests you can make per minute to prevent abuse.

### Current limits:
- **Llama 3.2**: ~20-50 requests per minute (good for personal use)
- **Gemini 2.0**: ~10-20 requests per minute (can hit limits faster)

### If you see "Rate limit reached":
1. **Wait 60 seconds** - Limits reset every minute
2. **Don't spam the button** - One analysis at a time
3. **Try a different model** - Switch models if one is hitting limits
4. **Consider paid tier** - If you need more requests

### Error Messages:
- ✅ **429**: Rate limit - wait and retry
- ✅ **401**: Invalid API key - check your .env
- ✅ **500**: Server error - check OpenRouter status

## How to Check Current Model

1. Open `/server/api/analyze.post.ts` - line ~65
2. Open `/server/api/extract.post.ts` - line ~85
3. Look for the `model:` field
4. Make sure it ends with `:free`

## Rate Limits

OpenRouter's free models have reasonable rate limits:
- **Llama 3.2**: ~20-50 requests per minute
- **Gemini 2.0**: ~10-20 requests per minute
- Enough for personal dream tracking
- If you hit limits, wait 60 seconds
- No cost, ever!

## Want Paid Models?

If you need more advanced models (like Claude 3.5 Sonnet or GPT-4), you can:
1. Add credits to your OpenRouter account
2. Change the model name in the API files
3. Remove the `:free` suffix

But for dream tracking, the free Gemini model works great! 🌙✨
