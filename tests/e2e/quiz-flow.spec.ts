import { test, expect } from '@playwright/test';

test.describe('Quiz flow', () => {
  test('home → quiz page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '认识自我' })).toBeVisible();
    await page.getByRole('link', { name: /开始/ }).click();
    await expect(page).toHaveURL(/\/quiz/);
    await expect(page.getByText(/把活动拖到对应位置/)).toBeVisible();
  });

  test('submit button disabled until 5 placements', async ({ page }) => {
    await page.goto('/quiz');
    const submitBtn = page.getByRole('button', { name: /提交/ });
    await expect(submitBtn).toBeDisabled();
  });

  test('renders 16 activity blocks in pool', async ({ page }) => {
    await page.goto('/quiz');
    const labels = ['写作', '写代码', '画画', '音乐', '摄影', '舞蹈', '运动', '烹饪',
                    '旅游', '演讲', '辩论', '聚会', '阅读', '学习', '独处', '游戏'];
    for (const label of labels) {
      await expect(page.getByText(label).first()).toBeVisible();
    }
  });
});
