import React from "react";
import { Button, View, StyleSheet, SafeAreaView } from "react-native";

import { Amplify } from "aws-amplify";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react-native";
import output from "./amplify_outputs.json"
import TodoList from "./src/TodoList";

Amplify.configure(output);

// Amplify.configure({
//   Auth: {
//     Cognito: {
//       userPoolClientId: '25r3m05corkq402vi0kbcoto5j',
//       userPoolId: 'us-east-1_tzT9Dvnz9',
//     }
//   }
// });

const SignOutButton = () => {
  const { signOut } = useAuthenticator();
  return (
    <View style={styles.signOutButton}>
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
};

const App = () => {
  return (
    <Authenticator.Provider>
      <Authenticator>
        <SafeAreaView>
          <SignOutButton />
          <TodoList />
        </SafeAreaView>
      </Authenticator>
    </Authenticator.Provider>
  );
};

const styles = StyleSheet.create({
  signOutButton: {
    alignSelf: "flex-end",
  },
});

export default App;