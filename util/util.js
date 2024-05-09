const moment = require('moment');

const convertToObjectWithDateKey = (arr) => {
    return arr.reduce((acc, el) => {
        return {...acc, [new Date(moment(el.dt).format("YYYY-MM-DD"))]: el};
    }, {})
}

function weekOfTheMonthYear(date) {
    const day = date.getDate()
    const weekDay = date.getDay()
    //let week = Math.ceil(day / 7)
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((date - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7);
      let year = date.getYear()
      let month = date.getMonth()
    
    const ordinal = ['First', 'Second', 'Third', 'Fourth', 'Last']
    const weekDays  = ['Sunday','Monday','Tuesday','Wednesday', 'Thursday','Friday','Saturday']
    
  
    // Check the next day of the week and if it' on the same month, if not, respond with "Last"
    const nextWeekDay = new Date(date.getTime() + (1000 * 60 * 60 * 24 * 7))
    if (nextWeekDay.getMonth() !== date.getMonth()) {
      week = 5
    }
    
    return `${year}_${month+1}_${weekNumber}`
}

function monthOfYear(date) {
    const day = date.getDate()
    const weekDay = date.getDay()
    let week = Math.ceil(day / 7)
      let year = date.getYear()
      let month = date.getMonth()
    
    const ordinal = ['First', 'Second', 'Third', 'Fourth', 'Last']
    const weekDays  = ['Sunday','Monday','Tuesday','Wednesday', 'Thursday','Friday','Saturday']
    
  
    // Check the next day of the week and if it' on the same month, if not, respond with "Last"
    const nextWeekDay = new Date(date.getTime() + (1000 * 60 * 60 * 24 * 7))
    if (nextWeekDay.getMonth() !== date.getMonth()) {
      week = 5
    }
    
    return `${year}_${month+1}`
}

module.exports = {convertToObjectWithDateKey, weekOfTheMonthYear, monthOfYear}