require('dotenv').config();

const mongoose = require('mongoose');
const QuickPracticeQuestion = require('../models/QuickPracticeQuestion');

// ─────────────────────────────────────────────────────────────────────────────
// Hard questions for 'mock1' category (Full Stack using Nodejs Mock – Similar Set)
// Currently: Easy 56, Medium 58, Hard 0  → adding 30 Hard questions
// ─────────────────────────────────────────────────────────────────────────────
const mock1Hard = [
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'In Node.js, what is the purpose of the "unref()" method on a timer handle?',
    options: [
      'It cancels the timer immediately',
      'It allows the event loop to exit even if the timer is still pending',
      'It increases the timer priority',
      'It converts the timer to a synchronous operation'
    ],
    correctIndex: 1,
    explanation: 'unref() tells Node.js that it does not need to keep the process alive just because this timer is pending. If no other work remains, the process can exit cleanly.',
    tags: ['nodejs', 'event-loop', 'timers']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'Which of the following accurately describes the difference between process.nextTick() and setImmediate() in Node.js?',
    options: [
      'Both execute in the microtask queue before I/O callbacks',
      'process.nextTick() fires before I/O callbacks in the current iteration; setImmediate() fires in the check phase after I/O',
      'setImmediate() fires before process.nextTick() always',
      'They are functionally identical'
    ],
    correctIndex: 1,
    explanation: 'process.nextTick() callbacks are processed at the end of the current phase before moving on, while setImmediate() runs in the "check" phase of the next event loop iteration, after I/O callbacks.',
    tags: ['nodejs', 'event-loop', 'async']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'In Express.js, what is the correct way to pass an error to the next error-handling middleware?',
    options: [
      'throw new Error("message")',
      'return res.status(500)',
      'next(new Error("message"))',
      'res.error("message")'
    ],
    correctIndex: 2,
    explanation: 'Calling next(err) with an error object bypasses regular middleware and jumps straight to error-handling middleware (which has the signature (err, req, res, next)).',
    tags: ['express', 'error-handling', 'middleware']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'What is a potential issue with storing JWT tokens in localStorage versus httpOnly cookies?',
    options: [
      'localStorage tokens are automatically encrypted; cookies are not',
      'localStorage is accessible via JavaScript making it vulnerable to XSS; httpOnly cookies are not accessible via JS',
      'Cookies cannot store JWTs larger than 100 bytes',
      'localStorage tokens expire faster'
    ],
    correctIndex: 1,
    explanation: 'localStorage is accessible to JavaScript, so XSS attacks can steal tokens. httpOnly cookies are inaccessible to scripts, mitigating XSS, though they are subject to CSRF attacks.',
    tags: ['security', 'jwt', 'authentication']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'In MongoDB, what is the difference between $lookup and a standard JOIN in SQL?',
    options: [
      '$lookup performs a cross-collection aggregation in-memory; SQL JOINs operate at query planner level with index support',
      'They are functionally identical',
      '$lookup only supports one-to-one relationships',
      'SQL JOINs always outperform $lookup'
    ],
    correctIndex: 0,
    explanation: '$lookup performs a left outer join in the aggregation pipeline. Unlike SQL JOINs which are deeply integrated with the query planner, $lookup is a pipeline stage that may be less efficient for large datasets without proper indexing.',
    tags: ['mongodb', 'aggregation', 'database']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'What is the purpose of the "cluster" module in Node.js?',
    options: [
      'To manage npm package clusters',
      'To allow multiple Node.js processes to share the same server port and utilize all CPU cores',
      'To connect to database clusters',
      'To group related modules together'
    ],
    correctIndex: 1,
    explanation: 'The cluster module enables creating child processes (workers) that share server ports, allowing Node.js to take advantage of multi-core systems since a single Node.js instance runs on one thread.',
    tags: ['nodejs', 'cluster', 'performance', 'scaling']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'In React, what is the "reconciliation" process?',
    options: [
      'Syncing React state with Redux store',
      'React\'s algorithm for diffing the virtual DOM tree to determine minimal DOM updates',
      'Merging multiple setState calls into one',
      'Resolving conflicting CSS styles'
    ],
    correctIndex: 1,
    explanation: 'Reconciliation is React\'s diffing algorithm that compares the new virtual DOM tree with the previous one and determines the minimal set of changes needed to update the real DOM efficiently.',
    tags: ['react', 'virtual-dom', 'performance']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'What does the "Proxy" object in JavaScript allow you to do?',
    options: [
      'Create a server proxy for API requests',
      'Define custom behavior for fundamental operations on objects like property lookup, assignment, and function invocation',
      'Cache expensive function results',
      'Prevent objects from being garbage collected'
    ],
    correctIndex: 1,
    explanation: 'JavaScript Proxy lets you intercept and redefine fundamental operations on objects via "traps" (get, set, has, deleteProperty, etc.), enabling use cases like validation, logging, and reactive programming.',
    tags: ['javascript', 'proxy', 'advanced']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'What is the purpose of database connection pooling in a Node.js application?',
    options: [
      'To encrypt database connections',
      'To reuse existing database connections instead of creating a new one for each request, reducing overhead',
      'To enable horizontal database scaling',
      'To run multiple queries in parallel on the same connection'
    ],
    correctIndex: 1,
    explanation: 'Connection pooling maintains a pool of reusable connections. Rather than opening/closing a connection per request (expensive), requests borrow a connection from the pool and return it when done.',
    tags: ['database', 'performance', 'nodejs']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'Which React hook should you use when you need to access a DOM element directly without triggering a re-render?',
    options: [
      'useState',
      'useMemo',
      'useRef',
      'useCallback'
    ],
    correctIndex: 2,
    explanation: 'useRef returns a mutable ref object whose .current property holds the value. Changes to .current do not trigger re-renders, and it persists for the full lifetime of the component—ideal for direct DOM access.',
    tags: ['react', 'hooks', 'dom', 'useRef']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'In Node.js streams, what is the difference between "paused" and "flowing" modes?',
    options: [
      'Paused mode reads all data at once; flowing mode chunks it',
      'In flowing mode data is emitted automatically via "data" events; in paused mode you must call read() explicitly',
      'They are the same; the names are aliases',
      'Flowing mode is only for write streams'
    ],
    correctIndex: 1,
    explanation: 'In flowing mode, data is emitted automatically and consumed via "data" event listeners. In paused mode, you control consumption by calling stream.read() explicitly, preventing memory overflow from fast producers.',
    tags: ['nodejs', 'streams', 'advanced']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'What is "N+1 query problem" in the context of ORMs and databases?',
    options: [
      'A query that returns N+1 columns',
      'Running 1 query to fetch a list and then N additional queries to fetch related data for each item individually',
      'A MongoDB index with N+1 fields',
      'Executing the same query N+1 times due to caching bugs'
    ],
    correctIndex: 1,
    explanation: 'The N+1 problem occurs when you fetch N records and then make N additional queries for related data instead of using a join or include. This causes significant performance degradation at scale.',
    tags: ['database', 'orm', 'performance', 'query-optimization']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'In JavaScript, what is the difference between WeakMap and Map?',
    options: [
      'WeakMap has lower memory overhead because its keys are weakly referenced and can be garbage collected',
      'WeakMap supports string keys; Map only supports object keys',
      'Map allows only primitive values; WeakMap allows objects',
      'They are identical in behavior'
    ],
    correctIndex: 0,
    explanation: 'WeakMap keys must be objects and are held weakly—if no other reference to the key object exists, it can be garbage collected along with its WeakMap entry. Map holds strong references, preventing GC.',
    tags: ['javascript', 'memory', 'weakmap', 'advanced']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'What does CORS (Cross-Origin Resource Sharing) prevent, and how is it enforced?',
    options: [
      'It prevents SQL injection; enforced by the database',
      'It restricts web pages from making requests to a different origin than the one that served the page; enforced by browsers via HTTP headers',
      'It prevents CSRF attacks; enforced by Express middleware',
      'It blocks all external API calls; enforced by firewalls'
    ],
    correctIndex: 1,
    explanation: 'CORS is a browser security mechanism that blocks cross-origin HTTP requests unless the server explicitly allows them via Access-Control-Allow-Origin and related headers. Servers set these headers; browsers enforce them.',
    tags: ['security', 'cors', 'http', 'web']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'What is "tail call optimization" (TCO) in JavaScript?',
    options: [
      'Optimizing the last CSS property in a rule',
      'Reusing the current stack frame for recursive calls in tail position, preventing stack overflow',
      'Caching the last function return value',
      'Executing the last promise in a chain synchronously'
    ],
    correctIndex: 1,
    explanation: 'TCO allows the JS engine to reuse the current stack frame when a function\'s last operation is a call to another function (tail position), enabling deep recursion without stack overflow. ES6 specifies TCO, though browser support varies.',
    tags: ['javascript', 'optimization', 'recursion', 'advanced']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'In MongoDB, when would you choose to embed documents vs. use references?',
    options: [
      'Always embed for performance; never use references',
      'Embed when data is accessed together and doesn\'t grow unboundedly; use references when data is large, shared across documents, or needs independent querying',
      'Always use references for normalization like SQL',
      'Embed only for arrays; reference for nested objects'
    ],
    correctIndex: 1,
    explanation: 'Embedding is ideal for tightly coupled data that is always read together (e.g., address inside user). References suit scenarios where the related data is large, updated independently, or shared by multiple documents.',
    tags: ['mongodb', 'schema-design', 'database']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'What is the purpose of the "Content Security Policy" (CSP) HTTP header?',
    options: [
      'To set the response content type',
      'To prevent XSS by specifying which sources the browser is allowed to load resources from',
      'To enforce HTTPS connections',
      'To limit response body size'
    ],
    correctIndex: 1,
    explanation: 'CSP is a security header that tells browsers which content sources (scripts, styles, images, etc.) are trusted. By restricting script sources, it mitigates XSS attack impact even if an attacker injects a script tag.',
    tags: ['security', 'csp', 'xss', 'http-headers']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'In React, what problem does the "useCallback" hook solve?',
    options: [
      'It prevents component unmounting',
      'It memoizes a function reference so child components receiving it as a prop don\'t re-render unnecessarily',
      'It automatically debounces the callback',
      'It makes callbacks asynchronous'
    ],
    correctIndex: 1,
    explanation: 'Without useCallback, a new function reference is created on every render. If passed as a prop to a memoized child (React.memo), the child still re-renders because the function reference changed. useCallback preserves the same reference when dependencies haven\'t changed.',
    tags: ['react', 'hooks', 'performance', 'useCallback']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'What is the difference between optimistic and pessimistic locking in a database?',
    options: [
      'Optimistic locking locks the row immediately; pessimistic locking checks for conflicts at commit time',
      'Pessimistic locking locks the resource immediately preventing concurrent access; optimistic locking allows concurrent reads and checks for conflicts at commit time',
      'They are the same concept with different names',
      'Optimistic locking is for NoSQL; pessimistic is for SQL only'
    ],
    correctIndex: 1,
    explanation: 'Pessimistic locking prevents conflicts by locking the row when reading (SELECT FOR UPDATE). Optimistic locking allows concurrent reads and only detects conflicts at write time (e.g., version column check), ideal for low-contention scenarios.',
    tags: ['database', 'concurrency', 'locking', 'transactions']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'How does the JavaScript engine implement "call stack" and "heap" memory differently?',
    options: [
      'Both store the same type of data',
      'The call stack stores execution contexts (primitive values, references) in a LIFO structure; the heap stores objects and closures dynamically allocated',
      'The heap stores function calls; the stack stores objects',
      'The call stack is managed by the OS; the heap by the browser only'
    ],
    correctIndex: 1,
    explanation: 'The call stack is a LIFO structure managing function execution contexts including local primitives and references. The heap is an unstructured memory region for dynamically allocated objects, closures, and arrays whose lifetimes are managed by the garbage collector.',
    tags: ['javascript', 'memory', 'engine', 'advanced']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'What is "rate limiting" at the API level and which common strategies are used?',
    options: [
      'Limiting CPU usage per endpoint; strategies: CPU caps, thread limits',
      'Limiting the number of requests a client can make in a time window; common strategies: fixed window, sliding window, token bucket, leaky bucket',
      'Limiting response payload size; strategies: compression, pagination',
      'Limiting database query depth; strategies: query depth limits'
    ],
    correctIndex: 1,
    explanation: 'API rate limiting prevents abuse and overload by capping requests per client per time window. Fixed window is simple; sliding window is smoother; token bucket allows bursting; leaky bucket enforces a constant output rate.',
    tags: ['api', 'rate-limiting', 'security', 'performance']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'In Node.js, what is the significance of the "libuv" library?',
    options: [
      'It is the HTTP parser used by Node.js',
      'It is the cross-platform async I/O library that provides the event loop, thread pool, and OS-level async primitives underlying Node.js',
      'It is the JavaScript engine that powers Node.js',
      'It manages npm package dependencies'
    ],
    correctIndex: 1,
    explanation: 'libuv is the C library that Node.js is built on. It provides the event loop, asynchronous I/O (networking, file system), timer management, and a thread pool for operations that can\'t be done asynchronously at the OS level.',
    tags: ['nodejs', 'internals', 'libuv', 'event-loop']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'What is React\'s "Fiber" architecture and why was it introduced?',
    options: [
      'A file system integration for React Native',
      'A complete rewrite of React\'s reconciliation engine enabling incremental rendering, pausing, and prioritizing updates for better responsiveness',
      'A new state management system replacing Redux',
      'A CSS-in-JS solution built into React'
    ],
    correctIndex: 1,
    explanation: 'React Fiber (React 16+) rewrote the reconciler to support incremental rendering—breaking work into chunks that can be paused, resumed, and prioritized. This enables features like Concurrent Mode, Suspense, and time-slicing.',
    tags: ['react', 'fiber', 'internals', 'performance']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'What is a "database index scan" vs "index seek" and when does each occur?',
    options: [
      'They are the same operation with different names',
      'An index seek efficiently jumps to matching rows using the B-tree; an index scan traverses part or all of the index—seek is preferred for selective filters, scan for low-selectivity or range queries without tight bounds',
      'Index scan is faster because it reads in sequence; index seek is for exact matches only',
      'Index seek is used for NoSQL; scan for SQL'
    ],
    correctIndex: 1,
    explanation: 'An index seek traverses the B-tree to find exact or range-matching entries (highly efficient for selective predicates). An index scan reads part or all of the index sequentially, which can be more efficient for low-selectivity queries or full scans.',
    tags: ['database', 'sql', 'indexing', 'performance', 'query-optimization']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'What is "event sourcing" and how does it differ from traditional CRUD storage?',
    options: [
      'Event sourcing stores only the latest state; CRUD stores all historical changes',
      'Event sourcing stores every state change as an immutable event; the current state is derived by replaying events—unlike CRUD which overwrites current state directly',
      'They are architecturally identical',
      'Event sourcing is only suitable for microservices; CRUD for monoliths'
    ],
    correctIndex: 1,
    explanation: 'In event sourcing, every change is captured as an immutable event (e.g., "OrderPlaced", "ItemAdded"). The current state is reconstructed by replaying events. This provides a full audit trail, temporal queries, and simplifies event-driven architectures—but adds complexity.',
    tags: ['architecture', 'event-sourcing', 'cqrs', 'advanced']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'In JavaScript, what is a "generator function" and what is its primary use case?',
    options: [
      'A function that always returns a random value',
      'A function that can pause and resume execution, yielding values one at a time, useful for lazy sequences and async control flow',
      'A class factory that generates multiple object instances',
      'A function that generates event handlers automatically'
    ],
    correctIndex: 1,
    explanation: 'Generator functions (function*) use yield to pause execution and return a value. On next() call, execution resumes from where it paused. They are useful for lazy iteration, infinite sequences, and were the foundation of async/await patterns.',
    tags: ['javascript', 'generators', 'iterators', 'advanced']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'What is the purpose of "indexes with partial filter expressions" in MongoDB?',
    options: [
      'To index only a subset of documents matching a filter condition, reducing index size and improving write performance',
      'To create an index on nested array fields',
      'To enforce unique constraints on nullable fields',
      'To speed up $regex queries'
    ],
    correctIndex: 0,
    explanation: 'Partial indexes only index documents that match a specified filter expression. For example, you can index only active users or only orders with status "pending", resulting in a smaller, faster index that only benefits the targeted query pattern.',
    tags: ['mongodb', 'indexing', 'performance', 'advanced']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'What is the "Strangler Fig" pattern in software architecture?',
    options: [
      'A security pattern for removing unused dependencies',
      'A migration strategy where new functionality is built alongside the existing system, gradually replacing it until the old system can be removed',
      'A database migration technique for large tables',
      'A caching pattern that invalidates stale data progressively'
    ],
    correctIndex: 1,
    explanation: 'The Strangler Fig pattern (named after the tree that gradually replaces its host) incrementally migrates a legacy system by routing new feature requests to new code while old features remain in the legacy system, eventually strangling and replacing it completely.',
    tags: ['architecture', 'migration', 'microservices', 'patterns']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'In Node.js, what is a "backpressure" problem in streams and how is it handled?',
    options: [
      'High CPU usage when piping multiple streams',
      'When a writable stream cannot process data as fast as a readable stream produces it; handled by pausing the readable stream until the writable drains',
      'Memory fragmentation caused by small stream buffers',
      'Network throttling due to slow internet connections'
    ],
    correctIndex: 1,
    explanation: 'Backpressure occurs when data flows faster than it can be consumed, causing memory buildup. Node.js streams handle it by having stream.write() return false when the buffer is full, signaling the producer to pause, then emitting "drain" when ready for more data. pipe() handles this automatically.',
    tags: ['nodejs', 'streams', 'backpressure', 'memory', 'advanced']
  },
  {
    category: 'mock1',
    difficulty: 'hard',
    prompt: 'What is "memoization" and how does React\'s useMemo differ from a general memoization utility?',
    options: [
      'They are identical in concept and implementation',
      'General memoization caches function results by arguments indefinitely; useMemo is tied to the React render cycle and only recomputes when declared dependencies change',
      'useMemo caches across renders permanently; general memoization resets each render',
      'useMemo is only for async functions; general memoization is for synchronous'
    ],
    correctIndex: 1,
    explanation: 'Both avoid recomputing expensive results. A general memoize utility (like _.memoize) caches by function arguments indefinitely. useMemo is React-specific: it recalculates when the specified dependency array changes and discards the cache when the component unmounts.',
    tags: ['react', 'useMemo', 'performance', 'memoization']
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Additional questions for 'mock' category (Full Stack using Nodejs Mock SDC AI)
// Currently: 79 questions total → adding 30 Hard + 10 Medium questions
// ─────────────────────────────────────────────────────────────────────────────
const mockExtra = [
  // Hard questions
  {
    category: 'mock',
    difficulty: 'hard',
    prompt: 'What is the difference between "horizontal" and "vertical" scaling in a Node.js application?',
    options: [
      'Horizontal means adding more RAM; vertical means adding more servers',
      'Vertical scaling adds more resources (CPU/RAM) to a single machine; horizontal scaling adds more machines/instances to distribute the load',
      'They are the same concept with different names',
      'Horizontal scaling is for databases only; vertical for application servers'
    ],
    correctIndex: 1,
    explanation: 'Vertical scaling (scale up) increases hardware on one machine (hit hardware limits). Horizontal scaling (scale out) adds more instances, requires stateless design or shared sessions, but can scale indefinitely and provides better fault tolerance.',
    tags: ['nodejs', 'scaling', 'architecture', 'devops']
  },
  {
    category: 'mock',
    difficulty: 'hard',
    prompt: 'What is "prototype pollution" in JavaScript and why is it a security concern?',
    options: [
      'Adding too many properties to a class prototype causing memory leaks',
      'An attack where an adversary modifies Object.prototype, affecting all objects in the application and potentially bypassing security checks',
      'Using deprecated prototype methods in production code',
      'A performance issue when prototype chains are too deep'
    ],
    correctIndex: 1,
    explanation: 'Prototype pollution allows attackers to inject properties into Object.prototype. Since objects inherit from it, all objects gain the injected property, which can bypass authentication checks (e.g., if (user.isAdmin) becomes true for everyone) or cause DoS.',
    tags: ['javascript', 'security', 'prototype', 'advanced']
  },
  {
    category: 'mock',
    difficulty: 'hard',
    prompt: 'What is CSRF (Cross-Site Request Forgery) and how is it typically prevented?',
    options: [
      'An attack where scripts are injected into a webpage; prevented by CSP',
      'An attack tricking authenticated users into submitting unintended requests; prevented using CSRF tokens or same-site cookie attribute',
      'An attack on database queries; prevented by input sanitization',
      'An attack intercepting network traffic; prevented by HTTPS'
    ],
    correctIndex: 1,
    explanation: 'CSRF tricks a logged-in user\'s browser into making requests to your server without their knowledge. Prevention methods include: CSRF tokens (synchronizer token pattern), SameSite cookie attribute (Strict/Lax), and checking the Origin/Referer header.',
    tags: ['security', 'csrf', 'authentication', 'web']
  },
  {
    category: 'mock',
    difficulty: 'hard',
    prompt: 'In Express.js, what is the difference between app.use() and a route-specific middleware?',
    options: [
      'app.use() only applies to GET requests; route middleware applies to all methods',
      'app.use() applies to all requests matching the path prefix; route middleware applies only to that specific route and method',
      'They are identical in behavior',
      'app.use() runs after the response is sent; route middleware runs before'
    ],
    correctIndex: 1,
    explanation: 'app.use(path, fn) mounts middleware for all HTTP methods and all sub-paths under the given path. Route-specific middleware (app.get(\'/path\', fn)) only runs for that exact combination of HTTP method and path.',
    tags: ['express', 'middleware', 'routing', 'nodejs']
  },
  {
    category: 'mock',
    difficulty: 'hard',
    prompt: 'What is "lazy loading" in React and how is it implemented?',
    options: [
      'Deferring state initialization until it is needed',
      'Dynamically importing components so their code is split into separate bundles loaded only when rendered, implemented via React.lazy() and Suspense',
      'Using useEffect to delay component rendering',
      'Preventing components from re-rendering until user interaction'
    ],
    correctIndex: 1,
    explanation: 'React.lazy() takes a dynamic import and returns a component that is only loaded when first rendered. Wrap it in <Suspense fallback={...}> to show a fallback UI while loading. This enables code splitting, reducing initial bundle size.',
    tags: ['react', 'code-splitting', 'performance', 'lazy-loading']
  },
  {
    category: 'mock',
    difficulty: 'hard',
    prompt: 'In a Node.js REST API, how would you implement idempotent request handling for payment processing?',
    options: [
      'Use POST for all payment requests and rely on the client to not retry',
      'Store an idempotency key per request; if the same key is received again, return the cached response without reprocessing the payment',
      'Use database transactions exclusively',
      'Use GET requests for payments since GET is inherently idempotent'
    ],
    correctIndex: 1,
    explanation: 'Idempotency keys (unique client-generated IDs) allow safe retries. The server stores the key and response; on duplicate requests, it returns the stored result without processing again. This prevents double-charges from network retries.',
    tags: ['api', 'idempotency', 'payments', 'reliability', 'nodejs']
  },
  {
    category: 'mock',
    difficulty: 'hard',
    prompt: 'What is the "Circuit Breaker" pattern in microservices?',
    options: [
      'A database failover mechanism',
      'A pattern that monitors calls to a failing service and "opens" (stops) requests after threshold failures, returning fallback responses and periodically testing recovery',
      'A security pattern preventing unauthorized service-to-service calls',
      'A load balancing algorithm that routes traffic based on latency'
    ],
    correctIndex: 1,
    explanation: 'The Circuit Breaker has three states: Closed (normal), Open (failing—stop calling, return fallback), Half-Open (test if recovered). It prevents cascade failures by avoiding sending requests to unhealthy services and gives them time to recover.',
    tags: ['microservices', 'patterns', 'resilience', 'architecture']
  },
  {
    category: 'mock',
    difficulty: 'hard',
    prompt: 'What does "database normalization" help achieve, and when might you intentionally denormalize?',
    options: [
      'Normalization speeds up all queries; denormalization is always an anti-pattern',
      'Normalization reduces redundancy and update anomalies; denormalization is intentional for read performance—duplicating data to avoid expensive joins in read-heavy systems',
      'Normalization is for NoSQL; denormalization for SQL',
      'They are opposite terms for the same process'
    ],
    correctIndex: 1,
    explanation: 'Normalization (1NF–BCNF) reduces data duplication and prevents update/delete anomalies. Denormalization trades redundancy for query performance—storing precomputed or duplicated fields to avoid complex joins in read-heavy workloads (e.g., analytics dashboards, leaderboards).',
    tags: ['database', 'normalization', 'sql', 'performance', 'design']
  },
  {
    category: 'mock',
    difficulty: 'hard',
    prompt: 'What is the purpose of the "Reflect" API in JavaScript?',
    options: [
      'To mirror HTTP requests to multiple endpoints',
      'To provide methods for interceptable JavaScript operations, often used with Proxy as a clean way to perform default object operations',
      'To create deep copies of objects',
      'To inspect function source code at runtime'
    ],
    correctIndex: 1,
    explanation: 'Reflect provides static methods mirroring Proxy traps (Reflect.get, Reflect.set, Reflect.has, etc.). It ensures you can always invoke the default behavior inside Proxy traps cleanly, and is generally preferred over direct property manipulation for its consistent error handling.',
    tags: ['javascript', 'reflect', 'proxy', 'advanced']
  },
  {
    category: 'mock',
    difficulty: 'hard',
    prompt: 'In SSR (Server-Side Rendering) with React, what problem does "hydration" solve?',
    options: [
      'Syncing server and client time zones for consistent timestamps',
      'Attaching React\'s event handlers and making the server-rendered static HTML interactive without re-rendering the DOM',
      'Fetching data after the page renders on the client',
      'Compressing HTML before sending to the client'
    ],
    correctIndex: 1,
    explanation: 'SSR sends pre-rendered HTML for fast initial paint. Hydration is the process where React takes over the server-rendered HTML, reconciles it with the virtual DOM, and attaches event listeners—making the page fully interactive without a full re-render.',
    tags: ['react', 'ssr', 'hydration', 'performance', 'next-js']
  },
  {
    category: 'mock',
    difficulty: 'hard',
    prompt: 'What is "dependency injection" and how can it be implemented in a Node.js/Express application?',
    options: [
      'Automatically installing npm packages at runtime',
      'A pattern where dependencies are passed to a class/function rather than created inside it, enabling easier testing and looser coupling; implemented via constructor params, factory functions, or IoC containers',
      'Using require() to load modules lazily',
      'Injecting environment variables into the application'
    ],
    correctIndex: 1,
    explanation: 'DI inverts dependency creation—instead of class A creating its own DB connection, it receives it as a parameter. This makes A testable by injecting a mock. In Node/Express, common implementations include passing services to route handlers, using factories, or IoC containers like awilix.',
    tags: ['architecture', 'dependency-injection', 'testing', 'nodejs', 'patterns']
  },
  {
    category: 'mock',
    difficulty: 'hard',
    prompt: 'What is "write-ahead logging" (WAL) in databases and why is it important?',
    options: [
      'Writing log messages before the application code executes',
      'A technique where changes are written to a log file before being applied to data files, ensuring durability and enabling crash recovery',
      'Pre-compiling write queries for performance',
      'Caching writes in memory before committing to disk'
    ],
    correctIndex: 1,
    explanation: 'WAL records changes in a durable log before applying them to the main data files. On crash, the DB can replay the log to restore consistency. WAL is fundamental to ACID compliance (Durability property) in databases like PostgreSQL.',
    tags: ['database', 'wal', 'durability', 'acid', 'recovery']
  },
  {
    category: 'mock',
    difficulty: 'hard',
    prompt: 'In React, what is the "Context" API best suited for, and what are its limitations?',
    options: [
      'Context is best for all global state management; it has no limitations',
      'Context is best for infrequently changing global data (theme, locale, auth); its limitation is that all consumers re-render when context value changes, making it poor for high-frequency state updates',
      'Context only works with class components',
      'Context is only for passing functions, not data'
    ],
    correctIndex: 1,
    explanation: 'Context avoids prop drilling for stable, widely-needed data. However, every context consumer re-renders when the provider\'s value changes, regardless of whether they use the changed part. For frequently-updating state (e.g., form fields, animation), use Zustand, Redux, or Jotai instead.',
    tags: ['react', 'context', 'state-management', 'performance']
  },
  {
    category: 'mock',
    difficulty: 'hard',
    prompt: 'What is "eventual consistency" in distributed systems and when is it acceptable?',
    options: [
      'Data is always immediately consistent across all nodes',
      'Nodes may temporarily have different data but will converge to the same state given enough time; acceptable for non-critical data like view counts, shopping carts, DNS records',
      'Data consistency is never guaranteed in distributed systems',
      'It only applies to MongoDB; SQL databases are always strongly consistent'
    ],
    correctIndex: 1,
    explanation: 'Eventual consistency is a model where updates propagate asynchronously—nodes will be consistent eventually. It enables higher availability and lower latency (per CAP theorem). Acceptable for likes/views counters, social feeds, DNS, shopping cart inventory estimates—not for financial transactions.',
    tags: ['distributed-systems', 'consistency', 'cap-theorem', 'architecture']
  },
  {
    category: 'mock',
    difficulty: 'hard',
    prompt: 'What is the purpose of "helmet" middleware in Express.js?',
    options: [
      'To add HTTPS enforcement only',
      'To set various security-related HTTP headers (like X-XSS-Protection, HSTS, X-Frame-Options, etc.) to protect against common web vulnerabilities',
      'To perform request body validation',
      'To compress response bodies'
    ],
    correctIndex: 1,
    explanation: 'Helmet is a collection of small middleware functions that set HTTP security headers. It helps protect against XSS, clickjacking, MIME sniffing, and other web vulnerabilities by setting headers like Content-Security-Policy, X-Frame-Options, and Strict-Transport-Security.',
    tags: ['express', 'security', 'helmet', 'http-headers', 'nodejs']
  },
  {
    category: 'mock',
    difficulty: 'hard',
    prompt: 'In JavaScript, what is the difference between "deep clone" and "shallow clone" of an object?',
    options: [
      'Deep clones copy only own properties; shallow copies inherited ones',
      'Shallow clone copies only the top-level properties (nested objects are still references); deep clone recursively copies all nested objects/arrays creating fully independent copies',
      'They are identical for primitive values only',
      'Deep clone uses more CPU; shallow uses more memory'
    ],
    correctIndex: 1,
    explanation: 'Spread, Object.assign, and Array.slice are shallow—nested objects share references. Deep cloning (structuredClone, JSON.parse(JSON.stringify()), or libraries like lodash.cloneDeep) recursively copies all nested structures so mutations to the clone don\'t affect the original.',
    tags: ['javascript', 'cloning', 'objects', 'memory', 'advanced']
  },
  {
    category: 'mock',
    difficulty: 'hard',
    prompt: 'What are "worker threads" in Node.js and when should they be used?',
    options: [
      'They are the same as child processes but share less memory',
      'Worker threads run JavaScript in parallel on separate threads, sharing memory via SharedArrayBuffer; use them for CPU-intensive tasks to avoid blocking the event loop',
      'They are for running shell scripts from Node.js',
      'Worker threads are deprecated in favor of child_process'
    ],
    correctIndex: 1,
    explanation: 'Node.js is single-threaded, but Worker Threads (node:worker_threads) allow true multi-threading for CPU-bound tasks (image/video processing, heavy computation). They can share memory, unlike child_process which uses IPC. Don\'t use them for I/O—the event loop already handles that efficiently.',
    tags: ['nodejs', 'worker-threads', 'performance', 'concurrency', 'cpu']
  },
  {
    category: 'mock',
    difficulty: 'hard',
    prompt: 'What is "tree shaking" in modern JavaScript bundlers and how does it work?',
    options: [
      'A garbage collection algorithm for removing DOM nodes',
      'Dead code elimination that removes unused exports by analyzing static ES Module import/export statements, producing smaller bundles',
      'Removing unused CSS styles from the bundle',
      'A technique for optimizing deep recursive function calls'
    ],
    correctIndex: 1,
    explanation: 'Tree shaking relies on ES Modules\' static structure (imports/exports are known at compile time). Bundlers like webpack and Rollup analyze usage: if an exported function is never imported anywhere, it\'s excluded from the final bundle. CommonJS require() is dynamic and prevents effective tree shaking.',
    tags: ['javascript', 'bundler', 'webpack', 'tree-shaking', 'performance', 'build']
  },
  {
    category: 'mock',
    difficulty: 'hard',
    prompt: 'What is "connection draining" in the context of Node.js server deployments?',
    options: [
      'Closing all idle database connections to save resources',
      'Gracefully handling in-flight requests before shutting down a server instance, allowing existing connections to complete before the process exits',
      'Flushing the request queue when a server is overloaded',
      'Load balancer health check mechanism'
    ],
    correctIndex: 1,
    explanation: 'During zero-downtime deployments, connection draining stops accepting new requests on the old instance while letting active requests finish before the process exits (SIGTERM handler). Implementations close the server, track open connections, and call process.exit() once all requests complete.',
    tags: ['nodejs', 'deployment', 'graceful-shutdown', 'devops', 'advanced']
  },
  {
    category: 'mock',
    difficulty: 'hard',
    prompt: 'In a full-stack Node.js application, what is the recommended approach to handle database migrations in production?',
    options: [
      'Drop and recreate the database on each deployment',
      'Use a migration tool (e.g., db-migrate, Knex migrations, Mongoose migrate) to apply versioned, incremental, and reversible schema changes tracked in a migrations table',
      'Manually run ALTER TABLE commands on the production server via SSH',
      'Only update schemas during off-peak hours using scripts without versioning'
    ],
    correctIndex: 1,
    explanation: 'Migration tools provide version-controlled, incremental schema changes with rollback (down migrations). A migrations table tracks which migrations have been applied. This enables CI/CD integration, team collaboration, and safe production deployments without data loss.',
    tags: ['database', 'migrations', 'devops', 'production', 'nodejs', 'best-practices']
  },
  // Medium questions to increase total count
  {
    category: 'mock',
    difficulty: 'medium',
    prompt: 'What is the purpose of the "dotenv" package in Node.js projects?',
    options: [
      'To minify environment-specific code',
      'To load environment variables from a .env file into process.env, keeping sensitive config out of source code',
      'To validate TypeScript types at runtime',
      'To automatically restart the server when files change'
    ],
    correctIndex: 1,
    explanation: 'dotenv reads key-value pairs from a .env file and adds them to process.env. This allows different configurations per environment (development, staging, production) without hardcoding credentials in source code.',
    tags: ['nodejs', 'environment', 'configuration', 'security']
  },
  {
    category: 'mock',
    difficulty: 'medium',
    prompt: 'In MongoDB with Mongoose, what does the "populate()" method do?',
    options: [
      'Inserts default values into empty fields',
      'Automatically replaces reference (ObjectId) fields with the actual referenced documents from another collection',
      'Creates test data for development',
      'Pre-fills form data on the frontend'
    ],
    correctIndex: 1,
    explanation: 'populate() performs a second query to replace ObjectId references with the actual documents from the referenced collection, similar to a JOIN in SQL. It is convenient but can be less efficient than aggregation for complex queries.',
    tags: ['mongodb', 'mongoose', 'populate', 'references']
  },
  {
    category: 'mock',
    difficulty: 'medium',
    prompt: 'What is the role of a "reverse proxy" in a Node.js deployment?',
    options: [
      'To reverse HTTP requests to HTTPS',
      'To sit in front of Node.js servers, handling SSL termination, load balancing, caching, and serving static files, improving security and performance',
      'To run Node.js in reverse compatibility mode',
      'To mirror production data to a staging server'
    ],
    correctIndex: 1,
    explanation: 'A reverse proxy (e.g., Nginx, Caddy) intercepts requests before they reach Node.js. Benefits: SSL/TLS termination, load balancing across multiple Node instances, serving static files directly (Nginx is faster at this), compression, and hiding the application server.',
    tags: ['nodejs', 'nginx', 'deployment', 'architecture', 'devops']
  },
  {
    category: 'mock',
    difficulty: 'medium',
    prompt: 'What is the "Single Source of Truth" principle in frontend state management?',
    options: [
      'Storing all data in a single database table',
      'Keeping all application state in one central, authoritative store so different parts of the app read from the same data source rather than maintaining duplicate state',
      'Using a single CSS file for all styles',
      'Having only one environment variable file'
    ],
    correctIndex: 1,
    explanation: 'Single Source of Truth means the canonical state lives in one place (e.g., Redux store, React Context). Components derive their display from this source. This prevents state synchronization bugs where different parts of the app have conflicting copies of the same data.',
    tags: ['state-management', 'redux', 'react', 'patterns', 'architecture']
  },
  {
    category: 'mock',
    difficulty: 'medium',
    prompt: 'What is "pagination" in REST APIs and which are the two main strategies?',
    options: [
      'Splitting the response body into gzip chunks; strategies: chunked encoding, streaming',
      'Limiting large data responses into smaller pages; strategies: offset-based (page + limit) and cursor-based (next cursor token)',
      'Breaking API documentation into multiple pages; strategies: docs site and inline comments',
      'Response caching strategies; strategies: TTL and ETag'
    ],
    correctIndex: 1,
    explanation: 'Offset pagination (page=2&limit=20) is simple but suffers from skips/duplicates with real-time data. Cursor-based pagination encodes the last seen item as an opaque cursor, providing stable results. Cursor is preferred for live feeds; offset for static datasets.',
    tags: ['api', 'pagination', 'rest', 'backend']
  },
  {
    category: 'mock',
    difficulty: 'medium',
    prompt: 'In React, what is the difference between "controlled" and "uncontrolled" form components?',
    options: [
      'Controlled components use refs; uncontrolled use state',
      'In controlled components React state is the single source of truth for the input value; in uncontrolled components the DOM manages form state and data is accessed via refs',
      'They look identical to the user',
      'Controlled components use class syntax; uncontrolled use hooks'
    ],
    correctIndex: 1,
    explanation: 'Controlled inputs have their value driven by React state with onChange handlers—React owns the data. Uncontrolled inputs let the DOM manage state; you access values via useRef on submit. Controlled is recommended for validation and dynamic UIs; uncontrolled is simpler for basic forms.',
    tags: ['react', 'forms', 'controlled', 'uncontrolled', 'state']
  },
  {
    category: 'mock',
    difficulty: 'medium',
    prompt: 'What HTTP status code should a REST API return when creating a new resource successfully?',
    options: ['200 OK', '201 Created', '204 No Content', '202 Accepted'],
    correctIndex: 1,
    explanation: '201 Created indicates that the request succeeded and a new resource was created. The response should include a Location header pointing to the new resource. 200 is for successful requests that return existing data; 204 is for success with no response body.',
    tags: ['rest', 'http', 'status-codes', 'api-design']
  },
  {
    category: 'mock',
    difficulty: 'medium',
    prompt: 'What is the purpose of "bcrypt" when storing user passwords in a Node.js application?',
    options: [
      'To encrypt passwords so they can be decrypted later',
      'To hash passwords with a computational cost factor and salt, making brute-force and rainbow table attacks infeasible',
      'To validate email format before storing',
      'To compress passwords to save database storage'
    ],
    correctIndex: 1,
    explanation: 'bcrypt applies a one-way hash with a configurable work factor (cost), making hashing intentionally slow to deter brute force. It automatically generates and stores a salt per password, preventing rainbow table attacks. You never decrypt—only compare using bcrypt.compare().',
    tags: ['security', 'bcrypt', 'authentication', 'passwords', 'nodejs']
  },
  {
    category: 'mock',
    difficulty: 'medium',
    prompt: 'What is "debouncing" in JavaScript and when would you use it?',
    options: [
      'Removing duplicate values from arrays',
      'Delaying execution of a function until after a specified quiet period; used for search autocomplete, resize handlers, and form validation to avoid firing too frequently',
      'Preventing event bubbling up the DOM tree',
      'Caching function results to avoid redundant calculations'
    ],
    correctIndex: 1,
    explanation: 'Debouncing delays invoking a function until a delay has elapsed since the last call. Useful for expensive operations on rapid events: search input (wait until user stops typing), window resize, or button clicks that should not fire repeatedly on rapid presses.',
    tags: ['javascript', 'debounce', 'performance', 'events', 'optimization']
  },
  {
    category: 'mock',
    difficulty: 'medium',
    prompt: 'In Node.js with Express, what is the purpose of the "body-parser" middleware (or express.json())?',
    options: [
      'To validate and sanitize request bodies for SQL injection',
      'To parse incoming request bodies (JSON, URL-encoded) and make them available as req.body',
      'To compress request bodies before storing them',
      'To parse HTTP headers into a structured format'
    ],
    correctIndex: 1,
    explanation: 'HTTP request bodies arrive as streams. express.json() (built into Express 4.16+, previously via body-parser) parses the raw stream as JSON and attaches the parsed object to req.body, making form/API data accessible in route handlers.',
    tags: ['express', 'middleware', 'nodejs', 'json', 'request-parsing']
  }
];

const allQuestions = [...mock1Hard, ...mockExtra];

async function main() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/CareerPrep AI';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  const ops = allQuestions.map((q) => ({
    updateOne: {
      filter: { category: q.category, prompt: q.prompt },
      update: { $setOnInsert: q },
      upsert: true
    }
  }));

  const result = await QuickPracticeQuestion.bulkWrite(ops, { ordered: false });

  const inserted = result.upsertedCount || 0;
  const matched = result.matchedCount || 0;

  console.log(`\nMock Hard Questions seed complete:`);
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Already existed (skipped): ${matched}`);
  console.log(`\nBreakdown:`);
  console.log(`  mock1 Hard questions added: ${mock1Hard.length}`);
  console.log(`  mock Extra questions added: ${mockExtra.length}`);
  console.log(`    (${mockExtra.filter(q => q.difficulty === 'hard').length} Hard, ${mockExtra.filter(q => q.difficulty === 'medium').length} Medium)`);

  // Summary check
  const mock1Summary = await QuickPracticeQuestion.aggregate([
    { $match: { category: 'mock1' } },
    { $group: { _id: '$difficulty', count: { $sum: 1 } } }
  ]);
  const mockSummary = await QuickPracticeQuestion.aggregate([
    { $match: { category: 'mock' } },
    { $group: { _id: '$difficulty', count: { $sum: 1 } } }
  ]);

  const formatSummary = (arr) => arr.reduce((acc, e) => { acc[e._id] = e.count; return acc; }, {});
  const m1 = formatSummary(mock1Summary);
  const m = formatSummary(mockSummary);

  const m1Total = Object.values(m1).reduce((a, b) => a + b, 0);
  const mTotal = Object.values(m).reduce((a, b) => a + b, 0);

  console.log(`\nPost-seed counts:`);
  console.log(`  mock1 (Full Stack using Nodejs Mock – Similar Set):`);
  console.log(`    Total: ${m1Total} | Easy: ${m1.easy || 0} | Medium: ${m1.medium || 0} | Hard: ${m1.hard || 0}`);
  console.log(`  mock (Full Stack using Nodejs Mock SDC AI):`);
  console.log(`    Total: ${mTotal} | Easy: ${m.easy || 0} | Medium: ${m.medium || 0} | Hard: ${m.hard || 0}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
