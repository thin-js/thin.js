"use strict"
var thin = function(selector, context = document) {
    let elements;
    if (typeof selector === 'function') {
        return thin.ready(selector);
    } else {
        if (typeof selector === 'string') {
            elements = context.querySelectorAll(selector);
        } else if (selector.nodeType) {
            elements = [selector]
        } else if (selector.length) {
            elements = selector
        }
        //附加扩展接口
        Object.assign(elements, thin.fn);

        //附加each接口
        elements.each = function(callback) {
            for (let i = 0; i < elements.length; i++) {
                callback(i, elements[i]);
            }
        }
        return elements;
    }
};


thin.fn = {} //selector函数容器，由extend填充，并由selector附加到结果集中。

thin.fn.extend = function(ext) {
    Object.assign(thin.fn, ext)
};

thin.onready = [];
window.addEventListener("load", ev => {
    while (thin.onready.length) {
        thin.onready.shift()();
    }
});

thin.ready = (onready) => { thin.onready.push(onready); };


thin.cookie = function(cname) {
    let name = cname + "=";
    let cookiearray = decodeURIComponent(document.cookie).split(";");
    for (var i = 0; i < cookiearray.length; i++) {
        var c = cookiearray[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
};

// thin.setCookie = function(cname, cvalue, exdays) {
//     var d = new Date();
//     d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
//     var expires = "expires=" + d.toUTCString();
//     document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
// }


thin.ajax = function(options) {

    options.dataType = options.dataType || "json";
    options.type = options.type || "POST";

    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState != 4) {} else if (xhr.status == 200) {
            let d = xhr.responseText;
            switch (options.dataType) {
                case "json":
                    options.success(JSON.parse(d), xhr.statusText, xhr);
                    break;
                default:
                    options.success(d, xhr.statusText, xhr)
                    break;
            }
        } else if (xhr.status != 200) {
            //console.log({ readyState: xhr.readyState, status: xhr.status, xhr: xhr });
            try { xhr.responseJSON = JSON.parse(xhr.responseText); } catch (ex) {
                console.log({ ex })
            };
            options.error(xhr, xhr.statusText);
        }
    }

    switch (options.type.toUpperCase()) {
        case "POST":
            //console.log(options);
            xhr.open(options.type, options.url, true);
            xhr.setRequestHeader('Content-Type', options.contentType);
            switch (options.contentType) {
                case "application/x-www-form-urlencoded":
                    xhr.send(thin.serialize(options.data));
                    break;
                default:
                    //console.log(options.contentType);
                    xhr.send(options.data);
                    break;
            }
            break;
        default:
        case "GET":
            //console.log({ pos: "GET", options })
            xhr.open(options.type, options.url, true);
            xhr.send();
            break;
    }
}



thin.serialize = function(obj) {
    let arr = [];
    for (let key in obj) {
        arr.push(key + "=" + (typeof(obj[key]) == 'object' ? JSON.stringify(obj[key]) : obj[key]));
    }
    return arr.join('&');
}

thin.append = function(container, content) {
    if (typeof content === 'string') {
        //console.log({ container, content })
        let wrapper = document.createElement(container.nodeName);
        let fr = document.createDocumentFragment();
        fr.append(content);
        wrapper.innerHTML = content;
        //console.log({ wrapper, fr, content });
        wrapper.childNodes.forEach(node => {
            container.appendChild(node.cloneNode(true));
        });
    } else if (content.nodeType) {
        container.appendChild(content);
    } else if (content.length) {
        content.forEach(node => {
            container.appendChild(node)
        });
    }
};

thin.collectdata = function(container) {
    let data = {};
    if (container) thin("input,textarea,select", container).each((i, e) => {
        if (e.name) { data[e.name] = e.value };
    });
    return data;
}

thin.pop = function(p, data) {
    let popmask = document.createElement("popmask");
    popmask.style.zIndex = 1000;
    if (p.onclose) popmask.onclose = p.onclose;
    let modaldialog = document.createElement("popdialog");
    var popcontainer = document.createElement("popbody"); //弹出框-内容
    if (typeof p.width === 'number') p.width += "px";
    modaldialog.style.width = p.width || "800px";
    if (typeof p.height === 'number') p.height += "px";
    modaldialog.style.height = p.height || "600px";
    //popcontainer.style.overflowY = "scroll";
    popmask.appendChild(modaldialog);

    let header = document.createElement("popheader"); //弹出框-标题

    header.onmousedown = function(ev) {
        var pos_offset = { x: modaldialog.offsetLeft - ev.clientX, y: modaldialog.offsetTop - ev.clientY };
        document.addEventListener("mouseup", mouseup);
        document.addEventListener("mousemove", mousemove);

        function mousemove(ev) {
            modaldialog.style.left = (pos_offset.x + ev.clientX) + "px";
            modaldialog.style.top = (pos_offset.y + ev.clientY) + "px";
        }

        function mouseup(ev) {
            document.removeEventListener("mousemove", mousemove);
            document.removeEventListener("mouseup", mouseup);
        }
    }

    header.innerText = p.header || "untitled";
    let closeicon = document.createElement("closeicon");
    closeicon.innerText = "✕";
    closeicon.onclick = function() {
        thin.popclose(this);
    }
    header.appendChild(closeicon);
    modaldialog.appendChild(header);
    modaldialog.appendChild(popcontainer);
    document.body.appendChild(popmask);

    if (p.render !== undefined) {
        p.render({ container: popcontainer, data: data || p.data });
    } else {
        thin(popcontainer).render(p.template, data || p.data);
    };
}
var poplayer = thin.pop; //兼容V1

thin.popclose = function(context) {
    let container = context;
    while (container.parentNode !== undefined && container.tagName !== 'POPMASK') {
        container = container.parentNode;
    }
    if (container) {
        if (container.onclose) container.onclose();
        container.parentNode.removeChild(container);
    }
}

thin.rerender = function(context, id) {
    let container = context;

    while (container.thin_query === undefined) { container = container.parentNode } //向上遍历查找最近的render锚点。
    container.innerHTML = "";
    console.log({ context, container });
    thin.render_by_template(container, container.thin_template);
}


thin.render_by_template = function(container, template) {
    if (Array.isArray(template)) {
        template.forEach(t => { thin.render_by_template(container, t) })
    } else if (typeof template === 'string') {
        render_string_template(container, template)
    } else if (template.field) {
        field_template(container, template);
    } else if (template.e) {
        element_template();
    } else if (typeof template === 'function') {
        template({ container: container, data: nearest_data(container) });
    } else if (template.if !== undefined && template.e === undefined) {
        if_template(container, template);
    } else if (template.switch !== undefined) {
        switch_template(container, template);
    } else if (template.foreach !== undefined) {
        foreach_template(container, template);
    } else if (template.ajax) {
        ajax_template();
    } else if (template.multiview) {
        multiview_template(container, template);
    } else if (template.template) {
        v1_template(container, template);
    } else if (template.table) {
        table_template();
    } else {
        console.log({ error: "unknow template", template: template });
    }

    function v1_template(container, template) { //提供对V1模板写法的兼容性。
        template.template.data = template.template.data || template.data
        thin.render_by_template(container, template.template);
    }

    function if_template(container, template) {
        if ((typeof template.if === 'function') ? template.if({ container: container, data: nearest_data(container) }) : template.if) {
            thin.render_by_template(container, template.then);
        } else {
            if (template.else) { thin.render_by_template(container, template.else) };
        };
    }

    function foreach_template(container, template) {
        if (typeof(template.foreach) === 'function') {
            template.t.data = template.foreach;
            thin.render_by_template(container, template.t);
        } else if (typeof(template.foreach) === 'string') {
            template.t.datapath = template.foreach;
            thin.render_by_template(container, template.t);
        } else if (Array.isArray(template.foreach)) {
            template.t.data = template.foreach;
            thin.render_by_template(container, template.t);
        }
    }


    function switch_template(container, template) {
        let v = render_content(container, template.switch);
        if (template.case === undefined) {

        } else if (template.case[v] !== undefined) {
            thin.render_by_template(container, template.case[v]);
        } else if (template.case.default !== undefined) {
            thin.render_by_template(container, template.case.default);
        }
    }

    function multiview_template(container, template) {
        //console.log({ container: container, template: template })
        let mv = document.createElement("multiview");
        let tab = document.createElement("tab");
        mv.appendChild(tab);
        let viewcontainer = document.createElement("viewcontainer");
        mv.appendChild(viewcontainer);
        container.appendChild(mv);

        if (Array.isArray(template.multiview)) {
            template.multiview.forEach(view => {
                if (view.if === undefined) {
                    renderview(view);
                } else if (typeof view.if === 'function') {
                    if (view.if(container, nearest_data(container))) { renderview(view) }
                } else if (view.if) renderview(view);

                function renderview(view) {
                    let tabnav = document.createElement("tab-nav");
                    tabnav.innerText = view.view;
                    tab.appendChild(tabnav);
                    tabnav.addEventListener("click", ev => {
                        render_view(viewcontainer, view.t);
                    });
                }
            });
            tab.childNodes[0].classList.add("active");
            render_view(viewcontainer, template.multiview[0].t);
        } else {
            for (let viewname in template.multiview) {
                let tabnav = document.createElement("tab-nav");
                tabnav.innerText = viewname;
                tabnav.addEventListener("click", ev => {
                    render_view(viewcontainer, template.multiview[viewname]);
                });
                tab.appendChild(tabnav);
            }
            tab.childNodes[0].classList.add("active");
            render_view(viewcontainer, template.multiview[Object.keys(template.multiview)[0]]);
        }



        function render_view(container, template) {
            console.log({ container, template });
            thin(container).empty();
            if (typeof template === 'function') {
                template({ container: container, data: nearest_data(container) });
            } else {
                thin.render_by_template(container, template);
            }
        }
    }

    //ajax 模板
    function ajax_template() {
        container.thin_template = template; //锚定模板，以备rerender。
        let loading;
        if (template.loading) {
            loading = document.createElement("loading");
            container.appendChild(loading);
            thin.render_by_template(loading, template.loading);
        }
        container.thin_query = template.query;
        thin.ajax({
            url: template.ajax,
            data: JSON.stringify(container.thin_query),
            dataType: template.dataType || "json",
            contentType: template.contentType || "application/json",
            success: data => {
                if (template.debug) { console.log({ data }) };
                if (template.loading) thin(loading).remove();
                container.thin_data = data;
                thin.render_by_template(container, template.success);
                if (template.pager) render_pager(container, template.pager);
            },
            error: (error, statusText) => {
                //console.log({ error, statusText });
                if (template.loading) thin(loading).remove();
                if (template.error) {
                    template.error.data = error;
                    thin.render_by_template(container, template.error);
                } else {
                    let err_template = { e: "error", t: "[[responseText]]", data: error }
                    thin.render_by_template(container, err_template);
                }
            }
        });
    }

    //翻页器
    function render_pager(container, pager_template) {
        if (pager_template === true) {
            thin.render_by_template(container, [{
                e: "prevpage",
                t: { e: "a", t: "上一页" },
                if: p => { return p.data.pagenum > 1 },
                click: p => {
                    let query_container = nearest_querycontainer(container);
                    query_container.thin_query.pagenum = p.org_data.pagenum - 1;
                    thin.rerender(container);
                }
            }, " [[pagenum]] / [[totalpage]] ", {
                e: "prevpage",
                t: { e: "a", t: "下一页" },
                if: p => { return p.data.pagenum < p.data.totalpage },
                click: p => {
                    let query_container = nearest_querycontainer(container);
                    query_container.thin_query.pagenum = p.org_data.pagenum + 1;
                    thin.rerender(container);
                }
            }]);
        } else if (typeof pager_template === 'function') {
            pager_template({ container: container, data: nearest_data(container) });
        } else if (typeof pager_template === 'object') {
            thin.render_by_template(container, pager_template);
        }
    }

    //查找最近的query容器
    function nearest_querycontainer(context) {
        let query_container = context;
        while (query_container !== undefined && query_container.thin_query === undefined) {
            query_container = query_container.parentNode;
        }
        return query_container
    }

    //表格模板
    function table_template() {
        let table = document.createElement("table");
        container.appendChild(table);
        let thead = document.createElement("thead");
        table.appendChild(thead);
        let headerrow = document.createElement("tr");
        thead.appendChild(headerrow);
        template.table.forEach(col => {
            let th = document.createElement("th");
            render_helper(th, col);
            th.innerText = col.col;
            headerrow.appendChild(th);
        });
        if (template.table.find(col => { return col.filter !== undefined })) {
            let filterrow = document.createElement("tr");
            thead.appendChild(filterrow);
            template.table.forEach(col => {
                let td = document.createElement("td");
                filterrow.appendChild(td);
                if (col.filter === undefined) {

                } else if (col.filter.input) {
                    thin.render_by_template(td, { e: "input", name: col.filter.input, value: "[[filter/" + col.filter.input + "]]" })
                } else if (col.filter.select) {
                    if (col.filter.datapath) {
                        let options = col.filter.emptyforall === true ? [""].concat(datarover(td, col.filter.datapath)) : datarover(td, col.filter.datapath);
                        thin.render_by_template(td, { e: "select", name: col.filter.select, value: "[[filter/" + col.filter.select + "]]", options: options });
                    } else {
                        thin.render_by_template(td, { e: "select", name: col.filter.select, value: "[[filter/" + col.filter.select + "]]", options: col.filter.options });
                    }

                } else thin.render_by_template(td, col.filter);
            });
            //filter事件
            filterrow.addEventListener("change", ev => {
                let filter = thin.collectdata(filterrow);
                if (template.onfilter) {
                    template.onfilter({ filter: filter });
                } else {
                    let querycontainer = nearest_querycontainer(ev.srcElement);
                    console.log({ ev: ev, querycontainer: querycontainer });
                    querycontainer.thin_query.filter = filter;
                    querycontainer.thin_query.pagenum = 1;
                    thin.rerender(querycontainer);
                }
            })
        }


        let tbody = document.createElement("tbody");
        table.appendChild(tbody);
        let data = datarover(container, template.datapath);
        console.log({ data, datapath: template.datapath });
        if (Array.isArray(data)) {
            data.forEach(row => {
                let tr = document.createElement("tr");
                tr.thin_data = row;
                tbody.appendChild(tr);
                if (typeof template.rowclick === 'function') {
                    tr.addEventListener("click", function(e) {
                        template.rowclick({
                            sender: this,
                            org_data: nearest_data(this),
                            new_data: thin.collectdata(nearest_datacontainer(this)),
                            event: e
                        });
                    }, false);
                } else if (typeof template.rowclick === 'object') {
                    tr.addEventListener("click", function(e) {
                        thin.pop(template.rowclick, nearest_data(this));
                    }, false);
                }
                //应该附加一个行模板，行模板可以由col设置生成。
                let row_template = [];
                if (template.debug) console.log(row);
                template.table.forEach(col => {
                    let td = { e: "td" };
                    if (col.t !== undefined) {
                        td.t = col.t
                    } else if (col.bind !== undefined) {
                        td.t = "[[" + col.bind + "]]";
                    }
                    row_template.push(td);
                });
                thin.render_by_template(tr, row_template);
            });
        }
    }

    //查找最近的编辑标记
    function nearest_editflag(container) {
        while (!container.thin_editflag && container.parentNode) {
            container = container.parentNode;
        }
        return container.thin_editflag;
    }

    function field_template(container, template) {
        let field = document.createElement("field");
        container.appendChild(field);
        field.style.setProperty('--colspan', template.colspan || 1);
        if (template.title) {
            let label = document.createElement("label");
            label.innerText = template.title;
            field.appendChild(label);
        }
        if (template.edit === true || nearest_editflag(container)) {
            if (template.options) {
                thin.render_by_template(field, { e: "select", bind: template.field, options: template.options, click: template.click, event: template.event });
            } else
                thin.render_by_template(field, { e: "input", bind: template.field, click: template.click, event: template.event });
        } else {
            thin.render_by_template(field, "[[" + template.field + "]]");
        }
    }

    function render_helper(element, template) {
        if (template.name !== undefined) { element.setAttribute("name", template.name); }
        if (template.id !== undefined) { element.setAttribute("id", template.id); }
        if (template.class !== undefined) { element.setAttribute("class", template.class); }
        if (template.width) { element.style.setProperty("width", typeof template.width === "number" ? template.width + "px" : template.width); }
        if (template.height) { element.style.setProperty("height", typeof template.height === "number" ? template.height + "px" : template.height); }
        if (template.edit !== undefined) {
            element.thin_editflag = (typeof template.edit === 'function') ? template.edit({ container: element, data: nearest_data(element) }) : template.edit
        };
    };

    function element_template() {

        if (template.if === undefined || ((typeof template.if === 'function') ? template.if({ container: container, data: nearest_data(container) }) : template.if)) {
            let data;
            if (template.data !== undefined) {
                data = template.data
            } else if (template.datapath !== undefined) {
                data = datarover(container, template.datapath);
            }
            if (Array.isArray(data)) {
                data.forEach(d => {
                    render_object_template(d);
                });
            } else {
                render_object_template(data);
            }
        }

        function render_object_template(data) {
            let element = document.createElement(template.e);
            container.appendChild(element)
            if (data !== undefined) {
                element.thin_data = data;
                element.thin_template = template.t
            };
            render_helper(element, template);
            // if (template.name !== undefined) { element.setAttribute("name", template.name); }
            // if (template.id !== undefined) { element.setAttribute("id", template.id); }
            // if (template.class !== undefined) { element.setAttribute("class", template.class); }
            // if (template.width) { element.style.setProperty("width", typeof template.width === "number" ? template.width + "px" : template.width); }
            // if (template.height) { element.style.setProperty("height", typeof template.height === "number" ? template.height + "px" : template.height); }
            // if (template.edit !== undefined) { element.thin_editflag = template.edit };

            if (template.e === 'select') {
                if (template.options) {
                    if (typeof template.options === 'string') {
                        // for (let op in template.options.split(',')) {
                        //     element.options.add(new Option(op));
                        // }
                        let opt = datarover(element, template.options);
                        if (Array.isArray(opt)) {
                            opt.forEach(op => {
                                element.options.add(new Option(op));
                            })
                        }

                    } else if (Array.isArray(template.options)) {
                        //console.log("isArray!")
                        template.options.forEach(op => {
                            element.options.add(new Option(op));
                        })
                    } else if (typeof template.options === 'object') {
                        for (let op in template.options) {
                            element.options.add(new Option(template.options[op], op))
                        }
                    }
                }
            }


            switch (template.e) {
                case "fieldset":
                    if (template.title) {
                        let legend = document.createElement("legend");
                        legend.innerText = template.title;
                        element.appendChild(legend);
                    }
                    break;
                case "field":
                case "f1":
                case "f2":
                case "f3":
                    if (template.title) {
                        let label = document.createElement("label");
                        label.innerText = template.title;
                        element.appendChild(label);
                    }
                    break;
                default:
                    break;
            }

            if (template.t) {
                thin.render_by_template(element, template.t);
            }

            if (template.selected !== undefined) template.value = template.selected; //兼容V1
            if (template.value) {
                thin(element).val(render_content(element, template.value));
            }

            if (template.a !== undefined) {
                for (let key in template.a) {
                    let val = template.a[key];
                    element.setAttribute(key, render_content(element, val))
                }
            }
            if (template.style !== undefined) {
                for (let key in template.style) {
                    let val = template.style[key];
                    element.style.setProperty(key, render_content(element, val));
                }
            }

            if (template.bind) {
                let value = datarover(element, template.bind);
                element.value = value !== undefined ? value : "";
                element.addEventListener("change", ev => {
                    datarover(element, template.bind, element.value);
                });
            }

            if (template.event) {
                for (let key in template.event) {
                    element.addEventListener(key, (ev) => {
                            template.event[key]({
                                sender: element,
                                org_data: nearest_data(element),
                                new_data: thin.collectdata(nearest_datacontainer(element)),
                                event: ev
                            });
                        },
                        false);
                }
            }
            if (template.click) {
                element.addEventListener("click", function(e) {
                    template.click({
                        sender: this,
                        org_data: nearest_data(this),
                        new_data: thin.collectdata(nearest_datacontainer(this)),
                        event: e
                    });
                }, false);
            }
        }
    }

    function render_string_template(container, string_template) {
        thin.append(container, render_content(container, string_template));
    }

    function render_content(container, template) {
        if (typeof template === 'function') {
            return template({ container: container, data: nearest_data(container) });
        }
        if (typeof template === 'string') {
            const reg = /\[\[[a-zA-Z0-9\-\./_]*\]\]/gi;
            return template.replace(reg, (m) => {
                let path = m.replace("[[", "").replace("]]", "");
                let d = datarover(container, path)
                return d !== undefined ? d : "";
            });
        } else {
            return template;
        }
    }

    function nearest_data(node) {
        let datacontainer = nearest_datacontainer(node);
        return datacontainer ? datacontainer.thin_data : undefined;
    }

    function nearest_datacontainer(node) {
        while (node && !node.thin_data) { node = node.parentNode };
        return node;
    };

    function datarover(container, datapath, value) {
        if (!datapath) return undefined;
        let patharray = datapath.split("/");
        let datacontainer = nearest_datacontainer(container);
        if (!datacontainer) return undefined;
        let data = datacontainer.thin_data;
        while (patharray.length > 1) {
            let path = patharray.shift();
            if (path === '..') {
                datacontainer = nearest_datacontainer(datacontainer.parentNode);
                data = datacontainer.thin_data;
                if (!datacontainer) return undefined;
            } else if (path === '.') {
                return data;
            } else {
                if (value !== undefined && data[path] === undefined) data[path] = {}
                data = data[path];
                if (data === undefined) return undefined;
            }
        }
        let path = patharray.shift();
        if (path === '.') {
            if (value !== undefined) data = value;
            return data;
        } else {
            if (value !== undefined) data[path] = value;
            return data[path];
        }
    }
}


thin.fn.extend({
    append: function(content) {
        this.forEach(node => {
            thin.append(node, content);
        });
    },

    val: function(value) {
        if (value !== undefined) {
            this.forEach(node => {
                node.value = value;
            });
        } else {
            return this[0] !== undefined ? this[0].value : undefined;
        }
    },

    html: function(htmlString) {
        this.forEach(node => { node.innerHTML = htmlString });
        return this[0] !== undefined ? this[0].innerHTML : undefined;
    },

    removeClass: function(classname) {
        this.forEach(node => { node.classList.remove(classname) });
    },
    addClass: function(classname) {
        this.forEach(node => { node.classList.add(classname) });
    },

    empty: function() {
        this.forEach(node => {
            node.innerHTML = '';
        })
    },

    remove: function() {
        this.forEach(node => { node.parentNode.removeChild(node) });
    },

    attr: function(attribute, value) {
        this.forEach(node => {
            node.setAttribute(attribute, value);
        });
    },

    hide: function() {
        this.forEach(node => {
            node.thin_org_display = node.style.display;
            node.style.display = 'none';
        });
    },

    show: function() {
        this.forEach(node => {
            node.style.display = node.thin_org_display || "";
        })
    },


    on: function(event, ...args) {
        let fn = args.pop();
        let childSelector = args.shift();
        this.forEach(node => {
            if (childSelector) {
                node.addEventListener(event, (ev) => {
                    //console.log({ event, ev, node, childSelector });
                    let selected = node.querySelectorAll(childSelector);
                    selected.forEach(child => { child.thin_on_childSeletor = true }); //加匹配标记
                    let target = ev.target
                    while (target) {
                        if (target.thin_on_childSeletor) {
                            target.thin_temp_fn = fn;
                            target.thin_temp_fn(ev);
                            delete target.thin_temp_fn;
                        }
                        target = target.parentNode;
                    }
                    selected.forEach(child => { delete child.thin_on_childSeletor }); //去除匹配标记
                });
            } else {
                node.addEventListener(event, fn);
            }
        });
    },
    render: function(template, data) {
        //console.log({ this: this, template: template });
        this.forEach(node => { // thin selector 指向的总是一个节点列表，逐条处理。
            if (data !== undefined) {
                node.thin_data = data;
            };
            node.thin_template = template;
            node.thin_render = function() {
                thin.render_by_template(this, this.thin_template);
            };
            node.thin_render();
        });

    }
});

if (typeof $ === "undefined") {
    window.$ = thin
};

$(function() {
    $(document).on("click", "tab-nav", function(ev) {
        //console.log({ this: this, ev });
        $("tab-nav", this.parentElement).removeClass("active");
        $(this).addClass("active");
    });
});