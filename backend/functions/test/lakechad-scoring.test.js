const assert = require('assert');
const { buildScoringPrompt } = require('../lib/analyzeAnswer');

(async () => {
  const prompt = buildScoringPrompt({
    questionId: 'lakechad-q3',
    transcription: 'The lake reappeared after it disappeared during the ice age.',
    scoringGuideline: 'Official rubric placeholder',
    studentId: 'test-student',
    referenceAnswer: 'The lake reappeared after disappearing.'
  });

  assert.match(prompt, /บทอ่าน:/);
  assert.match(prompt, /เกณฑ์การให้คะแนน:/);
  assert.match(prompt, /การปรากฏขึ้นใหม่ของทะเลสาบ/);

  console.log('Lake Chad scoring prompt built successfully.');
})();
