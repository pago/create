/*   Annotate - a text enhancement interaction jQuery UI widget
#     (c) 2011 Szaby Gruenwald, IKS Consortium
#     Annotate may be freely distributed under the MIT license
*/((function(){var a,b,c,d,e,f,g,h,i,j,k=Array.prototype.indexOf||function(a){for(var b=0,c=this.length;b<c;b++)if(b in this&&this[b]===a)return b;return-1};e={rdf:"http://www.w3.org/1999/02/22-rdf-syntax-ns#",enhancer:"http://fise.iks-project.eu/ontology/",dcterms:"http://purl.org/dc/terms/",rdfs:"http://www.w3.org/2000/01/rdf-schema#",skos:"http://www.w3.org/2004/02/skos/core#"},f=this,d=f.jQuery,a=f.Backbone,i=f._,c=f.VIE,h=new c,h.use(new h.StanbolService({url:"http://dev.iks-project.eu:8080",proxyDisabled:!0})),h.namespaces.add("skos",e.skos),(j=String.prototype).trim==null&&(j.trim=function(){return this.replace(/^\s+|\s+$/g,"")}),b=function(){function a(a){this.vie=a.vie,this.logger=a.logger}return a.prototype._entities=function(){var a;return(a=window.entityCache)!=null?a:window.entityCache={}},a.prototype.get=function(a,b,c,d){var e,f=this;a=a.replace(/^<|>$/g,""),this._entities()[a]&&this._entities()[a].status==="done"?typeof c=="function"&&c.apply(b,[this._entities()[a].entity]):this._entities()[a]&&this._entities()[a].status==="error"?typeof d=="function"&&d.apply(b,["error"]):this._entities()[a]||(this._entities()[a]={status:"pending",uri:a},e=this,this.vie.load({entity:a}).using("stanbol").execute().success(function(b){return i.defer(function(){var c,d;return c=f._entities()[a],d=i.detect(b,function(b){if(b.getSubject()==="<"+a+">")return!0}),d?(c.entity=d,c.status="done",$(c).trigger("done",d)):(f.logger.warn("couldn''t load "+a,b),c.status="not found")})}).fail(function(b){return i.defer(function(){var c;return f.logger.error("couldn't load "+a),c=f._entities()[a],c.status="error",$(c).trigger("fail",b)})}));if(this._entities()[a]&&this._entities()[a].status==="pending")return $(this._entities()[a]).bind("done",function(a,d){if(typeof c=="function")return c.apply(b,[d])}).bind("fail",function(a,c){if(typeof c=="function")return c.apply(b,[c])})},a}(),g=function(a){var b;return b=a.substring(a.lastIndexOf("#")+1),b.substring(b.lastIndexOf("/")+1)},d.widget("IKS.annotate",{__widgetName:"IKS.annotate",options:{vie:h,vieServices:["stanbol"],autoAnalyze:!1,showTooltip:!0,debug:!1,depictionProperties:["foaf:depiction","schema:thumbnail"],labelProperties:["rdfs:label","skos:prefLabel","schema:name","foaf:name"],descriptionProperties:["rdfs:comment","skos:note","schema:description","skos:definition",{property:"skos:broader",makeLabel:function(a){var b;return b=i(a).map(function(a){return a.replace(/<.*[\/#](.*)>/,"$1").replace(/_/g,"&nbsp;")}),"Subcategory of "+b.join(", ")+"."}},{property:"dcterms:subject",makeLabel:function(a){var b;return b=i(a).map(function(a){return a.replace(/<.*[\/#](.*)>/,"$1").replace(/_/g,"&nbsp;")}),"Subject(s): "+b.join(", ")+"."}}],fallbackLanguage:"en",ns:{dbpedia:"http://dbpedia.org/ontology/",skos:"http://www.w3.org/2004/02/skos/core#"},typeFilter:null,annotationInteractionWidget:"annotationInteraction",getTypes:function(){return[{uri:""+this.ns.dbpedia+"Place",label:"Place"},{uri:""+this.ns.dbpedia+"Person",label:"Person"},{uri:""+this.ns.dbpedia+"Organisation",label:"Organisation"},{uri:""+this.ns.skos+"Concept",label:"Concept"}]},getSources:function(){return[{uri:"http://dbpedia.org/resource/",label:"dbpedia"},{uri:"http://sws.geonames.org/",label:"geonames"}]}},_create:function(){var a;return a=this,this._logger=this.options.debug?console:{info:function(){},warn:function(){},error:function(){},log:function(){}},this.entityCache=new b({vie:this.options.vie,logger:this._logger}),this.options.autoAnalyze&&this.enable(),d().tooltip||(this.options.showTooltip=!1,this._logger.warn("the used jQuery UI doesn't support tooltips, disabling.")),this._initExistingAnnotations()},_destroy:function(){return this.disable(),$(":IKS-annotationSelector",this.element).each(function(){if($(this).data().annotationSelector)return $(this).annotationSelector("destroy")}),this._destroyExistingAnnotationInteractionWidgets()},enable:function(b){var c,d=this;return c=this.element,this.options.vie.analyze({element:this.element}).using(this.options.vieServices).execute().success(function(e){return i.defer(function(){var f,g,h,j,k,l,m,n,o,p;g=Stanbol.getEntityAnnotations(e);for(l=0,n=g.length;l<n;l++){f=g[l],k=f.get("dcterms:relation");if(!k){d._logger.error("For "+f.getSubject()+" dcterms:relation is not set! This makes this EntityAnnotation unusable!",f);continue}p=i.flatten([k]);for(m=0,o=p.length;m<o;m++){h=p[m],h instanceof a.Model||(h=f.vie.entities.get(h));if(!h)continue;i(i.flatten([h])).each(function(a){return a.setOrAdd({entityAnnotation:f.getSubject()})})}}j=Stanbol.getTextAnnotations(e),j=d._filterByType(j),j=i(j).filter(function(a){return a.getSelectedText&&a.getSelectedText()?!0:!1}),i(j).each(function(a){return d._logger.info(a._enhancement,"confidence",a.getConfidence(),"selectedText",a.getSelectedText(),"type",a.getType(),"EntityEnhancements",a.getEntityEnhancements()),d._processTextEnhancement(a,c)}),d._trigger("success",!0);if(typeof b=="function")return b(!0)})}).fail(function(a){return typeof b=="function"&&b(!1,a),d._trigger("error",a),d._logger.error("analyze failed",a.responseText,a)})},disable:function(){return $(":IKS-annotationSelector",this.element).each(function(){if($(this).data().annotationSelector)return $(this).annotationSelector("disable")})},_initExistingAnnotations:function(){return this.existingAnnotations=d("a[about][typeof]",this.element),this._logger.info(this.existingAnnotations),this.existingAnnotations[this.options.annotationInteractionWidget](this.options)},_destroyExistingAnnotationInteractionWidgets:function(){return this.existingAnnotations[this.options.annotationInteractionWidget]("destroy")},acceptAll:function(a){var b;return b={updated:[],accepted:0},$(":IKS-annotationSelector",this.element).each(function(){var a;if($(this).data().annotationSelector){a=$(this).annotationSelector("acceptBestCandidate");if(a)return b.updated.push(this),b.accepted++}}),a(b)},_processTextEnhancement:function(a,b){var c,d,e,f,h,i,j,k,l,m,n,o,p=this;if(!a.getSelectedText()){this._logger.warn("textEnh",a,"doesn't have selected-text!");return}e=$(this._getOrCreateDomElement(b[0],a.getSelectedText(),{createElement:"span",createMode:"existing",context:a.getContext(),start:a.getStart(),end:a.getEnd()})),h=a.getType()||"Other",j=this,e.addClass("entity");for(k=0,m=h.length;k<m;k++)i=h[k],e.addClass(g(i).toLowerCase());a.getEntityEnhancements().length&&e.addClass("withSuggestions"),o=a.getEntityEnhancements();for(l=0,n=o.length;l<n;l++)c=o[l],d=c.getUri(),this.entityCache.get(d,c,function(a){return"<"+d+">"===a.getSubject()?p._logger.info("entity "+d+" is loaded:",a.as("JSON")):j._logger.info("forwarded entity for "+d+" loaded:",a.getSubject())});return f=this.options,f.cache=this.entityCache,f.annotateElement=this.element,e.annotationSelector(f).annotationSelector("addTextEnhancement",a)},_filterByType:function(a){var b=this;return this.options.typeFilter?i.filter(a,function(a){var c,d,e,f,g;if(f=b.options.typeFilter,k.call(a.getType(),f)>=0)return!0;g=b.options.typeFilter;for(d=0,e=g.length;d<e;d++){c=g[d];if(k.call(a.getType(),c)>=0)return!0}}):a},_getOrCreateDomElement:function(a,b,c){var d,e,f,g,h,j,k,l,m,n;c==null&&(c={}),j=function(a,b){var c,d,e,f;e=[],c=0,f=[];while(a.indexOf(b,c+1)!==-1)d=a.indexOf(b,c+1),e.push(d),f.push(c=d);return f},f=function(a,b){return i(a).sortedIndex(b)},g=function(a,b,c){var d,e,g,h,i;return d=j(a,b),i=f(d,c),d.length===1?d[0]:i===d.length?d[i-1]:(h=i-1,e=c-d[h],g=d[i]-c,g>e?d[h]:d[i])},d=a,m=function(a){return $(a).text().replace(/\n/g," ")};if(m(a).indexOf(b)===-1)return this._logger.error("'"+b+"' doesn't appear in the text block."),$();l=c.start+m(a).indexOf(m(a).trim()),l=g(m(a),b,l),k=0;while(m(d).indexOf(b)!==-1&&d.nodeName!=="#text")d=i(d.childNodes).detect(function(a){var c;return c=m(a).lastIndexOf(b),c>=l-k?!0:(k+=m(a).length,!1)});return c.createMode==="existing"&&m($(d).parent())===b?$(d).parent()[0]:(k=l-k,e=b.length,n=m(d).substring(k,k+e),n===b?(d.splitText(k+e),h=document.createElement(c.createElement||"span"),h.innerHTML=b,$(d).parent()[0].replaceChild(h,d.splitText(k)),$(h)):this._logger.warn("dom element creation problem: "+n+" isnt "+b))}}),d.widget("IKS.annotationInteraction",{__widgetName:"IKS.annotationInteraction",options:{ns:{dbpedia:"http://dbpedia.org/ontology/",skos:"http://www.w3.org/2004/02/skos/core#"},getTypes:function(){return[{uri:""+this.ns.dbpedia+"Place",label:"Place"},{uri:""+this.ns.dbpedia+"Person",label:"Person"},{uri:""+this.ns.dbpedia+"Organisation",label:"Organisation"},{uri:""+this.ns.skos+"Concept",label:"Concept"}]},getSources:function(){return[{uri:"http://dbpedia.org/resource/",label:"dbpedia"},{uri:"http://sws.geonames.org/",label:"geonames"}]}},_create:function(){var a=this;return this._logger=this.options.debug?console:{info:function(){},warn:function(){},error:function(){},log:function(){}},this.vie=this.options.vie,this._loadEntity(function(b){return a.entity=b,a._initTooltip()})},_destroy:function(){return this.element.tooltip("destroy")},_initTooltip:function(){var a,b=this;a=this,this._logger.info("init tooltip for",this.element);if(this.options.showTooltip)return d(this.element).tooltip({items:"[about]",hide:{effect:"hide",delay:50},show:{effect:"show",delay:50},content:function(c){var d;return d=b.element.attr("about"),b._logger.info("tooltip uri:",d),a._createPreview(d)}})},_createPreview:function(a){var b,c,d,e;return d="",e=100,b=this._getDepiction(this.entity,e),b&&(d+="<img style='float:left;padding: 5px;width: "+e+"px' src='"+b.substring(1,b.length-1)+"'/>"),c=this._getDescription(this.entity),c||(this._logger.warn("No description found for",this.entity),c="No description found."),d+="<div style='padding 5px;width:250px;float:left;'><small>"+c+"</small></div>",this._logger.info("tooltip for "+a+": cacheEntry loaded",this.entity),d},_loadEntity:function(a){var b=this;return this.vie.use(new this.vie.RdfaService),this.vie.load({element:this.element}).using("rdfa").execute().success(function(c){return b._logger.info("found",c,b.element,b.vie),i(c).each(function(c){return b.vie.load({entity:c.getSubject()}).using("stanbol").execute().success(function(b){var d;return d=i(b).detect(function(a){return c.getSubject()===a.getSubject()}),a(d)}).fail(function(a){return b._logger.error("error getting entity from stanbol",a,c.getSubject())})})}).fail(function(a){return b._logger.error("error reading RDFa",a,b.element)})},_getUserLang:function(){var a;return a=window.navigator.language||window.navigator.userLanguage,a.split("-")[0]},_getDepiction:function(a,b){var c,d,e,f;f=this.options.depictionProperties,d=i(f).detect(function(b){if(a.get(b))return!0});if(d&&(e=i([a.get(d)]).flatten()))return c=i(e).detect(function(a){a=(typeof a.getSubject=="function"?a.getSubject():void 0)||a;if(a.indexOf("thumb")!==-1)return!0}).replace(/[0-9]{2..3}px/,""+b+"px"),c},_getLabel:function(a){var b,c;return b=this.options.labelProperties,c=[this._getUserLang(),this.options.fallbackLanguage],this._getPreferredLangForPreferredProperty(a,b,c)},_getDescription:function(a){var b,c;return b=this.options.descriptionProperties,c=[this._getUserLang(),this.options.fallbackLanguage],this._getPreferredLangForPreferredProperty(a,b,c)},_getPreferredLangForPreferredProperty:function(a,b,c){var d,e,f,g,h,j,k,l,m,n=this;for(j=0,l=c.length;j<l;j++){f=c[j];for(k=0,m=b.length;k<m;k++){g=b[k];if(typeof g=="string"&&a.get(g)){e=i.flatten([a.get(g)]),d=i(e).detect(function(a){typeof a=="string"&&a.toString().indexOf("@"+f)>-1&&!0;if(typeof a=="object"&&a["@language"]===f)return!0});if(d)return d.toString().replace(/(^\"*|\"*@..$)/g,"")}else if(typeof g=="object"&&a.get(g.property))return h=i.flatten([a.get(g.property)]),h=i(h).map(function(a){return a.isEntity?a.getSubject():a}),g.makeLabel(h)}}return""}}),d.widget("IKS.annotationSelector",{__widgetName:"IKS.annotationSelector",options:{ns:{dbpedia:"http://dbpedia.org/ontology/",skos:"http://www.w3.org/2004/02/skos/core#"},getTypes:function(){return[{uri:""+this.ns.dbpedia+"Place",label:"Place"},{uri:""+this.ns.dbpedia+"Person",label:"Person"},{uri:""+this.ns.dbpedia+"Organisation",label:"Organisation"},{uri:""+this.ns.skos+"Concept",label:"Concept"}]},getSources:function(){return[{uri:"http://dbpedia.org/resource/",label:"dbpedia"},{uri:"http://sws.geonames.org/",label:"geonames"}]}},_create:function(){var a=this;this.enableEditing(),this._logger=this.options.debug?console:{info:function(){},warn:function(){},error:function(){},log:function(){}};if(this.isAnnotated())return this._initTooltip(),this.linkedEntity={uri:this.element.attr("about"),type:this.element.attr("typeof")},this.options.cache.get(this.linkedEntity.uri,this,function(b){var c,d;return c=window.navigator.language||window.navigator.userLanguage,d=c.split("-")[0],a.linkedEntity.label=i(b.get("rdfs:label")).detect(function(a){if(a.toString().indexOf("@"+d)>-1)return!0}).toString().replace(/(^\"*|\"*@..$)/g,""),a._logger.info("did I figure out?",a.linkedEntity.label)})},enableEditing:function(){var a=this;return this.element.click(function(b){a._logger.log("click",b,b.isDefaultPrevented());if(!a.dialog&&!!a.dialog)return a.searchEntryField.find(".search").focus(100);a._createDialog(),setTimeout(function(){return a.dialog.open()},220),a.entityEnhancements=a._getEntityEnhancements(),a._createSearchbox();if(a.entityEnhancements.length>0)return a._createMenu()})},disableEditing:function(){return d(this.element).unbind("click")},_destroy:function(){this.disableEditing(),this.menu&&(this.menu.destroy(),this.menu.element.remove(),delete this.menu),this.dialog&&(this.dialog.destroy(),this.dialog.element.remove(),this.dialog.uiDialogTitlebar.remove(),delete this.dialog),this._logger.info("destroy tooltip");if(this.element.data().tooltip)return this.element.tooltip("destroy")},remove:function(a){var b;b=this.element.parent(),this._logger.info("destroy tooltip"),this.element.data().tooltip&&this.element.tooltip("destroy"),!this.isAnnotated()&&this.textEnhancements?this._trigger("decline",a,{textEnhancements:this.textEnhancements}):this._trigger("remove",a,{textEnhancement:this._acceptedTextEnhancement,entityEnhancement:this._acceptedEntityEnhancement,linkedEntity:this.linkedEntity}),this.destroy();if(this.element.qname().name!=="#text")return this.element.replaceWith(document.createTextNode(this.element.text()))},disable:function(){return!this.isAnnotated()&&this.element.qname().name!=="#text"?this.element.replaceWith(document.createTextNode(this.element.text())):this.disableEditing()},isAnnotated:function(){return this.element.attr("about")?!0:!1},annotate:function(a,b){var c,f,h,i,j,k,l,m;return i=a.getUri(),h=a.getTextEnhancement().getType()||"",f=this.element.html(),l=a.getTextEnhancement().getType(),l.length||(l=["Other"]),this.element.attr("xmlns:skos",e.skos),k=b.rel||"skos:related",c="entity "+g(l[0]).toLowerCase(),j=$("<a href='"+i+"'            about='"+i+"'            typeof='"+h+"'            rel='"+k+"'            class='"+c+"'>"+f+"</a>"),this._cloneCopyEvent(this.element[0],j[0]),this.linkedEntity={uri:i,type:h,label:a.getLabel()},this.element.replaceWith(j),this.element=j.addClass(b.styleClass),this._logger.info("created annotation in",this.element),this._updateTitle(),this._insertLink(),this._acceptedTextEnhancement=a.getTextEnhancement(),this._acceptedEntityEnhancement=a,m={linkedEntity:this.linkedEntity,textEnhancement:a.getTextEnhancement(),entityEnhancement:a},this.select(m),this._initTooltip(),d(j).annotationSelector(this.options)},select:function(a){var b;return b=new d.Event("select"),b.ui=a,this._trigger("select",b,a),d(this.options.annotateElement).trigger("annotateselect",a)},acceptBestCandidate:function(){var a;a=this._getEntityEnhancements();if(!a.length)return;if(this.isAnnotated())return;return this.annotate(a[0],{styleClass:"acknowledged"}),a[0]},addTextEnhancement:function(a){return this.options.textEnhancements=this.options.textEnhancements||[],this.options.textEnhancements.push(a),this.textEnhancements=this.options.textEnhancements},close:function(){var a;return(a=this.dialog)!=null&&typeof a.close=="function"&&a.close(),d(".ui-tooltip").remove()},_initTooltip:function(){var a,b=this;a=this;if(this.options.showTooltip)return this._logger.info("init tooltip for",this.element),d(this.element).tooltip({items:"[about]",hide:{effect:"hide",delay:50},show:{effect:"show",delay:50},content:function(c){var d;return d=b.element.attr("about"),b._logger.info("tooltip uri:",d),a._createPreview(d,c),"loading..."}})},_getEntityEnhancements:function(){var a,b,c,d,e,f,g,h,j,k;a=[],h=this.textEnhancements;for(d=0,f=h.length;d<f;d++){c=h[d],j=c.getEntityEnhancements();for(e=0,g=j.length;e<g;e++)b=j[e],a.push(b)}return k=[],a=i(a).filter(function(a){var b;return b=a.getUri(),i.indexOf(k,b)===-1?(k.push(b),!0):!1}),i(a).sortBy(function(a){return-1*a.getConfidence()})},_typeLabels:function(a){var b,c,d,e=this;return c=this.options.getTypes(),b=i(c).map(function(a){return a.uri}),d=i.intersect(b,a),i(d).map(function(a){var b;return b=i(c).detect(function(b){return b.uri===a}),b.label})},_sourceLabel:function(a){var b,c;return a||this._logger.warn("No source"),a?(c=this.options.getSources(),b=i(c).detect(function(b){return a.indexOf(b.uri)!==-1}),b?b.label:a.split("/")[2]):""},_createDialog:function(){var a,b,c,e=this;return b=this.element.text(),d(".annotateselector-dialog").dialog("destroy").remove(),a=$("<div class='annotateselector-dialog'><span class='entity-link'></span></div>").attr("tabIndex",-1).addClass().keydown(function(a){if(!a.isDefaultPrevented()&&a.keyCode&&a.keyCode===$.ui.keyCode.ESCAPE)return e.close(a),a.preventDefault()}).bind("dialogblur",function(a){return e._logger.info("dialog dialogblur"),e.close(a)}).bind("blur",function(a){return e._logger.info("dialog blur"),e.close(a)}).appendTo($("body")[0]),c=this,a.dialog({width:400,title:b,autoOpen:!1,open:function(a,b){return $.data(this,"dialog").uiDialog.position({of:c.element,my:"left top",at:"left bottom",collision:"none"})}}),this.dialog=a.data("dialog"),this.dialog.uiDialogTitlebar.hide(),this._logger.info("dialog widget:",this.dialog),this.dialog.element.focus(100),window.d=this.dialog,this._insertLink(),this._updateTitle(),this._setButtons()},_insertLink:function(){if(this.isAnnotated()&&this.dialog)return $("Annotated: <a href='"+this.linkedEntity.uri+"' target='_blank'>            "+this.linkedEntity.label+" @ "+this._sourceLabel(this.linkedEntity.uri)+"</a><br/>").appendTo($(".entity-link",this.dialog.element))},_setButtons:function(){var a=this;return this.dialog.element.dialog("option","buttons",{rem:{text:this.isAnnotated()?"Remove":"Decline",click:function(b){return a.remove(b)}},Cancel:function(){return a.close()}})},_updateTitle:function(){var a;if(this.dialog)return this.isAnnotated()?a=""+this.linkedEntity.label+" <small>@ "+this._sourceLabel(this.linkedEntity.uri)+"</small>":a=this.element.text(),this.dialog._setOption("title",a)},_createMenu:function(){var a,b,c,e=this;return c=this,b=$("<ul></ul>").appendTo(this.dialog.element),this._renderMenu(b,this.entityEnhancements),a=function(a,b){return e._logger.info("selected menu item",b.item),e.annotate(b.item.data("enhancement"),{styleClass:"acknowledged"}),e.close(a)},this.menu=b.menu({selected:a,select:a,blur:function(a,b){return e._logger.info("menu.blur()",b.item)}}).focus(150),this.options.showTooltip&&this.menu.tooltip({items:".ui-menu-item",hide:{effect:"hide",delay:50},show:{effect:"show",delay:50},content:function(a){var b;return b=d(this).attr("entityuri"),c._createPreview(b,a),"loading..."}}),this.menu=this.menu.data("menu")},_createPreview:function(a,b){var c,e,f=this;return e=function(c){var d,e,g,h;return g="",h=100,d=f._getDepiction(c,h),d&&(g+="<img style='float:left;padding: 5px;width: "+h+"px' src='"+d.substring(1,d.length-1)+"'/>"),e=f._getDescription(c),e||(f._logger.warn("No description found for",c),e="No description found."),g+="<div style='padding 5px;width:250px;float:left;'><small>"+e+"</small></div>",f._logger.info("tooltip for "+a+": cacheEntry loaded",c),setTimeout(function(){return b(g)},200)},c=function(c){return f._logger.error("error loading "+a,c),b("error loading entity for "+a)},d(".ui-tooltip").remove(),this.options.cache.get(a,this,e,c)},_getUserLang:function(){var a;return a=window.navigator.language||window.navigator.userLanguage,a.split("-")[0]},_getDepiction:function(a,b){var c,d,e,f;f=this.options.depictionProperties,d=i(f).detect(function(b){if(a.get(b))return!0});if(d&&(e=i([a.get(d)]).flatten()))return c=i(e).detect(function(a){a=(typeof a.getSubject=="function"?a.getSubject():void 0)||a;if(a.indexOf("thumb")!==-1)return!0}).replace(/[0-9]{2..3}px/,""+b+"px"),c},_getLabel:function(a){var b,c;return b=this.options.labelProperties,c=[this._getUserLang(),this.options.fallbackLanguage],this._getPreferredLangForPreferredProperty(a,b,c)},_getDescription:function(a){var b,c;return b=this.options.descriptionProperties,c=[this._getUserLang(),this.options.fallbackLanguage],this._getPreferredLangForPreferredProperty(a,b,c)},_getPreferredLangForPreferredProperty:function(a,b,c){var d,e,f,g,h,j,k,l,m,n=this;for(j=0,l=c.length;j<l;j++){f=c[j];for(k=0,m=b.length;k<m;k++){g=b[k];if(typeof g=="string"&&a.get(g)){e=i.flatten([a.get(g)]),d=i(e).detect(function(a){typeof a=="string"&&a.toString().indexOf("@"+f)>-1&&!0;if(typeof a=="object"&&a["@language"]===f)return!0});if(d)return d.toString().replace(/(^\"*|\"*@..$)/g,"")}else if(typeof g=="object"&&a.get(g.property))return h=i.flatten([a.get(g.property)]),h=i(h).map(function(a){return a.isEntity?a.getSubject():a}),g.makeLabel(h)}}return""},_renderMenu:function(a,b){var c,d,e;b=i(b).sortBy(function(a){return-1*a.getConfidence()});for(d=0,e=b.length;d<e;d++)c=b[d],this._renderItem(a,c);return this._logger.info("rendered menu for the elements",b)},_renderItem:function(a,b){var c,d,e,f,g;return e=b.getLabel().replace(/^\"|\"$/g,""),g=this._typeLabels(b.getTypes()).toString()||"Other",f=this._sourceLabel(b.getUri()),c=this.linkedEntity&&b.getUri()===this.linkedEntity.uri?" class='ui-state-active'":"",d=$("<li"+c+" entityuri='"+b.getUri()+"' about='"+b.getUri()+"'><a>"+e+" <small>("+g+" from "+f+")</small></a></li>").data("enhancement",b).appendTo(a)},_createSearchbox:function(){var a,b,c=this;return this.searchEntryField=$('<span style="background: fff;"><label for="search">Search:</label> <input id="search" class="search"></span>').appendTo(this.dialog.element),a=this.textEnhancements[0],b=this,this.searchbox=$(".search",this.searchEntryField).autocomplete({source:function(c,d){return b._logger.info("req:",c),b.options.vie.find({term:""+c.term+(c.term.length>3?"*":"")}).using("stanbol").execute().fail(function(a){return b._logger.error("Something wrong happened at stanbol find:",a)}).success(function(c){var e=this;return i.defer(function(){var e,f;return b._logger.info("resp:",i(c).map(function(a){return a.id})),e=10,c=i(c).filter(function(a){return a.getSubject().replace(/^<|>$/g,"")==="http://www.iks-project.eu/ontology/rick/query/QueryResultSet"?!1:!0}),f=i(c.slice(0,e)).map(function(c){return{key:c.getSubject().replace(/^<|>$/g,""),label:""+b._getLabel(c)+" @ "+b._sourceLabel(c.id),_label:b._getLabel(c),getLabel:function(){return this._label},getUri:function(){return this.key},_tEnh:a,getTextEnhancement:function(){return this._tEnh}}}),d(f)})})},open:function(a,c){b._logger.info("autocomplete.open",a,c);if(b.options.showTooltip)return $(this).data().autocomplete.menu.activeMenu.tooltip({items:".ui-menu-item",hide:{effect:"hide",delay:50},show:{effect:"show",delay:50},content:function(a){var c;return c=$(this).data()["item.autocomplete"].getUri(),b._createPreview(c,a),"loading..."}})},select:function(a,b){return c.annotate(b.item,{styleClass:"acknowledged"}),c._logger.info("autocomplete.select",a.target,b)}}).focus(200).blur(function(a,b){return c._dialogCloseTimeout=setTimeout(function(){return c.close()},200)}),!this.entityEnhancements.length&&!this.isAnnotated()&&setTimeout(function(){var a;return a=c.element.html(),c.searchbox.val(a),c.searchbox.autocomplete("search",a)},300),this._logger.info("show searchbox")},_cloneCopyEvent:function(a,b){return d().jquery.indexOf("1.6")===0?this._cloneCopyEvent1_6(a,b):this._cloneCopyEvent1_7(a,b)},_cloneCopyEvent1_6:function(a,b){var c,e,f,g,h,i,j;if(b.nodeType!==1||!d.hasData(a))return;g=$.expando,i=$.data(a),c=$.data(b,i);if(i=i[g]){e=i.events,c=c[g]=d.extend({},i);if(e){delete c.handle,c.events={};for(j in e){f=0,h=e[j].length;while(f<h)d.event.add(b,j+(e[j][f].namespace?".":"")+e[j][f].namespace,e[j][f],e[j][f].data),f++}}return null}},_cloneCopyEvent1_7:function(a,b){var c,e,f,g,h,i;if(b.nodeType!==1||!d.hasData(a))return;i=void 0,f=void 0,g=void 0,h=d._data(a),c=d._data(b,h),e=h.events;if(e){delete c.handle,c.events={};for(i in e){f=0,g=e[i].length;while(f<g)d.event.add(b,i+(e[i][f].namespace?".":"")+e[i][f].namespace,e[i][f],e[i][f].data),f++}}if(c.data)return c.data=d.extend({},c.data)}});if(typeof Stanbol=="undefined"||Stanbol===null)Stanbol={};Stanbol.getTextAnnotations=function(a){var b;return b=i(a).filter(function(a){return a.isof("<"+e.enhancer+"TextAnnotation>")}),b=i(b).sortBy(function(a){var b;return a.get("enhancer:confidence")&&(b=Number(a.get("enhancer:confidence"))),-1*b}),i(b).map(function(b){return new Stanbol.TextEnhancement(b,a)})},Stanbol.getEntityAnnotations=function(a){return i(a).filter(function(a){return a.isof("<"+e.enhancer+"EntityAnnotation>")})},Stanbol.TextEnhancement=function(){function b(a,b){this._enhancement=a,this._enhList=b,this.id=this._enhancement.getSubject()}return b.prototype.getSelectedText=function(){var a;a=this._vals("enhancer:selected-text");if(typeof a=="string")return a;if(typeof a=="object")return a.toString()},b.prototype.getConfidence=function(){return this._vals("enhancer:confidence")},b.prototype.getEntityEnhancements=function(){var a,b=this;return a=this._enhancement.get("entityAnnotation"),a?(a=i.flatten([a]),i(a).map(function(a){return new Stanbol.EntityEnhancement(a,b)})):[]},b.prototype.getType=function(){return this._uriTrim(this._vals("dcterms:type"))},b.prototype.getContext=function(){return this._vals("enhancer:selection-context")},b.prototype.getStart=function(){return Number(this._vals("enhancer:start"))},b.prototype.getEnd=function(){return Number(this._vals("enhancer:end"))},b.prototype.getOrigText=function(){var a;return a=this._vals("enhancer:extracted-from"),this._enhList[a]["http://www.semanticdesktop.org/ontologies/2007/01/19/nie#plainTextContent"][0].value},b.prototype._vals=function(a){return this._enhancement.get(a)},b.prototype._uriTrim=function(b){var c,d;return b?b instanceof a.Model||b instanceof a.Collection?(c=b,function(){var a,b,e,f;e=c.models,f=[];for(a=0,b=e.length;a<b;a++)d=e[a],f.push(d.get("@subject").replace(/^<|>$/g,""));return f}()):i(i.flatten([b])).map(function(a){return a.replace(/^<|>$/g,"")}):[]},b}(),Stanbol.EntityEnhancement=function(){function b(a,b){this._enhancement=a,this._textEnhancement=b,this}return b.prototype.getLabel=function(){return this._vals("enhancer:entity-label").toString().replace(/(^\"*|\"*@..$)/g,"")},b.prototype.getUri=function(){return this._uriTrim(this._vals("enhancer:entity-reference"))[0]},b.prototype.getTextEnhancement=function(){return this._textEnhancement},b.prototype.getTypes=function(){return this._uriTrim(this._vals("enhancer:entity-type"))},b.prototype.getConfidence=function(){return Number(this._vals("enhancer:confidence"))},b.prototype._vals=function(a){var b;return b=this._enhancement.get(a),b?b.pluck?b.pluck("@subject"):b:[]},b.prototype._uriTrim=function(b){var c,d;return b?b instanceof a.Collection?(c=b,function(){var a,b,e,f;e=c.models,f=[];for(a=0,b=e.length;a<b;a++)d=e[a],f.push(d.getSubject().replace(/^<|>$/g,""));return f}()):(b instanceof a.Model&&(b=b.getSubject()),i(i.flatten([b])).map(function(a){return a.replace(/^<|>$/g,"")})):[]},b}()})).call(this);