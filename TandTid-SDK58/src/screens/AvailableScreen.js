import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import {
  Shell,
  ActionButton,
  Chip,
  EmptyState,
  Icon,
  SlotGrid,
  useCompact,
  useNow,
} from "../components";
import { useAppointments } from "../context/AppContext";
import { DEFAULT_FILTERS, filterSlots } from "../domain/appointments";
import styles from "../styles";

export default function AvailableScreen({ navigation }) {
  const { slots } = useAppointments();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const compact = useCompact();
  const now = useNow();
  const available = filterSlots(slots, filters, now);
  const search = () =>
    navigation.navigate("Search", {
      query: filters.query,
      treatment: filters.treatment,
    });
  return (
    <Shell navigation={navigation} active="Available">
      <View style={[styles.hero, compact && { padding: 24 }]}>
        <View style={styles.between}>
          <View style={{ gap: 13, flex: 1, minWidth: 0 }}>
            <Text style={styles.heroLabel}>LIDT NEMMERE AT FINDE EN TID</Text>
            <Text
              accessibilityRole="header"
              style={[
                styles.heroTitle,
                compact && { fontSize: 34, lineHeight: 40 },
              ]}
            >
              Din næste tandlægetid{compact ? "\n" : " "}er lige her.
            </Text>
            <Text style={styles.heroSubtitle}>
              Se ledige tider i og omkring København. Vælg en tid, der passer
              dig.
            </Text>
          </View>
          {!compact && (
            <View style={{ opacity: 0.75 }}>
              <Icon name="sun" size={66} color="#C8DDB5" />
            </View>
          )}
        </View>
        <View style={styles.searchBar}>
          <View style={{ paddingLeft: 8 }}>
            <Icon name="search" />
          </View>
          <TextInput
            accessibilityLabel="Søg efter klinik, by eller behandling"
            value={filters.query}
            onChangeText={(query) => setFilters({ ...filters, query })}
            onSubmitEditing={search}
            placeholder={
              compact
                ? "Klinik, by eller behandling"
                : "Søg efter klinik, by eller behandling …"
            }
            placeholderTextColor="#859180"
            style={styles.searchInput}
            returnKeyType="search"
          />
          <ActionButton title="Søg" icon="arrow-right" onPress={search} />
        </View>
        <View style={styles.row}>
          <Icon name="check-circle" color="#D1E4C7" size={15} />
          <Text style={[styles.small, { color: "#DCE8DD" }]}>
            Først til mølle · Din tid er booket, når du har bekræftet
          </Text>
        </View>
      </View>
      <View style={{ gap: 17 }}>
        <View style={styles.between}>
          <View style={{ gap: 5 }}>
            <Text style={styles.sectionTitle}>Ledige tider</Text>
            <Text style={styles.muted}>
              {available.length} {available.length === 1 ? "tid" : "tider"}{" "}
              matcher din søgning
            </Text>
          </View>
          <ActionButton
            title="Alle filtre"
            secondary
            small
            icon="sliders"
            onPress={search}
          />
        </View>
        <View style={styles.between}>
          <View
            style={[styles.wrap, { flex: 1, minWidth: compact ? "100%" : 350 }]}
          >
            {[
              ["", "Alle behandlinger"],
              ["Tandeftersyn", "Tandeftersyn"],
              ["Tandrensning", "Tandrensning"],
            ].map(([value, label]) => (
              <Chip
                key={value}
                label={label}
                selected={filters.treatment === value}
                onPress={() => setFilters({ ...filters, treatment: value })}
              />
            ))}
          </View>
          <Chip
            label={
              filters.sort === "soonest" ? "↑ Tidligste tid" : "↑ Laveste pris"
            }
            selected={false}
            onPress={() =>
              setFilters({
                ...filters,
                sort: filters.sort === "soonest" ? "price" : "soonest",
              })
            }
          />
        </View>
      </View>
      {available.length ? (
        <SlotGrid slots={available} navigation={navigation} />
      ) : (
        <EmptyState
          icon="search"
          title="Ingen tider matcher"
          text="Prøv et andet kliniknavn, en anden by eller en anden behandling."
          action="Nulstil søgning"
          onPress={() => setFilters(DEFAULT_FILTERS)}
        />
      )}
      <View style={[styles.notice, styles.row, { gap: 14 }]}>
        <Icon name="heart" size={22} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[styles.text, { fontWeight: "600" }]}>
            Fandt du en tid, du vil overveje?
          </Text>
          <Text style={styles.muted}>
            Tryk på hjertet for at gemme den. Favoritter reserverer ikke tiden.
          </Text>
        </View>
      </View>
    </Shell>
  );
}
