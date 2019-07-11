# level-sugar

Syntactic sugar around Level database with JSON, promises, and streams.

## Usage

```javascript
const create = require('level-sugar')

const db = create('mydatabase')

// Get, set, and delete
await db.set('foo', { hello: 'world' })
await db.get('foo') // Resolves to { hello: 'world' }
await db.del('foo')
await db.get('foo') // Resolves to null

// Using prefixes
await db.foo.set('bar', { hello: 'world' })
await db.foo.get('bar') // Resolves to { hello: 'world' }
await db.get('foo.bar') // Resolves to { hello: 'world' }
await db.foo.del('bar')
await db.foo.del('bar') // Resolves to null

// Using lists
await db.bar.add('earth')
await db.bar.add('venus', 'mars')
await db.bar.forEach(value => ...) // Calls for each (earth, venus, mars), but order is not guaranteed.
await db.bar.forEach(async value => ...) // Calls for each, and awaits before continuing.
await db.bar.stream.subscribe(...) // Rxjs interface
```