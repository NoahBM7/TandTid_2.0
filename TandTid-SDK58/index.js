// Importerer Expos funktion til at registrere appens hovedkomponent.
import { registerRootComponent } from "expo";

// Importerer hovedkomponenten fra App.js.
import App from "./App";

// Registrerer App som appens rodkomponent.
// Det er den komponent, der indlæses, når appen starter.
registerRootComponent(App);
