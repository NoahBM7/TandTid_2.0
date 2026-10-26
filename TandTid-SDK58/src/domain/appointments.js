// Ren JavaScript: reglerne kan testes uden at starte React Native.
export const DEFAULT_FILTERS = {
  query: "",
  treatment: "",
  maxPrice: "",
  period: "all",
  sort: "soonest",
};

export function makeInitialState(now = new Date()) {
  const examples = [
    [
      "Smil på Frederiksberg",
      "Falkoner Allé 12, Frederiksberg",
      "Tandeftersyn",
      350,
      30,
      1,
      9,
    ],
    [
      "Tandlægerne ved Søerne",
      "Sortedam Dossering 8, København",
      "Tandrensning",
      450,
      45,
      1,
      13,
    ],
    [
      "City Tandklinik",
      "Nørregade 20, København",
      "Tandeftersyn",
      300,
      30,
      2,
      10,
    ],
    [
      "Smil på Frederiksberg",
      "Falkoner Allé 12, Frederiksberg",
      "Tandrensning",
      425,
      45,
      3,
      11,
    ],
    [
      "City Tandklinik",
      "Nørregade 20, København",
      "Tandrensning",
      395,
      30,
      4,
      14,
    ],
    [
      "Tandlægerne ved Søerne",
      "Sortedam Dossering 8, København",
      "Tandeftersyn",
      375,
      30,
      6,
      8,
    ],
  ];
  return {
    version: 2,
    favorites: [],
    slots: examples.map(
      ([clinic, address, treatment, price, duration, days, hour], index) => {
        const date = new Date(now);
        date.setDate(date.getDate() + days);
        date.setHours(hour, 0, 0, 0);
        return {
          id: `demo-${index}`,
          clinic,
          address,
          treatment,
          price,
          duration,
          startsAt: date.toISOString(),
          booked: false,
        };
      },
    ),
  };
}

const validSlot = (slot) =>
  slot &&
  typeof slot.id === "string" &&
  slot.id.length > 0 &&
  ["clinic", "address", "treatment"].every(
    (key) => typeof slot[key] === "string" && slot[key].trim(),
  ) &&
  Number.isFinite(slot.price) &&
  slot.price >= 0 &&
  Number.isInteger(slot.duration) &&
  slot.duration > 0 &&
  typeof slot.startsAt === "string" &&
  Number.isFinite(Date.parse(slot.startsAt)) &&
  typeof slot.booked === "boolean";

export function isValidState(value) {
  return (
    !!value &&
    value.version === 2 &&
    Array.isArray(value.slots) &&
    value.slots.every(validSlot) &&
    new Set(value.slots.map((slot) => slot.id)).size === value.slots.length &&
    Array.isArray(value.favorites) &&
    value.favorites.every(
      (id) =>
        typeof id === "string" && value.slots.some((slot) => slot.id === id),
    )
  );
}

export function parseAppointment(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time))
    return null;
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const result = new Date(year, month - 1, day, hours, minutes);
  if (
    result.getFullYear() !== year ||
    result.getMonth() !== month - 1 ||
    result.getDate() !== day ||
    result.getHours() !== hours ||
    result.getMinutes() !== minutes
  )
    return null;
  return result;
}

export function validateForm(form, now = new Date()) {
  if (["clinic", "address", "treatment"].some((key) => !form[key]?.trim()))
    return { error: "Udfyld klinikkens navn, adresse og behandling." };
  const startsAt = parseAppointment(form.date.trim(), form.time.trim());
  if (!startsAt || startsAt <= now)
    return { error: "Vælg en gyldig dato og et klokkeslæt i fremtiden." };
  const price = Number(form.price.replace(",", "."));
  const duration = Number(form.duration);
  if (
    !form.price.trim() ||
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isInteger(duration) ||
    duration <= 0
  )
    return {
      error:
        "Prisen skal være 0 eller derover. Varigheden skal være et positivt helt antal minutter.",
    };
  return {
    slot: {
      clinic: form.clinic.trim(),
      address: form.address.trim(),
      treatment: form.treatment.trim(),
      price,
      duration,
      startsAt: startsAt.toISOString(),
    },
  };
}

// Rollevalget er kun en demofunktion, ikke et login eller adgangskontrol.
export function transition(state, action, role, now = new Date()) {
  const slot = state?.slots.find((item) => item.id === action.id);
  const fail = (message) => ({ ok: false, message });
  const success = (next, message) => ({ ok: true, state: next, message });
  if (!state) return fail("Dine tider er ikke indlæst endnu.");
  if (action.type === "book") {
    if (
      role !== "patient" ||
      !slot ||
      slot.booked ||
      new Date(slot.startsAt) <= now
    )
      return fail("Tiden er ikke længere ledig. Vælg en anden tid.");
    return success(
      {
        ...state,
        slots: state.slots.map((item) =>
          item.id === slot.id ? { ...item, booked: true } : item,
        ),
      },
      "Tiden er din! Du finder bookingen under Mine tider.",
    );
  }
  if (action.type === "cancel") {
    if (role !== "patient" || !slot?.booked || new Date(slot.startsAt) <= now)
      return fail("Denne booking kan ikke afbestilles.");
    return success(
      {
        ...state,
        slots: state.slots.map((item) =>
          item.id === slot.id ? { ...item, booked: false } : item,
        ),
      },
      "Tiden er afbestilt og ledig igen.",
    );
  }
  if (action.type === "favorite") {
    if (role !== "patient" || !slot) return fail("Tiden findes ikke længere.");
    const exists = state.favorites.includes(slot.id);
    return success(
      {
        ...state,
        favorites: exists
          ? state.favorites.filter((id) => id !== slot.id)
          : [...state.favorites, slot.id],
      },
      exists
        ? "Tiden er fjernet fra dine favoritter."
        : "Tiden er gemt under Favoritter.",
    );
  }
  if (action.type === "add") {
    const next = { ...action.slot, booked: false };
    if (
      role !== "dentist" ||
      !validSlot(next) ||
      state.slots.some((item) => item.id === next.id) ||
      new Date(next.startsAt) <= now
    )
      return fail("Tiden kunne ikke oprettes. Kontrollér oplysningerne.");
    return success(
      { ...state, slots: [...state.slots, next] },
      "Tiden er oprettet og klar til booking.",
    );
  }
  if (action.type === "remove") {
    if (role !== "dentist" || !slot || slot.booked)
      return fail("En booket tid kan ikke fjernes.");
    return success(
      {
        ...state,
        slots: state.slots.filter((item) => item.id !== slot.id),
        favorites: state.favorites.filter((id) => id !== slot.id),
      },
      "Tiden er fjernet.",
    );
  }
  return fail("Handlingen kunne ikke gennemføres.");
}

export const sortedSlots = (slots) =>
  [...slots].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
export const normalize = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("da-DK")
    .replaceAll("ø", "o")
    .replaceAll("æ", "ae");

export function filterSlots(
  slots,
  filters = DEFAULT_FILTERS,
  now = new Date(),
) {
  const query = normalize(filters.query.trim());
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  if (filters.period === "week") end.setDate(end.getDate() + 6);
  return slots
    .filter((slot) => {
      if (slot.booked || new Date(slot.startsAt) <= now) return false;
      if (
        query &&
        !normalize(`${slot.clinic} ${slot.address} ${slot.treatment}`).includes(
          query,
        )
      )
        return false;
      if (filters.treatment && slot.treatment !== filters.treatment)
        return false;
      if (
        filters.maxPrice.trim() &&
        slot.price > Number(filters.maxPrice.replace(",", "."))
      )
        return false;
      if (filters.period !== "all" && new Date(slot.startsAt) > end)
        return false;
      return true;
    })
    .sort((a, b) =>
      filters.sort === "price"
        ? a.price - b.price || Date.parse(a.startsAt) - Date.parse(b.startsAt)
        : Date.parse(a.startsAt) - Date.parse(b.startsAt),
    );
}

export const formatDate = (value) =>
  new Date(value).toLocaleDateString("da-DK", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
export const formatTime = (value) =>
  new Date(value).toLocaleTimeString("da-DK", {
    hour: "2-digit",
    minute: "2-digit",
  });
export const formatPrice = (value) =>
  `${value.toLocaleString("da-DK", { minimumFractionDigits: Number.isInteger(value) ? 0 : 2, maximumFractionDigits: 2 })} kr.`;
