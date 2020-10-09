import React from 'react';
import {
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
  makeStyles, Paper,
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { util } from 'postchain-client';
import log from 'loglevel';
import { POST } from './lib/util';
import useMetaMask from './lib/hooks/use-meta-mask';
import ApplicationState from './core/redux/application-state';
import { setAccountDetail } from './core/redux/account/account.actions';
import * as config from './config';

const useStyles = makeStyles({
  description: {
    margin: '10px',
  },
  textInput: {
    marginTop: '10px',
    marginRight: '5px',
  },
  button: {
    marginTop: '18px',
    marginLeft: '5px',
  },
  stakedTokens: {
    fontWeight: 'bold',
  },
  message: {
    marginTop: '10px',
    fontWeight: 'bold',
  },
  metaMaskInfo: {
    textAlign: 'center',
  },
});

const StakeMain: React.FunctionComponent = () => {
  const classes = useStyles();
  const { loginAPI, haveAccounts, selectedAddress, provider, updateStakeState } = useMetaMask();
  const [stakeAmount, setStakeAmount] = React.useState(10);
  const [duration, setDuration] = React.useState(7);
  const [loading, setLoading] = React.useState(false);
  const [initialized, setInitialized] = React.useState(false);
  const [stakeError, setStakeError] = React.useState('');
  const contracts = loginAPI?.contracts;
  const accountState = useSelector((state: ApplicationState) => state.account);
  const dispatch = useDispatch();
  const needRefresh =
    loginAPI?.stakeState &&
    (!accountState.isChecked ||
      accountState.accountDetail == null ||
      accountState.accountDetail.validUntil !== loginAPI.stakeState.until);

  React.useEffect(() => {
    if (!initialized && loginAPI) {
      if (loginAPI.stakeState != null) {
        const remainingDuration = (Date.now() / 1000 - loginAPI.stakeState.until) / 86400;
        setDuration(Math.max(remainingDuration, 7));
        setStakeAmount(Math.max(loginAPI.stakeState.amount, 10));
      }
      setInitialized(true);
    }
  }, [initialized, loginAPI]);

  async function login(stakeUntilDate: number) {
    const wasLoading = loading;
    if (!loading) {
      if (stakeError !== '') setStakeError('');
      setLoading(true);
    }
    try {
      const pubkey = accountState.keyPair.pubKey.toString('hex');
      const loginMessage = `Please sign your public key '${pubkey}' in order to login`;
      const signature = await loginAPI.messageSigner.sign(selectedAddress, loginMessage);

      const response = await POST(`${config.authServer.url}/login`, {
        signature,
        pubkey,
      });

      log.debug(`Login response: ${response}`);
      if (response.status === 'SUCCESS') {
        const accountID = util.sha256(selectedAddress.toLowerCase()).toString('hex');
        // yes, accountID is sha256 of selected address text
        dispatch(
          setAccountDetail({
            accountID,
            validUntil: stakeUntilDate,
          })
        );
      } else {
        setStakeError('Login server failed, please try later');
      }
    } catch (e) {
      setStakeError(`Error: ${e.message}`);
    }
    if (!wasLoading) setLoading(false);
  }

  async function stake() {
    if (!contracts.staker || !selectedAddress || !stakeAmount || !duration) return;

    if (stakeError !== '') setStakeError('');
    if (loginAPI.stakeState && loginAPI.stakeState.amount > stakeAmount) {
      setStakeError('Cannot reduce stake');
      return;
    }
    try {
      // TODO: do not allow to reduce duration
      const actualStakeAmount = stakeAmount * 1000000;
      const allowance = await contracts.hget.getAllowance(selectedAddress);
      setLoading(true);
      if (allowance < actualStakeAmount) {
        await contracts.hget.approve(selectedAddress, actualStakeAmount);
      }
      const stakeUntilDate = Math.round(Date.now() / 1000 + duration * 86400);
      await contracts.staker.stake(selectedAddress, stakeAmount, stakeUntilDate);
      await updateStakeState();
      await login(stakeUntilDate);
    } catch (e) {
      setStakeError(`Error: ${e.message}`);
    }
    setLoading(false);
  }

  const mainContent = () => {
    return (
      <Grid container spacing={4}>
        {(!loginAPI?.stakeState || !loginAPI.stakeState.isFresh) && (
          <Typography variant="body2" className={classes.description}>
            You need to stake HGET tokens to cast a vote. Staking freezes tokens for a certain duration. Minimum amount
            to stake is 10 HGET, minimum duration is 7 days. Tokens shall be frozen for at least 7 days from the moment
            a vote is cast.
          </Typography>
        )}
        {loginAPI?.stakeState && (
          <Grid item xs={12}>
            <Paper style={{padding: "12px"}}>
              <div>
                <Typography variant="h6">Status</Typography>
              </div>
              <div>
                <Typography variant="body2" component="p">
                  <span className={classes.stakedTokens}>Staked tokens: </span>
                  {loginAPI.stakeState.amount} HGET
                </Typography>
              </div>
              <div>
                <Typography variant="body2">
                  <span className={classes.stakedTokens}>Frozen until: </span>
                  {new Date(loginAPI.stakeState.until * 1000).toLocaleDateString(window.navigator.language)}
                </Typography>
              </div>
              <div>
                <Typography variant="body2" component="p">
                  <span className={classes.stakedTokens}>Logged in: </span>
                  {accountState.isChecked ? 'yes' : 'no'}
                </Typography>
              </div>
            </Paper>
          </Grid>
        )}
        {needRefresh && (
          <Grid item container>
            <Grid item container>
              <Typography variant="h5">Account needs to be refreshed</Typography>
            </Grid>
            <Grid item container>
              <Button
                variant="contained"
                color="primary"
                onClick={() => login(loginAPI.stakeState.until)}
                disabled={loading}
              >
                Refresh account
                {loading && <CircularProgress />}
              </Button>
            </Grid>
          </Grid>
        )}
        <Grid item container>
          <div>
            <TextField
              variant="outlined"
              label="Amount to stake"
              type="number"
              value={stakeAmount}
              inputProps={{ min: 10 }}
              onChange={(e) => setStakeAmount(parseInt(e.target.value))}
              className={classes.textInput}
            />
            <TextField
              variant="outlined"
              label="Duration"
              type="number"
              value={duration}
              inputProps={{ min: 7 }}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className={classes.textInput}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => stake()}
              disabled={loading}
              className={classes.button}
            >
              {loading ? <CircularProgress size={24} /> : <span>{loginAPI?.stakeState ? 'Re-stake' : 'Stake'}</span>}
            </Button>
            {stakeError && (
              <Typography variant="body2" color="error" className={classes.message}>
                {stakeError}
              </Typography>
            )}
          </div>
        </Grid>
      </Grid>
    );
  };

  return (
    <DialogContent dividers>
      {!provider && (
        <div>
          <Typography color="error" variant="h5" component="h5">
            MetaMask not detected
          </Typography>
          <Typography variant="body2" component="p" className={classes.message}>
            In order to submit & vote on proposals, <a href="https://metamask.io/">MetaMask</a> is required.
          </Typography>
        </div>
      )}
      {provider && !haveAccounts && (
        <div className={classes.metaMaskInfo}>
          <CircularProgress size={48} />
          <Typography variant="body2" className={classes.message}>
            Please connect MetaMask
          </Typography>
        </div>
      )}
      {initialized && provider && haveAccounts && selectedAddress && !loginAPI && (
        <Typography color="error" variant="h3">
          Error while initializing
        </Typography>
      )}
      {provider && haveAccounts && selectedAddress && loginAPI && mainContent()}
    </DialogContent>
  );
};

const StakeDialog: React.FunctionComponent<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Account</DialogTitle>
      {open && <StakeMain />}
    </Dialog>
  );
};

export default StakeDialog;
