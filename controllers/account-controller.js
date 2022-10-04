const db = require('../models')
const { Account, User, Category } = db
const dayjs = require('dayjs') 
const { Op } = require('sequelize')

const accountController = {
  
  getAccount: (req, res, next) => {
    const userId = req.user.id
    const year = req.body.year
    const month = req.body.month
    const currentYear = dayjs().format(`YYYY`)
    const currentMonth = dayjs().format(`MM`)
    let star = ''
    let end = ''
    
    if (year) {
      star += year
      end += year
    } else {
      star += currentYear
      end += currentYear
    }
    star += '/'
    end += '/'
    if (month) {
      star += month
      end += month
    } else {
      star += currentMonth
      end += currentMonth
    }

    star = star + '/1'
    end = end + '/31'
    
      Account.findAll({
        raw: true,
        nest: true,
        where: {
          date: {
            [Op.between]: [star, end]
          }
        },
        include: [{ model: User, where: { id: userId } }]
      })
        .then(data => {
          let food = 0
          let traffic = 0
          let superMarket = 0
          let bill = 0
          let other = 0
          let total
          for (let i = 0; i < data.length; i++) {
            if (data[i].categoryId == 1) {
              food = food + Number(data[i].price)
            } else if (data[i].categoryId == 2) {
              traffic += Number(data[i].price)
            } else if (data[i].categoryId == 3) {
              superMarket += Number(data[i].price)
            } else if (data[i].categoryId == 4) {
              bill += Number(data[i].price)
            } else if (data[i].categoryId == 5) {
              other += Number(data[i].price)
            }
          }
          total = food + traffic + superMarket + bill + other
          res.render('account', { food, traffic, superMarket, bill, other, total, year, month })
        })
        .catch(err => next(err))
  },
  createExpensePage : (req, res, next) => {
    Category.findAll({
      raw: true
    })
      .then(categories => res.render('create', {categories}))
      .catch(err => next(err))
    
  },
  createExpense: (req, res, next) => {
    const userId = req.user.id
    const { name, price, date, categoryId } = req.body
    Account.create({
      name,
      price,
      userId,
      date,
      categoryId
    })
      .then(res.redirect('/'))
      .catch(error => {
        console.log(error)
        res.render('errorPage', { error: error.message })
        next(error)
      })
  },
  detailPage : (req, res, next) => {
    const { year, month, order } = req.body
    const currentYear = dayjs().format(`YYYY`)
    const currentMonth = dayjs().format(`MM`)
    const userId = req.user.id
    const categoryId = Number(req.query.categoryId) || ''
    let ordering = req.body.order || ['date', 'ASC']
    let star = ''
    let end = ''
    const orderChange = {
      1: '依建立時間',
      2: '依金額 大=>小',
      3: '依金額 小=>大',
    }

    let orderToString = orderChange[Number(order)]
      
    if (year) {
      star += year
      end  += year
    } else {
      star += currentYear
      end  += currentYear
    }
    star +=  '/'
    end  +=  '/'
    if (month) {
      star += month
      end  += month
    } else {
      star += currentMonth
      end  += currentMonth
    }

    star = star +'/1'
    end = end + '/31'

    if (order == '1') {
      ordering = ['date', 'ASC']
    } else if (order == '2') {
      ordering = ['price', 'DESC']
    } else if (order == '3') {
      ordering = ['price', 'ASC']
    }
 
      Promise.all([Account.findAll({
        raw: true,
        nest: true,
        where: {
          date: {
            [Op.between]: [star, end]
          },
          ...categoryId ? { categoryId } : {} 

        },
        order:[
          ordering
        ],
        include: [
          { model: User, where: { id: userId } }
        ]
      }), Category.findAll({
        raw: true
      })])
        .then(([accounts, categories]) => {
          let total = 0
          let chartData  = {}
          for (let i = 0; i < accounts.length; i++) {
            accounts[i].date = dayjs(accounts[i].date).format(`YYYY-MM-DD`)
            accounts[i].chartIndex = Number(dayjs(accounts[i].date).format(`DD`))
            if (accounts[i].chartIndex in chartData) {
              chartData[accounts[i].chartIndex] += accounts[i].price
            } else {
              chartData[accounts[i].chartIndex] = accounts[i].price
            }
          }
          for (let i = 1 ; i <= 31; i++) {
            if(!chartData[i]) {
              chartData[i] = 0
            }
          }

          let charts = [chartData[1], chartData[2], chartData[3], chartData[4], chartData[5], chartData[6], chartData[7], chartData[8], chartData[9], chartData[10], chartData[11], chartData[12], chartData[13], chartData[14], chartData[15], chartData[16], chartData[17], chartData[18], chartData[19], chartData[20], chartData[21], chartData[22], chartData[23], chartData[24], chartData[25], chartData[26], chartData[27], chartData[28], chartData[29], chartData[30], chartData[31]]
          
          const categoryChange = {
            1: '飲食',
            2: '交通',
            3: '超市',
            4: '帳單',
            5: '其他'
          }
          for (let i = 0; i < accounts.length; i++) {
            total += Number(accounts[i].price)
            accounts[i].categoryIdToString = categoryChange[accounts[i].categoryId]
          }
          res.render('detail', { accounts, total, year, month, categories, categoryId, orderToString, order, charts })
        })
        .catch(error => {
          console.log(error)
          res.render('errorPage', { error: error.message })
          next(error)
        })
  },
  editExpensePage: (req, res, next) => {
    Promise.all([
      Account.findByPk(req.params.id, {
        raw: true
      }), Category.findAll({
        raw: true
      })
    ])
      .then(([account, categories]) => {
        if (!account) throw new Error("紀錄不存在!")
        const categoryChange = {
          1: '飲食',
          2: '交通',
          3: '超市',
          4: '帳單',
          5: '其他'
        }
        const categoryIdToString = categoryChange[account.categoryId]
        account.date = dayjs(account.date).format(`YYYY-MM-DD`)
        res.render('edit', { account, categories, categoryIdToString })
      })
      .catch(err => next(err))
  },
  editExpense: (req, res, next) => {
    const { name, price, date, categoryId } = req.body
    //categoryId = Number(categoryId)
    Account.findByPk(req.params.id)
      .then(account => {
        if (!account) throw new Error("紀錄不存在!")
        return account.update({
          name,
          price,
          categoryId,
          date
        })
      })
      .then(() =>{
        req.flash('success_messages', '資料修改成功!')
        res.redirect('/detail')
      })
      .catch(err => next(err))
  },
  deleteAccount: (req, res, next) => {
    const id = req.params.id
    Account.findByPk(id)
      .then(account => {
        return account.destroy()
      })
      .then(() => {
        res.redirect('/detail')
      })
      .catch(err => next(err))
  },
  getChart: (req, res, next) => {
    const currentYear = dayjs().format(`YYYY`)
    const currentMonth = dayjs().format(`MM`)
    const currentTime = dayjs().format(`YYYY/MM/`)
    const userId = req.user.id
    const categoryId = req.body.categoryId
    const keyword = req.body.keyword 
    const date_star = req.body.date_star 
    const date_end = req.body.date_end 
    let star = ''
    let end = ''
    if (!date_star) {
      star = currentYear + '/1/1' 
    } else {
      star = date_star
    }
    if (!date_end) {
      end = currentYear + '/12/31'
    } else {
      end = date_end
    }

    Promise.all([
      Account.findAll({
        raw: true,
        nest: true,
        where: {
          date: {
            [Op.between]: [star, end]
          },
          ...keyword ? { name: {
            [Op.or]: {
              [Op.startsWith]: `${keyword}`,
              [Op.substring]: `${keyword}`,
              [Op.endsWith]: `${keyword}`
            }
          } } : {},
          ...categoryId ? { categoryId } : {}
        },
        order: [
          ['date', 'ASC']
        ],
        include: [
          { model: User, where: { id: userId } }
        ]
      }), Category.findAll({
        raw: true
      })
    ])
    .then(([accounts,categories]) => {
      const categoryChange = {
        1: '飲食',
        2: '交通',
        3: '超市',
        4: '帳單',
        5: '其他'
      }
      let month_ = {}
      const categoryIdToString = categoryChange[categoryId]
      for (let i = 0 ; i < accounts.length; i++){
        accounts[i].date = dayjs(accounts[i].date).format(`YYYY-MM-DD`)
        accounts[i].categoryIdName = categoryChange[accounts[i].categoryId]
      }
 

      res.render('chart', { accounts, keyword, date_star, date_end, categories, categoryId, categoryIdToString })
    })
      .catch(err => next(err))
    
  }
}

module.exports = accountController