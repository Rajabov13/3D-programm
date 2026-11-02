// Plays mini-game stages in the browser using the answer keys from dump-fixtures.ts.
// Buttons carry data-opt / data-line / data-pair attributes (stable test hooks).

/** Answers the task currently on screen; `correct: false` picks a wrong answer where possible. */
async function answerTask(page, spec, { correct = true, check = 'Check', cont = 'Continue' } = {}) {
  if (spec.kind === 'match') {
    for (let i = 0; i < spec.count; i++) {
      await page.locator(`[data-pair="l${i}"]`).click();
      await page.locator(`[data-pair="r${correct ? i : (i + 1) % spec.count}"]`).click();
      if (!correct) break;
    }
    if (!correct) {
      // A wrong pair costs a heart; finish the board correctly.
      for (let i = 0; i < spec.count; i++) {
        const left = page.locator(`[data-pair="l${i}"]`);
        if (await left.isDisabled()) continue;
        await left.click();
        await page.locator(`[data-pair="r${i}"]`).click();
      }
    }
  } else {
    if (spec.kind === 'choice' || spec.kind === 'bug') {
      await page.locator(`[data-${spec.kind === 'bug' ? 'line' : 'opt'}="${correct ? spec.answer : spec.wrong}"]`).click();
    } else if (spec.kind === 'order') {
      const order = [...Array(spec.count).keys()];
      if (!correct) [order[0], order[1]] = [order[1], order[0]];
      for (const i of order) await page.locator(`[data-line="${i}"]`).click();
    }
    await page.getByRole('button', { name: check, exact: true }).click();
  }
  await page.getByRole('button', { name: cont, exact: true }).click();
}

/** Plays a whole stage. `wrong` lists task indexes (first attempt) to answer wrongly. */
async function playStage(page, base, stage, { wrong = [], labels = {} } = {}) {
  await page.goto(`${base}/play/${stage.id}`);
  // Learning cards first (info → picture → example), then the test.
  for (let i = 1; i < stage.cards; i++) await page.getByRole('button', { name: labels.next ?? 'Next', exact: true }).click();
  await page.getByRole('button', { name: labels.start ?? 'Start the test', exact: true }).click();
  const queue = stage.tasks.map((_, i) => i);
  const requeued = new Set();
  let mistakes = 0;
  for (let pos = 0; pos < queue.length; pos++) {
    const index = queue[pos];
    const isWrong = wrong.includes(index) && !requeued.has(index);
    await answerTask(page, stage.tasks[index], { correct: !isWrong, check: labels.check, cont: labels.cont });
    if (isWrong) {
      mistakes++;
      requeued.add(index);
      queue.push(index);
      if (mistakes >= 3) return 'failed';
    }
  }
  return 'done';
}

module.exports = { answerTask, playStage };
