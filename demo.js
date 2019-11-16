const create = require('.')

const db = create('mydatabase')

async function main() {
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
    // await db.bar.forEach(value => ...) // Calls for each (earth, venus, mars), but order is not guaranteed.
    // await db.bar.forEach(async value => ...) // Calls for each, and awaits before continuing.
    // await db.bar.stream.subscribe(...) // Rxjs interface


    for await (let [key, planet] of db) {
        console.log(planet)
    }
    console.log('done')
}

main()