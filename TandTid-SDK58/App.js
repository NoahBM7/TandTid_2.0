import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppContext } from "./src/context/AppContext";
import { makeInitialState, transition } from "./src/domain/appointments";
import { createRepository } from "./src/storage/repository";
import { ActionButton, Confirmation } from "./src/components";
import styles, { colors } from "./src/styles";
import RoleScreen from "./src/screens/RoleScreen";
import AvailableScreen from "./src/screens/AvailableScreen";
import DetailsScreen from "./src/screens/DetailsScreen";
import BookingsScreen from "./src/screens/BookingsScreen";
import ClinicScreen from "./src/screens/ClinicScreen";
import CreateScreen from "./src/screens/CreateScreen";
import SearchScreen from "./src/screens/SearchScreen";
import FavoritesScreen from "./src/screens/FavoritesScreen";

const Stack = createNativeStackNavigator();
const repository = createRepository(AsyncStorage);

export default function App() {
  const [state, setState] = useState(null);
  const latest = useRef(null);
  const [role, setRole] = useState(null);
  const roleRef = useRef(null);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  // Køen sikrer, at to hurtige tryk ikke skriver oven i hinandens ændringer.
  const queue = useRef(Promise.resolve());
  function chooseRole(next) {
    roleRef.current = next;
    setRole(next);
  }

  async function load() {
    setLoadError("");
    try {
      let restored = await repository.load();
      // Demotider oprettes kun første gang. En gemt, tom liste forbliver tom.
      if (restored === null) {
        restored = makeInitialState();
        await repository.save(restored);
      }
      latest.current = restored;
      setState(restored);
    } catch {
      setLoadError(
        "Vi kunne ikke læse dine gemte data. Prøv igen. Dine data bliver ikke overskrevet.",
      );
    }
  }
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 6000);
    return () => clearTimeout(timer);
  }, [message]);

  // Vis først ændringen, når AsyncStorage har gemt den.
  function dispatch(action) {
    const operation = queue.current.then(async () => {
      const result = transition(latest.current, action, roleRef.current);
      if (!result.ok) {
        setMessage(result.message);
        return result;
      }
      setSaving(true);
      try {
        await repository.save(result.state);
        latest.current = result.state;
        setState(result.state);
        if (result.message) setMessage(result.message);
        return result;
      } catch {
        const message = "Ændringen kunne ikke gemmes. Prøv igen.";
        setMessage(message);
        return { ok: false, message };
      } finally {
        setSaving(false);
      }
    });
    queue.current = operation.catch(() => {});
    return operation;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {!state ? (
        <View style={styles.loading}>
          <Text style={styles.brandName}>TandTid</Text>
          {loadError ? (
            <>
              <Text style={styles.text}>{loadError}</Text>
              <ActionButton title="Prøv igen" onPress={load} />
            </>
          ) : (
            <>
              <ActivityIndicator color={colors.green} />
              <Text style={styles.muted}>Henter dine tider …</Text>
            </>
          )}
        </View>
      ) : (
        <AppContext.Provider
          value={{
            ...state,
            role,
            setRole: chooseRole,
            dispatch,
            saving,
            confirm: setConfirmation,
            notify: setMessage,
          }}
        >
          <View style={styles.app}>
            <NavigationContainer>
              <Stack.Navigator
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.background },
                  animation: "fade",
                }}
              >
                <Stack.Screen
                  name="Role"
                  component={RoleScreen}
                  options={{ title: "TandTid · Velkommen" }}
                />
                <Stack.Screen
                  name="Available"
                  component={AvailableScreen}
                  options={{ title: "TandTid · Ledige tider" }}
                />
                <Stack.Screen
                  name="Details"
                  component={DetailsScreen}
                  options={{ title: "TandTid · Din næste tid" }}
                />
                <Stack.Screen
                  name="Bookings"
                  component={BookingsScreen}
                  options={{ title: "TandTid · Mine tider" }}
                />
                <Stack.Screen
                  name="Clinic"
                  component={ClinicScreen}
                  options={{ title: "TandTid · Klinik" }}
                />
                <Stack.Screen
                  name="Create"
                  component={CreateScreen}
                  options={{ title: "TandTid · Opret tid" }}
                />
                <Stack.Screen
                  name="Search"
                  component={SearchScreen}
                  options={{ title: "TandTid · Søgning" }}
                />
                <Stack.Screen
                  name="Favorites"
                  component={FavoritesScreen}
                  options={{ title: "TandTid · Favoritter" }}
                />
              </Stack.Navigator>
            </NavigationContainer>
            {!!message && (
              <View
                style={styles.toast}
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
              >
                <Text style={styles.toastText}>{message}</Text>
                <ActionButton
                  title="Luk besked"
                  small
                  secondary
                  onPress={() => setMessage("")}
                />
              </View>
            )}
            <Confirmation
              options={confirmation}
              onClose={() => setConfirmation(null)}
            />
          </View>
        </AppContext.Provider>
      )}
    </SafeAreaProvider>
  );
}
