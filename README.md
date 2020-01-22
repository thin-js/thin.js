# thin.js
前端框架都太重了，自己写个羽量级的，基于html5+css3+jquery。

[TOC]

## Render
渲染器

```javascript
        $(selector).render({
          data:data,
          template:template
        });
```
## poplayer
浮层渲染器
```javascript
        poplayer({
            data:data,
            template:template
        })
```

## tab 
标签导航

```html
        <tab>
            <tab-nav>item1</tab-nav>
            <tab-nav>item2</tab-nav>
        <tab>
``` 
## multiview
多视图
```html
        <multiview>
            <view>view 1</view>
            <view>view 2</view>
        </multiview>
```
## template模板

模板可以是字符串、对象或者数组。

### 字符串模板

```javascript
        $(selector).render({
                data:data,
                template:"<div>[[path/name]]<div>"
        });
```
可以使用一段html字符串作为模板，在模板中可以使用数据漫游器绑定数据。

请注意：
1. 在字符串模板中保持html元素结构的完整性，元素必须被关闭。
1. 当根模板是字符串模板时，数据无法正确绑定到节点。

### 对象模板
模板可以是一个javascript对象。
```javascript
        template:{
                e:"div",
                t:"hello world！"
        }
```
对象可以有以下成员：

|成员|类型|说明|
|--|--|--|
|e|string|元素名|
|t|string/object/array/function|子模板|
|click|function|click事件处理函数|
|style|object|样式表|
|a|object|html属性|
|event|object|事件处理函数定义|







### 数组模板
模板也可以是由字符串模板和对象模板组成的数组。

注意：
1. 当根模板是数组模板时，数据无法正确绑定到节点。

### 数据漫游器
