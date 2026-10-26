import React from "react";
import { Text, View } from "react-native";
import {
  Shell,
  Heading,
  SlotGrid,
  ActionButton,
  EmptyState,
  Icon,
  useNow,
} from "../components";
import { useAppointments } from "../context/AppContext";
import { sortedSlots } from "../domain/appointments";
import styles from "../styles";

export default function BookingsScreen({ navigation }) {
  const { slots, dispatch, confirm, saving } = useAppointments();
  const now = useNow();
  const bookings = sortedSlots(slots.filter((slot) => slot.booked));
  const upcoming = bookings.filter((slot) => new Date(slot.startsAt) > now);
  const past = bookings.filter((slot) => new Date(slot.startsAt) <= now);
  return (
    <Shell navigation={navigation} active="Bookings">
      <Heading
        eyebrow="DINE AFTALER"
        title="Plads i kalenderen. Ro i maven."
        subtitle="Her finder du demopatientens bookinger. Dine aftaler huskes, når du åbner appen igen."
      />
      <Text style={styles.sectionTitle}>
        Kommende tider · {upcoming.length}
      </Text>
      {upcoming.length ? (
        <SlotGrid
          slots={upcoming}
          showDetails={false}
          renderActions={(slot) => (
            <View style={{ gap: 14 }}>
              <View style={styles.row}>
                <Icon name="check-circle" size={16} />
                <Text style={[styles.muted, { fontWeight: "600" }]}>
                  Bekræftet booking
                </Text>
              </View>
              <ActionButton
                title="Afbestil tid"
                secondary
                disabled={saving}
                onPress={() =>
                  confirm({
                    title: "Afbestil din tid?",
                    text: "Tiden bliver ledig, så en anden patient kan booke den.",
                    action: "Ja, afbestil tiden",
                    danger: true,
                    onConfirm: () => dispatch({ type: "cancel", id: slot.id }),
                  })
                }
              />
            </View>
          )}
        />
      ) : (
        <EmptyState
          title="Du har ingen kommende tider"
          text="Din næste tandlægetid kan være få tryk væk. Find en ledig tid, der passer dig."
          action="Find en tid"
          onPress={() => navigation.navigate("Available")}
        />
      )}
      {!!past.length && (
        <>
          <Text style={styles.sectionTitle}>
            Tidligere tider · {past.length}
          </Text>
          <SlotGrid
            slots={past}
            showDetails={false}
            renderActions={() => (
              <Text style={styles.muted}>Tidspunktet er passeret</Text>
            )}
          />
        </>
      )}
    </Shell>
  );
}
