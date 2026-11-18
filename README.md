# Ochkoʻz — Java Greedy

Java'da greedy algoritmlarni noldan musobaqa darajasigacha o'rganish uchun offline ilova.
Shriftlar, darslar, masalalar va kod — hammasi ichida, internet kerak emas.

## Ichida nima bor

- **15 ta dars** (10 modul): greedy nima → isbot usullari (exchange argument, greedy stays ahead) → intervallar → comparator va saralash → deadline'li rejalashtirish → PriorityQueue → regret greedy → two pointers va multiset → sakrash/qamrov → monoton stek → MST → Dijkstra → konstruktiv → binary search + greedy → matroid va strategiya.
- **28 ta masala** (CSES, LeetCode, Codeforces): shart, misollar, 3 bosqichli hint, g'oya, **isbot** ("Nega greedy to'g'ri?") va to'liq Java yechim. Barcha yechimlar misollarda va brute force bilan tasodifiy testlarda sinalgan.
- **Yechish taymeri** — har masalada vaqtni o'lchaydi, masalalar ro'yxatida ko'rinadi.
- **"Greedy yoki DP?" o'yini** — 24 ta masala tavsifi: greedy yetadimi yoki DP kerakmi, tez qaror qilish mashqi.
- **Vizualizator**: 9 ta animatsiya — activity selection, minimal xonalar, tangalar (greedy va optimal), fractional knapsack, Huffman, Jump Game II, monoton stek, Kruskal, Dijkstra. Qadamlarni sudrab ko'rish mumkin.
- **Work item board**: 97 ta avtomatik work item, 11 haftalik sprint, story points, acceptance criteria, burndown, drag & drop.
- **Test** (62 savol), **kartalar** (48, Leitner), **shablonlar** + "Qaysi greedy usuli?" topuvchi, fokus taymer, qidiruv (Ctrl K), klaviatura yorliqlari (?), kunduzgi/tungi mavzu, JSON eksport/import.

## GitHub Pages'ga joylash

1. GitHub'da yangi public repo oching, masalan `ochkoz`.
2. Arxivdagi `ochkoz/` papka **ichidagi** barcha fayllarni repo ildiziga yuklang (`index.html` ildizda bo'lishi kerak).
3. Settings → Pages → Source: **Deploy from a branch**, `main`, `/ (root)` → Save.
4. 1–2 daqiqadan keyin: `https://<foydalanuvchi>.github.io/ochkoz/`

Telefonda (Android, Chrome): saytni oching → ⋮ → **Ilovani o'rnatish**. Birinchi ochilishdan keyin internetsiz ishlaydi.

Katak (DP) ilovasi bilan bir xil domen'da bo'lsa ham ular aralashmaydi — progress alohida saqlanadi.

## Lokal

`index.html` ni brauzerda oching yoki `python -m http.server 8000` → http://localhost:8000

## Kontentni tahrirlash

Darslar `src/lessons/*.md`, masalalar `src/problems/*.md`, shablonlar `src/cheats.md`. Keyin:

```
node tools/build.js
```

Test, kartalar, o'yin va patternlar — `js/data/extra.js`. Java yechimlarni tekshirish (JDK kerak):

```
node tools/build.js --dump-java
node tools/test-java.js
```
