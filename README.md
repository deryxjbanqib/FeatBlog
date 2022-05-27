FeatBlog 是基于 CloudBase 云开发的一款免费开源的轻博客主题，包含PC端、响应式移动端和小程序（小程序也将近期开源）。支持在云开发控制台一键上传安装到云函数环境中，通过 CloudBase CMS 后端管理，可以快速的管理 Web 网站和小程序等多端产生的内容数据。

![](https://static.featwork.com/featblog/img/4/6.png)

### 项目背景

相信很多同学都使用或了解过 WordPress 博客系统 ，它是使用 PHP 语言和 MySQL 数据库开发的，用户搭建  WordPress 站点就要求一个能够运行 PHP环境 和 MySQL数据库的服务器，有一定的部署门槛。

而 FeatBlog 采用 CloudBase 云数据库、云函数等云原生一体化开发环境，用户无需自行搭建服务器即可部署应用，
极大减轻了繁杂的操作。它天然支持弹性扩缩容，按量计费，灵活管理，也极大节约了成本。

### 配置说明

运行环境：CloudBase 云函数

后端管理：CloudBase CMS

前端框架：Koajs

演示地址：[https://featwork.com/blog](https://featwork.com/blog)

项目地址：[https://gitee.com/featwork/featblog](https://gitee.com/featwork/featblog)

安装教程：[https://featwork.com/1602318397394](https://featwork.com/1602318397394)

### 设计简单：

FeatBlog 博客主题采用响应式布局设计，兼容各种主流浏览器和移动端，没有多余的功能与复杂的样式，设计简约而又不失便捷实用，致力于为用户提供设计简约且操作简单的博客网站。

### 入门简单：

基于 Koajs 框架，逻辑代码不到100行，有JavaScrip基础知识都能看懂，有助于学习和了解云函数调用，云数据库集合操作等，能方便快速搭建项目。

### 操作简单：

通过 CloudBase CMS，支持文本、富文本、Markdown、图片、文件、关联类型等多种类型的可视化编辑，随时随地管理 Web 网站和小程序等多端产生的内容数据。

### 部署简单：

可以在云开发控制台一键上传安装到云函数环境，配置HTTP访问服务可以提供免费的域名。也可以通过CloudBase CLI工具一体化快速方便的部署。

### 代码片段：

一个路由判断首页，分类和详情页

```
router.get('/:page?/:id?', async (ctx, next) => {
  typeof ctx.params.page === 'undefined' ? t['page'] = 1 : t['page'] = ctx.params.page
  
  // 判断分类
  const forum = await db.collection("feat-blog-forum").where({ route: t['page'] }).get()
  
  // 判断文章
  const thread = await db.collection("feat-blog-thread").where({ _id: t['page'] }).get()
})
```

默认为首页，则 `ctx.params.page` 为首页分页

```
// 匹配字段
t['match'] = {}

// 指定模板
t['view'] = 'index'

// 对应数量
t['skip'] = t['limit'] * (t['page'] - 1)

// 默认分页
t['limit'] = 10
```

如果有分类数据就属于分类页，则 `ctx.params.page` 为分类路由，`ctx.params.id` 为分类分页

```
if (forum.data.length != 0) {
  typeof ctx.params.id === 'undefined' ? t['page'] = 1 : t['page'] = ctx.params.id

  // 匹配分类页路由
  t['match'] = { route: ctx.params.page }
  t['skip'] = t['limit'] * (t['page'] - 1)
}
```

如果没有分类数据就属于详情页，则 `ctx.params.page` 为详情页ID

```
if (forum.data.length == 0) {

  // 详情页ID必须是字符串
  if (!number.test(t['page'])) {
    
    // 匹配详情页ID
    t['match'] = { _id: t['page'] }
    t['skip'] = 0
    t['limit'] = 1
    t['view'] = 'article'
  }
}
```

数据库集合的聚合操作实例，如果有更好的设计模式欢迎分享

```
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
```

### 总结：

现在 FeatBlog 还只是初期阶段，后期也会发布各种主题风格。总之使用 FeatBlog 无需自行搭建服务器即可部署，你值得拥有。

QQ：1524790154
