import React, { useEffect, useState } from "react";
import "../../../server/firebase.js";
import { child, getDatabase, onValue, ref } from "firebase/database";
import { Label } from "semantic-ui-react";

export const Notification = (props) => {

    const database = getDatabase();

    const messagesRef = ref(database, "messages");
    const usersRef = ref(database, "users");

    const [channelVisitedState, setChannelVisitedState] = useState({});
    const [messagesTimeStampState, setMessagesTimeStampState] = useState({});

    useEffect(() => {
        if (props.user) {
            onValue(child(usersRef, `${props.user.uid}/lastVisited`), snapshot => {
                setChannelVisitedState(snapshot.val());
            });

            onValue(messagesRef, snapshot => {
                let messages = snapshot.val();
                let channelsId = Object.keys(messages);
                let messagesTimeStamp = {};

                channelsId.forEach((channelId) => {
                    let channelMessageKeys = Object.keys(messages[channelId]);
                    channelMessageKeys.reduce((agg, item) => {
                        messagesTimeStamp[channelId] = [...messagesTimeStamp[channelId] || []];
                        messagesTimeStamp[channelId].push(messages[channelId][item].timestamp);
                    });
                });
                setMessagesTimeStampState(messagesTimeStamp);
            });
        }
    }, [props.user]);

    const calculateNotificationCount = (channelId) => {
        if (channelVisitedState && messagesTimeStampState && props.channel && props.channel.id !== channelId) {
            let lastVisited = channelVisitedState[channelId];
            let channelMessagesTimeStamp = messagesTimeStampState[channelId];

            if (channelMessagesTimeStamp) {
                let notificationCount = channelMessagesTimeStamp.filter(timestamp => !lastVisited || lastVisited < timestamp).length;
                return notificationCount === 0 ? null : <Label color="purple">{notificationCount}</Label>
            }
        }
        return null;
    }

    return <>{props.displayName}{calculateNotificationCount(props.notificationChannelId)}</>;
}