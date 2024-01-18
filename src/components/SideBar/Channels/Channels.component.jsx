import React, { useState, useEffect } from 'react';
import { Button, Icon, Menu, Modal, Form, Segment } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { setChannel } from '../../../store/actionCreater';
import '../../../server/firebase';
import { getDatabase, ref, child, push, update, onChildAdded, set, onDisconnect, serverTimestamp } from 'firebase/database';

import { Notification } from '../Notification/Notification.component';
import './Channels.css';

const Channels = (props) => {

    const [modalOpenState, setModalOpenState] = useState(false);
    const [channelAddState, setChannelAddState] = useState({ name: "", description: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [channelsState, setChannelsState] = useState([]);

    const database = getDatabase();
    const channelsRef = ref(database, 'channels');
    const usersRef = ref(database, 'users');

    useEffect(() => {
        onChildAdded(channelsRef, (snapshot) => {
            setChannelsState((currentState) => {
                let updatedState = [...currentState];
                updatedState.push(snapshot.val());
                return updatedState;
            })
        });
    }, []);

    useEffect(() => {
        if (channelsState.length >= 1) {
            props.selectChannel(channelsState[0]);
        }
    }, [!props.channel ? channelsState : null]);

    const openModal = () => {
        setModalOpenState(true);
    }

    const closeModal = () => {
        setModalOpenState(false);
    }

    const checkIfFormValid = () => {
        return channelAddState && channelAddState.name && channelAddState.description;
    }

    const displayChannels = () => {
        if (channelsState.length > 0) {
            return channelsState.map((channel) => {
                return <Menu.Item
                    key={channel.id}
                    onClick={() => selectChannel(channel)}
                    active={props.channel && channel.id === props.channel.id && !props.channel.isFavourite}
                >
                    <span><Icon name='users' /></span>
                    <Notification
                        user={props.user}
                        channel={props.channel}
                        notificationChannelId={channel.id}
                        displayName={channel.name}
                    />
                </Menu.Item>
            })
        }
    }

    const selectChannel = (channel) => {
        setLastVisited(props.user, props.channel);
        setLastVisited(props.user, channel);
        props.selectChannel(channel);
    }

    const setLastVisited = (user, channel) => {
        const lastVisited = child(usersRef, `${user.uid}/lastVisited/${channel.id}`);
        set(lastVisited, serverTimestamp());
        onDisconnect(lastVisited).set(serverTimestamp());
    }

    const onSubmit = () => {

        if (!checkIfFormValid()) {
            return;
        }

        const key = push(child(ref(database), 'channels')).key;

        const channel = {
            id: key,
            name: channelAddState.name,
            description: channelAddState.description,
            created_by: {
                name: props.user.displayName,
                avatar: props.user.photoURL
            }
        }

        setIsLoading(true);

        const updates = {};
        updates["channels/" + key] = channel;

        update(ref(database), updates)
            .then(() => {
                setChannelAddState({ name: '', description: '' });
                closeModal();
            })
            .catch((err) => {
                console.log(err);
            });

        setIsLoading(false);

    }

    const handleInput = (e) => {
        let target = e.target;
        setChannelAddState((currentState) => {
            let updatedState = { ...currentState };
            updatedState[target.name] = target.value;
            return updatedState;
        })
    }

    return <> <Menu.Menu style={{ marginTop: "35px" }}>
        <Menu.Item style={{ fontSize: "17px" }}>
            <span>
                <Icon name='exchange' /> Channels
            </span>
            ({channelsState.length})
        </Menu.Item>
        {displayChannels()}
        <Menu.Item>
            <span className='clickAble' onClick={openModal}>
                <Icon name='add' /> ADD
            </span>
        </Menu.Item>
    </Menu.Menu>
        <Modal open={modalOpenState} onClose={closeModal}>
            <Modal.Header>
                Create Channel
            </Modal.Header>
            <Modal.Content>
                <Form onSubmit={onSubmit}>
                    <Segment stacked>
                        <Form.Input
                            name="name"
                            value={channelAddState.name}
                            onChange={handleInput}
                            type='text'
                            placeholder="Enter Channel Name"
                        />
                        <Form.Input
                            name="description"
                            value={channelAddState.description}
                            onChange={handleInput}
                            type='text'
                            placeholder="Enter Channel Description"
                        />
                    </Segment>
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button loading={isLoading} onClick={onSubmit}>
                    <Icon name='checkmark' /> Save
                </Button>
                <Button loading={isLoading} onClick={closeModal}>
                    <Icon name='remove' /> Cancel
                </Button>
            </Modal.Actions>
        </Modal>
    </>
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

export default connect(mapStateToProps, mapDispatchToProps)(Channels);