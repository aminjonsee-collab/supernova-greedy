---
id: l01
module: m0
week: 1
title: Greedy nima va qachon ishlaydi
mins: 40
viz: coins
problems: p01 | p02
goals: Greedy tanlov va optimal substructure'ni tushunish | Greedy ishlamaydigan holatni qarshi misol bilan ko'rsatish | Greedy'ni DP'dan farqlash
summary: Har qadamda hozirgi eng yaxshi tanlov, unga qaytmaslik — va bu qachon xato bo'lishi.
---

## Ta'rif

**Greedy (ochko'z) algoritm** — har qadamda **hozir eng yaxshi ko'rinadigan** tanlovni qiladi va unga hech qachon qaytmaydi. Kelajakni o'ylamaydi, variantlarni sanamaydi, faqat bitta yo'l bilan ketadi.

Shuning uchun greedy odatda juda tez (ko'pincha `O(n log n)` — saralash narxi) va qisqa yoziladi. Muammo bitta: **har doim ham to'g'ri emas**.

Greedy to'g'ri ishlashi uchun masalada ikki xususiyat bo'lishi kerak:

- **Greedy choice property** — mahalliy (lokal) eng yaxshi tanlovni o'z ichiga olgan optimal yechim mavjud.
- **Optimal substructure** — tanlov qilingandan keyin qolgan masala ham xuddi shunday optimal yechiladi.

> [!NOTE] DP ham optimal substructure'dan foydalanadi, lekin har qadamda **barcha** tanlovlarni ko'rib chiqadi. Greedy esa bittasini tanlaydi va qolganini tashlaydi.

## Ishlaydigan misol: so'm bilan qaytim

Qaytim berishda eng katta mos kupyuradan boshlaymiz: 1000, 2000, 5000, 10 000, 20 000, 50 000, 100 000, 200 000. 37 000 so'm → 20 000 + 10 000 + 5 000 + 2 000 — 4 ta kupyura, bu minimal.

Bunday tizimlar **canonical** deyiladi: ularda greedy doim optimal. Real valyutalar ataylab shunday tuzilgan.

```java
static int greedyCoins(int[] coins, int x) {
    Arrays.sort(coins);
    int cnt = 0;
    for (int i = coins.length - 1; i >= 0; i--) {
        cnt += x / coins[i];
        x %= coins[i];
    }
    return x == 0 ? cnt : -1;
}
```

## Ishlamaydigan misol

Tangalar `{1, 3, 4}`, summa 6:

- Greedy: 4 + 1 + 1 → **3 ta** tanga
- Optimal: 3 + 3 → **2 ta** tanga

Greedy 4 ni oldi — "hozir eng yaxshi" — va bu tanlov keyingi qadamlarni yomonlashtirdi. Bunday masala uchun DP kerak (coin change).

> [!WARN] Greedy yechim 5 daqiqada yoziladi va namunaviy testlardan o'tadi, lekin yashirin testda yiqiladi. Doim **qarshi misol** izlang.

## Greedy qanday topiladi

1. **Qoidani taklif qiling.** "Eng kichigini olaman", "eng erta tugaydiganini olaman", "eng katta nisbatlisini olaman"…
2. **Buzib ko'ring.** 3–5 elementli kichik misollar o'ylang, ayniqsa chegaraviy: teng qiymatlar, bitta element, juda katta bitta element.
3. **Isbotlang yoki sinang.** Keyingi darsdagi exchange argument bilan, yoki brute force bilan stress test.

Bir masalaga odatda bir nechta "tabiiy" greedy qoidasi bor, va ulardan faqat bittasi to'g'ri bo'ladi. Masalan, intervallarni tanlashda "eng qisqasini olish" ham, "eng erta boshlanadiganini olish" ham xato — faqat "eng erta tugaydiganini olish" to'g'ri (3-dars).

## Greedy shakllari

| Shakl | Qachon | Misol |
|---|---|---|
| Saralash + bir o'tish | Tartib hamma narsani hal qilsa | Intervallar, Tasks and Deadlines |
| PriorityQueue | Har qadamda "hozirgi eng yaxshi" o'zgarib tursa | Huffman, IPO |
| Ikki ko'rsatkich | Saralangan ikki uchni juftlash | Ferris Wheel |
| Monoton stek | Leksikografik eng kichik natija | Remove K Digits |
| Binary search + greedy check | "Minimal maksimum" turidagi javob | Array Division |

## Birinchi masala: Lemonade Change

Limonad 5 so'm. Xaridorlar 5, 10 yoki 20 lik pul beradi. Har biriga qaytim bera olamizmi? 20 lik uchun qaytim 15: `10 + 5` yoki `5 + 5 + 5`. Greedy: **10 + 5 ni afzal ko'ring**, chunki 5 lik universal (10 ga ham, 20 ga ham kerak), 10 lik esa faqat 20 uchun foydali.

```java
int five = 0, ten = 0;
for (int b : bills) {
    if (b == 5) five++;
    else if (b == 10) {
        if (five == 0) return false;
        five--;
        ten++;
    } else {
        if (ten > 0 && five > 0) { ten--; five--; }
        else if (five >= 3) five -= 3;
        else return false;
    }
}
return true;
```

=====
---
id: l02
module: m0
week: 1
title: Greedy'ni isbotlash
mins: 50
viz:
problems: p03
goals: Exchange argument bilan isbot yozish | "Greedy stays ahead" usulini qo'llash | Isbot o'rniga stress test qilishni bilish
summary: Exchange argument, "greedy oldinda boradi" va brute force bilan amaliy tekshirish.
---

## Nega isbot kerak?

Musobaqada to'liq rasmiy isbot yozish shart emas. Lekin **isbot g'oyasini** bilish ikki narsani beradi: to'g'ri qoidani tezroq topasiz va noto'g'ri qoidani yuborishdan oldin sezasiz. Uchta asosiy usul bor.

## 1. Exchange argument (almashtirish)

G'oya: istalgan optimal yechim `O` ni olamiz. Agar u greedy yechim `G` dan farq qilsa, `O` da kichik bir almashtirish qilib, natijani **yomonlashtirmasdan** `G` ga yaqinlashtiramiz. Bir necha almashtirishdan keyin `O` = `G`, demak `G` ham optimal.

**Misol: kutish vaqtini minimallashtirish.** n ta ish, i-ishning davomiyligi `t[i]`. Bitta mashina ishlarni ketma-ket bajaradi. Tugash vaqtlari yig'indisini minimallashtiring.

Greedy: **qisqasini birinchi** (Shortest Processing Time).

Isbot: tartibda qo'shni ikki ish `a`, `b` bo'lib, `t[a] > t[b]` bo'lsin. Ularni almashtiramiz. Boshqa ishlarning tugash vaqti o'zgarmaydi. `a` va `b` ning tugash vaqtlari yig'indisi:

- almashtirishdan oldin: `(T + t[a]) + (T + t[a] + t[b])`
- keyin: `(T + t[b]) + (T + t[b] + t[a])`

Farq `t[a] - t[b] > 0` — almashtirish yig'indini kamaytirdi. Demak optimal tartibda "inversiya" (kattasi kichigidan oldin) yo'q, ya'ni u saralangan.

> [!TIP] Saralash kalitini topishning universal usuli: **qo'shni ikki elementni** solishtiring. Qaysi tartib yaxshiroq ekanini ko'rsatadigan shart — sizning comparator'ingiz.

## 2. Greedy stays ahead (greedy oldinda boradi)

G'oya: greedy har qadamda optimaldan **orqada qolmasligini** induksiya bilan ko'rsatish.

**Misol: activity selection.** Greedy eng erta tugaydigan intervalni oladi. Greedy tanlagan intervallar `g1, g2, …` va istalgan optimal yechim `o1, o2, …` (ikkalasi tugash vaqti bo'yicha tartiblangan).

Da'vo: har k uchun `end(g_k) ≤ end(o_k)`.

- k = 1: greedy eng erta tugaydiganini oldi, shuning uchun to'g'ri.
- k → k+1: `o_{k+1}` boshlanishi `end(o_k) ≥ end(g_k)` dan keyin. Demak `o_{k+1}` greedy uchun ham ruxsat etilgan nomzod edi, greedy esa nomzodlar ichida eng erta tugaydiganini oladi: `end(g_{k+1}) ≤ end(o_{k+1})`.

Shunday qilib greedy hech qachon orqada qolmaydi va kamida optimalcha interval oladi.

## 3. Qarama-qarshilik va kesim xossasi

"Greedy tanlamagan elementni o'z ichiga olgan optimal yechim bor deylik…" deb boshlab, uni greedy elementi bilan almashtirib, ziddiyatga kelish. MST'dagi **cut property** shunday isbotlanadi (11-dars).

## Median: Stick Lengths

Barcha tayoqlarni bir xil `x` uzunlikka keltirish narxi `Σ |p[i] - x|`. Qaysi x eng yaxshi?

Agar x dan chapda `L` ta, o'ngda `R` ta element bo'lsa, x ni 1 ga o'ngga surish narxni `L - R` ga o'zgartiradi. `L < R` ekan — o'ngga surish foydali; `L > R` bo'lsa — chapga. Muvozanat nuqtasi — **median**.

```java
Arrays.sort(p);
long med = p[n / 2], cost = 0;
for (long x : p) cost += Math.abs(x - med);
```

## Amaliy isbot: stress test

Musobaqada isbotga vaqt yo'q bo'lsa — kichik testlarda brute force bilan solishtiring. Greedy uchun bu ayniqsa samarali: qarshi misol odatda 4–6 elementda chiqadi.

```java
import java.util.*;

public class Stress {
    static int greedy(int[] coins, int x) {
        int[] c = coins.clone();
        Arrays.sort(c);
        int cnt = 0;
        for (int i = c.length - 1; i >= 0; i--) { cnt += x / c[i]; x %= c[i]; }
        return x == 0 ? cnt : -1;
    }

    static int brute(int[] coins, int x) {
        int[] dp = new int[x + 1];
        Arrays.fill(dp, Integer.MAX_VALUE / 2);
        dp[0] = 0;
        for (int s = 1; s <= x; s++)
            for (int c : coins) if (c <= s) dp[s] = Math.min(dp[s], dp[s - c] + 1);
        return dp[x] >= Integer.MAX_VALUE / 2 ? -1 : dp[x];
    }

    public static void main(String[] args) {
        Random rnd = new Random(1);
        for (int it = 0; it < 100000; it++) {
            int[] coins = {1, rnd.nextInt(9) + 2, rnd.nextInt(9) + 2};
            int x = rnd.nextInt(30) + 1;
            if (greedy(coins, x) != brute(coins, x)) {
                System.out.println(Arrays.toString(coins) + " x=" + x + " greedy=" + greedy(coins, x) + " opt=" + brute(coins, x));
                return;
            }
        }
        System.out.println("Qarshi misol topilmadi");
    }
}
```

> [!NOTE] Stress test "isbot" emas — u faqat sinab ko'rilgan o'lchamlarda xato yo'qligini ko'rsatadi. Lekin amalda xatolarning katta qismini ushlaydi.

=====
---
id: l03
module: m1
week: 2
title: Intervallar
mins: 60
viz: intervals | rooms
problems: p04 | p05 | p06
goals: Activity selection'da nega aynan tugash vaqti bo'yicha saralash kerakligini tushunish | Sweep line (hodisalar) usuli | Minimal xonalar va interval qamrovi
summary: Activity selection, sweep line, minimal xonalar, o'qlar va qamrov — intervallar oilasi.
---

## Activity selection

Bitta zal, n ta tadbir `[s, e)`. Kesishmaydigan eng ko'p tadbirni tanlang.

Uchta "tabiiy" qoida:

| Qoida | Natija | Qarshi misol |
|---|---|---|
| Eng erta boshlanadigani | Xato | `[0, 10)`, `[1, 2)`, `[3, 4)` → greedy 1 ta, optimal 2 ta |
| Eng qisqasi | Xato | `[0, 5)`, `[4, 6)`, `[5, 10)` → greedy 1 ta, optimal 2 ta |
| **Eng erta tugaydigani** | **To'g'ri** | — |

Intuitsiya: erta tugaydigan interval keyingilar uchun **eng ko'p vaqt qoldiradi**. Isbot — 2-darsdagi "greedy stays ahead".

```java
int[][] a = new int[n][2];
Arrays.sort(a, (x, y) -> Integer.compare(x[1], y[1]));
int cnt = 0, lastEnd = Integer.MIN_VALUE;
for (int[] it : a) {
    if (it[0] >= lastEnd) {
        cnt++;
        lastEnd = it[1];
    }
}
```

> [!WARN] Comparator'da `x[1] - y[1]` yozmang: qiymatlar ±2·10^9 atrofida bo'lsa ayirma `int`dan chiqib, saralash buziladi. Doim `Integer.compare` yoki `Long.compare`.

## Sweep line: bir vaqtda nechta?

"Bir vaqtning o'zida eng ko'p nechta interval ochiq?" — intervallarni **hodisalarga** aylantiramiz: boshlanish `+1`, tugash `-1`. Hodisalarni vaqt bo'yicha saralab, hisoblagichni yuritamiz.

```java
long[] ev = new long[2 * n];
for (int i = 0; i < n; i++) {
    ev[2 * i] = (long) s[i] * 2 + 1;
    ev[2 * i + 1] = (long) e[i] * 2;
}
Arrays.sort(ev);
int cur = 0, best = 0;
for (long x : ev) {
    cur += (x & 1) == 1 ? 1 : -1;
    best = Math.max(best, cur);
}
```

Bu yerda hodisa bitta `long`ga kodlangan: `vaqt * 2 + tur`. Bir xil vaqtda tugash (`+0`) boshlanishdan (`+1`) oldin keladi — yarim ochiq `[s, e)` intervallar uchun to'g'ri. Yopiq intervallar uchun tartibni teskari qiling.

## Minimal xonalar (interval partitioning)

Barcha tadbirlarni o'tkazish uchun minimal nechta zal kerak? Javob — bir vaqtda ochiq intervallarning maksimal soni (yuqoridagi sweep). Har tadbirga **qaysi zal** berilishini ham topish uchun: boshlanish bo'yicha saralab, bo'shagan zallarni min-heap'da saqlaymiz.

```java
Arrays.sort(a, (x, y) -> Integer.compare(x[0], y[0]));
PriorityQueue<Integer> ends = new PriorityQueue<>();
for (int[] it : a) {
    if (!ends.isEmpty() && ends.peek() <= it[0]) ends.poll();
    ends.add(it[1]);
}
System.out.println(ends.size());
```

Heap'da har zalning hozirgi tugash vaqti. Eng erta bo'shaydigani bo'sh bo'lsa — o'sha zalni qayta ishlatamiz, aks holda yangi zal.

## Minimal o'qlar

Gorizontal sharlar `[x1, x2]`. Vertikal o'q `x` nuqtadagi barcha sharlarni yoradi. Minimal o'qlar soni? Tugash bo'yicha saralab, o'qni **joriy sharning oxiriga** otamiz — u shu nuqtagacha boshlangan hammasini yoradi.

```java
Arrays.sort(a, (x, y) -> Long.compare(x[1], y[1]));
int arrows = 0;
long pos = Long.MIN_VALUE;
for (long[] b : a) {
    if (b[0] > pos) {
        arrows++;
        pos = b[1];
    }
}
```

Bu activity selection'ning o'zi: o'qlar soni = o'zaro kesishmaydigan sharlarning maksimal soni.

## Qamrov (interval covering)

`[0, T]` kesmani minimal sondagi interval bilan to'liq yoping. Greedy: hozir yopilgan joy `cur`. `cur` dan oldin boshlanadigan intervallar ichidan **eng uzoqqa boradiganini** tanlaymiz.

```java
Arrays.sort(a, (x, y) -> Integer.compare(x[0], y[0]));
int cur = 0, i = 0, cnt = 0;
while (cur < T) {
    int far = cur;
    while (i < n && a[i][0] <= cur) far = Math.max(far, a[i++][1]);
    if (far == cur) { cnt = -1; break; }
    cur = far;
    cnt++;
}
```

## Xulosa jadvali

| Masala | Saralash kaliti | Qo'shimcha |
|---|---|---|
| Maksimal kesishmaydigan | tugash | — |
| Minimal o'chirish (kesishmasin) | tugash | `n - maksimal` |
| Bir vaqtda maksimal | hodisalar | +1 / -1 |
| Minimal xonalar | boshlanish | min-heap |
| Minimal o'qlar | tugash | — |
| Kesmani yopish | boshlanish | eng uzoq yetadigani |
