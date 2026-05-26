describe('TODO App', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Create', () => {
    it('adding a new TODO shows the remaining counter and clears the input field', async () => {
      await element(by.id('new-todo-input')).typeText('Buy groceries');
      await element(by.id('add-todo-button')).tap();

      await expect(element(by.text('Buy groceries'))).toBeVisible();
      await expect(element(by.id('todo-count'))).toHaveText('1 of 1 remaining');
      await expect(element(by.id('new-todo-input'))).toHaveText('');
    });

    it('adds multiple TODOs', async () => {
      await element(by.id('new-todo-input')).typeText('First task')
      await element(by.id('add-todo-button')).tap();
      await element(by.id('new-todo-input')).typeText('Second task')
      await element(by.id('add-todo-button')).tap();

      await expect(element(by.text('First task'))).toBeVisible();
      await expect(element(by.text('Second task'))).toBeVisible();
    });

    it('does not add a TODO when input is empty', async () => {
      await element(by.id('add-todo-button')).tap();

      await expect(element(by.id('todo-list'))).not.toExist();
    });
  });

  describe('Read', () => {
    it('shows the empty state when there are no TODOs', async () => {
      await expect(element(by.text('No TODOs yet.'))).toBeVisible();
    });
  });

  describe('Update', () => {
    it('edits a TODO', async () => {
      await element(by.id('new-todo-input')).typeText('Original text');
      await element(by.id('add-todo-button')).tap();

      await element(by.id('edit-todo-1')).tap();
      await waitFor(element(by.id('edit-todo-input'))).toBeVisible()
      await element(by.id('edit-todo-input')).clearText();
      await element(by.id('edit-todo-input')).typeText('Updated text')
      await element(by.id('save-edit-button')).tap();

      await expect(element(by.text('Updated text'))).toBeVisible();
      await expect(element(by.text('Original text'))).not.toExist();
    });

    it('dismisses the edit modal on cancel', async () => {
      await element(by.id('new-todo-input')).typeText('Some task');
      await element(by.id('add-todo-button')).tap();

      await element(by.id('edit-todo-1')).tap();
      await waitFor(element(by.id('edit-todo-input'))).toBeVisible();
      await element(by.id('cancel-edit-button')).tap();

      await expect(element(by.id('edit-modal'))).not.toBeVisible();
      await expect(element(by.text('Some task'))).toBeVisible();
    });

    it('marks a TODO as completed', async () => {
      await element(by.id('new-todo-input')).typeText('Complete me')
      await element(by.id('add-todo-button')).tap();

      await element(by.id('toggle-todo-1')).tap();

      await waitFor(element(by.id('todo-count'))).toHaveText('0 of 1 remaining');
    });

    it('updates the counter when a TODO is completed', async () => {
      await element(by.id('new-todo-input')).typeText('Task A')
      await element(by.id('add-todo-button')).tap();
      await element(by.id('new-todo-input')).typeText('Task B')
      await element(by.id('add-todo-button')).tap();

      await element(by.id('toggle-todo-1')).tap();

      await waitFor(element(by.id('todo-count'))).toHaveText('1 of 2 remaining');
    });

    it('unmarks a completed TODO', async () => {
      await element(by.id('new-todo-input')).typeText('Toggle me')
      await element(by.id('add-todo-button')).tap();

      await element(by.id('toggle-todo-1')).tap();
      await waitFor(element(by.id('todo-count'))).toHaveText('0 of 1 remaining');
      await element(by.id('toggle-todo-1')).tap();

      await waitFor(element(by.id('todo-count'))).toHaveText('1 of 1 remaining');
    });
  });

  describe('Delete', () => {
    it('reveals the delete button on swipe left and hides it on swipe right', async () => {
      await element(by.id('new-todo-input')).typeText('Swipeable task');
      await element(by.id('add-todo-button')).tap();

      await element(by.id('todo-item-1')).swipe('left', 'fast', 0.5);
      await expect(element(by.id('swipe-delete-1'))).toBeVisible();

      await element(by.id('todo-item-1')).swipe('right', 'fast', 0.5);
      await expect(element(by.id('swipe-delete-1'))).not.toBeVisible();
    });

    it('deletes a TODO by swiping left and tapping the delete button', async () => {
      await element(by.id('new-todo-input')).typeText('Swipe to delete me');
      await element(by.id('add-todo-button')).tap();

      await element(by.id('todo-item-1')).swipe('left', 'fast', 0.5);
      await element(by.id('swipe-delete-1')).tap();

      await waitFor(element(by.id('delete-confirm-modal'))).toBeVisible();
      await element(by.id('confirm-delete-button')).tap();

      await expect(element(by.text('Swipe to delete me'))).not.toExist();
      await expect(element(by.text('No TODOs yet.'))).toBeVisible();
    });

    it('cancels swipe deletion when tapping Cancel on the confirmation', async () => {
      await element(by.id('new-todo-input')).typeText('Keep me');
      await element(by.id('add-todo-button')).tap();

      await element(by.id('todo-item-1')).swipe('left', 'fast', 0.5);
      await element(by.id('swipe-delete-1')).tap();

      await waitFor(element(by.id('delete-confirm-modal'))).toBeVisible();
      await element(by.id('cancel-delete-button')).tap();

      await expect(element(by.text('Keep me'))).toBeVisible();
    });
  });
});
