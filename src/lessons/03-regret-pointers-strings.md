---
id: l07
module: m3
week: 6
title: Regret greedy — tanlovni keyinroq tuzatish
mins: 60
viz:
problems: p14 | p15
goals: Variantlarni heap'da "zaxirada" saqlash g'oyasi | Minimal yoqilg'i quyish masalasi | Buy Low Sell High'dagi ikki marta qo'shish hiylasi
summary: Avval olib qo'yamiz, keyin afsuslansak — eng arzon variantni bekor qilamiz.
---

## G'oya

Oddiy greedy tanlovga qaytmaydi. **Regret greedy** esa qaror qabul qilishni kechiktiradi: o'tib ketgan imkoniyatlarni heap'da saqlaydi va kerak bo'lganda "o'tmishda aslida shuni tanlagan edim" deb ulardan foydalanadi. Yoki aksincha — avval olgan narsasini eng kam zarar bilan bekor qiladi.

Moore–Hodgson (5-dars) shunday edi: ishni qabul qilamiz, sig'masa — eng uzunini bekor qilamiz.

## Minimal yoqilg'i quyish

Mashina 0 nuqtadan `target` ga boradi, boshlang'ich yoqilg'i `start`, 1 birlik masofa = 1 litr. Yo'lda stansiyalar `(pos, fuel)`. Minimal nechta to'xtash kerak?

Qaror "shu stansiyada to'xtaymanmi?" ni darhol qilish qiyin. Regret usuli:

1. Yo'lda yuramiz. O'tgan har stansiyaning yoqilg'isini **max-heap**'ga solamiz ("to'xtashim mumkin edi").
2. Keyingi nuqtaga yetib bo'lmasa — heap'dan **eng katta** yoqilg'ini olamiz: "o'sha stansiyada to'xtagan edim" deb hisoblaymiz.

```java
PriorityQueue<Integer> pq = new PriorityQueue<>(Collections.reverseOrder());
long reach = start;
int stops = 0, i = 0;
while (reach < target) {
    while (i < n && st[i][0] <= reach) pq.add(st[i++][1]);
    if (pq.isEmpty()) { stops = -1; break; }
    reach += pq.poll();
    stops++;
}
```

Nega eng kattasi? Har to'xtash bitta "narx" turadi, shuning uchun har to'xtashda imkon qadar ko'p yoqilg'i olish — eng uzoqqa yetkazadi (exchange argument).

## Buy Low Sell High

Har kuni aksiya narxi `p[i]`. Har kuni bitta aksiya sotib olish, bitta sotish yoki hech narsa qilmaslik mumkin. Oxirida qo'lda aksiya qolmasin. Maksimal foyda?

Hiyla: min-heap'da "sotib olish imkoniyatlari". Har kun `p`:

- heap boshi `x < p` bo'lsa — `x` da olib, `p` da sotamiz: `ans += p - x`, `x` ni chiqaramiz va **`p` ni ikki marta** qo'shamiz.
- aks holda `p` ni bir marta qo'shamiz.

```java
PriorityQueue<Long> pq = new PriorityQueue<>();
long ans = 0;
for (long p : price) {
    if (!pq.isEmpty() && pq.peek() < p) {
        ans += p - pq.poll();
        pq.add(p);
    }
    pq.add(p);
}
```

Nega ikki marta? Bitta nusxa — "bugun sotdim, lekin afsuslansam, keyinroq qimmatroq narxda sotaman" variantini saqlaydi: keyin `q > p` kelsa, `q - p` qo'shiladi va jami `(p - x) + (q - p) = q - x` — xuddi `x` da olib, `q` da sotgandek. Ikkinchi nusxa — "bugun sotib olish" imkoniyati.

> [!TIP] Regret greedy belgisi: tanlov keyinroq ma'lum bo'ladigan ma'lumotga bog'liq, lekin har bekor qilish "lokal" va narxi aniq hisoblanadi.

## Qayerda uchraydi

| Masala | Heap'da | Bekor qilish |
|---|---|---|
| Course Schedule III | davomiyliklar (max) | eng uzun ishni |
| Minimum Refueling Stops | yoqilg'ilar (max) | — (kechiktirilgan tanlov) |
| Buy Low Sell High | narxlar (min) | avvalgi sotuvni |
| CSES Tasks with K changes, "Scheduling with profits" | foydalar (min) | eng kam foydalisini |

=====
---
id: l08
module: m4
week: 7
title: Ikki ko'rsatkich va multiset
mins: 55
viz:
problems: p16 | p17 | p18
goals: Saralangan ikki uchni juftlash greedy'sini isbotlash | Java'da TreeMap'ni multiset sifatida ishlatish | floorKey / higherKey bilan "eng mos" elementni olish
summary: Ferris Wheel, Apartments, Concert Tickets — juftlash va "eng mos qolganini olish".
---

## Eng og'irini eng yengili bilan

**Ferris Wheel**: har kabinaga ko'pi bilan 2 bola, umumiy og'irlik ≤ x. Minimal kabinalar?

Greedy: saralab, eng og'ir bolani olamiz. Uni **eng yengil** bola bilan juftlash mumkin bo'lsa — juftlaymiz, aks holda yolg'iz o'tqazamiz.

```java
Arrays.sort(w);
int i = 0, j = n - 1, gond = 0;
while (i <= j) {
    if (i < j && w[i] + w[j] <= x) i++;
    j--;
    gond++;
}
```

Isbot (exchange): eng og'ir bola `H` hech kim bilan sig'masa, u baribir yolg'iz o'tiradi. Sig'sa, optimal yechimni olamiz. Agar unda `H` yolg'iz bo'lsa, `L` ni (eng yengilni) uning yoniga ko'chiramiz — kabinalar soni oshmaydi. Agar `H` ning sherigi `y`, `L` ning sherigi esa `z` bo'lsa, `y` va `L` ni almashtiramiz: `H + L ≤ x` (tekshirdik), `y + z ≤ y + H ≤ x` (chunki `z ≤ H`). Natija yomonlashmadi, endi u greedy bilan bir xil boshlanadi.

## Ikki ro'yxatni juftlash

**Apartments**: n ta xaridor (kerakli o'lcham `a`), m ta kvartira (`b`). `|a - b| ≤ k` bo'lsa mos. Maksimal juftliklar?

Ikkalasini saralab, ikki ko'rsatkich: eng kichik xaridor va eng kichik kvartira.

```java
Arrays.sort(a);
Arrays.sort(b);
int i = 0, j = 0, cnt = 0;
while (i < n && j < m) {
    if (Math.abs(a[i] - b[j]) <= k) { cnt++; i++; j++; }
    else if (b[j] < a[i] - k) j++;
    else i++;
}
```

Kvartira juda kichik bo'lsa — u hech kimga yaramaydi (keyingilar yanada katta xohlaydi). Xaridor juda kichik xohlasa — unga hech qaysi qolgan kvartira yaramaydi.

## Java'da multiset

C++ `multiset` ning Java'dagi o'rnini `TreeMap<Integer, Integer>` (qiymat → soni) bosadi:

```java
static TreeMap<Integer, Integer> ms = new TreeMap<>();

static void add(int x) { ms.merge(x, 1, Integer::sum); }

static void remove(int x) {
    int c = ms.get(x);
    if (c == 1) ms.remove(x);
    else ms.put(x, c - 1);
}
```

| Kerak | Metod |
|---|---|
| ≤ x eng kattasi | `floorKey(x)` |
| < x eng kattasi | `lowerKey(x)` |
| ≥ x eng kichigi | `ceilingKey(x)` |
| > x eng kichigi | `higherKey(x)` |
| Eng kichik / katta | `firstKey()` / `lastKey()` |

Topilmasa `null` qaytadi — `Integer` bilan tekshiring, `int`ga avtomatik o'tkazsangiz NullPointerException.

## Concert Tickets

Chiptalar narxlari ro'yxati. Har xaridor `t` dan oshmaydigan **eng qimmat** chiptani oladi (yo'q bo'lsa -1). Bu greedy masalaning shartida berilgan, bizdan faqat tez bajarish talab qilinadi: `floorKey(t)` + o'chirish, har biri O(log n).

```java
StringBuilder out = new StringBuilder();
for (int q : t) {
    Integer p = ms.floorKey(q);
    if (p == null) out.append(-1).append('\n');
    else { out.append(p).append('\n'); remove(p); }
}
System.out.print(out);
```

> [!TIP] "Eng mos qolgan elementni olib, uni o'chirish" — greedy'ning juda tez-tez uchraydigan shakli. Har safar TreeMap haqida o'ylang.

=====
---
id: l09
module: m4
week: 7
title: Sakrash, yetib borish va aylana
mins: 45
viz: jump
problems: p19 | p20
goals: "Eng uzoq yetish" invariantini yuritish | Jump Game II'ni BFS qatlamlari sifatida ko'rish | Gas Station isbotini tushunish
summary: Jump Game I/II, Gas Station va qamrov masalalari — bitta o'tishda.
---

## Jump Game: yetib bora olamanmi?

`a[i]` — i dan ko'pi bilan nechta qadam sakrash mumkin. 0 dan oxirgisiga yetish mumkinmi? Faqat bitta son kerak: **hozirgacha yetish mumkin bo'lgan eng uzoq indeks.**

```java
int far = 0;
for (int i = 0; i < n && i <= far; i++) far = Math.max(far, i + a[i]);
boolean ok = far >= n - 1;
```

## Jump Game II: minimal sakrashlar

Bu aslida BFS: 0-qatlam — `[0, 0]`, 1-qatlam — bitta sakrashda yetiladigan indekslar, va h.k. Qatlamlar **ketma-ket oraliqlar** bo'lgani uchun navbat kerak emas:

```java
int jumps = 0, curEnd = 0, far = 0;
for (int i = 0; i < n - 1; i++) {
    far = Math.max(far, i + a[i]);
    if (i == curEnd) {
        jumps++;
        curEnd = far;
    }
}
```

`curEnd` — joriy qatlam oxiri. Unga yetganda sakrash majburiy, va keyingi qatlam `far` gacha boradi. Bu intervallarni qamrash (3-dars) bilan bir xil g'oya.

## Gas Station

Aylana yo'lda n ta stansiya: i-da `gas[i]` litr olasiz, i → i+1 ga `cost[i]` litr ketadi. Qaysi stansiyadan boshlasangiz to'liq aylana olasiz?

Ikki fakt:

1. `Σgas < Σcost` bo'lsa — javob yo'q.
2. Aks holda javob bor, va uni bitta o'tishda topamiz: boshlanish nuqtasidan yuramiz; bak manfiy bo'lib qolsa, boshlanishni **keyingi stansiyaga** ko'chiramiz.

```java
long total = 0, tank = 0;
int start = 0;
for (int i = 0; i < n; i++) {
    long d = gas[i] - cost[i];
    total += d;
    tank += d;
    if (tank < 0) { start = i + 1; tank = 0; }
}
System.out.println(total < 0 ? -1 : start);
```

Nega oraliqdagi stansiyalarni tekshirmaymiz? `s` dan boshlab `i` da yiqildik. `s` va `i` orasidagi har `j` ga `s` dan yetganda bakda `≥ 0` bor edi; `j` dan boshlash esa bakni `0` dan boshlash demak — yanada yomon. Demak ularning hech biri ham `i` dan o'tolmaydi.

> [!NOTE] Gas Station "maksimal prefiks yig'indi" g'oyasiga yaqin: boshlanish — prefiks yig'indi eng past bo'lgan nuqtadan keyingisi.

## Qamrov masalalari bir xil

| Masala | Qatlamlar |
|---|---|
| Jump Game II | `[i, i + a[i]]` |
| Video Stitching | kliplar `[s, e]` |
| Minimum Taps to Water a Garden | `[i - r, i + r]` |

Hammasini "boshlanish ≤ hozirgi qamrov bo'lganlar ichidan eng uzoqqa yetadiganini ol" bilan yechiladi.

=====
---
id: l10
module: m5
week: 8
title: Satr greedy va monoton stek
mins: 55
viz: stack
problems: p21 | p22
goals: Leksikografik tartibda "eng chapdagi pozitsiya hal qiladi" tamoyili | Monoton stek bilan raqam/harf olib tashlash | Oxirgi uchrash indeksidan foydalanish
summary: Remove K Digits, eng kichik distinct subsequence va "chapdagi belgi muhimroq" qoidasi.
---

## Leksikografik greedy tamoyili

Ikki satr (yoki bir xil uzunlikdagi son) solishtirilganda **birinchi farqli pozitsiya** hal qiladi. Shuning uchun: chapdagi pozitsiyani imkon qadar yaxshilang, keyin qolganlari haqida o'ylang. Bu deyarli barcha "eng kichik/katta satr tuzing" masalalarining kaliti.

## Remove K Digits

Sondan aynan k ta raqamni o'chirib, eng kichik sonni hosil qiling.

`1432219`, k = 3 → `1219`. Qoida: chapdan yuramiz; agar joriy raqam stek tepasidagidan **kichik** bo'lsa va hali o'chirish huquqi bo'lsa — tepadagini o'chiramiz (chapdagi pozitsiya kichrayadi).

```java
StringBuilder st = new StringBuilder();
for (char c : num.toCharArray()) {
    while (k > 0 && st.length() > 0 && st.charAt(st.length() - 1) > c) {
        st.deleteCharAt(st.length() - 1);
        k--;
    }
    st.append(c);
}
st.setLength(st.length() - k);
int i = 0;
while (i < st.length() - 1 && st.charAt(i) == '0') i++;
String res = st.substring(i);
System.out.println(res.isEmpty() ? "0" : res);
```

Stek doim **kamaymaydigan** (non-decreasing) ketma-ketlik bo'lib qoladi. Oxirida k qolsa — eng katta raqamlar oxirda, shuning uchun oxiridan kesamiz.

## Smallest Subsequence of Distinct Characters

Har belgi aynan bir marta qatnashadigan, leksikografik eng kichik subsequence. `cbacdcbc` → `acdb`.

Remove K Digits'ga o'xshash, lekin tepadagi belgini faqat **u keyinroq yana uchrasa** olib tashlash mumkin:

```java
int[] last = new int[26];
for (int i = 0; i < s.length(); i++) last[s.charAt(i) - 'a'] = i;
boolean[] in = new boolean[26];
StringBuilder st = new StringBuilder();
for (int i = 0; i < s.length(); i++) {
    char c = s.charAt(i);
    if (in[c - 'a']) continue;
    while (st.length() > 0) {
        char top = st.charAt(st.length() - 1);
        if (top > c && last[top - 'a'] > i) {
            st.deleteCharAt(st.length() - 1);
            in[top - 'a'] = false;
        } else break;
    }
    st.append(c);
    in[c - 'a'] = true;
}
```

## Bitta almashtirish bilan eng katta son

LeetCode 670: ikki raqamni bir marta almashtirib eng katta son. Chapdan birinchi pozitsiya `i` ni topamiz, undan o'ngda kattaroq raqam bor; o'sha raqamlardan eng kattasining **eng oxirgi** uchrashini olib almashtiramiz (oxirgisi — kichik raqamni imkon qadar o'ngga yuborish uchun).

```java
char[] d = String.valueOf(x).toCharArray();
int[] last = new int[10];
for (int i = 0; i < d.length; i++) last[d[i] - '0'] = i;
outer:
for (int i = 0; i < d.length; i++) {
    for (int dg = 9; dg > d[i] - '0'; dg--) {
        if (last[dg] > i) {
            char t = d[i]; d[i] = d[last[dg]]; d[last[dg]] = t;
            break outer;
        }
    }
}
```

> [!TIP] Java'da satrni stek sifatida yuritish uchun `StringBuilder` (`append`, `deleteCharAt(len-1)`, `charAt(len-1)`) — tez va qulay. `String +=` tsiklda O(n²).

## Monoton stek oilasi

| Masala | Stek monotonligi |
|---|---|
| Remove K Digits | o'suvchi |
| Remove Duplicate Letters | o'suvchi + "keyin bormi" sharti |
| Next Greater Element | kamayuvchi |
| Largest Rectangle in Histogram | o'suvchi |
| Create Maximum Number | kamayuvchi (k ta element tanlash) |
