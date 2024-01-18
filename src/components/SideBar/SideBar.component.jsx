import React from "react";
import { Menu } from "semantic-ui-react";

import UserInfo from "./UserInfo/UserInfo.component";
import Channels from "./Channels/Channels.component";
import './SideBar.css';
import PrivateChat from "./PrivateChat/PrivateChat.component";
import FavouriteChannels from "./FavouriteChannels/FavouriteChannels.component";

export const SideBar = () => {
    return (
        <Menu vertical fixed="left" borderless size="large" className="side_bar">
            <UserInfo />
            <FavouriteChannels />
            <Channels />
            <PrivateChat />
        </Menu>
    )
}