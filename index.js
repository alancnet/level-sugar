const level = require('level')
const uuidv1 = require('uuid/v1')

const wrap = (db, prefix) => {
  const locals = {
    async get(key, ...args) {
      if (!key) throw new Error(`Key cannot be empty: ${prefix}${key}`)
      try {
        return JSON.parse(await db.get(prefix + key, ...args))
      } catch (err) {
        if (err.name === 'NotFoundError') return null
        throw err
      }
    },
    async put(key, value, ...args) {
      return await db.put(prefix + key, JSON.stringify(value), ...args)
    },
    async del(key, ...args) {
      return await db.del(prefix + key, ...args)
    },
    async add(...values) {
      for (let value of values) {
        await db.put(`${prefix}${uuidv1()}`, JSON.stringify(value))
      }
    },
    async * [Symbol.asyncIterator](){
      const iterator = db.iterator({
        gt: `${prefix}`,
        lt: `${prefix + String.fromCharCode(65535)}`
      })

      while (true) {
        const next = await new Promise((resolve, reject) => iterator.next((err, key, value) => err ? reject(err) : resolve({key, value})))
        if (next.key === undefined) return
        yield [next.key.substr(prefix.length), JSON.parse(next.value)]
      }
    },
    batch(array, ...args) {
      if (array) {
        array = array.map(item => ({
          ...item,
          key: prefix + item.key
        }))
        return db.batch(array, ...args)
      } else {
        return wrap(db.batch(), prefix)
      }
    },
    toString() {
      return `[DB ${prefix || '<root>'}]`
    }
  }
  return new Proxy(db, {
    get(db, key) {
      if (locals[key]) return locals[key]
      if (db[key]) return db[key]
      return wrap(db, `${prefix}${key}.`)
    }
  })
}


const create = (...levelArgs) => {
  return wrap(level(...levelArgs), '')
}

module.exports = Object.assign(create, {
  level, wrap
})
