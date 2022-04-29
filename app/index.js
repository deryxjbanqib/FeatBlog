const router = require('koa-router')()
const tcb = require('@cloudbase/node-sdk')
const common = require('./common.js')
const app = tcb.init({
  env: process.env.ENVID
})
router.get('/:page?/:id?', async (ctx, next) => {
  const number = /^\+?[1-9][0-9]*$/
  const db = app.database()
  const $ = db.command.aggregate
  const nav = await db.collection("feat-blog-forum").orderBy("c_order", "asc").get()
  const config = await db.collection("feat-blog-config").get()
  const t = config.data[0]
  typeof ctx.params.page === 'undefined' ? t['page'] = 1 : t['page'] = ctx.params.page
  const forum = await db.collection("feat-blog-forum").where({ route: t['page'] }).get()
  const thread = await db.collection("feat-blog-thread").where({ _id: t['page'] }).get()
  t['match'] = {}
  t['view'] = 'index'
  t['skip'] = t['limit'] * (t['page'] - 1)
  t['count'] = await db.collection("feat-blog-thread").count()
  if (forum.data.length == 0) {
    if (!number.test(t['page'])) {
      t['skip'] = 0
      t['limit'] = 1
      t['view'] = 'article'
      t['match'] = { _id: t['page'] }
      if (thread.data.length != 0) {
        t['title'] = thread.data[0].title
        t['keywords'] = thread.data[0].keywords
        t['description'] = thread.data[0].description
      }
    }
  } else {
    typeof ctx.params.id === 'undefined' ? t['page'] = 1 : t['page'] = ctx.params.id
    t['count'] = await db.collection("feat-blog-thread").where({ c_id: forum.data[0]._id }).count()
    t['skip'] = t['limit'] * (t['page'] - 1)
    t['match'] = { route: ctx.params.page }
    t['href'] = ctx.params.page + '/'
    t['pic'] = forum.data[0].c_pic
    t['name'] = forum.data[0].name
    t['title'] = forum.data[0].name
    t['msg'] = forum.data[0].c_description
    t['description'] = forum.data[0].c_description
  }
  const { data } = await db.collection('feat-blog-thread').aggregate()
  .lookup({
    from: 'feat-blog-forum',
    localField: 'c_id',
    foreignField: '_id',
    as: 'forum'
  })
  .replaceRoot({
    newRoot: $.mergeObjects([$.arrayElemAt(['$forum', 0]), '$$ROOT'])
  })
  .project({
    forum: 0
  })
  .match(t['match'])
  .sort({
    order: 1,
    _createTime: -1
  })
  .skip(t['skip'])
  .limit(t['limit'])
  .end()
  if (data.length == 0) {
    await ctx.render('404')
    return
  } else {
    await ctx.render(t['view'], {
      t,
      nav,
      data,
      common
    })
  }
})
module.exports = router