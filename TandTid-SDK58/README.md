# TandTid - iteration 2

TandTid er en studieprototype i React Native og JavaScript. Appen gør fiktive ledige tandlægetider tilgængelige efter først til mølle-princippet. Den samme kode bruges på iPhone, Android og i browseren.

## Åbn projektet i VS Code

1. Pak ZIP-filen ud.
2. Vælg **File > Open Folder** i VS Code, og åbn hele mappen **TandTid-SDK58**. Det er mappen med `package.json`.
3. Åbn **Terminal > New Terminal**.
4. Installér pakkerne:

```sh
npm install
```

### Hvis du hentede den tidligere udgave med SDK 54

Stop den gamle terminalserver med Ctrl+C. Pak den nye ZIP ud i sin egen mappe, og åbn **TandTid-SDK58** i VS Code. Kør `npm install` og derefter `npx expo start --clear` i den nye mappe. Scan den nye QR-kode; en QR-kode fra den gamle terminal åbner fortsat SDK 54-projektet.

### Start på iPhone med Expo Go

Denne udgave bruger **Expo SDK 58**, React Native 0.88 og React 19.3. Projektets SDK passer dermed til Expo Go-installationen, der kræver SDK 58. De nye funktioner er de samme på mobil og web.

1. Installér eller opdatér **Expo Go** fra App Store.
2. Forbind iPhone og computer til samme Wi-Fi.
3. Start projektet i terminalen:

```sh
npx expo start --clear
```

4. Scan QR-koden med iPhones Kamera, og vælg at åbne i Expo Go.
5. Lad terminalen køre, mens du bruger appen.

Hvis forbindelsen er blokeret på netværket, stop med Ctrl+C, og prøv:

```sh
npx expo start --tunnel
```

Expo kan bede om at installere en ekstra pakke til tunnelen. Hvis du får en versionsfejl, kontrollér først at terminalen står i den nye projektmappe, og at Expo Go understøtter SDK 58. Brug ikke filerne fra det gamle projekt sammen med den nye `package.json`.

Expo Go og projektets SDK skal passe sammen. Se [Expos vejledning om versionsfejl](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/).

### Start i browseren

```sh
npm run web
```

### Test og byg

```sh
npm test
npm run build:web
```

Alle platforme kan eksporteres med:

```sh
npx expo export --platform all
```

Brug Node.js 24 LTS (mindst 24.3.0) og npm. SDK 58 understøtter også Node.js 22 fra version 22.13.0 og Node.js 26 eller nyere. Der skal ikke indtastes API-nøgler.

## Nyt i anden iteration

- **Søgning:** ny skærm med søgning efter klinik, by eller behandling samt filtre for behandling, maksimal pris, periode og sortering.
- **Favoritter:** ny skærm og hjerteknapper til at gemme og fjerne tider. En favorit reserverer ikke tiden.
- **Lokal lagring:** oprettede tider, bookinger, afbestillinger og favoritter gemmes med AsyncStorage og gendannes efter genstart.
- **Web:** responsivt layout og bekræftelser, der også fungerer i browseren.
- **Kodestruktur:** mapper med én fil pr. skærm samt genbrugelige komponenter, fælles styling og `.gitignore`.

## Mapper og filer

```text
TandTid-SDK58/
├── App.js                         # Navigation, fælles tilstand og lagring
├── index.js                       # Registrerer appen i Expo
├── app.json                       # Expo-konfiguration
├── package.json                   # Pakker og kommandoer
├── package-lock.json              # De låste pakkeversioner
├── .gitignore
├── README.md
├── src/
│   ├── components/
│   │   └── index.js               # Knapper, formularfelter, kort og layout
│   ├── context/
│   │   └── AppContext.js          # Deler data mellem skærmene
│   ├── domain/
│   │   └── appointments.js        # Bookingregler, søgning og validering
│   ├── screens/
│   │   ├── RoleScreen.js
│   │   ├── AvailableScreen.js
│   │   ├── DetailsScreen.js
│   │   ├── BookingsScreen.js
│   │   ├── ClinicScreen.js
│   │   ├── CreateScreen.js
│   │   ├── SearchScreen.js        # Ny
│   │   └── FavoritesScreen.js     # Ny
│   ├── storage/
│   │   └── repository.js          # Læser og skriver gemte data
│   └── styles.js                  # Fælles styling og farver
├── tests/
│   └── appointments.test.js       # Test af regler, filtre og lagring
└── docs/
    └── UDVIKLING.md               # Ændringer og afprøvning
```

`node_modules` er udeladt fra ZIP-filen. Mappen bliver oprettet af `npm install` og skal ikke med i afleveringens kodebackup.

## Prøv de nye funktioner

1. Vælg **Fortsæt som tandlæge**.
2. Opret en fremtidig tid med klinik, adresse, behandling, dato, klokkeslæt, pris og varighed.
3. Skift rolle til patient.
4. Søg efter den nye klinik. Åbn **Alle filtre**, og prøv prisloft og periode.
5. Tryk på hjertet, og find tiden under **Favoritter**.
6. Åbn tiden, og tryk **Bekræft booking**.
7. Luk appen, og åbn den igen. Vælg patient, og kontrollér **Mine tider** og **Favoritter**.
8. Afbestil tiden. Den bliver ledig igen, hvis tidspunktet stadig ligger i fremtiden.
9. Skift til tandlæge. En ledig tid kan fjernes efter bekræftelse. En booket tid kan ikke fjernes.

## Lagring og afgrænsning

AsyncStorage gemmer JSON under nøglen `@tandtid/state/v2`. På web bruges browserens lokale lager; på telefonen bruges AsyncStorage. Data deles ikke mellem telefon og computer eller mellem forskellige browseradresser.

Demotider oprettes kun første gang. En tom, gemt liste bliver ikke fyldt op igen ved genstart. Korrupt eller utilgængelig lagring viser en fejl og bliver ikke automatisk overskrevet. En ændring vises først som gennemført, når den er gemt.

Dette er en prototype med én demopatient og en fælles oversigt for alle demoklinikker. Rollevalget er ikke et login. Der er ingen rigtig booking, betaling, server, personkonti, synkronisering eller reservation mellem flere brugere. Ændringer på samme enhed er gemt lokalt, og browserdata kan slettes af browseren.

## Video
https://www.youtube.com/shorts/jN8_q5vSukY


## Teknisk dokumentation

- [Expo: webudvikling](https://docs.expo.dev/workflow/web/)
- [AsyncStorage 2: brug](https://react-native-async-storage.github.io/2.0/Usage/)
- [Expo: versionsfejl i Expo Go](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/)
