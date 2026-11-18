## Fast I/O (CP shabloni)

```java
import java.util.*;
import java.io.*;

public class Main {
    static BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    static StringTokenizer st;

    static String next() throws IOException {
        while (st == null || !st.hasMoreTokens()) st = new StringTokenizer(br.readLine());
        return st.nextToken();
    }

    static int ni() throws IOException { return Integer.parseInt(next()); }
    static long nl() throws IOException { return Long.parseLong(next()); }

    public static void main(String[] args) throws IOException {
        int n = ni();
        StringBuilder out = new StringBuilder();
        out.append(n).append('\n');
        System.out.print(out);
    }
}
```

## Xavfsiz saralash

```java
static void shuffleSort(int[] a) {
    Random r = new Random();
    for (int i = a.length - 1; i > 0; i--) {
        int j = r.nextInt(i + 1);
        int t = a[i]; a[i] = a[j]; a[j] = t;
    }
    Arrays.sort(a);
}
```

Codeforces'da `Arrays.sort(int[])` ni O(n²) ga tushiradigan hack testlar bor. Aralashtirish yoki `long[]`/`Integer[]`ni `ArrayList` orqali saralash bu xavfni yo'qotadi.

## Comparator'lar

```java
Arrays.sort(a, (x, y) -> Integer.compare(x[1], y[1]));
Arrays.sort(a, (x, y) -> x[1] != y[1] ? Integer.compare(x[1], y[1]) : Integer.compare(y[0], x[0]));
Arrays.sort(a, Comparator.comparingLong((long[] x) -> x[0]).thenComparingLong(x -> x[1]));
Arrays.sort(s, (x, y) -> (y + x).compareTo(x + y));
Arrays.sort(it, (x, y) -> Long.compare(y[1] * x[0], x[1] * y[0]));
```

Oxirgisi — `v/w` nisbati bo'yicha kamayish tartibi, kasrsiz.

## Activity selection

```java
Arrays.sort(a, (x, y) -> Integer.compare(x[1], y[1]));
int cnt = 0;
long last = Long.MIN_VALUE;
for (int[] it : a) if (it[0] >= last) { cnt++; last = it[1]; }
```

## Sweep line

```java
long[] ev = new long[2 * n];
for (int i = 0; i < n; i++) { ev[2 * i] = s[i] * 2L + 1; ev[2 * i + 1] = e[i] * 2L; }
Arrays.sort(ev);
int cur = 0, best = 0;
for (long x : ev) { cur += (x & 1) == 1 ? 1 : -1; best = Math.max(best, cur); }
```

## PriorityQueue

```java
PriorityQueue<Integer> minH = new PriorityQueue<>();
PriorityQueue<Integer> maxH = new PriorityQueue<>(Collections.reverseOrder());
PriorityQueue<long[]> pq = new PriorityQueue<>((x, y) -> Long.compare(x[0], y[0]));
PriorityQueue<Long> packed = new PriorityQueue<>();
packed.add(value << 20 | index);
long top = packed.poll();
int idx = (int) (top & ((1 << 20) - 1));
long val = top >> 20;
```

## Multiset (TreeMap)

```java
TreeMap<Integer, Integer> ms = new TreeMap<>();
ms.merge(x, 1, Integer::sum);
if (ms.merge(x, -1, Integer::sum) == 0) ms.remove(x);
Integer le = ms.floorKey(x);
Integer gt = ms.higherKey(x);
```

## DSU

```java
static int[] par, sz;

static int find(int x) {
    while (par[x] != x) { par[x] = par[par[x]]; x = par[x]; }
    return x;
}

static boolean union(int a, int b) {
    a = find(a); b = find(b);
    if (a == b) return false;
    if (sz[a] < sz[b]) { int t = a; a = b; b = t; }
    par[b] = a;
    sz[a] += sz[b];
    return true;
}
```

## Dijkstra

```java
long[] dist = new long[n];
Arrays.fill(dist, Long.MAX_VALUE);
dist[s] = 0;
PriorityQueue<long[]> pq = new PriorityQueue<>((x, y) -> Long.compare(x[0], y[0]));
pq.add(new long[]{0, s});
while (!pq.isEmpty()) {
    long[] cur = pq.poll();
    int v = (int) cur[1];
    if (cur[0] > dist[v]) continue;
    for (int e = head[v]; e != -1; e = nxt[e]) {
        long nd = cur[0] + w[e];
        if (nd < dist[to[e]]) { dist[to[e]] = nd; pq.add(new long[]{nd, to[e]}); }
    }
}
```

## Monoton stek (satr)

```java
StringBuilder st = new StringBuilder();
for (char c : s.toCharArray()) {
    while (st.length() > 0 && st.charAt(st.length() - 1) > c && canRemove()) st.deleteCharAt(st.length() - 1);
    st.append(c);
}
```

## Javob bo'yicha binary search

```java
long lo = minPossible, hi = maxPossible;
while (lo < hi) {
    long mid = lo + (hi - lo) / 2;
    if (check(mid)) hi = mid;
    else lo = mid + 1;
}

long lo2 = minPossible, hi2 = maxPossible;
while (lo2 < hi2) {
    long mid = lo2 + (hi2 - lo2 + 1) / 2;
    if (check(mid)) lo2 = mid;
    else hi2 = mid - 1;
}
```

Birinchisi — `check` true bo'lgan **eng kichik** qiymat, ikkinchisi — **eng katta**.

## Qaysi saralash kaliti?

| Masala | Kalit |
|---|---|
| Kesishmaydigan intervallar max | tugash ↑ |
| Minimal xonalar / qamrov | boshlanish ↑ |
| Σ tugash vaqti min | davomiylik ↑ |
| Σ og'irlikli tugash min | `t / w` ↑ |
| Maksimal kechikish min | deadline ↑ |
| Fractional knapsack | `v / w` ↓ |
| Eng katta birlashma | `a + b` vs `b + a` |
| Juftlash (Ferris Wheel) | ↑, ikki uchdan |
