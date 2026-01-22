import { useParams } from "react-router-dom";
import { ChannelManager } from "@/components/channel/ChannelManager";
import { DetailChannel } from "@/components/channel/DetailChannel";

export function ChannelView() {
  const { id } = useParams<{ id?: string }>();

  // If there's an id in the URL, show detail view
  if (id) {
    return <DetailChannel />;
  }

  // Otherwise show the channel list
  return (
    <div className="animate-slide-in">
      <ChannelManager />
    </div>
  );
}
