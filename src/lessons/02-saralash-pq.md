---
id: l04
module: m1
week: 3
title: Saralash va comparator
mins: 55
viz: frac
problems: p07 | p08 | p09
goals: Qo'shni juftlik usuli bilan saralash kalitini chiqarish | Java'da xavfsiz comparator yozish | Nisbat bo'yicha saralashni kasrsiz bajarish
summary: Greedy'ning yuragi — to'g'ri tartib. Comparator tuzoqlari, nisbatlar, birlashtirilgan satrlar.
---

## Kalitni qanday topish

Ko'p greedy masalalar "elementlarni qandaydir tartibda olish" ga keladi. Kalitni topish usuli (2-darsdan): **ikki qo'shni element a va b ni almashtirsak nima o'zgaradi?** Faqat shu ikkitasining hissasi o'zgaradi — shundan comparator kelib chiqadi.

**Tasks and Deadlines** (CSES). Har ish: davomiylik `a`, deadline `d`. Mukofot `d - f` (f — tugash vaqti, manfiy ham bo'ladi). Umumiy mukofot `Σd - Σf`. `Σd` tartibga bog'liq emas, demak `Σf` ni minimallashtirish kerak → **qisqasini birinchi**.

```java
Arrays.sort(task, (x, y) -> Integer.compare(x[0], y[0]));
long time = 0, reward = 0;
for (int[] t : task) {
    time += t[0];
    reward += t[1] - time;
}
```

Deadline umuman tartibga ta'sir qilmaydi — bu masalaning "hiylasi".

## Java comparator qoidalari

```java
Arrays.sort(a, (x, y) -> Integer.compare(x[1], y[1]));
Arrays.sort(a, Comparator.comparingInt((int[] x) -> x[1]).thenComparingInt(x -> x[0]));
list.sort((x, y) -> Long.compare(y.value, x.value));
```

- **Ayirma ishlatmang:** `x[1] - y[1]` overflow beradi.
- **Comparator tranzitiv bo'lishi shart.** Aks holda Java `IllegalArgumentException: Comparison method violates its general contract!` tashlaydi — bu ko'pincha haqiqiy mantiqiy xato belgisi.
- **`Arrays.sort(int[])` va hack.** Primitiv massivlarda dual-pivot quicksort ishlatiladi, Codeforces'da maxsus test bilan O(n²) ga tushirish mumkin. Yechim: saralashdan oldin aralashtiring yoki `Integer[]`/`long[]` ni `ArrayList` orqali saralang (u merge sort).

```java
static void safeSort(int[] a) {
    Random r = new Random();
    for (int i = a.length - 1; i > 0; i--) {
        int j = r.nextInt(i + 1);
        int t = a[i]; a[i] = a[j]; a[j] = t;
    }
    Arrays.sort(a);
}
```

## Satrlarni birlashtirish: Largest Number

Sonlardan eng katta birlashma tuzing: `[3, 30, 34, 5, 9]` → `9534330`. Oddiy satr saralash xato (`30` > `3` deb qaraladi). Qo'shni juftlik usuli: `a` ni `b` dan oldin qo'yish yaxshi, agar `a + b > b + a` (satr sifatida).

```java
String[] s = new String[n];
for (int i = 0; i < n; i++) s[i] = String.valueOf(a[i]);
Arrays.sort(s, (x, y) -> (y + x).compareTo(x + y));
if (s[0].equals("0")) System.out.println("0");
else System.out.println(String.join("", s));
```

> [!NOTE] Bu comparator tranzitiv ekanini isbotlash mumkin (`a + b` ni sonlar orqali yozib), shuning uchun saralash to'g'ri ishlaydi.

## Nisbat bo'yicha: fractional knapsack

Buyumlarni **bo'lib olish mumkin** bo'lsa (un, guruch), greedy optimal: qiymat/og'irlik nisbati eng kattasidan boshlab olamiz, oxirgisini qisman.

Kasrlarsiz solishtirish: `v1/w1 > v2/w2` ⇔ `v1·w2 > v2·w1` (`long`da).

```java
Arrays.sort(it, (x, y) -> Long.compare((long) y[1] * x[0], (long) x[1] * y[0]));
double total = 0;
long cap = W;
for (int[] b : it) {
    if (cap == 0) break;
    long take = Math.min(cap, b[0]);
    total += (double) b[1] * take / b[0];
    cap -= take;
}
```

> [!WARN] 0/1 knapsack'da (bo'lib bo'lmaydi) bu greedy **ishlamaydi**: W = 50, buyumlar (10, 60), (20, 100), (30, 120). Nisbat bo'yicha 10 + 20 = 160, optimal 20 + 30 = 220.

## Smith qoidasi

Har ishning davomiyligi `t` va og'irligi `w`. `Σ w·f` ni minimallashtirish. Qo'shni juftlik: `a` oldin yaxshi, agar `t[a]·w[b] < t[b]·w[a]`, ya'ni `t/w` nisbati kichigi oldin. SPT — bu `w = 1` dagi xususiy holat.

=====
---
id: l05
module: m2
week: 4
title: Deadline'li rejalashtirish
mins: 60
viz:
problems: p10 | p11
goals: EDD qoidasini va uning isbotini bilish | Moore–Hodgson: eng ko'p ishni o'z vaqtida bajarish | Deadline + foyda masalasini heap bilan yechish
summary: Kechikishni minimallashtirish, eng ko'p ishni ulgurish va foydali ishlarni tanlash.
---

## Maksimal kechikishni minimallashtirish

Har ish: davomiylik `t`, deadline `d`. Kechikish `max(0, f - d)`. **Eng katta** kechikishni minimallashtiring.

Greedy: **Earliest Deadline First (EDD)** — deadline bo'yicha saralang. Davomiylik ahamiyatsiz!

Isbot (exchange): qo'shni `a`, `b` da `d[a] > d[b]` bo'lsa, ularni almashtiramiz. `b` erta tugaydi — uning kechikishi kamayadi. `a` endi juftlikning ikkinchisi bo'lib, avval `b` tugagan vaqtda tugaydi, lekin `d[a] > d[b]` bo'lgani uchun uning kechikishi avval `b` niki bo'lgan qiymatdan katta emas. Maksimum oshmadi.

## Eng ko'p ishni o'z vaqtida bajarish

Endi maqsad boshqa: deadline'gacha tugaydigan ishlar **soni** maksimal bo'lsin (kechikkanlar umuman bajarilmaydi). Bu LeetCode **Course Schedule III**.

**Moore–Hodgson algoritmi:**
1. Deadline bo'yicha saralang.
2. Ishlarni birma-bir "qabul qiling", umumiy vaqtni yuriting.
3. Agar umumiy vaqt joriy deadline'dan oshsa — qabul qilinganlar ichidan **eng uzunini** chiqarib tashlang.

```java
Arrays.sort(c, (x, y) -> Integer.compare(x[1], y[1]));
PriorityQueue<Integer> taken = new PriorityQueue<>(Collections.reverseOrder());
long time = 0;
for (int[] it : c) {
    taken.add(it[0]);
    time += it[0];
    if (time > it[1]) time -= taken.poll();
}
System.out.println(taken.size());
```

Nega eng uzunini? Hozirgacha qabul qilinganlar soni bir xil qoladi (bitta qo'shdik, bitta chiqardik), lekin umumiy vaqt **imkon qadar ko'p** qisqaradi — keyingi ishlar uchun eng ko'p joy qoladi. Bu "regret" (afsus) greedy'ning birinchi namunasi — 7-darsda batafsil.

## Deadline + foyda (bir birlik vaqtli ishlar)

Har ish 1 birlik vaqt oladi, deadline `d` va foyda `p` bor. Maksimal foyda?

**1-usul (klassik):** foyda bo'yicha kamayish tartibida saralab, har ishni **deadline'gacha bo'lgan eng kech bo'sh slotga** qo'yamiz. Bo'sh slotni DSU bilan O(α) da topish mumkin.

**2-usul (heap, sodda):** deadline bo'yicha o'sish tartibida yuramiz va qabul qilingan foydalarni min-heap'da saqlaymiz. Heap o'lchami deadline'dan oshsa — eng kam foydalisini chiqaramiz.

```java
Arrays.sort(job, (x, y) -> Integer.compare(x[0], y[0]));
PriorityQueue<Integer> pq = new PriorityQueue<>();
long sum = 0;
for (int[] j : job) {
    pq.add(j[1]);
    sum += j[1];
    if (pq.size() > j[0]) sum -= pq.poll();
}
System.out.println(pq.size() + " " + sum);
```

Invariant: heap'dagi ishlarni deadline'lariga sig'dirib joylashtirish mumkin, va ular — shu nuqtagacha mumkin bo'lgan eng foydali to'plam.

## Qaysi qoida qaysi maqsad uchun

| Maqsad | Qoida |
|---|---|
| Σ tugash vaqti min | SPT: qisqasi oldin |
| Σ og'irlikli tugash min | Smith: `t / w` kichigi oldin |
| Maksimal kechikish min | EDD: deadline bo'yicha |
| O'z vaqtidagi ishlar soni max | Moore–Hodgson: EDD + eng uzunini chiqarish |
| Birlik ishlar, foyda max | Deadline bo'yicha + min-heap |

> [!WARN] Ishlar uzunligi har xil **va** foyda ham bor bo'lsa ("davomiylik + deadline + foyda") — greedy yetmaydi. Deadline bo'yicha saralab, keyin knapsack DP qilinadi.

=====
---
id: l06
module: m3
week: 5
title: PriorityQueue bilan greedy
mins: 55
viz: huffman
problems: p12 | p13
goals: Java PriorityQueue'ni min va max rejimida ishlatish | Huffman / ropes birlashtirish va uning isbotini bilish | Ikki to'plamli greedy (IPO) yozish
summary: "Hozirgi eng yaxshi" o'zgarib tursa — heap. Huffman, IPO va lazy deletion.
---

## Qachon heap kerak?

Saralash bir marta tartib beradi. Lekin ko'p masalalarda **tanlovdan keyin yangi element paydo bo'ladi** yoki nomzodlar to'plami o'zgaradi. Har qadamda "hozir eng yaxshisi" kerak bo'lsa — `PriorityQueue`.

```java
PriorityQueue<Integer> minH = new PriorityQueue<>();
PriorityQueue<Integer> maxH = new PriorityQueue<>(Collections.reverseOrder());
PriorityQueue<long[]> byFirst = new PriorityQueue<>((x, y) -> Long.compare(x[0], y[0]));
```

| Amal | Metod | Narx |
|---|---|---|
| Qo'shish | `add` / `offer` | O(log n) |
| Eng kichigini ko'rish | `peek` | O(1) |
| Eng kichigini olish | `poll` | O(log n) |
| Ixtiyoriy elementni o'chirish | `remove(obj)` | **O(n)** — qoching |

> [!TIP] Boxing'dan (`Integer`) qochish uchun bir nechta qiymatni bitta `long`ga kodlash mumkin: `(long) value << 20 | index`. Heap tezroq ishlaydi.

## Huffman: arqonlarni birlashtirish

n ta arqon. Ikki arqonni ulash narxi — ularning uzunliklari yig'indisi. Hammasini bittaga ulashning minimal narxi?

Greedy: **har doim ikki eng qisqasini ulang.**

```java
PriorityQueue<Long> pq = new PriorityQueue<>();
for (long x : a) pq.add(x);
long cost = 0;
while (pq.size() > 1) {
    long s = pq.poll() + pq.poll();
    cost += s;
    pq.add(s);
}
```

Nega to'g'ri: ulanishlar ikkilik daraxt hosil qiladi va har arqon uzunligi **daraxtdagi chuqurligicha** marta qo'shiladi. Eng chuqur ikki barg — aka-uka; ularni eng kichik ikki son bilan almashtirish narxni oshirmaydi (exchange). Bu Huffman kodlash bilan aynan bir xil — bitlar soni = chuqurlik × chastota.

> [!NOTE] Slimes (Katak, interval DP) dan farqi: u yerda faqat **qo'shni** bo'laklar birlashadi, shuning uchun greedy emas, DP kerak. Bu yerda istalgan ikkitasi — greedy ishlaydi.

## IPO: ikki to'plamli greedy

Kapitalingiz `w`. Har loyiha: talab qilinadigan kapital `c`, foyda `p`. Ko'pi bilan k ta loyiha. Har bajarilgan loyiha foydasi kapitalga qo'shiladi.

Greedy: har qadamda **hozir qurbingiz yetadigan** loyihalar ichidan eng foydalisini oling.

1. Loyihalarni `c` bo'yicha saralang.
2. Ko'rsatkich bilan `c ≤ w` bo'lganlarning foydasini max-heap'ga soling.
3. Heap'dan eng kattasini olib, `w` ga qo'shing. k marta takrorlang.

```java
Integer[] idx = new Integer[n];
for (int i = 0; i < n; i++) idx[i] = i;
Arrays.sort(idx, (x, y) -> Integer.compare(cap[x], cap[y]));
PriorityQueue<Integer> pq = new PriorityQueue<>(Collections.reverseOrder());
int ptr = 0;
for (int step = 0; step < k; step++) {
    while (ptr < n && cap[idx[ptr]] <= w) pq.add(profit[idx[ptr++]]);
    if (pq.isEmpty()) break;
    w += pq.poll();
}
```

Har loyiha heap'ga bir marta kiradi: O(n log n).

## Lazy deletion

Heap'dan ixtiyoriy elementni o'chirish qimmat. O'rniga "o'chirildi" belgisini qo'yamiz va element tepaga chiqqanda tashlab yuboramiz:

```java
while (!pq.isEmpty() && removed[pq.peek()[1]]) pq.poll();
```

Dijkstra'dagi `if (d > dist[v]) continue;` ham aynan shu g'oya.

## Klassik PQ greedy'lar

| Masala | Heap'da nima |
|---|---|
| Huffman / ropes | uzunliklar (min) |
| Minimal xonalar | tugash vaqtlari (min) |
| IPO | foydalar (max) |
| Moore–Hodgson | davomiyliklar (max) |
| K ta saralangan ro'yxatni birlashtirish | har ro'yxat boshi (min) |
| Reorganize String | belgi chastotalari (max) |
