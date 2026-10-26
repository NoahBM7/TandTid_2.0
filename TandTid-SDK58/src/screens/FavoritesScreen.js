import React from "react";
import { Text } from "react-native";
import { Shell, Heading, SlotGrid, EmptyState, useNow } from "../components";
import { useAppointments } from "../context/AppContext";
import { sortedSlots } from "../domain/appointments";
import styles from "../styles";

// Ny skærm: de gemte id'er hentes fra den samme vedvarende tilstand som tiderne.
export default function FavoritesScreen({ navigation }) {
  const { slots, favorites } = useAppointments();
  const now = useNow();
  const saved = sortedSlots(
    slots.filter((slot) => favorites.includes(slot.id)),
  );
  return (
    <Shell navigation={navigation} active="Favorites">
      <Heading
        eyebrow="GEMT TIL SENERE"
        title="Tider, du har et godt øje til"
        subtitle="Sammenlign dine favoritter i ro og mag. En gemt tid er ikke reserveret og kan blive booket af andre."
      />
      {saved.length ? (
        <>
          <Text style={styles.sectionTitle}>
            {saved.length} {saved.length === 1 ? "gemt tid" : "gemte tider"}
          </Text>
          <SlotGrid
            slots={saved}
            navigation={navigation}
            renderActions={(slot) =>
              slot.booked ? (
                <Text style={styles.muted}>Allerede booket</Text>
              ) : new Date(slot.startsAt) <= now ? (
                <Text style={styles.muted}>Tiden er udløbet</Text>
              ) : null
            }
          />
        </>
      ) : (
        <EmptyState
          icon="heart"
          title="Her er plads til dine favoritter"
          text="Tryk på hjertet ved en ledig tid. Så er den nem at finde her, også efter du har lukket appen."
          action="Udforsk ledige tider"
          onPress={() => navigation.navigate("Available")}
        />
      )}
    </Shell>
  );
}
