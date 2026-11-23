# Platestep

Proven programs that tell you what to lift next, one tap per set. Free, no ads, no account, and your logs stay on your phone.

**Open it:** https://jdabeast5.github.io/Training-Log/

## Install it on your home screen

Platestep is a web app. Add it to your home screen and it opens full screen, like any other app, and works offline.

- **iPhone or iPad (Safari):** tap Share, then **Add to Home Screen**.
- **Android (Chrome):** open the ⋮ menu, then **Install app** (or **Add to Home screen**).

Already logging in a Safari tab on iPhone or iPad? There the home-screen copy keeps its own storage, so move your log across first: in the tab, use **Export my data** in Settings, then add the app and use **Import backup** there. On Android, the installed app shares the browser's storage, so your log is already there.

## Your data

- **Your training log is stored on your phone**, in the browser's storage for this app. There is no account and no server copy.
- **Back it up yourself:** **Export my data** in Settings writes a JSON file you can keep anywhere, and **Import backup** restores it. The app reminds you after your first few sessions.
- **Food search** sends what you search for to the USDA FoodData Central API, and barcode scans to Open Food Facts.
- **Supplement search** sends what you search for to the NIH Dietary Supplement Label Database.
- **The barcode scanner** downloads its scanning library from jsDelivr (or unpkg if that fails) when you open it.
- **AI features are optional and use your own key.** They only run if you add your own Anthropic API key in Settings (AI Features Setup), and then send the request to Anthropic with that key.
- **Links you tap** (form videos on YouTube, recipe searches, study citations) open in your browser like any other link.
