import React, { useState } from "react";
import { Text, View } from "react-native";
import {
  Shell,
  Heading,
  ActionButton,
  Chip,
  Field,
  SlotGrid,
  EmptyState,
  useNow,
} from "../components";
import { useAppointments } from "../context/AppContext";
import { DEFAULT_FILTERS, filterSlots } from "../domain/appointments";
import styles from "../styles";

// Ny skærm: søgning kombinerer klinik/by med behandling, pris og periode.
export default function SearchScreen({ navigation, route }) {
  const { slots } = useAppointments();
  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    query: route.params?.query || "",
    treatment: route.params?.treatment || "",
  });
  const now = useNow();
  const invalidPrice =
    !!filters.maxPrice.trim() &&
    (!Number.isFinite(Number(filters.maxPrice.replace(",", "."))) ||
      Number(filters.maxPrice.replace(",", ".")) < 0);
  const results = invalidPrice ? [] : filterSlots(slots, filters, now);
  const change = (key) => (value) =>
    setFilters((previous) => ({ ...previous, [key]: value }));
  const choices = (key, options) => (
    <View style={styles.wrap}>
      {options.map(([value, label]) => (
        <Chip
          key={value}
          label={label}
          selected={filters[key] === value}
          onPress={() => change(key)(value)}
        />
      ))}
    </View>
  );
  return (
    <Shell navigation={navigation} active="Available" back="Tilbage til tider">
      <Heading
        eyebrow="FIND DET, DER PASSER DIG"
        title="En tid på dine vilkår"
        subtitle="Søg og filtrér de ledige tider. Resultaterne opdateres, mens du vælger."
      />
      <View style={styles.form}>
        <View style={[styles.wrap, { alignItems: "flex-start", gap: 22 }]}>
          <View style={{ flex: 2, minWidth: 220 }}>
            <Field
              label="Klinik, by eller behandling"
              value={filters.query}
              onChangeText={change("query")}
              placeholder="Fx Frederiksberg"
            />
          </View>
          <View style={{ flex: 1, minWidth: 180 }}>
            <Field
              label="Maks. pris i kroner"
              value={filters.maxPrice}
              onChangeText={change("maxPrice")}
              keyboardType="decimal-pad"
              placeholder="Intet prisloft"
            />
          </View>
        </View>
        {invalidPrice && (
          <Text accessibilityRole="alert" style={styles.errorText}>
            Skriv en pris på 0 kr. eller derover.
          </Text>
        )}
        <View style={{ gap: 9 }}>
          <Text style={styles.label}>Behandling</Text>
          {choices("treatment", [
            ["", "Alle behandlinger"],
            ...[...new Set(slots.map((slot) => slot.treatment))]
              .sort()
              .map((value) => [value, value]),
          ])}
        </View>
        <View style={{ gap: 9 }}>
          <Text style={styles.label}>Hvornår?</Text>
          {choices("period", [
            ["all", "Alle datoer"],
            ["today", "I dag"],
            ["week", "De næste 7 dage"],
          ])}
        </View>
        <View style={styles.between}>
          <View style={{ gap: 9 }}>
            <Text style={styles.label}>Sortér efter</Text>
            {choices("sort", [
              ["soonest", "Tidligste tid"],
              ["price", "Laveste pris"],
            ])}
          </View>
          <ActionButton
            title="Nulstil filtre"
            icon="rotate-ccw"
            small
            secondary
            onPress={() => setFilters(DEFAULT_FILTERS)}
          />
        </View>
      </View>
      <View style={styles.between}>
        <Text style={styles.sectionTitle}>Dine søgeresultater</Text>
        <Text accessibilityLiveRegion="polite" style={styles.muted}>
          {results.length} {results.length === 1 ? "ledig tid" : "ledige tider"}
        </Text>
      </View>
      {results.length ? (
        <SlotGrid slots={results} navigation={navigation} />
      ) : (
        <EmptyState
          icon="search"
          title="Ingen tider lige nu"
          text="Prøv at hæve prisloftet, vælge en anden periode eller søge i en anden by."
          action="Vis alle tider"
          onPress={() => setFilters(DEFAULT_FILTERS)}
        />
      )}
    </Shell>
  );
}
