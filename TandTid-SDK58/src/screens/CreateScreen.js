import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { Shell, Heading, Field, ActionButton, useCompact } from "../components";
import { useAppointments } from "../context/AppContext";
import { validateForm } from "../domain/appointments";
import styles from "../styles";

export default function CreateScreen({ navigation }) {
  const { dispatch, saving } = useAppointments();
  const [form, setForm] = useState({
    clinic: "",
    address: "",
    treatment: "",
    date: "",
    time: "",
    price: "",
    duration: "30",
  });
  const [error, setError] = useState("");
  const compact = useCompact();
  const change = (key) => (value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setError("");
  };
  async function submit() {
    const result = validateForm(form);
    if (result.error) {
      setError(result.error);
      return;
    }
    const saved = await dispatch({
      type: "add",
      slot: {
        ...result.slot,
        id: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      },
    });
    if (saved.ok) navigation.goBack();
    else setError(saved.message);
  }
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Shell
        navigation={navigation}
        active="Clinic"
        narrow
        back="Tilbage til klinikken"
      >
        <Heading
          eyebrow="GIV TIDEN VIDERE"
          title="Gør en tid ledig"
          subtitle="Udfyld oplysningerne. Tiden bliver synlig for patienten, så snart den er gemt."
        />
        <View style={[styles.form, compact && { padding: 20 }]}>
          <Text style={styles.sectionTitle}>Klinik og behandling</Text>
          <Field
            label="Klinikkens navn"
            value={form.clinic}
            onChangeText={change("clinic")}
            placeholder="Fx Smil Tandklinik"
          />
          <Field
            label="Adresse og by"
            value={form.address}
            onChangeText={change("address")}
            placeholder="Fx Nørregade 10, København"
          />
          <Field
            label="Behandling"
            value={form.treatment}
            onChangeText={change("treatment")}
            placeholder="Fx Tandeftersyn"
          />
          <Text style={styles.sectionTitle}>Tidspunkt og pris</Text>
          <View style={[styles.grid, compact && { flexDirection: "column" }]}>
            <View style={{ flex: 1 }}>
              <Field
                label="Dato (ÅÅÅÅ-MM-DD)"
                value={form.date}
                onChangeText={change("date")}
                placeholder="2026-11-05"
                autoCapitalize="none"
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label="Klokkeslæt (TT:MM)"
                value={form.time}
                onChangeText={change("time")}
                placeholder="14:30"
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
          <View style={[styles.grid, compact && { flexDirection: "column" }]}>
            <View style={{ flex: 1 }}>
              <Field
                label="Pris i kroner"
                value={form.price}
                onChangeText={change("price")}
                placeholder="350"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label="Varighed i minutter"
                value={form.duration}
                onChangeText={change("duration")}
                keyboardType="number-pad"
              />
            </View>
          </View>
          {!!error && (
            <View style={styles.error}>
              <Text accessibilityRole="alert" style={styles.errorText}>
                {error}
              </Text>
            </View>
          )}
          <ActionButton
            title={saving ? "Gemmer tiden …" : "Offentliggør ledig tid"}
            icon="plus"
            onPress={submit}
            disabled={saving}
          />
          <Text style={styles.small}>
            Oplysningerne gemmes på denne enhed. De deles ikke med andre
            enheder.
          </Text>
        </View>
      </Shell>
    </KeyboardAvoidingView>
  );
}
