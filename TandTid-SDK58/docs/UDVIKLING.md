# Udvikling af TandTid, iteration 2

## Videreført fra første version

Idéen, de to roller og bookingforløbet er videreført. Patienten finder, booker og afbestiller fiktive tider. Tandlægen opretter og fjerner ledige tider. Navigationen bruger fortsat en stack, og knapper, kort, overskrifter og felter er genbrugelige komponenter.

## Modtaget feedback og konkrete ændringer

Forelæserens feedback var positiv over for idéen, de to interviews, interviewguiden og refleksionerne. Der blev ikke nævnt specifikke nye funktioner.

Student teacher foreslog en mere overskuelig mappestruktur med en fil pr. skærm samt en `.gitignore`. Derfor er de tidligere samlede skærme delt i `src/screens`, fælles komponenter ligger i `src/components`, og regler, context, lagring og styling har deres egne filer. `.gitignore` udelader blandt andet pakker, midlertidige filer og lokale miljøfiler.

Søgning og favoritter er udviklingsvalg i anden iteration. De er ikke beskrevet som ønsker fra interviewpersoner eller som dokumenteret feedback fra klinikker. En efterfølgende brugerevaluering skal undersøge, om de hjælper brugerne.

## Nye funktioner og kodekrav

| Område                   | Implementering                                                      |
| ------------------------ | ------------------------------------------------------------------- |
| Nye skærme               | `SearchScreen.js` og `FavoritesScreen.js`                           |
| Nye interaktioner        | Søgning, filtre, nulstil filtre, sortering og favoritknapper        |
| Navigation               | Otte skærme i React Navigations stack med fælles navigationsknapper |
| Lagring                  | AsyncStorage gemmer tider, bookingstatus og favoritter              |
| Genbrugelige komponenter | Knap, felt, kort, overskrift, chip, layout og bekræftelse           |
| Styling                  | Fælles farver og styles i `src/styles.js`                           |
| README                   | Installation, platforme, funktioner, struktur og demo               |
| Demovideo                | Første versions link er bevaret og mærket; en ny video skal optages |

## iPhone og Expo Go

Den oprindelige ZIP brugte Expo SDK 57. Leveringspakken bruger Expo SDK 58, React Native 0.88 og React 19.3, så projektet matcher Expo Go-installationen på brugerens iPhone. De native pakkeversioner er afstemt med Expos kompatibilitetskontrol. Det ændrer ikke appens funktioner.

## Kontrol og afprøvning

Automatiske test dækker blandt andet dobbeltbooking, afbestilling, fortidige tider, rollebegrænsninger, beskyttelse af bookede tider, favoritter, kombinerede filtre, validering, lagring og beskadigede data.

I browseren er følgende flow kontrolleret: opret testtid, skift rolle, søg med prisfilter, gem favorit, book, genindlæs, se gendannet booking og favorit, afbestil og fjern testtiden. Layoutet kontrolleres også med en smal mobilvisning.

SDK 58-pakken er kontrolleret med Expo Doctor (20 af 20 kontroller godkendt), alle 15 automatiske test og eksport til iOS, Android og web. En vellykket eksport er ikke det samme som en test på en fysisk iPhone. Afprøv derfor også ovenstående flow i Expo Go på telefonen inden aflevering.

## Senere rapportarbejde

Bruger- og stakeholderinterviews, resultater, markedsrefleksion og egen læring skal bygge på det arbejde, der faktisk bliver gennemført. Dette dokument er en beskrivelse af appens udvikling, ikke en færdig rapport eller dokumentation for en ny brugerevaluering.
