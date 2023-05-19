import { useState, useEffect } from "react";
import { ActionPanel, Detail, List, Action, Icon, showToast, Toast, LocalStorage } from "@raycast/api";
import { exec } from "child_process";
import InitialSetup from "./initial_setup";

const DetailPassword = ({
  networkName,
  setIsLoading,
}: {
  networkName: string;
  setIsLoading: (loading: boolean) => void;
}) => {
  const [password, setPassword] = useState("");

  useEffect(() => {
    (async () => {
      const toast = await showToast({ style: Toast.Style.Animated, title: "Permission Checking" });

      exec(
        `security find-generic-password -D "AirPort network password" -a "${networkName}" -w`,
        async (error, password) => {
          if (error) {
            console.error(`exec error: ${error}`);

            toast.style = Toast.Style.Failure;
            toast.title = "Permission checked failed ❌";
            toast.message = error.message;

            setIsLoading(false);
            return;
          }

          // Trigger open raycast app
          exec("open /Applications/Raycast.app", () => {
            toast.style = Toast.Style.Success;
            toast.title = "Permission checked successes ✅";

            setPassword(password.trim());
            setIsLoading(false);
          });
        }
      );
    })();
  }, []);

  return (
    <Detail
      markdown={`
  ## Wifi Name 📶
  ${networkName}
  ## Password 🔑
  ${password}
  `}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard content={password} shortcut={{ modifiers: ["cmd"], key: "." }} />
        </ActionPanel>
      }
    />
  );
};

export default function Command() {
  const [networks, setNetworks] = useState<Array<string>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [askedInitialSetting, setAskedInitialSetting] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const askedInitialSetting = await LocalStorage.getItem<number>("askedInitialSetting");

      if (askedInitialSetting === 1) {
        setAskedInitialSetting(true);
      } else {
        setAskedInitialSetting(false);
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!askedInitialSetting) {
      return;
    }

    exec("/usr/sbin/networksetup -listpreferredwirelessnetworks en0", (error, stdout) => {
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
  }, [askedInitialSetting]);

  return (
    <>
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
                <Action.Push
                  title="Initial Setup Credential"
                  target={
                    <InitialSetup
                      isAbleToPop={true}
                      setAskedInitialSetting={setAskedInitialSetting}
                      showHUDAfterPop={false}
                    />
                  }
                />
              </ActionPanel>
            }
          />
        ))}
      </List>

      {!askedInitialSetting && !isLoading && (
        <InitialSetup isAbleToPop={false} setAskedInitialSetting={setAskedInitialSetting} />
      )}
    </>
  );
}
