import React from "react";
import { Text, View } from "react-native";
import {
  Shell,
  Heading,
  SlotCard,
  ActionButton,
  EmptyState,
  Icon,
  useNow,
} from "../components";
import { useAppointments } from "../context/AppContext";
import styles from "../styles";

export default function DetailsScreen({ navigation, route }) {
  const { slots, dispatch, saving } = useAppointments();
  const now = useNow();
  const slot = slots.find((item) => item.id === route.params?.id);
  const expired = slot && new Date(slot.startsAt) <= now;
  return (
    <Shell
      navigation={navigation}
      active="Available"
      narrow
      back="Tilbage til oversigten"
    >
      {!slot ? (
        <EmptyState
          title="Tiden findes ikke længere"
          text="Klinikken kan have fjernet tiden. Find en anden ledig tid i oversigten."
          action="Find en tid"
          onPress={() => navigation.navigate("Available")}
        />
      ) : (
        <>
          <Heading
            eyebrow="SNART LIDT TÆTTERE PÅ ET SMIL"
            title="Passer tiden dig?"
            subtitle="Se oplysningerne herunder, og bekræft, når du er klar."
          />
          <SlotCard slot={slot} detailed />
          <View style={styles.notice}>
            <View style={styles.row}>
              <Icon name="info" />
              <Text style={[styles.text, { fontWeight: "600" }]}>
                Godt at vide
              </Text>
            </View>
            <Text style={styles.text}>
              Du booker for appens demopatient. Bookingen er kun en
              demonstration, og der betales ikke i appen.
            </Text>
            <Text style={styles.muted}>
              En favorit reserverer ikke tiden. Tiden er først din, når
              bookingen er bekræftet.
            </Text>
          </View>
          <ActionButton
            title={
              saving
                ? "Gemmer booking …"
                : slot.booked
                  ? "Tiden er allerede booket"
                  : expired
                    ? "Tiden er udløbet"
                    : "Bekræft booking"
            }
            icon="check"
            disabled={saving || slot.booked || expired}
            onPress={async () => {
              const result = await dispatch({ type: "book", id: slot.id });
              if (result.ok) navigation.replace("Bookings");
            }}
          />
        </>
      )}
    </Shell>
  );
}
