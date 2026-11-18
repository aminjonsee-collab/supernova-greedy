---
id: l11
module: m6
week: 9
title: MST — Kruskal va Prim
mins: 65
viz: kruskal
problems: p23
goals: Cut property'ni tushunish va isbotlash | Kruskal'ni DSU bilan yozish | Prim'ni PriorityQueue bilan yozish
summary: Minimal spanning tree — graflardagi eng mashhur greedy va uning isboti.
---

## Masala

Bog'langan, og'irlikli, yo'naltirilmagan graf. Barcha tugunlarni bog'laydigan va qirralari yig'indisi minimal bo'lgan qism-daraxt (MST) kerak. Masalan, shaharlar orasida eng arzon yo'l tarmog'i.

## Cut property

Tugunlarni ikki guruhga bo'lamiz (kesim). Guruhlar orasidagi qirralardan **eng yengili** biror MST'da albatta bor.

Isbot (exchange): MST `T` da bu qirra `e` yo'q deylik. `e` ni `T` ga qo'shsak, sikl hosil bo'ladi va u kesimni yana bir qirra `f` bilan kesib o'tadi. `w(e) ≤ w(f)`, shuning uchun `T - f + e` ham daraxt va og'irligi oshmagan. Demak `e` ni o'z ichiga olgan MST bor.

Kruskal ham, Prim ham shu xossani turli kesimlar uchun qo'llaydi.

## Kruskal

Qirralarni og'irlik bo'yicha saralaymiz. Har qirrani, agar u **sikl hosil qilmasa**, olamiz. Sikl tekshiruvi — DSU (Disjoint Set Union).

```java
static int[] par, sz;

static int find(int x) {
    while (par[x] != x) {
        par[x] = par[par[x]];
        x = par[x];
    }
    return x;
}

static boolean union(int a, int b) {
    a = find(a);
    b = find(b);
    if (a == b) return false;
    if (sz[a] < sz[b]) { int t = a; a = b; b = t; }
    par[b] = a;
    sz[a] += sz[b];
    return true;
}
```

```java
Arrays.sort(e, (x, y) -> Integer.compare(x[2], y[2]));
long total = 0;
int used = 0;
for (int[] ed : e) {
    if (union(ed[0], ed[1])) {
        total += ed[2];
        used++;
    }
}
System.out.println(used == n - 1 ? String.valueOf(total) : "IMPOSSIBLE");
```

Murakkablik O(m log m). Iterativ `find` (path halving) — Java'da rekursiyasiz, stack xavfi yo'q.

## Prim

Bitta tugundan boshlab daraxtni o'stiramiz: har qadamda daraxt va qolgan tugunlar orasidagi **eng yengil** qirrani qo'shamiz (kesim — "daraxt / qolganlar").

```java
boolean[] in = new boolean[n];
PriorityQueue<long[]> pq = new PriorityQueue<>((x, y) -> Long.compare(x[0], y[0]));
pq.add(new long[]{0, 0});
long total = 0;
int cnt = 0;
while (!pq.isEmpty() && cnt < n) {
    long[] cur = pq.poll();
    int v = (int) cur[1];
    if (in[v]) continue;
    in[v] = true;
    total += cur[0];
    cnt++;
    for (int[] ed : adj[v]) if (!in[ed[0]]) pq.add(new long[]{ed[1], ed[0]});
}
```

| | Kruskal | Prim |
|---|---|---|
| Asosiy struktura | saralash + DSU | PriorityQueue |
| Murakkablik | O(m log m) | O(m log n) |
| Qachon qulay | qirralar ro'yxati berilgan | zich graf, qo'shnilik ro'yxati |

## MST xossalari

- **Minimax yo'l**: MST'dagi u→v yo'l — "eng og'ir qirrasi minimal" bo'lgan yo'l. "Ikki shahar orasida eng og'ir qirrani minimallashtiring" masalalari MST'ga keladi.
- Barcha og'irliklar har xil bo'lsa, MST yagona.
- Maksimal spanning tree — teskari tartibda saralash.

=====
---
id: l12
module: m6
week: 10
title: Dijkstra — eng yaqinini birinchi
mins: 55
viz: dijkstra
problems: p24
goals: Dijkstra greedy ekanini va nega ishlashini tushunish | Manfiy qirrada nega buzilishini ko'rsatish | Java'da lazy deletion bilan tez Dijkstra yozish
summary: Eng qisqa yo'l: eng yaqin tugun yakuniy — manfiy qirra bo'lmasa.
---

## Greedy qadam

Dijkstra har qadamda **hali yakunlanmagan tugunlar ichidan masofasi eng kichigini** oladi va uning masofasini yakuniy deb e'lon qiladi. Bu greedy: keyinroq kamroq masofa topilmaydi deb ishonadi.

Nega to'g'ri: `v` — eng yaqin yakunlanmagan tugun, `dist[v] = D`. Boshqa yo'l bilan `v` ga kamroqqa borish uchun avval biror yakunlanmagan `u` dan o'tish kerak, lekin `dist[u] ≥ D` va qirralar manfiy emas — demak bu yo'l `≥ D`.

## Manfiy qirra buzadi

`1 → 2` (2), `1 → 3` (5), `3 → 2` (-4). Dijkstra 2 ni masofa 2 bilan yakunlaydi, lekin `1 → 3 → 2` = 1. "Kelajak yo'q" degan greedy taxmin manfiy qirra bilan ishlamaydi. Bunda Bellman–Ford kerak.

## Java'da Dijkstra

```java
long[] dist = new long[n];
Arrays.fill(dist, Long.MAX_VALUE);
dist[0] = 0;
PriorityQueue<long[]> pq = new PriorityQueue<>((x, y) -> Long.compare(x[0], y[0]));
pq.add(new long[]{0, 0});
while (!pq.isEmpty()) {
    long[] cur = pq.poll();
    int v = (int) cur[1];
    if (cur[0] > dist[v]) continue;
    for (int[] ed : adj[v]) {
        int u = ed[0];
        long nd = cur[0] + ed[1];
        if (nd < dist[u]) {
            dist[u] = nd;
            pq.add(new long[]{nd, u});
        }
    }
}
```

`if (cur[0] > dist[v]) continue;` — lazy deletion: heap'da eskirgan yozuvlar qoladi, ularni olinganda tashlab yuboramiz. `decrease-key` kerak emas.

> [!WARN] Masofalar `long` bo'lsin: 10^5 qirra × 10^9 og'irlik = 10^14.

## Tezlik uchun

- `List<int[]>[]` o'rniga massivlarda qo'shnilik ro'yxati (`head`, `next`, `to`, `w`) — 2–3 marta tez.
- `long[]` juftlik o'rniga bitta `long`: `dist << 20 | v` (dist ≤ 2^43 bo'lsa).
- Javobni `StringBuilder` bilan chiqarish.

## Variantlar

| Masala | O'zgarish |
|---|---|
| Ko'p manbali | boshida barcha manbalarni `dist = 0` bilan heap'ga |
| 0-1 og'irliklar | deque bilan 0-1 BFS, O(n + m) |
| Holatli graf | tugun = (shahar, kupon ishlatildimi) — CSES Flight Discount |
| Eng qisqa yo'llar soni | `dist` teng bo'lsa `cnt[u] += cnt[v]` |

=====
---
id: l13
module: m7
week: 10
title: Konstruktiv va matematik greedy
mins: 55
viz:
problems: p25 | p26
goals: Prefiks yetish invarianti (Missing Coin Sum) | Multiset bilan Towers va uning LIS bilan bog'liqligi | Codeforces konstruktiv masalalariga yondashuv
summary: Invariantlar, "eng cheklangan joydan boshlash" va javobni bosqichma-bosqich qurish.
---

## Missing Coin Sum

Tangalar berilgan. Ularning qism-to'plamlari yig'indisi sifatida hosil qilib **bo'lmaydigan** eng kichik musbat son?

Saralaymiz. Invariant: birinchi i ta tanga bilan `[1, S]` dagi **barcha** sonlar hosil bo'ladi (S — ular yig'indisi). Keyingi tanga `c`:

- `c ≤ S + 1` bo'lsa, `[1, S + c]` ning hammasi hosil bo'ladi (eskilari + har biriga `c` qo'shib).
- `c > S + 1` bo'lsa, `S + 1` ni hech qachon hosil qilib bo'lmaydi (keyingi tangalar yanada katta).

```java
Arrays.sort(c);
long reach = 0;
for (long x : c) {
    if (x > reach + 1) break;
    reach += x;
}
System.out.println(reach + 1);
```

## Towers

Kublar ketma-ket keladi. Har kubni **o'zidan katta** kub ustiga qo'yish mumkin yoki yangi minora boshlanadi. Minimal minoralar soni?

Greedy: kubni tepasi kubdan katta bo'lgan minoralar ichidan **tepasi eng kichigiga** qo'yamiz (eng "tor" mos joy) — katta tepalar keyingi katta kublar uchun qoladi.

```java
TreeMap<Integer, Integer> tops = new TreeMap<>();
for (int k : cubes) {
    Integer t = tops.higherKey(k);
    if (t != null) {
        if (tops.merge(t, -1, Integer::sum) == 0) tops.remove(t);
    }
    tops.merge(k, 1, Integer::sum);
}
int towers = 0;
for (int v : tops.values()) towers += v;
```

> [!NOTE] Bu "patience sorting". Minoralar soni = eng uzun **kamaymaydigan** subsequence uzunligi (Dilworth teoremasi). LIS'ning O(n log n) algoritmi ham aynan shu g'oya.

## Konstruktiv masalalar

Codeforces'da "shunday massiv/satr/graf tuzing" turidagi masalalar ko'p uchraydi va ularning aksariyati greedy. Yondashuv:

1. **Kichik holatlarni qo'lda yeching** (n = 1..5) va naqsh izlang.
2. **Eng cheklangan joydan boshlang.** Eng katta element, eng kam variantli pozitsiya, eng kichik deadline — ular birinchi qaror qilinadi.
3. **Invariant topin.** Har qadamdan keyin nima saqlanadi? (yig'indi juftligi, qolgan elementlar soni, ...) Invariant ko'pincha "javob yo'q" holatini ham ko'rsatadi.
4. **Ikki uchdan quring.** Kichik va katta elementlarni navbatma-navbat qo'yish ko'p masalada ishlaydi.

## Juftlik va qoldiqlar

- `1..n` ni yig'indisi teng ikki guruhga bo'lish (CSES Two Sets): `n(n+1)/2` toq bo'lsa — yo'q. Aks holda kattadan boshlab, joriy maqsaddan oshmasa birinchi guruhga qo'shamiz.
- "Massivni bir xil qilish uchun minimal amallar": median (2-dars) yoki o'rtacha qiymat — amal turiga qarab.

```java
long target = (long) n * (n + 1) / 4;
List<Integer> first = new ArrayList<>();
for (int x = n; x >= 1; x--) {
    if (x <= target) {
        first.add(x);
        target -= x;
    }
}
```

=====
---
id: l14
module: m8
week: 11
title: Javob bo'yicha binary search + greedy tekshiruv
mins: 55
viz:
problems: p27 | p28
goals: Monoton predikatni ko'rish | check(x) ni greedy bilan yozish | Java'da long bilan xavfsiz binary search
summary: "Minimal maksimum" va "minimal vaqt" masalalari: javobni taxmin qilib, greedy bilan tekshirish.
---

## G'oya

Ko'p masalada optimal javobni to'g'ridan-to'g'ri topish qiyin, lekin **"javob ≤ x bo'lishi mumkinmi?"** degan savolga greedy bilan oson javob beriladi. Agar bu savol monoton bo'lsa (x mumkin bo'lsa, x+1 ham mumkin) — javob ustida binary search.

Belgilar: "**minimal** vaqt", "maksimumni **minimallashtiring**", "minimumni **maksimallashtiring**".

## Shablon

```java
long lo = 0, hi = (long) 1e18;
while (lo < hi) {
    long mid = lo + (hi - lo) / 2;
    if (check(mid)) hi = mid;
    else lo = mid + 1;
}
System.out.println(lo);
```

`lo + (hi - lo) / 2` — `(lo + hi) / 2` overflow'idan qochish uchun.

## Factory Machines

n ta mashina, i-mashina bitta mahsulotni `k[i]` sekundda yasaydi. t ta mahsulot uchun minimal vaqt?

`check(T)`: T vaqtda jami `Σ T / k[i]` ta mahsulot. Bu `≥ t` mi? Greedy shu yerda: har mashina T davomida to'xtovsiz ishlaydi.

```java
static boolean check(long T) {
    long made = 0;
    for (int x : k) {
        made += T / x;
        if (made >= t) return true;
    }
    return false;
}
```

> [!WARN] `made >= t` bo'lishi bilan to'xtating: aks holda `Σ T / k[i]` 2·10^5 × 10^18 bo'lib `long`dan chiqadi.

`hi` uchun `min(k) · t` yetarli: eng tez mashina yolg'iz o'zi shu vaqtda ulguradi.

## Array Division

Massivni k ta ketma-ket bo'lakka bo'ling, bo'laklar yig'indisining **maksimumi** minimal bo'lsin.

`check(S)`: har bo'lak yig'indisi `≤ S` bo'ladigan qilib necha bo'lak kerak? Greedy: chapdan yuramiz va bo'lakka imkon qadar ko'p element qo'shamiz; sig'masa — yangi bo'lak.

```java
static boolean check(long S) {
    int parts = 1;
    long cur = 0;
    for (int x : a) {
        if (x > S) return false;
        if (cur + x > S) { parts++; cur = 0; }
        cur += x;
    }
    return parts <= k;
}
```

Nega greedy to'g'ri: bo'lakni imkon qadar uzun qilish keyingi bo'laklarga kamroq element qoldiradi — hech qachon yomonlashtirmaydi ("greedy stays ahead").

## Aggressive Cows

Ombor o'rinlari berilgan, c ta sigirni joylashtiring, **eng yaqin ikki sigir orasidagi masofa** maksimal bo'lsin. `check(D)`: saralangan o'rinlarda chapdan boshlab, oldingi sigirdan ≥ D bo'lgan birinchi joyga qo'yamiz. c ta sig'sa — D mumkin. Bu safar "maksimal mumkin" qidiriladi:

```java
long lo = 0, hi = pos[n - 1] - pos[0];
while (lo < hi) {
    long mid = lo + (hi - lo + 1) / 2;
    if (check(mid)) lo = mid;
    else hi = mid - 1;
}
```

`+ 1` — aks holda `lo = mid` cheksiz siklga tushadi.

=====
---
id: l15
module: m9
week: 11
title: Matroid, greedy chegaralari va musobaqa strategiyasi
mins: 50
viz:
problems:
goals: Greedy qachon kafolatlangan to'g'ri ekanini (matroid) bilish | Greedy ishlamaydigan klassik masalalarni tanish | Musobaqada greedy'ni tez tekshirish tartibi
summary: Matroid nazariyasi qisqacha, greedy + DP gibridlari va musobaqa uchun cheklist.
---

## Matroid: greedy'ning nazariy asosi

Elementlar to'plami va "mustaqil" deb ataladigan qism-to'plamlar oilasi **matroid** bo'ladi, agar:

1. Mustaqil to'plamning har qism-to'plami ham mustaqil (merosiylik).
2. `A`, `B` mustaqil va `|A| < |B|` bo'lsa, `B` da shunday `x` borki, `A + x` ham mustaqil (almashtirish xossasi).

**Teorema:** matroidda "og'irlik bo'yicha kamayish tartibida olamiz, mustaqillik buzilmasa" greedy'si maksimal og'irlikli mustaqil to'plamni beradi.

| Matroid | Mustaqil to'plam | Greedy |
|---|---|---|
| Graf (graphic) | siklsiz qirralar | Kruskal |
| Uniform | ko'pi bilan k ta element | eng katta k tasini olish |
| Scheduling | deadline'larga sig'adigan birlik ishlar | 5-darsdagi deadline + foyda |
| Chiziqli (linear) | chiziqli erkli vektorlar | XOR basis |

> [!NOTE] Agar masaladagi "ruxsat etilgan to'plamlar" matroid bo'lsa — greedy isbotsiz ishlaydi. Agar almashtirish xossasi buzilsa (masalan, 0/1 knapsack) — greedy ishonchsiz.

## Greedy ishlamaydigan klassikalar

| Masala | Tabiiy greedy | Nega xato | Nima kerak |
|---|---|---|---|
| 0/1 knapsack | qiymat/og'irlik nisbati | bo'lib bo'lmaydi | DP |
| Coin change (ixtiyoriy tangalar) | eng katta tanga | {1, 3, 4}, 6 | DP |
| Eng uzun yo'l | eng og'ir qirra | kelajak hisobga olinmaydi | DAG DP |
| TSP | eng yaqin shahar | oxirida qimmat qaytish | bitmask DP |
| Slimes (qo'shnilar) | eng kichik juftlik | faqat qo'shnilar | interval DP |
| Weighted interval scheduling | eng erta tugash | og'irliklar | saralash + DP + binary search |

## Greedy + DP gibridi

Ko'p qiyin masalada **exchange argument tartibni beradi, DP esa tanlovni**:

1. Exchange argument bilan elementlarni qaysi tartibda ko'rib chiqish kerakligini aniqlang (masalan, deadline bo'yicha).
2. Shu tartibda knapsack yoki boshqa DP qiling.

Misol: davomiylik, deadline va foydali ishlar — deadline bo'yicha saralab, `dp[vaqt]` knapsack. Yana bir misol: qutilarni ustma-ust qo'yish — `kuch + og'irlik` bo'yicha saralab, DP.

## Musobaqa cheklisti

1. **Greedy qoidani bir gap bilan yozing.** "Eng erta tugaydiganini olaman."
2. **3 ta qarshi misol izlang:** teng qiymatlar, bitta juda katta element, ikki variant teng ko'rinadigan holat.
3. **Qo'shni juftlik testi:** ikki elementni almashtirsam yaxshilanadimi? Comparator shu yerdan.
4. **Shubha bo'lsa — stress test.** Brute force 15 qatordan oshmaydi, 2 daqiqada yoziladi.
5. **Java tekshiruvi:**
   - comparator'da ayirma yo'q (`Integer.compare`);
   - `Arrays.sort(int[])` dan oldin shuffle (Codeforces hack);
   - yig'indilar `long`;
   - `TreeMap` metodlari `null` qaytarishi mumkin;
   - teng elementlar (ties) tartibi javobga ta'sir qiladimi?

## Keyingi qadamlar

- **CSES → Sorting and Searching** bo'limi: deyarli hammasi greedy, ikki ko'rsatkich va multiset.
- **Codeforces**: `greedy` tegi, 1200 → 1900 bosqichma-bosqich; `constructive algorithms` tegi bilan birga.
- **AtCoder ABC** C–D masalalari — qisqa va toza greedy mashqlari.
