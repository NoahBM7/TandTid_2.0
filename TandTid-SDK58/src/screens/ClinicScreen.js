import React, { useState } from "react";
import { Text, View } from "react-native";
import {
  Shell,
  Heading,
  ActionButton,
  Chip,
  SlotGrid,
  EmptyState,
  useNow,
} from "../components";
import { useAppointments } from "../context/AppContext";
import { sortedSlots } from "../domain/appointments";
import styles from "../styles";

export default function ClinicScreen({ navigation }) {
  const { slots, dispatch, confirm, saving } = useAppointments();
  const [status, setStatus] = useState("all");
  const now = useNow();
  const slotStatus = (slot) =>
    new Date(slot.startsAt) <= now
      ? "past"
      : slot.booked
        ? "booked"
        : "available";
  const count = (value) =>
    slots.filter((slot) => slotStatus(slot) === value).length;
  const visible = sortedSlots(
    slots.filter((slot) => status === "all" || slotStatus(slot) === status),
  );
  return (
    <Shell navigation={navigation} active="Clinic">
      <View style={styles.between}>
        <Heading
          eyebrow="KLINIKKENS OVERBLIK"
          title="Plads til flere smil"
          subtitle="Opret ledige tider, og følg bookingerne på tværs af demoklinikkerne."
        />
        <ActionButton
          title="Opret en ledig tid"
          icon="plus"
          onPress={() => navigation.navigate("Create")}
        />
      </View>
      <View style={styles.wrap}>
        {[
          ["available", "Ledige tider"],
          ["booked", "Kommende bookinger"],
          ["past", "Tidligere tider"],
        ].map(([key, label]) => (
          <View key={key} style={styles.stat}>
            <Text style={styles.statNumber}>{count(key)}</Text>
            <Text style={styles.muted}>{label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.wrap}>
        {[
          ["all", "Alle tider"],
          ["available", "Ledige"],
          ["booked", "Bookede"],
          ["past", "Tidligere"],
        ].map(([value, label]) => (
          <Chip
            key={value}
            label={label}
            selected={status === value}
            onPress={() => setStatus(value)}
          />
        ))}
      </View>
      {visible.length ? (
        <SlotGrid
          slots={visible}
          showDetails={false}
          renderActions={(slot) => (
            <View style={{ gap: 12 }}>
              <Text style={[styles.muted, { fontWeight: "600" }]}>
                {slotStatus(slot) === "past"
                  ? `Tidspunkt passeret${slot.booked ? " · Booket" : ""}`
                  : slot.booked
                    ? "Booket · Demopatient"
                    : "Ledig · Klar til booking"}
              </Text>
              {!slot.booked && (
                <ActionButton
                  title="Fjern tid"
                  secondary
                  small
                  icon="trash-2"
                  disabled={saving}
                  onPress={() =>
                    confirm({
                      title: "Fjern den ledige tid?",
                      text: "Tiden fjernes fra oversigten og eventuelle favoritter.",
                      action: "Ja, fjern tiden",
                      danger: true,
                      onConfirm: () =>
                        dispatch({ type: "remove", id: slot.id }),
                    })
                  }
                />
              )}
            </View>
          )}
        />
      ) : (
        <EmptyState
          title="Ingen tider i denne oversigt"
          text="Opret en ledig tid, eller vælg en anden status for at se klinikkernes tider."
          action="Opret en tid"
          onPress={() => navigation.navigate("Create")}
        />
      )}
    </Shell>
  );
}
