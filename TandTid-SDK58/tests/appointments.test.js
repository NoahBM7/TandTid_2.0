import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_FILTERS,
  filterSlots,
  isValidState,
  makeInitialState,
  parseAppointment,
  transition,
  validateForm,
} from "../src/domain/appointments.js";
import { createRepository, STORAGE_KEY } from "../src/storage/repository.js";

const now = new Date(2026, 9, 26, 12);
const seed = () => makeInitialState(now);
const apply = (state, action, role = "patient", at = now) =>
  transition(state, action, role, at);

test("booking fjerner tiden fra søgningen og afviser dobbeltbooking", () => {
  const state = seed();
  const first = apply(state, { type: "book", id: "demo-0" });
  assert.equal(first.ok, true);
  assert.equal(
    filterSlots(first.state.slots, DEFAULT_FILTERS, now).length,
    state.slots.length - 1,
  );
  assert.equal(apply(first.state, { type: "book", id: "demo-0" }).ok, false);
  assert.equal(state.slots[0].booked, false);
});

test("afbestilling gør tiden ledig igen og bevarer favoritten", () => {
  const favorite = apply(seed(), { type: "favorite", id: "demo-0" }).state;
  const booked = apply(favorite, { type: "book", id: "demo-0" }).state;
  const cancelled = apply(booked, { type: "cancel", id: "demo-0" });
  assert.equal(cancelled.ok, true);
  assert.equal(cancelled.state.slots[0].booked, false);
  assert.deepEqual(cancelled.state.favorites, ["demo-0"]);
});

test("fortidige tider kan hverken bookes eller afbestilles", () => {
  const state = seed();
  const future = new Date(2027, 0, 1);
  assert.equal(
    apply(state, { type: "book", id: "demo-0" }, "patient", future).ok,
    false,
  );
  const booked = apply(state, { type: "book", id: "demo-0" }).state;
  assert.equal(
    apply(booked, { type: "cancel", id: "demo-0" }, "patient", future).ok,
    false,
  );
  assert.equal(filterSlots(state.slots, DEFAULT_FILTERS, future).length, 0);
});

test("rollerne beskytter prototypens handlinger", () => {
  const state = seed();
  assert.equal(
    apply(state, { type: "book", id: "demo-0" }, "dentist").ok,
    false,
  );
  assert.equal(apply(state, { type: "remove", id: "demo-0" }).ok, false);
  assert.equal(
    apply(state, { type: "favorite", id: "demo-0" }, null).ok,
    false,
  );
  assert.equal(
    apply(state, { type: "add", slot: { ...state.slots[0], id: "new" } }).ok,
    false,
  );
});

test("klinikken kan oprette og fjerne en ledig tid, men ikke en booket tid", () => {
  const state = seed();
  const created = apply(
    state,
    { type: "add", slot: { ...state.slots[0], id: "new" } },
    "dentist",
  );
  assert.equal(created.ok, true);
  const favorite = apply(created.state, { type: "favorite", id: "new" }).state;
  const removed = apply(favorite, { type: "remove", id: "new" }, "dentist");
  assert.equal(removed.ok, true);
  assert.equal(
    removed.state.slots.some((slot) => slot.id === "new"),
    false,
  );
  assert.deepEqual(removed.state.favorites, []);
  const booked = apply(state, { type: "book", id: "demo-0" }).state;
  assert.equal(
    apply(booked, { type: "remove", id: "demo-0" }, "dentist").ok,
    false,
  );
});

test("favoritknappen kan slås til og fra uden at reservere en tid", () => {
  const state = apply(seed(), { type: "favorite", id: "demo-0" }).state;
  assert.deepEqual(state.favorites, ["demo-0"]);
  assert.equal(state.slots[0].booked, false);
  assert.deepEqual(
    apply(state, { type: "favorite", id: "demo-0" }).state.favorites,
    [],
  );
});

test("søgning kombinerer by, behandling, prisloft og sortering", () => {
  const results = filterSlots(
    seed().slots,
    {
      ...DEFAULT_FILTERS,
      query: "KOBENHAVN",
      treatment: "Tandrensning",
      maxPrice: "420",
      sort: "price",
    },
    now,
  );
  assert.deepEqual(
    results.map((slot) => slot.id),
    ["demo-4"],
  );
  const sorted = filterSlots(
    seed().slots,
    { ...DEFAULT_FILTERS, sort: "price" },
    now,
  );
  assert.equal(sorted[0].price, 300);
  assert.equal(
    filterSlots(seed().slots, { ...DEFAULT_FILTERS, query: "ukendt" }, now)
      .length,
    0,
  );
});

test("periodefiltre afgrænser efter lokal kalenderdag", () => {
  assert.equal(
    filterSlots(seed().slots, { ...DEFAULT_FILTERS, period: "today" }, now)
      .length,
    0,
  );
  assert.equal(
    filterSlots(seed().slots, { ...DEFAULT_FILTERS, period: "week" }, now)
      .length,
    6,
  );
  const extra = {
    ...seed().slots[0],
    id: "later",
    startsAt: new Date(2026, 10, 5, 10).toISOString(),
  };
  assert.equal(
    filterSlots([extra], { ...DEFAULT_FILTERS, period: "week" }, now).length,
    0,
  );
});

test("datoer afvises, hvis kalenderen eller klokkeslættet er ugyldigt", () => {
  for (const [date, time] of [
    ["2026-02-31", "12:00"],
    ["2026-11-05", "25:00"],
    ["05-11-2026", "14:30"],
    ["2026-11-05", "14:60"],
  ])
    assert.equal(parseAppointment(date, time), null);
  assert.equal(parseAppointment("2026-11-05", "14:30").getMinutes(), 30);
});

test("formularen kræver indhold og accepterer danske decimalpriser", () => {
  const form = {
    clinic: "Test",
    address: "Testvej 1",
    treatment: "Eftersyn",
    date: "2026-11-05",
    time: "14:30",
    price: "350,50",
    duration: "30",
  };
  assert.equal(validateForm(form, now).slot.price, 350.5);
  for (const patch of [
    { clinic: " " },
    { price: "" },
    { price: "-5" },
    { duration: "0" },
    { duration: "1.5" },
    { date: "2026-01-01" },
  ])
    assert.ok(validateForm({ ...form, ...patch }, now).error);
});

test("lagring gendanner oprettelse, booking og favoritter i en ny session", async () => {
  let raw = null;
  const adapter = {
    getItem: async (key) => {
      assert.equal(key, STORAGE_KEY);
      return raw;
    },
    setItem: async (key, value) => {
      assert.equal(key, STORAGE_KEY);
      raw = value;
    },
  };
  const state = apply(apply(seed(), { type: "favorite", id: "demo-0" }).state, {
    type: "book",
    id: "demo-0",
  }).state;
  await createRepository(adapter).save(state);
  assert.deepEqual(await createRepository(adapter).load(), state);
});

test("en tom gemt liste bliver ikke erstattet af demotider", async () => {
  const state = { version: 2, slots: [], favorites: [] };
  const repo = createRepository({ getItem: async () => JSON.stringify(state) });
  assert.deepEqual(await repo.load(), state);
  assert.equal(
    await createRepository({ getItem: async () => null }).load(),
    null,
  );
});

test("beskadigede data og læsefejl bliver ikke overskrevet", async () => {
  for (const raw of [
    "{broken",
    JSON.stringify({ version: 99, slots: [], favorites: [] }),
  ]) {
    let writes = 0;
    const repo = createRepository({
      getItem: async () => raw,
      setItem: async () => {
        writes++;
      },
    });
    await assert.rejects(repo.load());
    assert.equal(writes, 0);
  }
  await assert.rejects(
    createRepository({
      getItem: async () => {
        throw Error("blocked");
      },
    }).load(),
  );
});

test("skrivefejl bliver returneret til appen", async () => {
  const repo = createRepository({
    setItem: async () => {
      throw Error("full");
    },
  });
  await assert.rejects(repo.save(seed()), /full/);
});

test("datavalideringen afviser dublerede id’er og løse favoritreferencer", () => {
  const state = seed();
  assert.equal(isValidState(state), true);
  assert.equal(isValidState({ ...state, favorites: ["missing"] }), false);
  assert.equal(
    isValidState({ ...state, slots: [...state.slots, state.slots[0]] }),
    false,
  );
});
