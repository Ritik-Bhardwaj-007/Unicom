import React, { useState } from "react";
import { Segment, Input, Button } from "semantic-ui-react";
import '../../../server/firebase.js';
import { getDatabase, serverTimestamp, set, ref, push } from "firebase/database";
import { getDownloadURL, getStorage, ref as sRef, uploadBytes } from "firebase/storage";
import { connect } from "react-redux";
import { v4 as uuidv4 } from "uuid";

import ImageUpload from "../ImageUpload/ImageUpload.component.jsx";

const MessageInput = (props) => {

    const database = getDatabase();
    const messageRef = ref(database, "message");
    const messageId = push(messageRef).toString().substring(57);

    const storage = getStorage();

    const [messageState, setMessageState] = useState("");
    const [fileDialogState, setFileDialogState] = useState(false);

    const createMessageInfo = (downloadURL) => {
        return {
            user: {
                avatar: props.user.photoURL,
                name: props.user.displayName,
                id: props.user.uid,
            },
            content: messageState,
            image: downloadURL || "",
            timestamp: serverTimestamp(),
        }
    }

    const sendMessage = (downloadURL) => {
        if (messageState || downloadURL) {
            set(ref(database, "messages/" + props.channel.id + "/" + messageId), createMessageInfo(downloadURL))
                .then(() => setMessageState(""))
                .catch((err) => console.log(err));
        }
    }

    const onMessageChange = (e) => {
        const target = e.target;
        setMessageState(target.value);
    }

    const createdActionButtons = () => {
        return <>
            <Button icon="send" onClick={() => sendMessage()} />
            <Button icon="upload" onClick={() => setFileDialogState(true)} />
        </>
    }

    const uploadImage = (file, contentType) => {
        const filePath = `chat/images/${uuidv4()}.jpg`;
        const storageRef = sRef(storage, filePath);
        uploadBytes(storageRef, file)
            .then((data) => {
                getDownloadURL(data.ref)
                    .then((url) => {
                        sendMessage(url);
                    })
                    .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));
    }

    return <Segment>
        <Input
            onChange={onMessageChange}
            fluid={true}
            name="message"
            placeholder="Text Message"
            label={createdActionButtons()}
            labelPosition="right"
            value={messageState}
        />
        <ImageUpload open={fileDialogState} onClose={() => setFileDialogState(false)} uploadImage={uploadImage} />
    </Segment>
}

const mapStateToProps = (state) => {
    return {
        user: state.user.currentUser,
        channel: state.channel.currentChannel,
    }
}

export default connect(mapStateToProps)(MessageInput);