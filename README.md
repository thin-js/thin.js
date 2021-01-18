<!-- TOC -->

- [thin.js 使用文档](#thinjs-使用文档)
  - [1. 开始使用](#1-开始使用)
    - [1.1 添加引用](#11-添加引用)
  - [2. render 渲染器和模板](#2-render-渲染器和模板)
    - [2.1 基本语法](#21-基本语法)
    - [2.2 模板 template](#22-模板-template)
      - [2.2.1 string template 字符串模板](#221-string-template-字符串模板)
      - [2.2.2 element template](#222-element-template)
        - [2.2.2.1 element：生成元素属性](#2221-element生成元素属性)
          - [2.2.1.1.1 使用函数生成属性值](#22111-使用函数生成属性值)
          - [2.2.1.1.2 常用属性快捷方式](#22112-常用属性快捷方式)
        - [2.2.2.2 element: 使用数据](#2222-element-使用数据)
          - [2.2.2.2.1 render 参数的 data 对象](#22221-render-参数的-data-对象)
          - [2.2.2.2.2 element 模板的 datapath/foreach 属性](#22222-element-模板的-datapathforeach-属性)
          - [2.2.2.2.3 element 模板的 data 属性](#22223-element-模板的-data-属性)
          - [2.2.2.2.4 使用数据](#22224-使用数据)
        - [2.2.2.3 element 模板：event 事件处理](#2223-element-模板event-事件处理)
          - [Q&A](#qa)
        - [2.2.2.4 element 模板：style 控制样式](#2224-element-模板style-控制样式)
        - [2.2.2.5 element 模板：timer 添加定时/延时任务](#2225-element-模板timer-添加定时延时任务)
        - [2.2.2.6 element 模板：options 添加option选项值](#2226-element-模板options-添加option选项值)
        - [2.2.2.7 element 模板：value和selected默认值](#2227-element-模板value和selected默认值)
        - [2.2.2.8 element 模板：bind双向数据绑定](#2228-element-模板bind双向数据绑定)
      - [2.2.3 模板：函数](#223-模板函数)
          - [Q&A](#qa-1)
      - [2.2.4 模板：if 结构](#224-模板if-结构)
      - [2.2.5 模板：switch case 结构](#225-模板switch-case-结构)
      - [2.2.6 when 结构](#226-when-结构)
      - [2.2.7 组合模板](#227-组合模板)
  - [3. poplayer 弹出层](#3-poplayer-弹出层)
    - [3.1 基本语法](#31-基本语法)
    - [3.2 poplayer 参数成员](#32-poplayer-参数成员)
    - [3.3 自定义渲染浮层](#33-自定义渲染浮层)
    - [3.4 onclose 回调函数](#34-onclose-回调函数)
    - [3.5 动态关闭 poplayer](#35-动态关闭-poplayer)
  - [4. tab 标签+multiview 多视图切换](#4-tab-标签multiview-多视图切换)
    - [4.1 基本语法](#41-基本语法)
    - [4.2 动态渲染](#42-动态渲染)
    - [Q&A](#qa-2)
  - [5. 简化写法以及补充写法](#5-简化写法以及补充写法)
    - [5.1 简化写法](#51-简化写法)
    - [5.2 handler 写法](#52-handler-写法)
    - [5.3 纯数组的渲染](#53-纯数组的渲染)

<!-- /TOC -->

# thin.js 使用文档

thin.js:一个羽量级的前端框架，基于 html5+css3+jquery。

本文档介绍 thin.js 的使用语法

## 1. 开始使用

### 1.1 添加引用

-   添加对 jquery 的引用,thinjs.com 上的版本为 3.4.1，你也可以从其他源引用 jquery。

```html
<script src="https://com.wf.pub/jquery.js"></script>
```

-   添加对 thin.js 的引用。

```html
<script src="https://com.wf.pub/thin.js"></script>
```

-   如果你用到 render 以外的其他功能，还需要添加对 thin.css 的引用。(可选)

```html
<link rel="stylesheet" href="https://com.wf.pub/thin.css" />
```

## 2. render 渲染器和模板

### 2.1 基本语法

渲染器是一个 jQuery 扩展，语法如下：

```js
$(selector).render({
    data: data,
    template: template
});
```

按照 template 依据 data 渲染到 selector 指定的元素中。

```
data：数据，可以是object或者array类型。
template： 模板
```

### 2.2 模板 template

thin.js 目前可以使用以下六种模板：

-   string template
-   element template
-   模板函数
-   if 结构
-   switch case 结构
-   when 结构
-   前述六种模板组成的数组

#### 2.2.1 string template 字符串模板

```js
var data = {
    name: 'wanfang'
};

$(selector).render({
    data: data,
    template: 'this is [[name]]'
});
```

#### 2.2.2 element template

element 模板本质上是一个包含"e"属性成员的 javascript 对象，可以根据 e 指定的 element name 生成 html 元素，并设置属性、样式、绑定数据、事件。

```js
var data = {
    name: 'wanfang'
};

$(selector).render({
    data: data,
    template: {
        e: 'p',
        t: 'this is [[name]]'
    }
});
```

对象可以有以下成员

| 成员         | 类型                         | 说明                                                                                                         |
| ------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
| e            | string                       | element 元素标签名                                                                                           |
| t            | string,object,array,function | template 子模板                                                                                              |
| id           | string                       | 标签 id                                                                                                      |
| class        | string                       | 标签类名                                                                                                     |
| name         | string                       | 标签的 name 属性                                                                                             |
| style        | object                       | 行内样式表                                                                                                   |
| width/height | string                       | 元素宽/高（与写在 style 无区别）                                                                             |
| a            | object                       | attribute, html 属性（name、src、href......）                                                                |
| click        | function                     | 点击事件处理函数                                                                                             |
| event        | object                       | 事件处理函数                                                                                                 |
| data         | object                       | 数据                                                                                                         |
| datapath     | string                       | 数据路径                                                                                                     |
| foreach      | string                       | 数据循环                                                                                                     |
| bind         |                              | 双向数据绑定                                                                                                 |
| selected     | string                       | 给select下拉选择框设置默认值                                                                                 |
| value        | string                       | 输入项设置值                                                                                                 |
| options      | string，array，object        | 选项值                                                                                                       |
| timer        | object                       | 元素绑定定时/延时任务                                                                                        |
| if           | string,function              | 控制渲染                                                                                                     |
| switch case  | string                       | 控制渲染                                                                                                     |
| when         | string,function              | 控制渲染                                                                                                     |
| title        | string                       | 生成标题标签，当 e=fieldset 时，生成 legend，当 e=field/f1/f2/f3 时在元素内生成 label 标签，e 为其他值是无效 |

##### 2.2.2.1 element：生成元素属性

在 element 模板中可以用 a 属性来控制渲染出的 dom element 的属性。

```js
{
    e:"div",
    a:{
        id:"sampleid",
        class:"sampleclass"
    }
}
```

渲染结果：

```html
<div id="sampleid" class="sampleclass"></div>
```

a 的成员的属性名和值将用作渲染出来的节点的属性名和值。
当需要生成的属性名包含特殊字符时，可以使用引号将属性名包括在内。

```js
a:{
    "data-sample":"sample data"
}
```

使用数据漫游器 a 的成员的值串中可以使用数据漫游器'[[]]'将数据填充到值串中。

```js
a:{
    "data-sample": "[[sample]]"
}
```

###### 2.2.1.1.1 使用函数生成属性值

a 的成员也可是函数，以根据数据生成不同的属性。

<font color=#FF0000>函数需要返回字符串作为生成的属性值。</font>

```js
a:{
    class: function(param) {
        if(param.data.field==="a"){
            return "classa";
        } else{
            return "classb";
        }
    }
}
```

传入参数 param 的结构如下：

```js
{
    container: container,//当前容器
    data: data// 当前容器所绑定的数据
}
```

###### 2.2.1.1.2 常用属性快捷方式

id,name,class 因为经常被使用到，所以可以直接在 element 中用相应的属性设置，<font color=FF000>但是取值不允许使用函数或者数据漫游器，如果需要根据数据决定取值，请使用 a 属性的成员进行设置。</font>

##### 2.2.2.2 element: 使用数据

在 thin.js 中可以用以下三种方式将数据源绑定到模板。

1. render 参数的 data 成员
2. element 模板的 datapath/foreach 属性
3. element 模板的 data 属性

###### 2.2.2.2.1 render 参数的 data 对象

给模板提供数据最常用的方式是作为 render 的参数的 data 成员传入。

```js
$(selector).render({
    data: data,
    template: template
});
```

###### 2.2.2.2.2 element 模板的 datapath/foreach 属性

datapath:

```js
// 对象数组的渲染
var data = {
    arr: [
        {
            name: 'name1'
        },
        {
            name: 'name2'
        },
        {
            name: 'name3'
        },
        {
            name: 'name4'
        }
    ]
};
// datapath 数据绑定
// 渲染的为dapath所在的DOM分支
$(selector).render({
    data: data,
    template: {
        e: 'div',
        // foreach: 'arr',
        t: {
            e: 'p',
            datapath: 'arr',
            t: 'this is [[name]]'
        }
    }
});
```

foreach:

```js
// foreach 数据绑定
// 渲染的为foreach所在的DOM分支的子元素
$(selector).render({
    data: data,
    template: {
        e: 'div',
        foreach: 'arr',
        t: {
            e: 'p',
            // datapath: 'arr',
            t: 'this is [[name]]'
        }
    }
});
```

-   当 datapath/foreach 指向的数据是对象时模板只渲染一次。
-   当 datapath/foreach 指向的数据是数组时模板会对每一行数据渲染一次。
-   当 datapath/foreach 指向的数据为 null 时模板不渲染。

两者的区别：datapath 需绑定在需要数据的元素上；foreach 需要绑定在需要数据元素的父元素上。

###### 2.2.2.2.3 element 模板的 data 属性

```js
// 绑定的数据类型为对象时
$(selector).render({
    data: data,
    template: {
        e: 'div',
        // foreach: 'newData',
        t: {
            e: 'p',
            data: {
                sex: 'woman',
                address: '北京市'
            },
            t: '[[sex]][[address]]'
        }
    }
});
```

###### 2.2.2.2.4 使用数据

-   在字符串模板中使用数据漫游器展示数据：
    所有末级模板都一定是字符串模板，我们可以在字符串模板中用双方括号调用数据漫游器从绑定的数据源中取值。

```js
var data = {
    location: {
        city: '天津'
    }
};
$(selector).render({
    data: data,
    template: {
        e: 'div', // 当前绑定的数据为data
        t: '<p>[[location/city]]</p>' // 根据数据路径，当前绑定的数据为data.location.city = data/location/city
    }
});
```

-   除子模版外，element 模板的 a,style,value,selected 的取值也可以用字符串模板调用数据漫游器生成。

-   在函数模板中使用数据：在函数模板和其他允许使用函数的属性中，thin.js 都会将数据和当前 dom 元素作为参数的成员传递给函数。
##### 2.2.2.3 element 模板：event 事件处理

event : 添加事件侦听器

```js
var data = {
    name: 'wanfang',
    age: '20'
};
$(selector).render({
    data: data,
    template: {
        e: 'form',
        t: [
            {
                e: 'label',
                t: [
                    '姓名：',
                    {
                        e: 'input',
                        a: {
                            name: 'name',
                            type: 'text',
                            value: '[[name]]'
                        }
                    }
                ]
            },
            {
                e: 'label',
                t: [
                    '年龄：',
                    {
                        e: 'input',
                        a: {
                            name: 'age',
                            type: 'text',
                            value: '[[age]]'
                        }
                    }
                ]
            },
            {
                e: 'button',
                a: {
                    type: 'button'
                },
                t: '提交',
                click: function (param) {
                    //因为click事件经常使用，所以不用放在event对象中
                    console.log(param);
                    // {
                    //     event: k.Event {
                    //         originalEvent: MouseEvent,
                    //         type: "click",
                    //         target: button,
                    //         currentTarget: button,
                    //         isDefaultPrevented: ƒ,
                    //         …
                    //     } 事件
                    //     new_data: {//可认为当前表单要提交的数据
                    //         name: "wanfang",
                    //         age: "50"
                    //     }
                    //     org_data: {//初始时对表单传入的数据
                    //         name: "wanfang",
                    //         age: "20"
                    //     }
                    //     sender: button 事件源
                    //     type: "click" 事件类型
                    // }
                },
                event: {
                    dbclick: function (param) {
                        console.log(param);
                    },
                    mouseover: function (param) {
                        console.log(param);
                    }
                }
            }
        ]
    }
});
```

传入的参数结构

| 名称     | 描述     |
| -------- | -------- |
| sender   | 事件源   |
| event    | 事件     |
| type     | 事件类型 |
| org_data | 原始数据 |
| new_data | 新数据   |

###### Q&A
1. Q：事件event中function传入的参数结构和函数模板(例：if:function(param){}、when:function(param){}...)中function的参数结构有何区别?
   
   A：事件中传入参数结构为：
    ```js
    {
        sender:{事件源},
        event:{事件},
        type:{事件类型},
        org_data:{原始数据},
        new_data:{新数据}
    }
    ```
    函数模板中传入参数结构为：
    ```js
    {
        container: 当前绑定的容器,
        data: 当前容器绑定的数据
    }
    ```
    函数模板具体使用情况请参考[2.3 模板：函数](#23-模板函数)

##### 2.2.2.4 element 模板：style 控制样式

style : 设置行间样式

```js
{
    e:"div",
    style:{
        width:"300px",
        height:"100px"
    }
}
```

渲染结果：

```html
<div style="width:300px;height:100px"></div>
```

style 的成员的属性名和值将用作渲染出来的节点的样式的名和值。
当需要生成的属性名包含特殊字符时，可以使用引号将属性名包括在内。

```js
style:{
    "font-size":"14px"
}
```

width / height : 设置宽度和高度

```js
{
   e:"div",
   width:300,
   height:100
}
```

生成结果：

```html
<div style="width:300px;height:100px"></div>
```

width，height 为快捷样式，不用写在 style 里面。

style 的成员也可是函数，以根据数据生成不同的属性。

```js
style:{
    "font-size":function(param){
        if(param.data.field===true){
             return "14px";
        }else{
             return "12px";
        }
    }
}
```

<font color=#FF0000>注：函数需要返回字符串作为生成的样式的值。</font>

##### 2.2.2.5 element 模板：timer 添加定时/延时任务
timer 提供 thin 定时/延时功能

定时 setInterval：

```js
var index = 1;
$(selector).render({
    template: {
        e: 'p',
        t: {
            timer: {
                interval: 1000,
                do: function (param) {
                    console.log(index);
                    index++;
                    if (index > 4) {
                        $(param.container).remove();
                    }
                }
            }
        }
    }
});
```

当定时器绑定的容器被移除时，定时器也会被移除。

延时 setTimeout：

```js
$(selector).render({
    template: {
        e: 'p',
        t: {
            timer: {
                delay: 1000,
                do: function (param) {
                    console.log('我延时了1s');
                }
            }
        }
    }
});
```
##### 2.2.2.6 element 模板：options 添加option选项值
options接收三种参数值object、array、string;
1. object
```js
$(selector).render({
    template: {
        e: 'form',
        t: {
            e: "label",
            t: [
                "性别：",
                {
                    e: 'select',
                    a: {
                        name: "sex",
                    },
                    options: {
                        男: 'man',
                        女: 'woman'
                    }
                }
            ]
        }
    }
});
```
object的key为option标签的text；object的value为option标签的value值。

渲染结果：
```html
<form>
    <label>性别：
        <select name="sex">
            <option value='man'>男</option>
            <option value='woman'>女</option>
        </select>
    </label>
</form>
```
2. array
```js
$(selector).render({
    template: {
        e: 'form',
        t: {
            e: "label",
            t: [
                "性别：",
                {
                    e: 'select',
                    a: {
                        name: "sex",
                    },
                    options: [
                        '男','女'
                    ]
                }
            ]
        }
    }
});
```
该方法只渲染option标签的text属性（不建议使用）。

渲染结果：
```html
<form>
    <label>性别：
        <select name="sex">
            <option>男</option>
            <option>女</option>
        </select>
    </label>
</form>
```
3. string
```js
$(selector).render({
    template: {
        e: 'form',
        t: {
            e: "label",
            t: [
                "性别：",
                {
                    e: 'select',
                    a: {
                        name: "sex",
                    },
                    options: '男,女'
                }
            ]
        }
    }
});
```
该方法只渲染option标签的text属性（不建议使用）。

渲染结果：
```html
<form>
    <label>性别：
        <select name="sex">
            <option>男</option>
            <option>女</option>
        </select>
    </label>
</form>
```
##### 2.2.2.7 element 模板：value和selected默认值
value和selected可以给input和select标签默认值。
```js
var data = {
    name: 'wanfang',
    age: '20',
    sex: 'woman'
};
$(selector).render({
    data: data,
    template: {
        e: 'form',
        t: [{
                e: "label",
                t: [
                    "姓名：",
                    {
                        e: 'input',
                        a: {
                            name: "name",
                            type: 'text'
                        },
                        value: '[[name]]'
                    }
                ]
            },
            {
                e: "label",
                t: [
                    "年龄：",
                    {
                        e: 'input',
                        a: {
                            name: "age",
                            type: 'text'
                        },
                        value: '[[age]]'
                    }
                ]
            },
            {
                e: "label",
                t: [
                    "性别：",
                    {
                        e: 'select',
                        a: {
                            name: "sex",
                        },
                        options: {
                            男: 'man',
                            女: 'woman'
                        },
                        // 对于select标签来说selected和value都可以
                        // selected: '[[sex]]',
                        value: '[[sex]]'
                    }
                ]
            }
        ]
    }
});
```
##### 2.2.2.8 element 模板：bind双向数据绑定
正常情况下事件中打印的org_data永远是传入的绑定数据data。
如果在element模板中使用了bind属性指定了数据路径，则在元素渲染时可以将相应的数据作为dom元素的值渲染出来，同时当dom元素的值发生变化时，thin.js也会用onchange事件捕获，并根据数据路径反向将数据自动更新到数据源中。
```js
var data = {
    name: 'wanfang',
    age: '20'
};
$(selector).render({
    data: data,
    template: {
        e: 'form',
        t: [{
                e: "label",
                t: [
                    "姓名：",
                    {
                        e: 'input',
                        a: {
                            name: "name",
                            type: 'text'
                        },
                        bind: 'name'
                    }
                ]
            },
            {
                e: "label",
                t: [
                    "年龄：",
                    {
                        e: 'input',
                        a: {
                            name: "age",
                            type: 'text'
                        },
                        bind: 'age'
                    }
                ]
            },
            {
                e: 'button',
                a: {
                    type: "button"
                },
                t: "提交",
                click: function (param) { //因为click事件经常使用，所以不用放在event对象中
                    console.log(param);
                    // 如果改变了输入框的值，此时打印org_data为输入框最新的值。说明bind产生效果，改变了原有的data_of_thin
                }
            }
        ]
    }
});
```
#### 2.2.3 模板：函数

模板可以是一个函数，渲染时会将当前位置的 dom 元素和绑定的数据传递给函数，用户可以编写自己的 javascript 代码进行渲染或其他操作。

```js
{
    t: function(param){
        // some code here.
        console.log(param)
    }
}
```
param对象：

| 成员      | 描述           |
| --------- | -------------- |
| container | 当前dom容器    |
| data      | 容器绑定的数据 |

例子：
```js
var data = {
    name: 'test1'
};
$(selector).render({
    data: data,
    template: {
        e: 'div',
        t: {
            e: 'div',
            class: 'test_div',
            t: function (param) {
                console.log(param);
                // {
                //     container：当前dom容器
                //     data：当前容器绑定的数据
                // }
                $(param.container).text(param.data.name);
            }
        }
    }
});
```
###### Q&A
1. Q：函数模板中参数param为什么没有org_data、new_data等属性？
   
   A：org_data、new_data等属性只有在事件event中才会被function(param){}中的param形参传入，其他函数模板结构均为data，container。
#### 2.2.4 模板：if 结构

用于根据条件真假决定使用哪个模板。

```js
{
   if: 布尔表达式|判断函数,
   then: 真模板,
   else: 假模板
}
```

例子：

```js
var data = {
    name: 'test1'
};
$(selector).render({
    data: data,
    template: {
        e: 'div',
        t: {
            if: function (param) {
                return param.data.name === 'test1';
            },
            // if: true,
            then: {
                e: 'p',
                t: '真模板'
            },
            else: {
                e: 'p',
                t: '假模板'
            }
        }
    }
});
```
param对象：

| 成员      | 描述           |
| --------- | -------------- |
| container | 当前dom容器    |
| data      | 容器绑定的数据 |

#### 2.2.5 模板：switch case 结构

switch case 结构

```js
{
    switch:"[[参数]]",
    case:{
        "条件1":"template1",
        "条件2":"template2",
        default:"default template"
    }
}
```

例子：

```js
var data = {
    name: 'test1'
};
$(selector).render({
    data: data,
    template: {
        e: 'div',
        t: {
            switch: '[[name]]',
            case: {
                test1: 'template1',
                test2: 'template2',
                default: 'default template'
            }
        }
    }
});
```
#### 2.2.6 when 结构
when写法可以根据传入的值控制容器是否渲染。也可根据传入的函数进行判断，然会相应是否渲染的值。
```js
// when的使用
var obj = {
    // boolen: ''
    // boolen: '值'
    boolen: true
}
// when
$(selector).render({
    data: obj,
    template: {
        e: 'p',
        t: {
            e: 'span',
            t: 'test',
            // 如果该数据路径值存在且不为空，渲染当前容器；反之不渲染。
            // 也可填入布尔值：true渲染；false不渲染
            when: 'boolen'
            // 也可根据数据进行判断，返回相应渲染结果
            // when: function (r) {
            //     if (r.data.boolen) {
            //         return true;
            //     } else {
            //         return false;
            //     }
            // }
        }
    }
});
```

#### 2.2.7 组合模板

由前述五种模板组成的数组

```js
var data = {
    name: 'test1'
};
$(selector).render({
    data: data,
    template: {
        e: 'div',
        class: 'test_div',
        t: [
            // 字符串模板
            'string template [[name]]',
            // element模板
            {
                e: 'p',
                t: '[[name]]'
            },
            // if模板
            {
                if: function (param) {
                    return param.data.name === 'test1';
                },
                then: '真模板',
                else: '假模板'
            },
            // switch case模板
            {
                switch: '[[name]]',
                case: {
                    test1: 'template1',
                    test2: 'template2',
                    default: 'default template'
                }
            },
            // 函数模板
            function (param) {
                $(param.container).append(param.data.name);
            }
        ]
    }
});
```

```html
<div class="test_div">
    string template test1
    <p>test1</p>
    真模板 template1 test1
</div>
```

## 3. poplayer 弹出层

### 3.1 基本语法

```js
poplayer({
    header: headertext,
    data: data,
    template: template
});
```

template 语法与 render 完全一样。

### 3.2 poplayer 参数成员

| 成员     | 类型     | 描述                                             |
| -------- | -------- | ------------------------------------------------ |
| header   | string   | 弹出框头部展示文字                               |
| height   | string   | 高度                                             |
| width    | string   | 宽度                                             |
| data     |          | 数据                                             |
| template |          | 模板                                             |
| render   | function | 自定义渲染器                                     |
| onclose  | function | 浮层关闭时的回调函数（仅用于浮层右上角按钮关闭） |

### 3.3 自定义渲染浮层

基本写法：

```js
poplayer({
    header: headertext,
    render: function (param) {
        renderFun(param);
    }
});
function renderFun(param) {
    // to render
    // param结构：
    // {
    //     container:{popbodycontainer}
    // }
}
```

简单写法：

```js
poplayer({
    header: headertext,
    render: renderFun
});
function renderFun(param) {
    // to render
    console.log(param);
    // param结构：
    // {
    //     container:{popbodycontainer}
    // }
}
```
<font color=#FF0000>注：poplayer中render函数不属于函数模板。该函数param传入参数只有popbody容器。</font>

### 3.4 onclose 回调函数
```js
var data = {
    name: 'test1',
    arr: [
        {
            name: 'test1',
            age: 18
        },
        {
            name: 'test2',
            age: 18
        },
        {
            name: 'test3',
            age: 18
        },
        {
            name: 'test4',
            age: 18
        }
    ]
};
poplayer({
    data: data,
    header: '弹出框',
    onclose: function () {
        console.log('我关闭了');
    },
    template: {
        e: 'div',
        t: [
            {
                e: 'ul',
                t: {
                    e: 'li',
                    datapath: 'arr',
                    t: '[[name]][[age]]'
                }
            }
        ]
    }
});
```

<font color=#FF0000>注：onclose 只为 poplayer 弹出层右上角关闭按钮的回调函数。其他 jq 操作移出弹出层都不会触发 onclose 事件</font>

### 3.5 动态关闭 poplayer

poplayer 函数会将当前弹出窗口的 jq 对象 renturn 出来。当我们进行操作结束之后想关闭弹窗时可以进行 jq 删除操作。(该操作不会触发 onclose 事件)

```js
var testPop = poplayer({
    data: data,
    header: '弹出框',
    onclose: function () {
        console.log('我关闭了');
    },
    template: {
        e: 'div',
        t: [
            {
                e: 'ul',
                t: {
                    e: 'li',
                    datapath: 'arr',
                    t: '[[name]][[age]]'
                }
            },
            {
                e: 'div',
                t: {
                    e: 'button',
                    t: '关闭',
                    click: function () {
                        testPop.remove();
                    }
                }
            }
        ]
    }
});
```

## 4. tab 标签+multiview 多视图切换

### 4.1 基本语法

```js
$(selector).render({
    data: '',
    template: [
        {
            multiview: [
                {
                    e: 'tab',
                    t: [
                        {
                            e: 'tab-nav',
                            t: 'nav1',
                            a: {
                                class: 'active',
                                view: 'nav1'
                            }
                        },
                        {
                            e: 'tab-nav',
                            t: 'nav2',
                            a: {
                                view: 'nav2'
                            }
                        }
                        // more tab-nav
                    ]
                },
                {
                    e: 'view',
                    t: '1',
                    id: 'nav1',
                    class: 'active'
                },
                {
                    e: 'view',
                    t: '2',
                    id: 'nav2'
                }
                // more view
            ]
        }
    ]
});
```

渲染结构：

```html
<multiview>
    <tab>
        <tab-nav class="active" view="nav1">nav1</tab-nav>
        <tab-nav view="nav2">nav2</tab-nav>
    </tab>
    <view id="nav1" class="active">1</view>
    <view id="nav2">2</view>
</multiview>
```

### 4.2 动态渲染

```js
$(selector).render({
    data: '',
    template: [
        {
            tab: {
                nav: {
                    nav1: {
                        // 自动向浏览器添加哈希路由(可选)
                        // 刷新页面自动调用当前哈希路由的click事件
                        hashpath: '#nav1',
                        click: function () {
                            // 渲染（可异步）
                            $('#show_container').text(1);
                        }
                    },
                    nav2: {
                        hashpath: '#nav2',
                        click: function () {
                            $('#show_container').text(2);
                        }
                    },
                    nav3: {
                        hashpath: '#nav3',
                        click: function () {
                            $('#show_container').text(3);
                        }
                    },
                    nav4: {
                        hashpath: '#nav4',
                        click: function () {
                            $('#show_container').text(4);
                        }
                    }
                },
                // 默认渲染第几个
                default: 2
            }
        },
        {
            e: 'div',
            id: 'show_container'
        }
    ]
});
```

渲染结构：

```html
<div>
    <tab>
        <tab-nav hashpath="#nav1">nav1</tab-nav>
        <tab-nav hashpath="#nav2" class="active">nav2</tab-nav>
        <tab-nav hashpath="#nav3">nav3</tab-nav>
        <tab-nav hashpath="#nav4">nav4</tab-nav>
    </tab>
    <div id="show_container">2</div>
</div>
```

点击时进行渲染，可用于异步渲染。

```js
{
    default: '默认渲染第几个导航',
    hashpath: '给tab-nav添加哈希路由',
    click: '点击事件，在点击事件里面动态渲染内容'
}
```
### Q&A
1. Q：动态渲染中的tab: {}的写法和第五章的简化写法一样么？
   
   A：不一样。动态渲染中的tab: {}为固定语法。
## 5. 简化写法以及补充写法

### 5.1 简化写法

简化之前基本语法：

```js
$(selector).render({
    data: data,
    template: {
        e: 'p',
        t: 'this is [[name]]'
    }
});
```

```js
template:{e:'标签名',t:'html'}
```

简化之后的基本写法：

```js
$(seletor).render({
    data: data,
    template: {
        p: 'this is [[name]]'
    }
});
```

```js
template:{'标签名':'html'}
```

### 5.2 handler 写法

-   closeon 通过事件移除标签

    -   closeon:事件名称（多个事件用,隔开）

        **在哪里写的 closeon，该事件就绑定在哪里**

-   after 将 DOM 树添加到指定选择器之后
    -   after: 'selector'
-   before 将 DOM 树添加到指定选择器之前
    -   before: 'selector'
-   in 将 DOM 树添加到指定选择器之内
    -   in: 'selector'
```js
var testDiv = {
    e: 'ul',
    closeon: 'click', //该点击事件绑定在当前的ul上
    in: '.test_div',
    // before: '.test_div',
    // after: '.test_div',
    t: [
        {
            e: 'li',
            t: '1'
        },
        {
            e: 'li',
            t: '2'
        },
        {
            e: 'li',
            t: '3'
        },
        {
            e: 'li',
            t: '4'
        }
    ]
};
$(selector).render({
    template: {
        e: 'div',
        t: ['<div class="test_div">我是容器</div>', {
            e: 'button',
            t: 'test',
            click: testDiv //点击渲染一组DOM树在指定位置
        }]
    }
});
```
<font color=#FF0000>虚拟DOM树中第一层DOM必须使用基础写法（{e: '标签名',t: html}）,简化写法目前不被支持（{'标签名':html}）</font>

渲染结果

before:

```html
<div class="test_container">
    <div>
        <ul>
            <li>1</li>
            <li>2</li>
            <li>3</li>
            <li>4</li>
        </ul>
        <div class="test_div">我是容器</div>
        测试
    </div>
</div>
```

after:

```html
<div class="test_container">
    <div>
        <div class="test_div">我是容器</div>
        <ul>
            <li>1</li>
            <li>2</li>
            <li>3</li>
            <li>4</li>
        </ul>
        测试
    </div>
</div>
```

in:

```html
<div class="test_container">
    <div>
        <div class="test_div">
            我是容器
            <ul>
                <li>1</li>
                <li>2</li>
                <li>3</li>
                <li>4</li>
            </ul>
        </div>
        测试
    </div>
</div>
```

<font color=#FF0000>click 接收的值为一个虚拟 DOM 树的话，会将当前的 DOM 树 append(默认为 append)到触发 click 事件的当前 DOM 里</font>

### 5.3 纯数组的渲染

对于纯数组而言，我们想遍历数组中的每一项，可以在数据访问器里填写符号 "."。

```js
// 纯数组的渲染
var arr = ['name1', 'name2', 'name3', 'name4', 'name5', 'name6'];
$('.test_container').render({
    data: arr,
    template: {
        e: 'p',
        t: '[[.]]'
    }
});
```

渲染结果：

```html
<div class="test_container">
    <p>name1</p>
    <p>name2</p>
    <p>name3</p>
    <p>name4</p>
    <p>name5</p>
    <p>name6</p>
</div>
```
<!-- ### 5.5 ajax 写法

ajax 写法在 thin.js 中提供 ajax 请求处理

```js
$(selector).render({
    template: {
        e: 'p',
        t: {
            loading: 'loading...', // 请求发送过程中的提示
            ajax: url, // 请求地址
            query: data, // 请求参数
            debug: true, // 控制台是否打印请求结果
            method: 'get', // 请求方式
            success: function (r) {
                // 成功回调
                console.log(r);
            },
            error: function (r) {
                // 失败回调
                console.log(r);
            }
        }
    }
});
``` -->
