# 🤖 WhatsApp Auto-React & Command Bot

වට්සැප් බොට් කෙනෙක් (Node.js & Baileys) - Pairing code සමග පහසුවෙන්ම සම්බන්ධ කරගත හැකි අතර, පහත සඳහන් සියලු විශේෂාංග ඇතුළත් වේ:

## ✨ විශේෂාංග (Features Included)
1. **👑 Single Emoji Auto-React (එක ඉමොජියක් පමණි - 👑)** : අපි යවන ඕනෑම මැසේජ් එකකට හෝ Target අංකයට එක ඉමොජියක් (Default 👑) රියැක්ට් වීම
2. **🎨 කැමති Emoji එකක් Add කරගැනීම** : `.setting emoji <emoji>` හෝ `.apply <emoji>` මඟින් ඕනෑම Emoji එකක් (👑, 🔥, ❤️, ⚡, 💎 ආදී) සකසා ගැනීම
3. **.apply prefix <symbol>** : බොට්ගේ Prefix එක වෙනස් කරන්න (`#`, `!`, `/`, `?`, `@`, `.`)
4. **.ping** : බොට්ගේ ප්‍රතිචාර වේගය (Latency in ms), Uptime සහ RAM භාවිතය බලාගන්න
5. **Auto-React Target Number** : `0764802314` (94764802314) අංකයෙන් මැසේජ් ලැබෙන විට ස්වයංක්‍රීයව රියැක්ට් කිරීම
6. **.setting** : සියලු සෙටින්ග්ස් කළමනාකරණය කිරීමට අලංකාර මෙනුව

---

## 🚀 පියවරෙන් පියවර රන් කරගන්නා ආකාරය (How to Run)

### ක්‍රමය 1: PC හෝ VPS (Windows / Mac / Linux / Ubuntu)
1. **Node.js (v18+)** පරිගණකයේ ස්ථාපනය කරගන්න.
2. මෙම Folder එක විවෘත කර Terminal එකේ Run කරන්න:
```bash
npm install
npm start
```
3. Terminal එකේ අසන විට ඔබගේ WhatsApp අංකය ලබා දෙන්න (උදා: `94764802314`).
4. Terminal එකේ පෙන්වන **8-Digit Pairing Code** එක ලබාගන්න.
5. ඔබගේ WhatsApp App එකේ:
   - **Settings** -> **Linked Devices** -> **Link a Device** -> **Link with phone number instead** වෙත ගොස් අංකය ලබා දෙන්න.
6. බොට් සාර්ථකව Connected වේ! 🟢

---

### ක්‍රමය 2: Android Phone (Termux) හරහා
```bash
pkg update && pkg upgrade -y
pkg install nodejs git -y
npm install
npm start
```

---

## 📌 විධාන ලැයිස්තුව (Commands List)

### 🔢 අංක පිළිවෙලට සෙටින්ග්ස් (Numbered Settings):
| අංකය (Reply) | විධානය (Command) | විස්තරය (Description) |
|---|---|---|
| **1 on** | `.setting 1 on` | 👑 Self-React සක්‍රිය කිරීම (අපේ මැසේජ් වලට 👑 React වීම) |
| **1.2 off** | `.setting 1.2 off` | 🔴 Self-React අක්‍රිය කිරීම |
| **2 on** | `.setting 2 on` | 🟢 Target Auto-React සක්‍රිය කිරීම |
| **2.2 off** | `.setting 2.2 off` | 🔴 Target Auto-React අක්‍රිය කිරීම |
| **3 <number>** | `.setting 3 <num>` | 📱 Target අංකය වෙනස් කිරීම (උදා: `3 0764802314`) |
| **4 <emoji>** | `.setting 4 <emoji>` | ✨ Reaction Emoji එකක් වෙනස් කිරීම (උදා: `4 👑` හෝ `4 🔥`) |
| **5 <symbol>** | `.setting 5 <symbol>` | 🔣 Prefix එක වෙනස් කිරීම (`#`, `!`, `/`, `?`, `@`, `.`) |
| **6** | `.ping` | ⚡ Bot Response Speed (Ping Latency in ms) |

### 🛠️ සම්පූර්ණ විධාන (Full Commands):
| විධානය (Command) | විස්තරය (Description) | උදාහරණ (Example) |
|---|---|---|
| `.ping` | බොට් ක්‍රියාකාරීත්වය හා වේගය පරීක්ෂා කිරීම | `.ping` |
| `.setting` | අංක පිළිවෙලට සෙටින්ග්ස් මෙනුව පෙන්වීම | `.setting` |
| `.setting emoji <emoji>` | රියැක්ට් වෙන එක ඉමොජිය කැමති පරිදි වෙනස් කිරීම | `.setting emoji 👑` හෝ `.setting emoji 🔥` |
| `.setting selfreact on/off` | අපේ මැසේජ් වලට රියැක්ට් වීම On / Off කිරීම | `.setting selfreact on` |
| `.setting react on/off` | Auto-React On / Off කිරීම | `.setting react on` |
| `.setting number <num>` | Target අංකය වෙනස් කිරීම | `.setting number 0764802314` |
| `.apply prefix <symbol>` | Prefix එක වෙනස් කිරීම (#, !, /, ?, @) | `.apply prefix #` |
| `.apply <emoji>` | Reaction ඉමෝජි එක වෙනස් කිරීම | `.apply 👑` |

---
Enjoy your automated WhatsApp bot!
