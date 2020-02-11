/*  thin.js - a light-weight web front-end framework,
    
    Copyright (C)2018, Li Wei
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

// 常用缩写 c=container,t=template,d=data;


// V1.1

$(function() {
    $(document).on("click", "tab-nav", function() {
        // 标签切换
        $("tab-nav", this.parentElement).removeClass("active");
        $(this).addClass("active");

        // 调用标签函数
        let fun = this.getAttribute("function");
        if (typeof(window[fun]) === "function") { window[fun](); }

        // 视图切换
        var view = this.getAttribute("view");
        if (view !== null) {
            var mv = $(this).parents("multiview:first");
            $("view", mv).removeClass("active");
            $("view#" + view, mv).addClass("active");
        }
    });
});

$.fn.extend({
    render: function(p) {
        if (p.data === undefined) { p.data = {}; }

        if (Array.isArray(p.template) || Array.isArray(p.data) || Object.prototype.toString.call(p.template) === "[object Object]") {
            render_by_data({
                c: this[0],
                t: p.template,
                d: p.data
            });
        } else {
            this[0].data_of_thin = p.data; //将数据附加到容器。
            render_by_templates({ c: this[0], t: p.template });
        }

        function render_by_data(p) {
            if (Array.isArray(p.d)) {
                //  数据是数组的场景。
                p.d.forEach(d => {
                    render_by_templates({ c: p.c, t: p.t, d: d });
                });
            } else {
                render_by_templates({ c: p.c, t: p.t, d: p.d });
            }
        }

        function render_by_templates(p) {
            if (Array.isArray(p.t)) {
                // 模板是数组的场景。
                p.t.forEach((t) => { render_template({ t: t, c: p.c, d: p.d }); }); //逐条调用渲染器。   
            } else {
                render_template({ t: p.t, c: p.c, d: p.d });
            }
        }

        function render_template(p) {
            if (typeof(p.t) === "string") {
                // 模板是字符串的场景
                let e = document.createDocumentFragment();
                $(e).append(render_content({ t: p.t, c: p.c }));
                p.c.appendChild(e);
            } else if (Object.prototype.toString.call(p.t) === "[object Object]") {
                //模板是对象的场景
                render_object_template({ c: p.c, t: p.t, d: p.d });
            } else if (typeof(p.t) === "function") {
                let datacontainer = nearest_datacontainer(p.c);
                p.t({
                    container: p.c,
                    data: datacontainer ? datacontainer.data_of_thin : undefined
                });
            } else {
                // 不支持的场景。
                console.log(Object.prototype.toString.call(p.t));
            }
        }

        function render_object_template(p) {
            if (p.t.datapath !== undefined && p.d === undefined) {
                let data = datarover({
                    container: p.c,
                    path: p.t.datapath
                });
                if (data !== null) {
                    render_by_data({ c: p.c, d: data, t: p.t });
                }
            } else {
                if (p.t.if !== undefined) {
                    // if 模板
                    switch (typeof(p.t.if)) {
                        case "function":
                            if (p.t.if({
                                    container: p.c,
                                    data: p.t.data ? p.t.data : p.data
                                })) {
                                render_by_templates({
                                    c: p.c,
                                    t: p.t.then
                                });
                            } else {
                                if (p.t.else) render_by_templates({
                                    c: p.c,
                                    t: p.t.else
                                });
                            };
                            break;
                        default:
                            if (p.t.if) {
                                render_by_templates({
                                    c: p.c,
                                    t: p.t.then
                                });
                            } else {
                                if (p.t.else) render_by_templates({
                                    c: p.c,
                                    t: p.t.else
                                });
                            };
                            break;
                    }
                } else if (p.t.switch !== undefined) {
                    //swtich 模板
                    let v = (typeof(p.t.switch) === "function" ?
                        p.t.switch({
                            container: p.c,
                            data: p.t.data ? p.t.data : p.data
                        }) :
                        render_content({ t: p.t.switch, c: p.c }));
                    if (p.t.case === undefined) {} else if (p.t.case[v] !== undefined) {
                        render_by_templates({
                            c: p.c,
                            t: p.t.case[v]
                        });
                    } else if (p.t.case.default !== undefined) {
                        render_by_templates({
                            c: p.c,
                            t: p.t.case.default
                        });
                    }
                } else if (p.t.foreach !== undefined) {
                    let d = null;
                    if (typeof(p.t.foreach) === 'function') {
                        d = p.t.foreach({ container: p.c, data: p.d });
                    } else if (typeof(p.t.foreach) === 'string') {
                        d = datarover({
                            container: p.c,
                            path: p.t.foreach
                        });
                    } else if (Array.isArray(p.t.foreach)) {
                        d = p.t.foreach
                    }
                    if (d) render_by_data({ c: p.c, d: d, t: p.t.t });
                } else {
                    // e 模板
                    if (p.c) render();
                }

                function render() {
                    //模板是对象的场景
                    let element = document.createElement(p.t.e ? p.t.e : "div");
                    let data_container = nearest_datacontainer(element);
                    p.c.appendChild(element);

                    if (p.t.data) {
                        element.data_of_thin = p.t.data;
                    } else if (p.d !== undefined) {
                        element.data_of_thin = p.d; //数据附着到当前节点。
                    }

                    if (p.t.name !== undefined) { element.setAttribute("name", p.t.name); }
                    if (p.t.id !== undefined) { element.setAttribute("id", p.t.id); } //V1.1 设置ID
                    if (p.t.class !== undefined) { element.setAttribute("class", p.t.class); } //V1.1 设置class
                    if (p.t.width !== undefined) { element.style.setProperty("width", typeof p.t.width === "number" ? p.t.width + "px" : p.t.width); } //V1.1 设置宽度
                    if (p.t.height !== undefined) { element.style.setProperty("height", typeof p.t.height === "number" ? p.t.height + "px" : p.t.height); } //V1.1 设置高度

                    // 添加options
                    if (p.t.options !== undefined) {
                        if (Array.isArray(p.t.options)) {
                            p.t.options.forEach(o => { element.options.add(new Option(o)); })
                        } else if (typeof(p.t.options) === "string") {
                            p.t.options.split(",").forEach(o => { element.options.add(new Option(o)); })
                        }
                    }
                    // 设置选中值
                    if (p.t.selected !== undefined) {
                        $(element).val(render_content({ t: p.t.selected, c: element }));
                    }

                    //V1.1 设置值
                    if (p.t.value !== undefined) {
                        $(element).val(render_content({ t: p.t.value, c: element }));
                    }
                    //V1.1 数据绑定
                    if (p.t.bind) {
                        //let data_container = nearest_datacontainer(element);
                        if (data_container) {
                            let data = data_container.data_of_thin;
                            let patharray = p.t.bind.split('/');
                            for (let i = 0; i < patharray.length - 1; i++) {
                                data = data[patharray[i]];
                            }
                            $(element).val(data[patharray[patharray.length - 1]]);
                            $(element).on("change", (e) => {
                                let data = data_container.data_of_thin;
                                for (let i = 0; i < patharray.length - 1; i++) {
                                    if (!data[patharray[i]]) {
                                        data[patharray[i]] = {}
                                    };
                                    data = data[patharray[i]];
                                }
                                data[patharray[patharray.length - 1]] = $(element).val();
                                console.log(data_container.data_of_thin);
                            });
                        }
                    }

                    // click 绑定click用户事件处理函数

                    if (p.t.click !== undefined) {
                        element.onclick = function() {
                            let data_container = nearest_datacontainer(this);
                            let new_data = {};
                            if (data_container !== null) {
                                //获取全部input的值：
                                $("input", data_container).each(function(i, e) {
                                    if (this.attributes["name"] !== undefined) {
                                        let name = this.attributes["name"].value;
                                        new_data[name] = $(this).val();
                                    }
                                });
                                //获取全部select的值：
                                $("select", data_container).each(function(i, e) {
                                    if (this.attributes["name"] !== undefined) {
                                        let name = this.attributes["name"].value;
                                        new_data[name] = $(this).val();
                                    }
                                });
                                //获取全部textarea的值：
                                $("textarea", data_container).each(function(i, e) {
                                    if (this.attributes["name"] !== undefined) {
                                        let name = this.attributes["name"].value;
                                        new_data[name] = $(this).val();
                                    }
                                });
                            }
                            p.t.click({
                                sender: this,
                                org_data: data_container.data_of_thin,
                                new_data: new_data
                            });
                        };
                    }

                    //  event 绑定事件侦听器

                    if (p.t.event !== undefined) {
                        Object.keys(p.t.event).forEach(function(key) {
                            $(element).on(key, function(e) {
                                let data_container = nearest_datacontainer(this);
                                let new_data = new Object();
                                //获取全部input的值：
                                $("input", data_container).each(function(i, e) {
                                    if (this.attributes["name"] !== undefined) {
                                        let name = this.attributes["name"].value;
                                        new_data[name] = $(this).val();
                                    }
                                });
                                //获取全部select的值：
                                $("select", data_container).each(function(i, e) {
                                    if (this.attributes["name"] !== undefined) {
                                        let name = this.attributes["name"].value;
                                        new_data[name] = $(this).val();
                                    }
                                });
                                //获取全部textarea的值：
                                $("textarea", data_container).each(function(i, e) {
                                    if (this.attributes["name"] !== undefined) {
                                        let name = this.attributes["name"].value;
                                        new_data[name] = $(this).val();
                                    }
                                });

                                p.t.event[e.type]({
                                    sender: this,
                                    type: e.type,
                                    event: e,
                                    org_data: data_container.data_of_thin,
                                    new_data: new_data
                                });
                            });
                        });
                    }

                    // V1.1
                    switch (p.t.e) {
                        case "fieldset":
                            // V1.1 增加当e为fieldset时对title属性的支持
                            if (p.t.title) {
                                let legend = document.createElement("legend");
                                legend.innerText = render_content({ t: p.t.title, c: element });
                                element.appendChild(legend);
                            }
                            break;

                        case "field":
                        case "f1":
                        case "f2":
                        case "f3":
                            //V1.1 增加当e为field/f1/f2/f3时对title属性的支持
                            if (p.t.title) {
                                let label = document.createElement("label");
                                label.innerText = render_content({ t: p.t.title, c: element });
                                element.appendChild(label);
                            }
                            break;
                        default:
                            break;
                    }

                    // t 渲染节点的内容
                    if (p.t.t !== undefined) render_by_templates({ c: element, t: p.t.t });

                    //a 设置节点attribute
                    if (p.t.a !== undefined) {
                        Object.keys(p.t.a).forEach(function(key) {
                            if (typeof(p.t.a[key]) === "function") {
                                //let data_container = nearest_datacontainer(element);
                                element.setAttribute(
                                    key,
                                    p.t.a[key]({
                                        container: element,
                                        data: data_container ? data_container.data_of_thin : null
                                    })
                                );
                            } else {
                                element.setAttribute(
                                    key,
                                    render_content({
                                        t: p.t.a[key],
                                        c: element
                                    })
                                );
                            }
                        });
                    }

                    //style 设置节点样式
                    if (p.t.style !== undefined) {
                        Object.keys(p.t.style).forEach(function(key) {
                            if (typeof(p.t.style[key]) === "function") {
                                //let data_container = nearest_datacontainer(element);
                                element.style.setProperty(
                                    key,
                                    p.t.style[key]({
                                        container: element,
                                        data: data_container.data_of_thin
                                    })
                                );
                            } else {
                                element.style.setProperty(
                                    key,
                                    render_content({
                                        t: p.t.style[key],
                                        c: element
                                    })
                                );
                            }
                        });
                    }
                }
            }
        }

        //
        //  根据模板串和数据容器生成字符串
        //
        function render_content(p) {
            var t = p.t;
            var reg = /\[\[[a-zA-Z0-9\-\./_]*\]\]/gi;
            var result =
                typeof t !== "string" ?
                t :
                t.replace(reg, function(m) {
                    //使用正则表达式匹配变量名
                    //逐个匹配项处理；
                    var path = m.replace("[[", "").replace("]]", "");
                    var patharray = path.split("/");
                    var data_container = nearest_datacontainer(p.c);
                    for (var i = 0; i < patharray.length; i++) {
                        if (patharray[i] === "..") {
                            if (isDOMElement(data_container)) {
                                data_container = nearest_datacontainer(
                                    data_container.parentNode
                                ); //上溯节点
                            } else {
                                return m;
                            }
                        } else {
                            if (isDOMElement(data_container)) {
                                //如果dp是文档节点，则从文档节点中取其包含数据为dp。
                                if (data_container.data_of_thin === undefined) {
                                    return m;
                                } else {
                                    data_container = data_container.data_of_thin;
                                }
                            }
                            if (data_container === null) {
                                return null;
                                //return "";
                            } else {
                                data_container = data_container[patharray[i]];
                            }
                        }
                    }
                    if (data_container === null || data_container === undefined) {
                        return "";
                    } else {
                        return data_container;
                    }
                });
            return result;
        }

        //
        // 查找最近的数据容器
        //
        function nearest_datacontainer(container) {
            while (!container.hasOwnProperty("data_of_thin")) {
                if (container.parentNode === null) return null;
                container = container.parentNode;
            }
            return container;
        }

        // @param  { any } p  参数
        //    p.path      { sting } 查找路径
        //    p.container { HTMLElement } 数据容器
        // @return { any } 返回查找到的数据数据
        function datarover(p) {
            let pa = p.path.split("/"); //路径数组
            let dp = nearest_datacontainer(p.container); //找到最近数据容器

            for (let i = 0; i < pa.length; i++) {
                if (pa[i] === "..") {
                    if (isDOMElement(dp)) {
                        dp = nearest_datacontainer(dp.parentNode); //上溯到上一个数据容器节
                    } else {
                        return null;
                    }
                } else {
                    if (isDOMElement(dp)) {
                        //如果dp是文档节点，则从文档节点中取其包含数据为dp。
                        if (dp.data_of_thin === undefined) {
                            return null;
                        } else {
                            dp = dp.data_of_thin;
                        }
                    }
                    if (dp === null) {
                        return null;
                    }
                    if (pa[i] in dp) {
                        dp = dp[pa[i]];
                    } else {
                        return null;
                    }
                }
            }
            return dp;
        }

        // 判断一个对象是否dom element;
        function isDOMElement(obj) {
            return !!(obj && typeof window !== "undefined" && (obj === window || obj.nodeType));
        }
    }
});

//弹窗
function poplayer(p) {
    //蒙版层
    var popmask = document.createElement("popmask");
    popmask.style.zIndex = 1000;

    //弹出框
    var modaldialog = document.createElement("popdialog");
    modaldialog.style.width = (typeof p.width === 'number') ? p.width + "px" : p.width;
    popmask.appendChild(modaldialog);
    //弹出框-标题
    var header;
    if (p.header !== undefined) {
        header = document.createElement("popheader");
        $(header).html(p.header);
        var closeicon = document.createElement("closeicon");
        closeicon.innerText = "✕";
        closeicon.onclick = function() {
            //如果定义了onclose回调函数，则调用一下。
            if (p.onclose !== undefined) {
                p.onclose();
            }
            $(popmask).remove();
        };
        closeicon.onmouseover = function() {
            this.style.filter = "alpha(opacity=80)";
            this.style.opacity = ".8";
        };
        closeicon.onmouseout = function() {
            this.style.filter = "alpha(opacity=50)";
            this.style.opacity = ".5";
        };
        header.appendChild(closeicon);
        modaldialog.appendChild(header);
    }
    //弹出框-内容
    var popcontainer = document.createElement("popbody");

    switch (typeof p.height) {
        case "string":
            popcontainer.style.height = p.height;
            break;
        case "number":
            popcontainer.style.height = p.height + "px";
            break;
        default:
            popcontainer.style.maxHeight = "600px";
            break;
    }
    popcontainer.style.overflowY = "scroll";

    modaldialog.appendChild(popcontainer);
    document.body.appendChild(popmask);

    if (p.render !== undefined) {
        p.render({ container: popcontainer });
    } else {
        $(popcontainer).render({
            data: p.data,
            template: p.template
        });
    }
    //绑定拖拽
    popDrag(header, modaldialog);
}

poplayer.close = function(element) {
    //tobe done
    console.log({ pos: "poplayer.close", element: element });
};

//拖拽函数
function popDrag(bar, target, callback) {
    //拖动事件参数对象
    var popDragParams = {
        left: 0,
        top: 0,
        currentX: 0,
        currentY: 0,
        flag: false,
        resetPosition: function() {
            //console.log(this);
            var target_style_left = $(target).css("left");
            var target_style_top = $(target).css("top");
            if (target_style_left !== "auto") {
                this.left = target_style_left;
            }
            if (target_style_top !== "auto") {
                this.top = target_style_top;
            }
        }
    };
    popDragParams.resetPosition();
    bar.onmousedown = function(event) {
        popDragParams.flag = true;
        if (!event) {
            event = window.event;
            //防止IE文字选中
            bar.onselectstart = function() {
                return false;
            };
        }
        var e = event;
        popDragParams.currentX = e.clientX;
        popDragParams.currentY = e.clientY;
    };
    document.onmouseup = function() {
        popDragParams.flag = false;
        popDragParams.resetPosition();
    };
    document.onmousemove = function(event) {
        var e = event ? event : window.event;
        if (popDragParams.flag) {
            var nowX = e.clientX,
                nowY = e.clientY;
            var disX = nowX - popDragParams.currentX,
                disY = nowY - popDragParams.currentY;
            target.style.left = parseInt(popDragParams.left) + disX + "px";
            target.style.top = parseInt(popDragParams.top) + disY + "px";

            if (typeof callback == "function") {
                callback(
                    (parseInt(popDragParams.left) || 0) + disX,
                    (parseInt(popDragParams.top) || 0) + disY
                );
            }

            if (event.preventDefault) { event.preventDefault(); }
            return false;
        }
    };
};