# Fatwa Answer Submission - Quick Reference

## API Endpoint
```
PUT https://noneffusive-reminiscent-tanna.ngrok-free.dev/api/v1/fatwas/{fatwaID}/answer
```

## Request Format
```json
{
  "answer": "Your answer text here"
}
```

## Headers Required
```
Content-Type: application/json
Authorization: Bearer {access_token}
```

## Complete Code Flow

### 1. User Types Answer in FatwaCard
```typescript
<textarea
  value={answer}
  onChange={(e) => setAnswer(e.target.value)}
  placeholder="write here..."
/>
```

### 2. User Clicks Submit Button
```typescript
<button onClick={handleSubmitAnswer}>
  Submit Answer
</button>
```

### 3. FatwaCard Validates and Calls Parent
```typescript
const handleSubmitAnswer = async () => {
  if (!answer.trim() || !onAnswer) return;
  setIsSubmitting(true);
  try {
    await onAnswer(fatwa.id, answer);
    setAnswer("");
  } finally {
    setIsSubmitting(false);
  }
};
```

### 4. FatwasPage Makes API Request
```typescript
const handleAnswer = async (fatwaId: string, answer: string) => {
  const token = localStorage.getItem("access_token");
  
  const response = await fetch(
    `https://noneffusive-reminiscent-tanna.ngrok-free.dev/api/v1/fatwas/${fatwaId}/answer`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ answer: answer.trim() }),
    }
  );
  
  if (response.ok) {
    setFatwas((prev) => prev.filter((f) => f.id !== fatwaId));
    alert("Answer submitted successfully!");
  }
};
```

## Console Logs to Check

### Submission Started
```
[FatwaCard] Submitting answer: {
  fatwaId: "fatwa_123",
  answerLength: 150,
  preacher: "Ahmed Al-Mansouri"
}
```

### API Request Sent
```
[Fatwas] Submitting answer for fatwa: {
  fatwaId: "fatwa_123",
  answerLength: 150,
  hasToken: true
}
```

### Response Received
```
[Fatwas] Answer submission response status: 200
```

### Success
```
[Fatwas] ✓ Answer submitted successfully: {
  fatwaId: "fatwa_123",
  response: {...}
}
```

## Testing Checklist

- [ ] Login as preacher
- [ ] Navigate to fatwas page
- [ ] Verify preacher name displays
- [ ] Type answer in textarea
- [ ] Click "Submit Answer"
- [ ] Check console for logs
- [ ] Verify success alert appears
- [ ] Verify fatwa removed from list
- [ ] Verify input field cleared

## Troubleshooting

| Issue | Check | Solution |
|-------|-------|----------|
| Button doesn't respond | Console for errors | Check token exists |
| "Failed to submit" error | Network tab response | Check API endpoint |
| Fatwa not removed | Console for success log | Refresh page |
| No preacher name | localStorage user data | Login again |
| 401 Unauthorized | Token validity | Login again |
| 404 Not Found | Fatwa ID | Check fatwa exists |

## Key Files

- `app/khateb_Studio/fatwas/fatwaCard.tsx` - UI component
- `app/khateb_Studio/fatwas/page.tsx` - API handler
- `FATWA_ANSWER_API_INTEGRATION.md` - Full documentation

## Environment

**Backend URL:** `https://noneffusive-reminiscent-tanna.ngrok-free.dev`

**Endpoint:** `/api/v1/fatwas/{fatwaID}/answer`

**Method:** `PUT`

**Auth:** Bearer token from localStorage
