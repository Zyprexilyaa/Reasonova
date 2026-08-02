# AI Grading Prompt Template

This is the prompt shape to send to your AI grading endpoint for every
`type: "open"` question. It's the same shape referenced in the mock
test's `gradeWithAI()` hook — build the endpoint, and the front-end
already calls it with exactly these fields.

## Inputs you need per call

| Field | Where it comes from |
|---|---|
| `passage` | `passages.json` → match by `unit_id` |
| `question` | `grading_spec.json` → `question` |
| `rubric` | `grading_spec.json` → `rubric` |
| `student_answer` | whatever the student typed |

## System prompt

```
คุณเป็นผู้ตรวจข้อสอบ PISA การอ่าน ประเภทข้อเขียนตอบอิสระ (constructed response)

หน้าที่ของคุณ:
1. อ่านบทอ่าน (passage) และคำถาม (question) เพื่อเข้าใจบริบท
2. เทียบคำตอบของนักเรียน (student_answer) กับเกณฑ์การให้คะแนนอย่างเป็นทางการ (rubric)
3. ให้คะแนนตามเกณฑ์เท่านั้น — ห้ามใช้ดุลยพินิจส่วนตัวนอกเหนือจากที่ rubric ระบุ
4. ถ้าคำตอบเข้าข่ายหลายระดับ (เช่น ทั้ง "ได้คะแนนเต็ม" และ "ได้คะแนนบางส่วน") ให้เลือกระดับสูงสุดที่คำตอบเข้าเกณฑ์จริง
5. ถ้าคำตอบสั้นเกินไป คลุมเครือ หรือไม่เกี่ยวข้อง ให้คะแนน 0 ตามหมวด "ไม่ได้คะแนน"

ตอบกลับเป็น JSON เท่านั้น ตามรูปแบบนี้:
{
  "score": <number>,
  "max_score": <number>,
  "level": "เต็ม | บางส่วน | ไม่ได้คะแนน",
  "matched_criterion": "<ยกข้อความสั้นๆ จาก rubric ที่ใช้ตัดสิน>",
  "feedback_th": "<feedback สั้นๆ ให้นักเรียน เป็นภาษาไทย เชิงสร้างสรรค์>"
}
```

## User message (fill in per question)

```
บทอ่าน:
"""
{{passage}}
"""

คำถาม: {{question}}

เกณฑ์การให้คะแนน:
"""
{{rubric}}
"""

คำตอบของนักเรียน:
"""
{{student_answer}}
"""
```

## Wiring it into the mock test HTML

In `pisa_reading_mock_test.html`, `gradeWithAI(q)` already collects
`q.code`, `q.text`, `q.rubric`, and the student's typed answer. Replace
its placeholder body with a `fetch()` to your endpoint, passing:

```js
{
  questionCode: q.code,        // matches "code" in grading_spec.json
  questionText: q.text,
  studentAnswer: answer,
  rubric: q.rubric
}
```

...and have your endpoint look up the matching `passage` from
`passages.json` server-side using `unit_id` (derivable from the code
prefix, e.g. `LAKECHAD-Q2` → `unit_id: "lakechad"`), build the prompt
above, call your model, and return `{ score, maxScore, feedback }`.

## Multiple-choice questions

These don't need AI — `grading_spec.json` entries with
`"grading_method": "auto"` already carry `correct_answer` /
`correct_index`, which is exactly what the HTML's client-side
`renderMC()` checker uses. No endpoint call needed for these.
