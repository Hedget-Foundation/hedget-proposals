import { select, takeLatest, put } from 'redux-saga/effects';
import log from 'loglevel';
import { AccountActionTypes } from './account.state';
import ApplicationState from '../application-state';
import { amountStaked, isCoreAccount } from '../../services/account.service';
import { setAmountStaked, setCoreAccount } from './account.actions';

const getAccountState = (state: ApplicationState) => state.account;

function* checkCoreAccountSaga() {
  const accountState = yield select(getAccountState);

  if (accountState && accountState.accountDetail) {
    const isCore = yield isCoreAccount(accountState.accountDetail);
    yield put(setCoreAccount(isCore));
  }
}

function* checkAmountStakedSaga() {
  const accountState = yield select(getAccountState);

  if (accountState && accountState.accountDetail) {
    const amount = yield amountStaked(accountState.accountDetail);
    log.debug(`User staked ${amount} HGET`);
    yield put(setAmountStaked(amount));
  }
}

export function* accountWatcher() {
  yield takeLatest(AccountActionTypes.CHECK_CORE_ACCOUNT, checkCoreAccountSaga);
  yield takeLatest(AccountActionTypes.CHECK_AMOUNT_STAKED, checkAmountStakedSaga);
}
