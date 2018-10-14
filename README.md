# thin.js
前端框架都太重了，自己写个羽量级的，基于html5+css3+jquery。

## Render
渲染器

        $(selector).render({
          data:data,
          template:template
        });

## poplayer
浮层渲染器

        poplayer({
            data:data,
            template:template
        })
        
## tab 
标签导航

        <tab>
            <tab-nav>item1</tab-nav>
            <tab-nav>item2</tab-nav>
        <tab>
        
## multiview
多视图

        <multiview>
            <view>view 1</view>
            <view>view 2</view>
        </multiview>
