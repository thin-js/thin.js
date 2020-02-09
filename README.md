# thin.js
前端框架都太重了，自己写个羽量级的，基于html5+css3+jquery。

## 开始使用

添加对jquery的引用,thinjs.com上的版本为3.4.1。
``` html
<script src="http://thinjs.com/jquery.js"></script>
```
添加对 thin.js的引用。
```html
<script src="http://thinjs.com/thin.min.js"></script>
``` 
如果你用到render以外的其他功能，还需要添加对thin.css的引用。(可选）
```html
<link rel="stylesheet" href="http://thinjs.com/thin.css">
```

使用渲染器
``` javascript
$(selector).render({
        data:data,
        template:template
});
```

更多使用说明参见：<a href='https://github.com/thin-js/thin.js/wiki'>https://github.com/thin-js/thin.js/wiki<a>


