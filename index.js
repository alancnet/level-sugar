const level = require('level')
const uuidv1 = require('uuid/v1')
const { Observable } = require('rxjs')

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
    get asyncStream() {
      return Observable.create(observer => {
        let ended = false
        const iterator = db.iterator({
          gt: `${prefix}00000000-0000-0000-0000-000000000000`,
          lt: `${prefix}ffffffff-ffff-ffff-ffff-ffffffffffff`
        })
        const next = () => {
          if (!ended) iterator.next((err, key, value) => {
            if (err) return observer.error()
            if (key === undefined && value === undefined) return observer.complete()
            observer.next({
              key: key.substr(prefix.length),
              value: JSON.parse(value),
              next
            })
          })
        }
        next()
        return () => {
          iterator.end((err) => {
            ended = true
            if (err) observer.error(err)
            else observer.complete()
          })
        }
      })
    },
    get stream() {
      return Observable.create(observer => {
        const subscription = this.asyncStream.subscribe(
          ({key, value, next}) => {
            next()
            observer.next({key, value})
          },
          err => observer.error(err),
          () => observer.complete()
        )
        return () => subscription.unsubscribe()
      })
    },
    async forEach(cb) {
      await new Promise((resolve, reject) => {
        this.asyncStream.subscribe(({key, value, next}) => Promise.resolve(cb(value, key)).then(next), reject, resolve)
      })
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
