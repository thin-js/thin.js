# element template

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
|t|string<br/>object<br/>array<br/>function|子模板|
|id|
|class|
|name|string|html name属性|
|style|object|样式表|
|width|
|height|
|title|string|生成标题标签，当e=fieldset时，生成legend，当e=field/f1/f2/f3时在元素内生成label标签，e为其他值是无效
|a|object|html属性|
|click|function|点击事件处理函数|
|event|object|事件处理函数定义|
|data|object|数据
|datapath|string|数据路径
|options|string</br>array</br>object|选项值|
|value||输入项设置值
|selected|string|给select下拉选择框设置选中值，建议用value替代。|
|bind||双向绑定数据

* [[模板 : element : 生成元素属性]]
* [[模板 : element : 使用数据]]
* [[模板 : element : 控制样式]]
* [[模板 : element : 处理事件]]

## 绑定数据源

在thin.js中可以用以下三种方式将数据源绑定到模板。

1. render参数的data成员
2. element模板的datapath属性
3. element模板的data属性

### render参数的data成员
给模板提供数据最常用的方式是作为render的参数的data成员传入。
``` javascript
$(selector).render({
   data:data,
   template:template
});
```

### element模板的datapath属性

还可以使用[[数据漫游器|render/datarover]]将已经绑定的数据的子节点绑定到当前element，常用于将数组绑定到表行节点渲染表格。

* 当datapath指向的数据是对象时模板只渲染一次。
* 当datapath指向的数据是数组时模板会对每一行数据渲染一次。
* 当datapath指向的数据为null时模板不渲染。

``` javascript
$(selector).render({
    data: {
        rows: [
            { field1: "aaa", field2: "bbb" },
            { field1: "ccc", field2: "ddd" }
        ]
    },
    template: {
        e: "table",
        t: {
            e: "tr",
            datapath: "rows",
            t: [
                "<td>[[field1]]</td><td>[[field2]]</td>"
            ]
        }
    }
})
```

### element模板的data属性
还可以通过子element模板的data属性将数据注入子模版。

``` javascript
{
    e: "option",
    data: [
        { city: "上海" },
        { city: "北京" },
        { city: "武汉" }
    ],
    t: "[[city]]"
}

```



## 使用数据
### 在字符串模板中使用数据漫游器展示数据
所有末级模板都一定是字符串模板，我们可以在字符串模板中用双方括号调用数据漫游器从绑定的数据源中取值。
``` javascript
"<td>[[localtion/city]]</td>"
```

除子模版外，element模板的a,style,value,selected的取值也可以用字符串模板调用数据漫游器生成。

### 在函数模板中使用数据

在函数模板和其他允许使用函数的属性中，thin.js都会将数据和当前dom元素作为参数的成员传递给函数。

### 使用bind属性实现双向数据绑定

如果在element模板中使用了bind属性指定了数据路径，则在元素渲染时可以将相应的数据作为dom元素的值渲染出来，同时当dom元素的值发生变化时，thin.js也会用onchange事件捕获，并根据数据路径反向将数据自动更新到数据源中。
``` javascript
var data={name:"lee",age:"16"};  
$("container").render({
   data:data,
   template:{e:"form",t:[
      {e:"input",bind:"name"},
      {e:"input",bind:"age"}
   ]}
});
```


### 在事件中使用数据
在click事件以及用event捕获的其他事件中，thin.js会将触发事件的dom元素、原始数据以及输入的新数据传给事件处理函数。
参见 [[模板 : element : 处理事件]]


## 事件绑定

### click : 绑定click事件处理函数

    {
        e:"a",
        t:"click sample",
        click:function(p){
            alert("hi!");
        }
    }


传入参数结构

    {
        sender:{事件引发元素},
        org_data:{原始数据},
        new_data:{新数据}
    }

### event : 添加事件侦听器
``` javascript
    {
        e:"div",
        t:"event sample",
        event:{
            click:function(p){
                alert("click");
            },
            dblclick:function(p){
                alert("dblclick");
            }
        }
    }
```
event的成员名作为侦听的事件名，值函数作为event handler。

handler的传入参数结构如下：
``` javascript
    {
        sender:{事件源},
        event:{事件},
        type:{事件类型},
        org_data:{原始数据},
        new_data:{新数据}
    }
```

## 设置样式

### class : 设置class

``` JavaScript
{
   e:"div",
   class:"sample"
}
```
生成结果

``` html
<div class=sample></div>
```

### width / height : 设置宽度和高度
``` JavaScript
{
   e:"div",
   width:300,
   height:100
}
```
生成结果

``` html
<div style="width:300px;height:100px"></div>
```

### style : 设置行间样式
``` JavaScript
    {
        e:"div",
        style:{
            width:"300px",
            height:"100px"
        }
    }
```
渲染结果
``` html    
    <div style="width:300px;height:100px"></div>
```
style的成员的属性名和值将用作渲染出来的节点的样式的名和值。

当需要生成的属性名包含特殊字符时，可以使用引号将属性名包括在内。
``` javascript
     style:{
          "font-size":"14px"
     }
```
style的成员也可是函数，以根据数据生成不同的属性。
``` javascript
     a:{
         "font-size":function(p){
              if(p.data.field==="a"){
                   return "14px";
              }else{
                   return "12px";
              }
         }
     }
```
传入参数的结构如下：
``` javascript
     { container:container,data:data}
```
函数需要返回字符串作为生成的样式的值。


## 生成成员属性

### a : 设置属性

在element模板中可以用a属性来控制渲染出的dom element的属性。

#### 用法

``` javascript
    {
        e:"div",
        a:{
            id:"sampleid",
            class:"sampleclass"
        }
    }
```

渲染结果
``` html    
    <div id="sampleid" class="sampleclass"></div>
```

a的成员的属性名和值将用作渲染出来的节点的属性名和值。

当需要生成的属性名包含特殊字符时，可以使用引号将属性名包括在内。

     a:{
          "data-sample":"sample data"
     }
#### 使用数据漫游器
a的成员的值串中可以使用数据漫游器将数据填充到值串中。

#### 使用函数生成属性值
a的成员也可是函数，以根据数据生成不同的属性。

     a:{
         class:function(p){
              if(p.data.field==="a"){
                   return "classa";
              }else{
                   return "classb";
              }
         }
     }

传入参数的结构如下：

     { container:container,data:data}

函数需要返回字符串作为生成的属性值。

### 常用属性快捷方式
id,name,class因为经常被使用到，所以可以直接在element中用相应的属性设置，但是取值不允许使用函数或者数据漫游器，如果需要根据数据决定取值，请使用a属性的成员进行设置。