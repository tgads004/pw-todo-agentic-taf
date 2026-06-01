import { test, expect } from '@playwright/test';

test.describe('Todo Application Tests', () => {

    test.beforeEach(async ({ page }) => {
        // Navigate to the demo todo app
        await page.goto('https://demo.playwright.dev/todomvc');
    });

    test('should add a new todo item', async ({ page }) => {
        const todoInput = page.getByPlaceholder('What needs to be done?');

        // Add a new todo
        await todoInput.fill('Buy groceries');
        await todoInput.press('Enter');

        // Verify the todo was added
        await expect(page.getByTestId('todo-title')).toContainText('Buy groceries');

        // Verify the todo count
        await expect(page.getByText('1 item left')).toBeVisible();
    });

    test('should complete a todo item', async ({ page }) => {
        const todoInput = page.getByPlaceholder('What needs to be done?');

        // Add a new todo
        await todoInput.fill('Complete test automation');
        await todoInput.press('Enter');

        // Mark as complete
        await page.getByLabel('Toggle Todo').click();

        // Verify the todo is marked as complete
        await expect(page.locator('.todo-list li')).toHaveClass(/completed/);

        // Verify the todo count shows 0 items left
        await expect(page.getByText('0 items left')).toBeVisible();
    });

    test('should delete a todo item', async ({ page }) => {
        const todoInput = page.getByPlaceholder('What needs to be done?');

        // Add a new todo
        await todoInput.fill('Task to be deleted');
        await todoInput.press('Enter');

        // Hover over the todo to reveal the delete button
        await page.locator('.todo-list li').hover();

        // Click the delete button
        await page.getByLabel('Delete').click();

        // Verify the todo list is empty
        await expect(page.locator('.todo-list li')).toHaveCount(0);
    });

    test('should add multiple todos', async ({ page }) => {
        const todoInput = page.getByPlaceholder('What needs to be done?');

        // Add multiple todos
        const todos = ['First task', 'Second task', 'Third task'];

        for (const todo of todos) {
            await todoInput.fill(todo);
            await todoInput.press('Enter');
        }

        // Verify all todos were added
        await expect(page.locator('.todo-list li')).toHaveCount(3);

        // Verify the todo count
        await expect(page.getByText('3 items left')).toBeVisible();
    });

    test('should filter active todos', async ({ page }) => {
        const todoInput = page.getByPlaceholder('What needs to be done?');

        // Add todos
        await todoInput.fill('Active task');
        await todoInput.press('Enter');
        await todoInput.fill('Completed task');
        await todoInput.press('Enter');

        // Complete the second todo
        await page.locator('.todo-list li').nth(1).getByLabel('Toggle Todo').click();

        // Filter to show only active todos
        await page.getByRole('link', { name: 'Active' }).click();

        // Verify only active todos are shown
        await expect(page.locator('.todo-list li')).toHaveCount(1);
        await expect(page.getByTestId('todo-title')).toContainText('Active task');
    });

    test('should filter completed todos', async ({ page }) => {
        const todoInput = page.getByPlaceholder('What needs to be done?');

        // Add todos
        await todoInput.fill('Active task');
        await todoInput.press('Enter');
        await todoInput.fill('Completed task');
        await todoInput.press('Enter');

        // Complete the second todo
        await page.locator('.todo-list li').nth(1).getByLabel('Toggle Todo').click();

        // Filter to show only completed todos
        await page.getByRole('link', { name: 'Completed' }).click();

        // Verify only completed todos are shown
        await expect(page.locator('.todo-list li')).toHaveCount(1);
        await expect(page.getByTestId('todo-title')).toContainText('Completed task');
    });

    test('should clear completed todos', async ({ page }) => {
        const todoInput = page.getByPlaceholder('What needs to be done?');

        // Add multiple todos
        await todoInput.fill('Task 1');
        await todoInput.press('Enter');
        await todoInput.fill('Task 2');
        await todoInput.press('Enter');

        // Complete first todo
        await page.locator('.todo-list li').first().getByLabel('Toggle Todo').click();

        // Clear completed todos
        await page.getByRole('button', { name: 'Clear completed' }).click();

        // Verify only active todo remains
        await expect(page.locator('.todo-list li')).toHaveCount(1);
        await expect(page.getByTestId('todo-title')).toContainText('Task 2');
    });
});
