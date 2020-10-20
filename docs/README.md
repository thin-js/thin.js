# Welcome to the thin.js wiki!
一个羽量级的前端框架，基于html5+css3+jquery。

## 开始使用

* 添加对jquery的引用,thinjs.com上的版本为3.4.1，你也可以从其他源引用jquery。
``` html
<script src="http://thinjs.com/jquery.js"></script>
```
* 添加对 thin.js的引用。
```html
<script src="http://thinjs.com/thin.min.js"></script>
``` 
* 如果你用到render以外的其他功能，还需要添加对thin.css的引用。(可选）
```html
<link rel="stylesheet" href="http://thinjs.com/thin.css">
```

* 使用渲染器
``` javascript
$(selector).render({
        data:data,
        template:template
});
```

 
## [[render]] 渲染器

1. [[基本语法|render]]
1. [[模板]]
1. [[element 模板|模板 : element]]
    1. [[控制样式|模板 : element : 控制样式]]
    1. [[使用数据|模板 : element : 使用数据]]
    1. [[处理事件|模板 : element : 处理事件]]
    1. [[生成元素属性|模板 : element : 生成元素属性]]
1. [[if 结构|模板 : if 结构]]
1. [[switch case 结构|模板 : switch case 结构]]
1. [[foreach 结构|模板 : foreach 结构]]

## [[poplayer]] 弹出层
弹窗渲染器

## tab 标签

## multiview 多视图