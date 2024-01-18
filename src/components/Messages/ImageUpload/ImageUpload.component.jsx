import React, { useState } from "react";
import { Button, Input, Modal, Icon } from "semantic-ui-react";
import mime from "mime";

const ImageUpload = (props) => {

    const [fileState, setFileState] = useState(null);
    const acceptedTypes = ["image/png", "image/jpeg"];

    const onFileAdded = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileState(file);
        }
    }

    const submit = () => {
        if (fileState && acceptedTypes.includes(mime.getType(fileState.name))) {
            props.uploadImage(fileState, mime.getType(fileState.name));
            props.onClose();
            setFileState(null);
        }
    }

    return (<Modal open={props.open} onClose={props.onClose}>
        <Modal.Header>Select a Image</Modal.Header>
        <Modal.Content>
            <Input
                type="file"
                name="file"
                onChange={onFileAdded}
                fluid
                label="File Type (png, jpeg)"
            />
        </Modal.Content>
        <Modal.Actions>
            <Button color="green" onClick={submit}>
                <Icon name="checkmark" />Add
            </Button>
            <Button color="red" onClick={props.onClose}>
                <Icon name="remove" />Cancel
            </Button>
        </Modal.Actions>
    </Modal>)
}

export default ImageUpload;