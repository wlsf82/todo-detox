describe('TODO App', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Create', () => {
    it('should add a new TODO', async () => {
      await element(by.id('new-todo-input')).typeText('Buy groceries');
      await element(by.id('add-todo-button')).tap();

      await expect(element(by.text('Buy groceries'))).toBeVisible();
    });

    it('should clear the input after adding a TODO', async () => {
      await element(by.id('new-todo-input')).typeText('Read a book');
      await element(by.id('add-todo-button')).tap();

      await expect(element(by.id('new-todo-input'))).toHaveText('');
    });

    it('should add multiple TODOs', async () => {
      await element(by.id('new-todo-input')).typeText('First task');
      await element(by.id('add-todo-button')).tap();

      await element(by.id('new-todo-input')).typeText('Second task');
      await element(by.id('add-todo-button')).tap();

      await expect(element(by.text('First task'))).toBeVisible();
      await expect(element(by.text('Second task'))).toBeVisible();
    });

    it('should not add a TODO when input is empty', async () => {
      await element(by.id('add-todo-button')).tap();

      await expect(element(by.id('todo-list'))).not.toExist();
    });

    it('should show the remaining counter after adding a TODO', async () => {
      await element(by.id('new-todo-input')).typeText('Task one');
      await element(by.id('add-todo-button')).tap();

      await expect(element(by.id('todo-count'))).toHaveText('1 of 1 remaining');
    });
  });

  describe('Read', () => {
    it('should show the empty state when there are no TODOs', async () => {
      await expect(element(by.text('No TODOs yet.'))).toBeVisible();
    });

    it('should show added TODOs in the list', async () => {
      await element(by.id('new-todo-input')).typeText('Walk the dog');
      await element(by.id('add-todo-button')).tap();

      await expect(element(by.text('Walk the dog'))).toBeVisible();
    });
  });

  describe('Update', () => {
    it('should edit a TODO', async () => {
      await element(by.id('new-todo-input')).typeText('Original text');
      await element(by.id('add-todo-button')).tap();

      await element(by.id('edit-todo-1')).tap();
      await waitFor(element(by.id('edit-todo-input')))
        .toBeVisible()
        .withTimeout(2000);
      await element(by.id('edit-todo-input')).clearText();
      await element(by.id('edit-todo-input')).typeText('Updated text');
      await element(by.id('save-edit-button')).tap();

      await expect(element(by.text('Updated text'))).toBeVisible();
      await expect(element(by.text('Original text'))).not.toExist();
    });

    it('should dismiss the edit modal on cancel', async () => {
      await element(by.id('new-todo-input')).typeText('Some task');
      await element(by.id('add-todo-button')).tap();

      await element(by.id('edit-todo-1')).tap();
      await waitFor(element(by.id('edit-modal')))
        .toBeVisible()
        .withTimeout(2000);

      await element(by.id('cancel-edit-button')).tap();
      await expect(element(by.id('edit-modal'))).not.toBeVisible();
    });

    it('should mark a TODO as completed', async () => {
      await element(by.id('new-todo-input')).typeText('Complete me');
      await element(by.id('add-todo-button')).tap();

      await element(by.id('toggle-todo-1')).tap();

      await waitFor(element(by.id('todo-count')))
        .toHaveText('0 of 1 remaining')
        .withTimeout(2000);
    });

    it('should update the counter when a TODO is completed', async () => {
      await element(by.id('new-todo-input')).typeText('Task A');
      await element(by.id('add-todo-button')).tap();
      await element(by.id('new-todo-input')).typeText('Task B');
      await element(by.id('add-todo-button')).tap();

      await element(by.id('toggle-todo-1')).tap();

      await waitFor(element(by.id('todo-count')))
        .toHaveText('1 of 2 remaining')
        .withTimeout(2000);
    });

    it('should unmark a completed TODO', async () => {
      await element(by.id('new-todo-input')).typeText('Toggle me');
      await element(by.id('add-todo-button')).tap();

      await element(by.id('toggle-todo-1')).tap();
      await waitFor(element(by.id('todo-count')))
        .toHaveText('0 of 1 remaining')
        .withTimeout(2000);

      await element(by.id('toggle-todo-1')).tap();
      await waitFor(element(by.id('todo-count')))
        .toHaveText('1 of 1 remaining')
        .withTimeout(2000);
    });
  });

  describe('Delete', () => {
    it('should delete a TODO', async () => {
      await element(by.id('new-todo-input')).typeText('Delete me');
      await element(by.id('add-todo-button')).tap();

      await element(by.id('delete-todo-1')).tap();
      await waitFor(element(by.id('delete-confirm-modal')))
        .toBeVisible()
        .withTimeout(2000);
      await element(by.id('confirm-delete-button')).tap();

      await expect(element(by.text('Delete me'))).not.toExist();
    });

    it('should show the empty state after deleting the last TODO', async () => {
      await element(by.id('new-todo-input')).typeText('Last task');
      await element(by.id('add-todo-button')).tap();

      await element(by.id('delete-todo-1')).tap();
      await waitFor(element(by.id('delete-confirm-modal')))
        .toBeVisible()
        .withTimeout(2000);
      await element(by.id('confirm-delete-button')).tap();

      await expect(element(by.text('No TODOs yet.'))).toBeVisible();
    });

    it('should cancel deletion when tapping Cancel on the confirmation', async () => {
      await element(by.id('new-todo-input')).typeText('Keep me');
      await element(by.id('add-todo-button')).tap();

      await element(by.id('delete-todo-1')).tap();
      await waitFor(element(by.id('delete-confirm-modal')))
        .toBeVisible()
        .withTimeout(2000);
      await element(by.id('cancel-delete-button')).tap();

      await expect(element(by.text('Keep me'))).toBeVisible();
    });
  });
});
