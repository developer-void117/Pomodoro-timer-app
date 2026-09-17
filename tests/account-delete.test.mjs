import test from 'node:test';
import assert from 'node:assert/strict';
import { getAccountDeletionRedirect } from '../lib/account-delete.mjs';

test('delete-account redirect goes to the login page with a success flag', () => {
  assert.equal(getAccountDeletionRedirect(), '/login?deleted=1');
});
