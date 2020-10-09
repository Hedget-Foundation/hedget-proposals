import React, { useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import PersonIcon from '@material-ui/icons/Person';
import CategoryIcon from '@material-ui/icons/Category';
import TimerIcon from '@material-ui/icons/Timer';
import EventIcon from '@material-ui/icons/Event';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import { RouteComponentProps } from 'react-router';
import {Typography, makeStyles, Container} from '@material-ui/core';
import { useSelector } from 'react-redux';
import Button from '@material-ui/core/Button';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Proposal, PollOption } from '../../core/services/proposals.model';
import {
  deleteProposal,
  getFullProposal,
  getProposalPollOptions,
  getProposalPollVote,
  voteForOptionInPoll,
} from '../../core/services/proposals.service';
import StatusChip from '../../shared/StatusChip';
import PollOptionStats from './poll/PollOptionStats';
import PollVoteOption from './poll/PollVoteOption';
import ApplicationState from '../../core/redux/application-state';
import { COLOR_RED } from '../../core/dynamic-theme/DefaultTheme';
import { formatedAuthor } from './util';
import {Link as RouterLink} from "react-router-dom";
import Box from "@material-ui/core/Box";

interface MatchParams {
  id: string;
}
const useStyles = makeStyles({
  leftContainer: {
    marginRight: '10px',
  },
  rightContainer: {
    marginTop: '10px',
  },
  authorWrapper: {
    marginTop: '10px',
  },
  iconText: {
    position: 'relative',
    top: -7,
    left: 2,
    maxWidth: '2ch',
    marginLeft: '2px',
  },
  title: {
    position: 'relative',
    top: '5px',
    marginLeft: '10px',
  },
  coreActions: {
    float: 'right',
  },
  coreDivider: {
    marginBottom: '10px',
  },
  deleteBtn: {
    backgroundColor: COLOR_RED,
  },
  description: {
    whiteSpace: 'pre-wrap',
  },
  link: {
    textDecoration: 'none',
  },
});

const FullProposal: React.FunctionComponent<RouteComponentProps<MatchParams>> = (props) => {
  const classes = useStyles();

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));

  const [proposal, setProposal] = useState<Proposal>();
  const [pollOptions, setPollOptions] = useState<PollOption[]>();
  const [optionVote, setOptionVote] = useState<string>();
  const accountState = useSelector((state: ApplicationState) => state.account);

  useEffect(() => {
    if (props.match.params.id) {
      getFullProposal(props.match.params.id).then((p) => setProposal(p));
      getProposalPollOptions(props.match.params.id).then((o) => setPollOptions(o));
    }
  }, [props]);

  useEffect(() => {
    if (!optionVote && pollOptions && accountState.isChecked && accountState.accountDetail) {
      getProposalPollVote(accountState, props.match.params.id).then((vote) => setOptionVote(vote));
    }
  }, [optionVote, pollOptions, accountState, props]);

  function renderPollStats(total: number) {
    return pollOptions.map((option) => (
      <PollOptionStats
        key={option.text}
        text={option.text}
        votes={option.votes}
        total={total}
        selected={option.text === optionVote}
      />
    ));
  }

  function voteForOption(voteAnswer: string): void {
    const answer = pollOptions.find((a) => a.text === voteAnswer);

    if (answer) {
      answer.votes += accountState.amountStaked;
      setOptionVote(answer.text);
      voteForOptionInPoll(accountState, proposal.id, answer.text).then();
    }
  }

  function renderPollOptions() {
    return pollOptions.map((option) => (
      <PollVoteOption key={option.text} text={option.text} voteHandler={voteForOption} />
    ));
  }

  if (!proposal || !pollOptions) return null;

  const total = pollOptions.map((opt) => opt.votes).reduce((a, b) => a + b, 0);

  return (
    <div>
      <Container>
        <RouterLink to="/">
          <Typography variant="h6">{"<<<"}</Typography>
        </RouterLink>
      </Container>
      <Typography variant="h5" component="span">
        <b>{proposal.id}:</b> {proposal.title}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <div className={classes.leftContainer}>
            <p className={classes.description}>{proposal.description}</p>
          </div>
        </Grid>
        <Grid item xs={12} md={6}>
          <div className={classes.rightContainer}>
            {accountState.isCoreAccount && (
              <div className={classes.coreActions}>
                <Button
                  variant="contained"
                  className={classes.deleteBtn}
                  onClick={() =>
                    deleteProposal(accountState, proposal.id).then(() => {
                      window.location.href = window.location.origin;
                    })
                  }
                >
                  <DeleteForeverIcon />
                </Button>
              </div>
            )}
            <StatusChip status={proposal.status} />
            <div className={classes.authorWrapper}>
              <PersonIcon />
              <a
                href={`https://etherscan.io/address/${proposal.author}`}
                className={classes.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Typography variant="body2" component="span" className={classes.iconText}>
                  {matches ? formatedAuthor(proposal.author) : proposal.author}
                </Typography>
              </a>
            </div>
            <div>
              <CategoryIcon />
              <Typography variant="body2" component="span" className={classes.iconText}>
                {proposal.category}
              </Typography>
            </div>
            <div>
              <TimerIcon />
              <Typography variant="body2" component="span" className={classes.iconText}>
                {new Date(proposal.startTimestamp).toDateString()}
              </Typography>
            </div>
            <div>
              <EventIcon />
              <Typography variant="body2" component="span" className={classes.iconText}>
                {new Date(proposal.endTimestamp).toDateString()}
              </Typography>
            </div>
          </div>
        </Grid>
        {total !== 0 && (
          <Grid item xs={12} md={6}>
            {renderPollStats(total)}
          </Grid>
        )}
        {total === 0 && (
          <Grid item xs={12}>
            <Typography variant="h5">No votes so far</Typography>
          </Grid>
        )}
        {accountState.isChecked &&
          accountState.accountDetail &&
          proposal &&
          !optionVote &&
          proposal.status === 'In Progress' && (
            <Grid item xs={12}>
              {renderPollOptions()}
            </Grid>
          )}
      </Grid>
    </div>
  );
};

export default FullProposal;
