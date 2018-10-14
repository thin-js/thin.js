# thin.js

## 1. render
### 1.1 用法

    $(selector).({
        data:data,
        template:template
    })

### 1.2 data



### 1.3 template

sample:

    {
        e:"div",    
        t:"<span>这是一个文本模板</span>",
        a:{
            href:"/test.html?name=[[name]]",
            class:function(p){
                    if (p.data.status="在店"){
                        return "class1";
                    }else{
                        return "class2";
                    }
                }
        },
        style:{
            height："100px"
        }
    }


#### 1.3.1 e
指定生成的元素的名称  
#### 1.3.2 t
元素内容模板  
t属性可以是单一模板，也可以是一个模板的数组，当模板是数组时，按顺序逐条生成模板项。  

模板可以有以下三种形式：
##### 串模板

串模板是一段要添加到生成节点中的html文本串，内容中可以使用数据选择器。

##### 子模板

当模板是一个对象时，被识别为子模版，子模版也符合template的约定，可以多层嵌套生成复杂的结构。

##### 自定义渲染器 

当模板是一个函数时，render会调用该函数，实现自定以渲染，函数模板形式

    function（p）{
        {function body}
    }

传入参数中包含两个属性：  

    {
        container : 当前DOM容器  
        data:   需要渲染的数据
    }


#### 1.3.3 a
设置生成的元素的属性  

    a:{
        attribute1:{value1},
        attribute2:{value2}
    }

生成结果类似

    <div attribute1="{value1}" attribute2="{value2}" ></div>

属性值可以是字符串或者函数。  

属性值是字符串时可以在串中使用数据漫游器。
属性值是函数时，render会调用这个函数，并将返回值生成为属性值。

    a:{
        class:function(p){
            {function body}
            return string_returnvalue;
        }
    }

传入参数结构：

    {
        container：{当前DOM容器}，
        data：{绑定数据}
    }


#### 1.3.4 data
数据
#### 1.3.5 datapath
数据节点  
#### 1.3.6 style
设置生成元素的样式
#### 1.3.7 options
在生成的元素下生成options元素及option
#### 1.3.8 selected: 设置选定值  
#### 1.3.9 click
click事件处理函数  
#### 1.3.10 event
添加事件侦听器 

### 1.4 数据选择器
数据选择器格式：  

    [[datapath]]

在文本模板、a属性值、style样式值

### 1.5 已知问题

1. 当data是数组时，根模板中的串模板数据选择器无效。
2. 





## 2. poplayer
## 3. tab
## 4. multiview
