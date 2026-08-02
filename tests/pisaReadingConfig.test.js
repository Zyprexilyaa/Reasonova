import test from 'node:test';
import assert from 'node:assert/strict';

const { default: readingContent } = await import('../frontend/src/pages/pisaReadingContent.js');

test('reading content exports the PISA units and AI-ready question metadata', () => {
  assert.ok(readingContent);
  assert.ok(Array.isArray(readingContent.units));
  assert.equal(readingContent.units.length, 6);
  assert.ok(Array.isArray(readingContent.units[0].questions));
  assert.ok(readingContent.units[0].questions.length > 0);
  assert.equal(readingContent.units[0].questions[0].type, 'open');
  assert.ok(readingContent.units[0].questions[0].scoringRubric || readingContent.units[0].questions[0].rubric);
});
