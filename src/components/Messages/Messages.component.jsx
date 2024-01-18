import React, { useEffect, useRef, useState } from "react";
import "../../server/firebase.js";
import { child, getDatabase, onChildAdded, onChildRemoved, ref, remove, set } from "firebase/database";
import { connect } from "react-redux";
import { Segment, Comment } from "semantic-ui-react";

import { setFavouriteChannel, removeFavouriteChannel } from "../../store/actionCreater.js";
import MessageHeader from "./MessageHeader.component";
import MessageInput from "./MessageInput/MessageInput.component";
import MessageContent from "./MessageContent/MessageContent.component";

import './Messages.css';

const Messages = (props) => {

    const database = getDatabase();
    let messagesRef;
    if (props.channel) {
        messagesRef = ref(database, "messages/" + props.channel.id);
    }

    let usersFavoriteRef;
    if (props.user) {
        usersFavoriteRef = child(ref(database, "users/" + props.user.uid), "favourite");
    }

    const [messagesState, setMessagesState] = useState([]);
    const [searchTermState, setSearchTermState] = useState("");

    let divRef = useRef();

    useEffect(() => {
        if (props.channel) {
            setMessagesState([]);
            onChildAdded(messagesRef, (snapshot) => {
                setMessagesState((currentState) => {
                    let updatedState = [...currentState];
                    updatedState.push(snapshot.val());
                    return updatedState;
                })
            });
        }
    }, [props.channel]);

    useEffect(() => {
        if (props.user) {
            onChildAdded(usersFavoriteRef, (snapshot) => {
                props.setFavouriteChannel(snapshot.val());
            });

            onChildRemoved(usersFavoriteRef, (snapshot) => {
                props.removeFavouriteChannel(snapshot.val());
            });
        }
    }, [props.user]);

    useEffect(() => {
        divRef.scrollIntoView({ behavior: "smooth" });
    }, [messagesState]);

    const displayMessages = () => {
        let messagesToDisplay = searchTermState ? filterMessageBySearchTerm() : messagesState;
        if (messagesToDisplay.length > 0 && props.user !== null) {
            return messagesToDisplay.map((message) => {
                return <MessageContent key={message.timestamp} message={message} ownMessage={message.user.id === props.user.uid} imageLoaded={imageLoaded} />
            });
        }
    }

    const imageLoaded = () => {
        divRef.scrollIntoView({ behavior: "smooth" });
    }

    const uniqueUsersCount = () => {
        const uniqueUsers = messagesState.reduce((acc, message) => {
            if (!acc.includes(message.user.name)) {
                acc.push(message.user.name);
            }
            return acc;
        }, []);

        return uniqueUsers.length;
    }

    const searchTermChange = (e) => {
        const target = e.target;
        setSearchTermState(target.value);
    }

    const filterMessageBySearchTerm = () => {
        const regex = new RegExp(searchTermState, "gi");
        const messages = messagesState.reduce((acc, message) => {
            if ((message.content && message.content.match(regex)) || message.user.name.match(regex)) {
                acc.push(message);
            }
            return acc;
        }, []);

        return messages;
    }

    const starChange = () => {
        let favouriteRef = child(usersFavoriteRef, props.channel.id);
        if (isStarred()) {
            remove(favouriteRef);
        }
        else {
            set(favouriteRef, { channelId: props.channel.id, channelName: props.channel.name });
        }
    }

    const isStarred = () => {
        if (props.channel) return Object.keys(props.favouriteChannels).includes(props.channel.id);
    }

    return <div className="messages">
        <MessageHeader
            starChange={starChange}
            starred={isStarred()}
            isPrivateChat={props.channel?.isPrivateChat}
            searchTermChange={searchTermChange}
            channelName={props.channel?.name}
            uniqueUsers={uniqueUsersCount()}
        />
        <Segment className="messagecontent">
            <Comment.Group>
                {displayMessages()}
                <div ref={currentEl => divRef = currentEl}></div>
            </Comment.Group>
        </Segment>
        <MessageInput />
    </div>
}

const mapStateToProps = (state) => {
    return {
        user: state.user.currentUser,
        channel: state.channel.currentChannel,
        favouriteChannels: state.favouriteChannel.favouriteChannel,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setFavouriteChannel: (channel) => dispatch(setFavouriteChannel(channel)),
        removeFavouriteChannel: (channel) => dispatch(removeFavouriteChannel(channel)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Messages);