import { Discovery } from '../types/discovery'

export const COMMON_PATTERNS = [
  'Two Pointers',
  'Sliding Window',
  'Monotonic Stack',
  'Binary Search on Answer',
  'Prefix Sums & Complements',
  'Intervals & Sweep-line',
  'Topological Sort',
  'Dynamic Programming',
  'Graph DFS / BFS',
  'Union-Find (DSU)',
  'Trie',
  'Heap / Priority Queue',
  'Bit Manipulation',
  'Backtracking & Pruning',
  'Tree Invariants'
] as const

export const DEFAULT_DISCOVERIES: Discovery[] = [
  {
    id: 'seed-1',
    title: 'Trapping Rain Water',
    url: 'https://leetcode.com/problems/trapping-rain-water/',
    rawCapture:
      'Forget calculating column-by-column water with left_max and right_max arrays. If left_max < right_max, the bottleneck for the left pointer is DEFINITELY left_max regardless of what tall bars lie in the middle! Just advance left pointer immediately.',
    pattern: 'Two Pointers',
    difficulty: 'Hard',
    tags: ['invariants', 'bottleneck', 'two-pointers', 'space-optimization'],
    isFavorite: true,
    needsRevisit: false,
    revisitCount: 2,
    lastRevisitedAt: '2026-10-25T14:30:00.000Z',
    isDraft: false,
    createdAt: '2026-10-12T09:15:00.000Z',
    updatedAt: '2026-10-25T14:30:00.000Z'
  },
  {
    id: 'seed-2',
    title: 'Daily Temperatures',
    url: 'https://leetcode.com/problems/daily-temperatures/',
    rawCapture:
      'I kept reaching for nested loops. But if we store indices of temperatures that haven’t found their warmer day yet, as soon as a warmer day arrives, it resolves ALL previous colder days waiting in the stack in reverse order.',
    pattern: 'Monotonic Stack',
    difficulty: 'Medium',
    tags: ['monotonic-stack', 'next-greater-element', 'linear-time'],
    isFavorite: true,
    needsRevisit: true,
    revisitCount: 1,
    lastRevisitedAt: '2026-10-20T11:00:00.000Z',
    isDraft: false,
    createdAt: '2026-10-15T16:20:00.000Z',
    updatedAt: '2026-10-20T11:00:00.000Z'
  },
  {
    id: 'seed-3',
    title: 'Course Schedule II',
    url: 'https://leetcode.com/problems/course-schedule-ii/',
    rawCapture:
      'In-degree 0 means zero dependencies left—it is immediately ready to execute. Push to queue, decrement neighbors. If processed count != total nodes at end, there is a cycle.',
    pattern: 'Topological Sort',
    difficulty: 'Medium',
    tags: ['graph', 'bfs', 'cycle-detection', 'dag'],
    isFavorite: false,
    needsRevisit: true,
    revisitCount: 0,
    isDraft: false,
    createdAt: '2026-10-18T18:40:00.000Z',
    updatedAt: '2026-10-18T18:40:00.000Z'
  },
  {
    id: 'seed-4',
    title: 'Median of Two Sorted Arrays',
    url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/',
    rawCapture:
      'Binary search on the smaller array’s partition point, not the values themselves! The partition in array A determines the exact partition in array B because the combined left half must always have (m + n + 1) / 2 elements.',
    pattern: 'Binary Search on Answer',
    difficulty: 'Hard',
    tags: ['binary-search', 'partition', 'divide-and-conquer'],
    isFavorite: true,
    needsRevisit: true,
    revisitCount: 3,
    lastRevisitedAt: '2026-10-28T09:10:00.000Z',
    isDraft: false,
    createdAt: '2026-10-10T12:00:00.000Z',
    updatedAt: '2026-10-28T09:10:00.000Z'
  },
  {
    id: 'seed-5',
    title: 'Subarray Sum Equals K',
    url: 'https://leetcode.com/problems/subarray-sum-equals-k/',
    rawCapture:
      'Sliding window fails with negative numbers because expanding or shrinking is not monotonic! Track prefix sum frequency in a hash map. If (current_sum - k) was observed before, every occurrence marks a valid contiguous subarray ending at current index.',
    pattern: 'Prefix Sums & Complements',
    difficulty: 'Medium',
    tags: ['hash-map', 'prefix-sum', 'negative-numbers'],
    isFavorite: false,
    needsRevisit: false,
    revisitCount: 1,
    lastRevisitedAt: '2026-10-19T10:15:00.000Z',
    isDraft: false,
    createdAt: '2026-10-17T11:45:00.000Z',
    updatedAt: '2026-10-19T10:15:00.000Z'
  },
  {
    id: 'seed-6',
    title: 'Word Break',
    url: 'https://leetcode.com/problems/word-break/',
    rawCapture:
      'dp[i] represents whether s[0..i] can be segmented. Instead of backtracking recursively, check previous valid cut points: if dp[j] is true and s[j..i] is in word set, then dp[i] is true.',
    pattern: 'Dynamic Programming',
    difficulty: 'Medium',
    tags: ['dp', 'string', 'reachability', 'pruning'],
    isFavorite: false,
    needsRevisit: true,
    revisitCount: 0,
    isDraft: false,
    createdAt: '2026-10-22T20:00:00.000Z',
    updatedAt: '2026-10-22T20:00:00.000Z'
  },
  {
    id: 'seed-7',
    title: 'Number of Connected Components in an Undirected Graph',
    rawCapture:
      'If union(u, v) returns false because u and v already share the same root, we found a redundant edge/cycle. If true, component count decreases by exactly 1.',
    pattern: 'Union-Find (DSU)',
    difficulty: 'Medium',
    tags: ['union-find', 'dsu', 'graph', 'amortized-o(1)'],
    isFavorite: false,
    needsRevisit: false,
    revisitCount: 0,
    isDraft: false,
    createdAt: '2026-10-24T15:10:00.000Z',
    updatedAt: '2026-10-24T15:10:00.000Z'
  },
  {
    id: 'seed-8',
    title: 'Sliding Window Maximum',
    url: 'https://leetcode.com/problems/sliding-window-maximum/',
    rawCapture:
      'Need max in current window in O(1). Keep a deque of indices. Before adding index i, remove all indices in deque whose values are smaller than nums[i] (they can NEVER be maximum now or in any future window that includes i). Also pop expired indices from front.',
    pattern: 'Monotonic Stack',
    difficulty: 'Hard',
    tags: ['monotonic-deque', 'sliding-window', 'linear-time', 'candidate-elimination'],
    isFavorite: true,
    needsRevisit: true,
    revisitCount: 2,
    lastRevisitedAt: '2026-10-27T17:00:00.000Z',
    isDraft: false,
    createdAt: '2026-10-21T08:30:00.000Z',
    updatedAt: '2026-10-27T17:00:00.000Z'
  },
  {
    id: 'seed-9',
    title: 'Minimum Window Substring',
    url: 'https://leetcode.com/problems/minimum-window-substring/',
    rawCapture:
      'Expand right pointer to satisfy condition, contract left pointer to optimize length. Keep a count of how many required unique characters have reached their needed frequency.',
    pattern: 'Sliding Window',
    difficulty: 'Hard',
    tags: ['sliding-window', 'frequency-map', 'two-pointers', 'substring'],
    isFavorite: false,
    needsRevisit: false,
    revisitCount: 1,
    isDraft: false,
    createdAt: '2026-10-23T19:40:00.000Z',
    updatedAt: '2026-10-23T19:40:00.000Z'
  },
  {
    id: 'seed-10',
    title: '',
    rawCapture:
      'Quick thought on tree diameter: two BFS passes work on any unweighted tree! First BFS from any arbitrary node finds one diameter endpoint. Second BFS from that endpoint finds the actual maximum diameter. Why? Triangle inequality on trees.',
    pattern: 'Tree Invariants',
    tags: ['tree', 'diameter', 'bfs', 'unweighted'],
    isFavorite: false,
    needsRevisit: true,
    revisitCount: 0,
    isDraft: true,
    createdAt: '2026-10-29T21:10:00.000Z',
    updatedAt: '2026-10-29T21:10:00.000Z'
  }
]
