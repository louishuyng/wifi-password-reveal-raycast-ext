import { Action, ActionPanel, Form, LocalStorage, showHUD, useNavigation } from "@raycast/api";

export default function InitialSetup({
  setAskedInitialSetting,
  isAbleToPop = true,
  showHUDAfterPop = true,
}: {
  setAskedInitialSetting?: (value: boolean) => void;
  isAbleToPop: boolean;
  showHUDAfterPop?: boolean;
}) {
  const { pop } = useNavigation();
  return (
    <Form
      navigationTitle="Setup username & password"
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Submit / Skip"
            onSubmit={(values) => {
              const { username, password } = values;

              LocalStorage.setItem(
                "machineCrendentialInfo",
                JSON.stringify({
                  username: username !== "" ? username : undefined,
                  password: password !== "" ? password : undefined,
                })
              );

              if (setAskedInitialSetting) {
                // NOTE: it will convert true to 1
                LocalStorage.setItem("askedInitialSetting", true);
                setAskedInitialSetting(true);
              }

              if (isAbleToPop) {
                showHUDAfterPop && showHUD("Finish initial setup process");
                pop();
              }
            }}
          />
        </ActionPanel>
      }
    >
      <Form.Description text="No longer waste time entering your username and password each time." />
      <Form.Description text="Note that it is only saved on your machine, so you don't have to worry about it being leaked anywhere." />
      <Form.TextField autoFocus={true} title="User Name" id="username" />
      <Form.TextField title="Password" id="password" />
    </Form>
  );
}
