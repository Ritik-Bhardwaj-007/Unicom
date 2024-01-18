import React from 'react';
import { Grid } from 'semantic-ui-react';

import './components/SideBar/SideBar.component';
import './App.css';
import { SideBar } from './components/SideBar/SideBar.component';
import Messages from './components/Messages/Messages.component';

function App() {
  return (
    <Grid columns="equal">
      <SideBar />
      <Grid.Column className='messagepanel'>
        <Messages />
      </Grid.Column>
    </Grid>
  );
}

export default App;
