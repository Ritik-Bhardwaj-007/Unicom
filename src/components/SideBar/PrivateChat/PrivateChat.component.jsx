import React, { useState, useEffect } from 'react';
import { Icon, Menu } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { setChannel } from '../../../store/actionCreater';
import '../../../server/firebase';
import { getDatabase, ref, onChildAdded, onValue, child, onDisconnect, set, onChildRemoved, serverTimestamp } from 'firebase/database';

import { Notification } from '../Notification/Notification.component';

const PrivateChat = (props) => {

    const [usersState, setUsersState] = useState([]);
    const [connectedUsersState, setConnectedUsersState] = useState([]);

    const database = getDatabase();
    const usersRef = ref(database, 'users');

    const connectedRef = ref(database, '.info/connected');
    const statusRef = child(ref(database), "status/");

    useEffect(() => {
        if (props.user !== null) {
            onChildAdded(usersRef, (snapshot) => {
                setUsersState((currentState) => {
                    let updatedState = [...currentState];

                    let user = snapshot.val();
                    user.name = user.displayName;
                    user.id = snapshot.key;
                    user.isPrivateChat = true;

                    updatedState.push(user);
                    return updatedState;
                })
            });

            onValue(connectedRef, (snapshot) => {
                if (props.user && snapshot.val()) {
                    const userStatusRef = child(statusRef, props.user.uid);
                    set(userStatusRef, true);
                    onDisconnect(userStatusRef).remove();
                }
            });
        }

    }, [props.user]);

    useEffect(() => {
        onChildAdded(statusRef, (snapshot) => {
            setConnectedUsersState((currentState) => {
                let updatedState = [...currentState];
                updatedState.push(snapshot.key);
                return updatedState;
            })
        });

        onChildRemoved(statusRef, (snapshot) => {
            setConnectedUsersState((currentState) => {
                let updatedState = [...currentState];
                let index = updatedState.indexOf(snapshot.key);

                updatedState.splice(index, 1);
                return updatedState;
            })
        });

    }, [usersState]);

    const displayUsers = () => {
        if (usersState.length > 0) {
            return usersState.filter((user) => props.user && user.id !== props.user.uid).map((user) => {
                return <Menu.Item
                    key={user.id}
                    name={user.name}
                    onClick={() => selectUser(user)}
                    active={props.channel && generateChannelId(user.id) === props.channel.id}
                >
                    <span><Icon name='user' /></span>
                    <Icon name='circle' color={`${connectedUsersState.indexOf(user.id) !== -1 ? "green" : "red"}`} />
                    <Notification
                        user={props.user}
                        channel={props.channel}
                        notificationChannelId={generateChannelId(user.id)}
                        displayName={user.name}
                    />
                </Menu.Item>
            })
        }
    }

    const selectUser = (user) => {
        let userTemp = { ...user };
        userTemp.id = generateChannelId(user.id);
        setLastVisited(props.user, props.channel);
        setLastVisited(props.user, userTemp);
        props.selectChannel(userTemp);
    }

    const setLastVisited = (user, channel) => {
        const lastVisited = child(usersRef, `${user.uid}/lastVisited/${channel.id}`);
        set(lastVisited, serverTimestamp());
        onDisconnect(lastVisited).set(serverTimestamp());
    }

    const generateChannelId = (userId) => {
        if (props.user.uid < userId) {
            return props.user.uid + userId;
        }
        else {
            return userId + props.user.uid;
        }
    }

    return <Menu.Menu style={{ marginTop: "35px" }}>
        <Menu.Item style={{ fontSize: "17px" }}>
            <span>
                <Icon name='mail' /> Chats
            </span>
            ({usersState.length - 1})
        </Menu.Item>
        {displayUsers()}
    </Menu.Menu>
}

const mapStateToProps = (state) => {
    return {
        user: state.user.currentUser,
        channel: state.channel.currentChannel
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        selectChannel: (channel) => dispatch(setChannel(channel))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PrivateChat);