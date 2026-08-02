import test from 'node:test';
import assert from 'node:assert/strict';

const { default: readingContent } = await import('../frontend/src/pages/pisaReadingContent.js');

test('reading content exports the PISA passage and AI-ready question metadata', () => {
  assert.ok(readingContent);
  assert.ok(Array.isArray(readingContent.questions));
  assert.ok(readingContent.questions.length > 0);
  assert.equal(readingContent.questions[0].type, 'open');
  assert.ok(readingContent.questions[0].scoringRubric);
  assert.ok(readingContent.sourcePdfUrl);
});
