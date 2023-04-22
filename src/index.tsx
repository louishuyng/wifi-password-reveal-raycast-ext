import { useState, useEffect } from "react";
import { ActionPanel, Detail, List, Action, Icon } from "@raycast/api";
import { exec } from "child_process";

const DetailPassword = ({
  networkName,
  setIsLoading,
}: {
  networkName: string;
  setIsLoading: (loading: boolean) => void;
}) => {
  const [text, setText] = useState("");

  useEffect(() => {
    exec(`security find-generic-password -wa ${networkName}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        setText("You didn't connect to this network yet");
        setIsLoading(false);
        return;
      }

      setText(stdout.trim());
      setIsLoading(false);
    });
  }, []);

  return <Detail markdown={`${text}`} />;
};

export default function Command() {
  const [networks, setNetworks] = useState<Array<string>>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    exec("/usr/sbin/networksetup -listpreferredwirelessnetworks en0", (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        setIsLoading(false);
        return;
      }

      const lines = stdout.trim().split("\n");

      // Extract the Wi-Fi network names from the lines
      const networks = lines.slice(1).map((line) => line.trim());

      if (networks?.length > 0) {
        setNetworks(networks);
      }
      setIsLoading(false);
    });
  }, []);

  return (
    <List isLoading={isLoading}>
      {networks.map((network, index) => (
        <List.Item
          key={index}
          icon={Icon.Wifi}
          title={network}
          actions={
            <ActionPanel>
              <Action.Push
                title="Show Details"
                target={<DetailPassword networkName={network} setIsLoading={setIsLoading} />}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
