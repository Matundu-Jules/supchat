import React from "react";
import ChannelList, { Channel } from "@components/Channel/ChannelList";

interface ChannelSidebarProps {
  channels: Channel[];
  onSelect?: (channel: Channel) => void;
}

const ChannelSidebar: React.FC<ChannelSidebarProps> = ({ channels, onSelect }) => {
  return (
    <aside>
      <ChannelList channels={channels} onAccess={onSelect} />
    </aside>
  );
};

export default ChannelSidebar;
