import { Stack } from "expo-router";


export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="games/dice" options={{ headerShown: false }} />
    </Stack>
  );
}
