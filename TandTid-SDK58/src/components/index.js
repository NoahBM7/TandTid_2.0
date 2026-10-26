import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { useAppointments } from "../context/AppContext";
import { formatDate, formatTime, formatPrice } from "../domain/appointments";
import styles, { colors } from "../styles";

export const Icon = ({ name, size = 18, color = colors.green }) => (
  <Feather
    name={name}
    size={size}
    color={color}
    accessible={false}
    aria-hidden={true}
  />
);
export const useCompact = () => useWindowDimensions().width < 760;

// Opdaterer tidsafhængige lister, også når appen står åben længe.
export function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function ActionButton({
  title,
  onPress,
  secondary = false,
  danger = false,
  disabled = false,
  small = false,
  icon,
  style,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.buttonSecondary,
        danger && styles.buttonDanger,
        small && styles.buttonSmall,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {icon && (
        <Icon
          name={icon}
          size={small ? 15 : 17}
          color={danger ? colors.danger : secondary ? colors.green : "#FFFFFF"}
        />
      )}
      <Text
        style={[
          styles.buttonText,
          secondary && styles.buttonSecondaryText,
          danger && styles.buttonDangerText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function Shell({ navigation, active, children, narrow = false, back }) {
  const { role, setRole, slots, favorites, saving } = useAppointments();
  const compact = useCompact();
  const tabs =
    role === "patient"
      ? [
          ["Available", "Find en tid", "search"],
          ["Bookings", "Mine tider", "calendar"],
          ["Favorites", "Favoritter", "heart"],
        ]
      : [["Clinic", "Klinikkens overblik", "grid"]];
  const changeRole = () => {
    setRole(null);
    navigation.reset({ index: 0, routes: [{ name: "Role" }] });
  };
  function tabLabel(name, label) {
    const count =
      name === "Bookings"
        ? slots.filter((slot) => slot.booked).length
        : name === "Favorites"
          ? favorites.length
          : 0;
    return `${label}${count ? ` (${count})` : ""}`;
  }
  const nav = (
    <View style={styles.wrap}>
      {tabs.map(([name, label, icon]) => (
        <Pressable
          key={name}
          accessibilityRole="button"
          accessibilityState={{ selected: active === name }}
          onPress={() => navigation.navigate(name)}
          style={[
            styles.navItem,
            active === name && styles.navActive,
            compact && { paddingHorizontal: 9 },
          ]}
        >
          <Icon
            name={icon}
            size={16}
            color={active === name ? colors.green : colors.muted}
          />
          <Text
            style={[
              styles.navText,
              active === name && styles.navActiveText,
              compact && { fontSize: 12 },
            ]}
          >
            {tabLabel(name, label)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <View
          style={[
            styles.headerInner,
            compact && { paddingHorizontal: 18, paddingVertical: 14 },
          ]}
        >
          <View style={styles.between}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="TandTid startside"
              onPress={() =>
                navigation.navigate(
                  role === "patient"
                    ? "Available"
                    : role === "dentist"
                      ? "Clinic"
                      : "Role",
                )
              }
              style={styles.row}
            >
              <View style={styles.brandMark}>
                <Icon name="smile" color="#FFFFFF" size={24} />
              </View>
              <Text style={styles.brandName}>
                TandTid<Text style={{ color: "#8AA076" }}>.</Text>
              </Text>
            </Pressable>
            {!!role && !compact && nav}
            {role ? (
              <ActionButton
                title="Skift rolle"
                secondary
                small
                icon="repeat"
                disabled={saving}
                onPress={changeRole}
              />
            ) : (
              <Text style={styles.eyebrow}>Mere plads til smil</Text>
            )}
          </View>
          {!!role && compact && nav}
        </View>
      </View>
      <ScrollView
        style={styles.page}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          compact && styles.mobileContent,
          narrow && styles.narrow,
        ]}
      >
        {back && (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              navigation.canGoBack()
                ? navigation.goBack()
                : navigation.navigate(
                    role === "dentist" ? "Clinic" : "Available",
                  )
            }
            style={styles.row}
          >
            <Icon name="arrow-left" size={16} />
            <Text style={styles.muted}>{back}</Text>
          </Pressable>
        )}
        {children}
        <View style={styles.footer}>
          <View style={styles.between}>
            <Text style={[styles.small, { fontWeight: "700" }]}>
              TandTid · Plads til din næste tid
            </Text>
            <View style={styles.row}>
              <Icon name={saving ? "loader" : "hard-drive"} size={13} />
              <Text style={styles.small}>
                {saving ? "Gemmer …" : "Dine ændringer gemmes på denne enhed"}
              </Text>
            </View>
          </View>
          <Text style={styles.small}>
            Studieprototype med fiktive klinikker og priser. Én demopatient og
            fælles klinikoversigt. Ingen rigtig booking eller betaling.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function Heading({ eyebrow, title, subtitle }) {
  return (
    <View style={{ gap: 10 }}>
      {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
      <Text accessibilityRole="header" style={styles.heading}>
        {title}
      </Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

export function Field({ label, value, onChangeText, hint, ...props }) {
  return (
    <View style={{ flexGrow: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#8A988D"
        style={styles.input}
        {...props}
      />
      {hint && <Text style={[styles.small, { marginTop: 6 }]}>{hint}</Text>}
    </View>
  );
}

export function Chip({ label, selected, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipActive,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.chipText, selected && styles.chipActiveText]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function SlotCard({ slot, navigation, children, detailed = false }) {
  const { favorites, role, dispatch, saving } = useAppointments();
  const saved = favorites.includes(slot.id);
  return (
    <View style={styles.card}>
      <View style={styles.between}>
        <Text style={styles.treatment}>{slot.treatment}</Text>
        {role === "patient" && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${saved ? "Fjern" : "Gem"} ${slot.clinic} ${formatDate(slot.startsAt)} ${formatTime(slot.startsAt)} ${saved ? "fra" : "som"} favorit`}
            accessibilityState={{ selected: saved, disabled: saving }}
            disabled={saving}
            onPress={() => dispatch({ type: "favorite", id: slot.id })}
            style={[styles.iconButton, saved && styles.favoriteActive]}
          >
            <Icon
              name="heart"
              color={saved ? colors.green : "#8A9A88"}
              size={20}
            />
            {saved && (
              <View style={{ position: "absolute", right: 2, top: 2 }}>
                <Icon name="check-circle" size={12} />
              </View>
            )}
          </Pressable>
        )}
      </View>
      <View style={{ gap: 8 }}>
        <Text style={styles.cardTitle}>{slot.clinic}</Text>
        <View style={[styles.row, { alignItems: "flex-start" }]}>
          <Icon name="map-pin" size={14} color={colors.muted} />
          <Text style={[styles.muted, { flex: 1 }]}>{slot.address}</Text>
        </View>
      </View>
      <View style={styles.dateBox}>
        <View style={styles.row}>
          <Icon name="calendar" size={16} />
          <Text style={styles.dateText}>
            {formatDate(slot.startsAt)} · kl. {formatTime(slot.startsAt)}
          </Text>
        </View>
        <View style={styles.row}>
          <Icon name="clock" size={15} color={colors.muted} />
          <Text style={styles.muted}>{slot.duration} minutter</Text>
        </View>
      </View>
      {children}
      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.small}>Pris i alt</Text>
          <Text style={styles.price}>{formatPrice(slot.price)}</Text>
        </View>
        {navigation && !detailed && (
          <ActionButton
            title="Se tid"
            icon="arrow-right"
            small
            onPress={() => navigation.navigate("Details", { id: slot.id })}
          />
        )}
      </View>
    </View>
  );
}

export function SlotGrid({
  slots,
  navigation,
  renderActions,
  showDetails = true,
}) {
  const { width } = useWindowDimensions();
  const columns = width >= 1050 ? 3 : width >= 720 ? 2 : 1;
  return (
    <View style={styles.grid}>
      {slots.map((slot) => (
        <View
          key={slot.id}
          style={{
            width: columns === 1 ? "100%" : columns === 2 ? "48.7%" : "32.1%",
            flexGrow: 0,
          }}
        >
          <SlotCard slot={slot} navigation={showDetails ? navigation : null}>
            {renderActions?.(slot)}
          </SlotCard>
        </View>
      ))}
    </View>
  );
}

export function EmptyState({
  icon = "calendar",
  title,
  text,
  action,
  onPress,
}) {
  return (
    <View style={styles.empty}>
      <View
        style={[
          styles.brandMark,
          {
            backgroundColor: colors.mint,
            width: 54,
            height: 54,
            borderRadius: 18,
          },
        ]}
      >
        <Icon name={icon} size={24} />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
      {action && <ActionButton title={action} onPress={onPress} secondary />}
    </View>
  );
}

// React Native Alert har ikke samme funktion i browseren. En fælles modal
// giver den samme bekræftelse på web, iOS og Android.
export function Confirmation({ options, onClose }) {
  return (
    <Modal
      visible={!!options}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal} accessibilityViewIsModal>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            {options?.title}
          </Text>
          <Text style={styles.text}>{options?.text}</Text>
          <ActionButton
            title={options?.action || "Bekræft"}
            danger={options?.danger}
            onPress={() => {
              const action = options?.onConfirm;
              onClose();
              action?.();
            }}
          />
          <ActionButton title="Behold tiden" secondary onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
