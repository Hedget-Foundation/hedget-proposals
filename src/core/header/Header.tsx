import React from 'react';
import { Grid } from '@material-ui/core';
import NavigationIcons from './NavigationIcons';
import Logo from './Logo';

const Header: React.FunctionComponent<unknown> = () => {
  return (
    <>
      <Grid container>
        <Grid item xs={8}>
          <Logo />
        </Grid>
        <Grid item xs={4}>
          <NavigationIcons />
        </Grid>
      </Grid>
    </>
  );
};

export default Header;
