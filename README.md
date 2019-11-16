# level-sugar

Syntactic sugar around Level database with JSON, promises, and streams.

## Usage

```javascript
const create = require('level-sugar')

const db = create('mydatabase')

// Get, put, and delete
await db.put('foo', { hello: 'world' })
await db.get('foo') // Resolves to { hello: 'world' }
await db.del('foo')
await db.get('foo') // Resolves to null

// Using prefixes
await db.foo.put('bar', { hello: 'world' })
await db.foo.get('bar') // Resolves to { hello: 'world' }
await db.get('foo.bar') // Resolves to { hello: 'world' }
await db.foo.del('bar')
await db.foo.del('bar') // Resolves to null

// Using lists
await db.bar.add('earth')
await db.bar.add('venus', 'mars')
for await (let {key, value} of db.bar) {
    // Async generator
}
```