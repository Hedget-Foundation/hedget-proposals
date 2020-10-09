import React from 'react';
import { makeStyles } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles({
  wrapper: {
    margin: '0 auto',
    textAlign: 'center',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline',
  },
  logoWrapper: {
    height: '57.5px',
    width: '160px',
    margin: '0 auto',
  },
  image: {
    margin: '0 auto',
    marginTop: '15px',
    textAlign: 'center',
    display: 'inline',
    height: '57.5px',
    width: '160px',
  },
  text: {
    display: 'inline',
  },
});

const Logo: React.FunctionComponent = () => {
  const classes = useStyles();

  return (
    <Box className={classes.logoWrapper}>
      <RouterLink to="/">
        <img src="assets/hedget-logo.png" alt="Hedget logo" className={classes.image} />
      </RouterLink>
    </Box>
  );
  // return (
  //   <>
  //     <RouterLink className={classes.wrapper} to="/">
  //       <img src="/assets/hedget-logo.png" alt="Hedget logo" className={classes.image} />
  //       Test
  //     </RouterLink>
  //   </>
  // );
};

export default Logo;
