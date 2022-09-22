const dayjs = require('dayjs') 
module.exports = {
  currentDate: () => {
    return dayjs().format('YYYY-MM-DD')
  },
  currentMonth: () => {
    return dayjs().format(`YYYY年MM月`)
  },
  ifCon: ( a, b, options) => {
    return a === b ? options.fn(this) : options.inverse(this)
  }
}