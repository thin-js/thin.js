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

$(function () {
    $(document).on("click", "tab-nav", function () {
        // 标签切换
        $("tab-nav", this.parentElement).removeClass("active");
        $(this).addClass("active");
        var fun = this.getAttribute("function");
        
        // 调用标签函数
        if (fun === null) {
            //console.log("no function");
        } else if (Object.prototype.toString.call(window[fun]) === '[object Function]') {
            window[fun]();
        } else {
            //console.log(Object.prototype.toString.call(window[fun]));
        }
        
        // 视图切换
        var view = this.getAttribute("view");
        if (view !== null) {
            var mv = $(this).parents("multiview");
            //console.log(mv);
            $("view", mv).removeClass("active");
            $("view#" + view, mv).addClass("active");
        }
    });
});

$.fn.extend({

  render: function (p) {
        //console.log({ function: "render_main", p: p });
        //this[0].dmt_render_data = p.data; //将数据附加到容器。

        if (Object.prototype.toString.call(p.template) === '[object Array]') {
            render_by_data({
                container: this[0],
                template: p.template,
                data: p.data
            });
        } else if (Object.prototype.toString.call(p.data) === '[object Array]') {
            render_by_data({
                container: this[0],
                template: p.template,
                data: p.data
            });
        }
        else {
            this[0].dmt_render_data = p.data; //将数据附加到容器。
            render_by_data({
                container: this[0],
                template: p.template
            });
        }



        function render_by_data(p) {
            //console.log({ function: "render_by_data", p: p });
            if (Object.prototype.toString.call(p.data) === '[object Array]') {
                //
                //  数据是数组的场景。
                //
                //console.log("data is array");
                //console.log({
                //    function: "render_by_data",
                //    p: p
                //});
                for (var di = 0; di < p.data.length; di++) {
                    // 逐条数据渲染。

                    render_by_templates({
                        container: p.container,
                        template: p.template,
                        data: p.data[di]
                    });
                }
            } else {
                //console.log("data is not array");
                render_by_templates({
                    container: p.container,
                    template: p.template,
                    data: p.data
                });
            }
        }

        function render_by_templates(p) {
            //console.log({ function: "render_by_templates", p: p });
            if (Object.prototype.toString.call(p.template) === '[object Array]') {
                // 模板是数组的场景。
                //console.log("template is array");
                for (var ti = 0; ti < p.template.length; ti++) {
                    //console.log("for each template");
                    render_template({
                        template: p.template[ti],
                        container: p.container,
                        data: p.data
                    });                      //逐条调用渲染器。
                }
            } else {
                //console.log("template is not array");
                //console.log(p);
                render_template({
                    template: p.template,
                    container: p.container,
                    data: p.data
                });                      //逐条调用渲染器。
            }
        }

        function render_template(p) {
            //console.log({ function: "render_template", p: p });
            if (Object.prototype.toString.call(p.template) === '[object String]') {
                //
                // 模板是字符串的场景
                //
                var content = render_content({
                    template: p.template,
                    container: p.container
                });
                //console.log(content);
                var e = document.createDocumentFragment();
                $(e).append(content);
                //console.log(e.childNodes.length);
                p.container.appendChild(e);
                //for (var ci = 0; ci < e.cloneNode.length; ci++) {
                //    e.childNodes[ci].dmt_render_data = p.data;
                //}
            } else if (Object.prototype.toString.call(p.template) === '[object Object]') {
                //模板是对象的场景
                render_object_template({
                    container: p.container,
                    template: p.template,
                    data: p.data
                });
            } else if (Object.prototype.toString.call(p.template) === '[object Function]') {
                var datacontainer = nearest_datacontainer(p.container);

                p.template({
                    container: p.container,
                    //template: p.template,
                    data: datacontainer.dmt_render_data
                });
            } else {
                // 不支持的场景。
                console.log(Object.prototype.toString.call(p.template));
            }
        }

        //
        // render object
        //
        function render_object_template(p) {

            if (p.template.datapath !== undefined && p.data === undefined) {
                //console.log({ function: "datapath find", p: p });
                var data = datarover({ container: p.container, path: p.template.datapath });
                //console.log(data);
                if (data !== null) {
                    render_by_data({
                        container: p.container,
                        data: data,
                        template: p.template
                    });
                }
            } else {


                //模板是对象的场景
                var element;

                if (p.template.e !== undefined) {
                    element = document.createElement(p.template.e);
                } else {
                    element = document.createElement("div");
                }

                $(p.container).append(element);

                if (p.data !== undefined) {
                    element.dmt_render_data = p.data; //数据附着到当前节点。
                }

                if (p.template.name !== undefined) {
                    element.setAttribute("name", p.template.name);
                }

                // 添加options
                if (p.template.options !== undefined) {
                    if (Object.prototype.toString.call(p.template.options) === '[object Array]') {
                        for (var oi = 0; oi < p.template.options.length; oi++) {
                            element.options.add(new Option(p.template.options[oi]));
                        }
                        //
                    } else if (Object.prototype.toString.call(p.template.options) === '[object Object]') {
                        //
                    } else if (Object.prototype.toString.call(p.template.options) === '[object String]') {
                        var options = p.template.options.split(",");
                        for (var soi = 0; soi < options.length; soi++) {
                            element.options.add(new Option(options[soi]));
                        }
                    }
                }
                // 设置选中值
                if (p.template.selected !== undefined) {
                    var selected_value = render_content({ template: p.template.selected, container: element });
                    $(element).val(selected_value);
                }


                // click 绑定click用户事件处理函数

                if (p.template.click !== undefined) {
                    //console.log({
                    //    function:"add onclick function"
                    //});
                    element.onclick = function () {
                        //console.log("click");
                        var data_container = nearest_datacontainer(this);
                        var new_data = {};
                        
                        //获取全部input的值：
                        $("input", data_container).each(function (i, e) {
                            var name = this.attributes["name"].value;
                            new_data[name] = $(this).val();
                        });
                        //获取全部select的值：
                        $("select", data_container).each(function (i, e) {
                            var name = this.attributes["name"].value;
                            new_data[name] = $(this).val();
                        });
                        
                        //console.log(new_data);
                        p.template.click({
                            sender: this,
                            org_data: data_container.dmt_render_data,
                            new_data: new_data
                        });
                    };
                }


                //  event 绑定事件侦听器

                if (p.template.event !== undefined) {
                    Object.keys(p.template.event).forEach(function (key) {
                        //e.setAttribute(key, template.a[key]);
                        //$(element).on(key, p.template.event[key]); //逐个绑定事件侦听程序
                        $(element).on(key, function (e) {
                            //console.log(e);
                            var data_container = nearest_datacontainer(this);
                            var new_data = new Object;
                            //获取全部input的值：
                            $("input", data_container).each(function (i, e) {
                                var name = this.attributes["name"].value;
                                new_data[name] = $(this).val();
                            });
                            //获取全部select的值：
                            $("select", data_container).each(function (i, e) {
                                var name = this.attributes["name"].value;
                                new_data[name] = $(this).val();
                            });

                            var eventtype = e.type;
                            p.template.event[eventtype]({
                                sender: this,
                                type: eventtype,
                                event: e,
                                org_data: data_container.dmt_render_data,
                                new_data: new_data
                            });
                        });
                    });
                }

                // t 渲染节点的内容
                if (p.template.t !== undefined) {

                    //console.log({ function: "render t", p: p });
                    render_by_templates({
                        container: element,
                        template: p.template.t
                    });
                }

                //a 设置节点attribute
                if (p.template.a !== undefined) {
                    Object.keys(p.template.a).forEach(function (key) {
                        //e.setAttribute(key, template.a[key]);
                        if (Object.prototype.toString.call(p.template.a[key]) === "[object Function]") {
                            var data_container = nearest_datacontainer(element);
                            element.setAttribute(key, p.template.a[key]({
                                container: element,
                                data: data_container.dmt_render_data
                            }));
                        }
                        else {
                            element.setAttribute(key, render_content({
                                template: p.template.a[key],
                                container: element
                            }));
                        }


                    });
                }

                //style 设置节点样式
                if (p.template.style !== undefined) {
                    Object.keys(p.template.style).forEach(function (key) {
                        //e.setAttribute(key, template.a[key]);
                        if (Object.prototype.toString.call(p.template.style[key]) === "[object Function]") {
                            var data_container = nearest_datacontainer(element);
                            element.style.setProperty(key, p.template.style[key]({
                                container: element,
                                data: data_container.dmt_render_data
                            }));
                        }
                        else {
                            element.style.setProperty(key, render_content({
                                template: p.template.style[key],
                                container: element
                            }));
                        }
                    });
                }
            }
        }


        //
        //  根据模板串和数据容器生成字符串
        //
        function render_content(p) {
            var t = p.template;
            //var data = nearest_datacontainer( p.container.dmt_render_data);
            //console.log("render_content");
            var reg = /\[\[[a-zA-Z0-9\./_]*\]\]/gi;
            var result = t.replace(reg, function (m) {     //使用正则表达式匹配变量名
                //逐个匹配项处理；
                var path = m.replace("[[", "").replace("]]", "");
                var patharray = path.split("/");
                //console.log(path); console.log(patharray);
                var data_container = nearest_datacontainer(p.container);
                for (var i = 0; i < patharray.length; i++) {
                    if (patharray[i] === "..") {
                        if (isDOMElement(data_container)) {
                            data_container = nearest_datacontainer(data_container.parentNode);  //上溯节点
                        } else {
                            return m;
                        }
                    } else {
                        if (isDOMElement(data_container)) {  //如果dp是文档节点，则从文档节点中取其包含数据为dp。
                            if (data_container.dmt_render_data === undefined) {
                                return m;
                            } else {
                                data_container = data_container.dmt_render_data;
                            }
                        }
                        if (data_container === null) {
                            return null;
                        } else {
                            data_container = data_container[patharray[i]];
                        }

                    }
                }
                return data_container;
            });
            return result;
        }

        //
        // 查找最近的数据容器
        //
        function nearest_datacontainer(container) {
            while (!container.hasOwnProperty("dmt_render_data")) {
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
            var pa = p.path.split("/");                     //路径数组
            var dp = nearest_datacontainer(p.container);    //找到最近数据容器

            for (var i = 0; i < pa.length; i++) {
                if (pa[i] === "..") {
                    if (isDOMElement(dp)) {
                        dp = nearest_datacontainer(dp.parentNode);  //上溯到上一个数据容器节
                    } else {
                        return null;
                    }
                } else {
                    if (isDOMElement(dp)) {  //如果dp是文档节点，则从文档节点中取其包含数据为dp。
                        if (dp.dmt_render_data === undefined) {
                            return null;
                        } else {
                            dp = dp.dmt_render_data;
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
            return !!(obj && typeof window !== 'undefined' && (obj === window || obj.nodeType));
        }
    }
});


function poplayer(p) {

    //蒙版层
    var popmask = document.createElement("popmask");
    popmask.style = "display:block;position: fixed;top: 0;left: 0;width: 100%;height: 100%;background: rgba(0,0,0,.6);overflow:hidden;";
    //popmask.style.zIndex = maxz + 1; //设置弹出层的zIndax为maxz+1；
    popmask.style.zIndex = 1000;

    //弹出框
    var modaldialog = document.createElement("popdialog");
    modaldialog.style = "display:block;width:40%;position:relative;margin:10% auto 0;border-radius:4px;background:#fff;line-height:24px;overflow:hidden;";
    if (p.width !== undefined) {
        modaldialog.style.width = p.width;
    }
    if (p.height !== undefined) {
        modaldialog.style.height = p.height;
    }
    popmask.appendChild(modaldialog);
    //弹出框-标题
    if (p.header !== undefined) {
        var header = document.createElement("popheader");
        header.style = "display:block;background-color: #81c5ba;padding:0 10px;color:#fff;position:relative;height:50px;line-height:50px;vertical-align:middle;font-size:16px;font-weight:bold;";
        $(header).html(p.header);
        var closeicon = document.createElement("span");
        closeicon.innerText = "✕";
        closeicon.style = "position:absolute;right:10px;top:0;cursor:pointer; color: #000;text-shadow: 0 1px 0 #fff;filter: alpha(opacity=50);opacity: .5;";
        closeicon.onclick = function () {
            //如果定义了onclose回调函数，则调用一下。
            if (p.onclose !== undefined) {
                p.onclose();
            }
            //popmask.remove();
            $(popmask).remove();
        };
        closeicon.onmouseover = function () {
            this.style.filter = "alpha(opacity=80)";
            this.style.opacity = ".8";
        };
        closeicon.onmouseout = function () {
            this.style.filter = "alpha(opacity=50)";
            this.style.opacity = ".5";
        };
        header.appendChild(closeicon);
        modaldialog.appendChild(header);
    }
    //弹出框-内容
    var popcontainer = document.createElement("popbody");
    popcontainer.style = "display:block;padding:5px 10px;";
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
}
