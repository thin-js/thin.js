## poplayer : 弹出浮层

### 使用poplayer渲染浮层

    poplayer({
        header:headertext,
        data:data,
        template:template
    });

template语法与[[render]]完全一样。

### poplayer参数成员
|成员|类型|用途|
|--|--|--|
|header||标题
|width||宽度
|height||高度
|data||数据
|template||模板
|render|function|自定义渲染器|
|onclose|function|当浮层关闭时的回调函数|

### 自定义渲染浮层

    poplayer({
        header:headertext,
        render:function(p){
            //my code here...
        }
    });

渲染函数传入参数结构

    {
        container:{popbodycontainer}
    }

