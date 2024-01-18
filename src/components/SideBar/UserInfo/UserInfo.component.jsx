import React from "react";
import { Grid, Header, Icon, Image, Dropdown } from "semantic-ui-react";
import { connect } from "react-redux";
import '../../../server/firebase';
import { getAuth, signOut } from 'firebase/auth';

import './UserInfo.css';

const UserInfo = (props) => {

    const getDropDownOptions = () => {
        return [{
            key: 'signout',
            text: <span onClick={handleSignOut}>Sign Out</span>
        }]
    }

    const handleSignOut = () => {
        const auth = getAuth();
        signOut(auth).then(() => console.log('User Signed Out'));
    }

    if (props.user) {
        return (
            <Grid>
                <Grid.Column>
                    <Grid.Row className="userinfo_grid_row">
                        <Header inverted as="h2">
                            <Icon name="university" />
                            <Header.Content>UniCom</Header.Content>
                        </Header>
                        <Header className="userinfo_displayname" inverted as="h4">
                            <Dropdown
                                trigger={
                                    <span>
                                        <Image src={props.user.photoURL} avatar></Image>
                                        {props.user.displayName}
                                    </span>
                                }
                                options={getDropDownOptions()}
                            >
                            </Dropdown>
                        </Header>
                    </Grid.Row>
                </Grid.Column>
            </Grid>
        );
    }

    return null;
}

const mapStateToProps = (state) => {
    return {
        user: state.user.currentUser
    }
}

export default connect(mapStateToProps)(UserInfo);
