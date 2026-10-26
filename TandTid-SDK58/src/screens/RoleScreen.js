import React from "react";
import { Text, View } from "react-native";
import { Shell, ActionButton, Icon, useCompact } from "../components";
import { useAppointments } from "../context/AppContext";
import styles, { colors } from "../styles";

export default function RoleScreen({ navigation }) {
  const { setRole } = useAppointments();
  const compact = useCompact();
  function enter(role, screen) {
    setRole(role);
    navigation.navigate(screen);
  }
  return (
    <Shell navigation={navigation}>
      <View
        style={[styles.hero, styles.heroLight, { padding: compact ? 26 : 46 }]}
      >
        <View style={[styles.row, { gap: 50 }]}>
          <View style={styles.heroBody}>
            <Text style={styles.eyebrow}>
              ET LEDIGT ØJEBLIK KAN GØRE EN FORSKEL
            </Text>
            <Text
              accessibilityRole="header"
              style={[
                styles.heroTitle,
                {
                  color: colors.ink,
                  fontSize: compact ? 37 : 52,
                  lineHeight: compact ? 43 : 59,
                },
              ]}
            >
              Et ledigt øjeblik.{"\n"}Et sundere smil.
            </Text>
            <Text style={[styles.subtitle, { maxWidth: 480 }]}>
              Vi forbinder ledige tandlægetider med dig, der har brug for en.
              Find en tid, der passer ind i din hverdag.
            </Text>
            <View style={styles.wrap}>
              <View style={styles.row}>
                <Icon name="check-circle" size={16} />
                <Text style={styles.muted}>Enkel booking</Text>
              </View>
              <View style={styles.row}>
                <Icon name="clock" size={16} />
                <Text style={styles.muted}>Først til mølle</Text>
              </View>
            </View>
          </View>
          {!compact && (
            <View style={styles.heroArt} accessibilityElementsHidden>
              <View style={styles.between}>
                <Text style={styles.eyebrow}>PLADS TIL ET SMIL</Text>
                <Icon name="calendar" />
              </View>
              <Text style={styles.sectionTitle}>Din næste tid</Text>
              <View style={styles.calendarGrid}>
                {Array.from({ length: 28 }, (_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.calendarDay,
                      i === 15 && styles.calendarSelected,
                    ]}
                  >
                    <Text style={[styles.small, i === 15 && styles.whiteText]}>
                      {i + 1}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={[styles.notice, { padding: 12 }]}>
                <View style={styles.row}>
                  <Icon name="check-circle" size={16} />
                  <Text style={[styles.muted, { color: colors.green }]}>
                    Lidt tættere på din næste tid
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
      <View style={{ gap: 8 }}>
        <Text style={styles.sectionTitle}>Velkommen til TandTid</Text>
        <Text style={styles.subtitle}>Vælg, hvordan du vil bruge appen.</Text>
      </View>
      <View style={styles.grid}>
        <View
          style={[
            styles.card,
            { flex: 1, minWidth: compact ? "100%" : 280, padding: 28 },
          ]}
        >
          <View style={styles.row}>
            <View style={[styles.brandMark, { backgroundColor: colors.mint }]}>
              <Icon name="user" />
            </View>
            <Text style={styles.eyebrow}>FOR DIG SOM PATIENT</Text>
          </View>
          <Text style={styles.sectionTitle}>Find din næste tandlægetid</Text>
          <Text style={styles.subtitle}>
            Søg efter en tid, sammenlign priser og gem dine favoritter til
            senere.
          </Text>
          <ActionButton
            title="Fortsæt som patient"
            icon="arrow-right"
            onPress={() => enter("patient", "Available")}
          />
        </View>
        <View
          style={[
            styles.card,
            { flex: 1, minWidth: compact ? "100%" : 280, padding: 28 },
          ]}
        >
          <View style={styles.row}>
            <View style={[styles.brandMark, { backgroundColor: colors.mint }]}>
              <Icon name="briefcase" />
            </View>
            <Text style={styles.eyebrow}>FOR DIG SOM TANDLÆGE</Text>
          </View>
          <Text style={styles.sectionTitle}>Giv den ledige tid videre</Text>
          <Text style={styles.subtitle}>
            Opret ledige tider, følg bookingerne og få overblik over klinikkens
            kalender.
          </Text>
          <ActionButton
            title="Fortsæt som tandlæge"
            secondary
            icon="arrow-right"
            onPress={() => enter("dentist", "Clinic")}
          />
        </View>
      </View>
    </Shell>
  );
}
