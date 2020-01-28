webpackJsonp([9,12],{458:function(t,i,n){n(475);var e=n(1)(n(473),n(476),"data-v-543eb68d",null);t.exports=e.exports},465:function(t,i,n){n(571);var e=n(1)(n(506),n(583),"data-v-3a2c92a6",null);t.exports=e.exports},473:function(t,i,n){"use strict";Object.defineProperty(i,"__esModule",{value:!0}),i.default={name:"PaginationVue",data:function(){return{curPage:this.options.page,curLimit:this.options.limit,curPoint:this.options.point,curCount:this.options.count,curEnd:this.options.end,curMax:this.options.max,curIndex:this.options.index,startIndex:1,paginationArray:[]}},props:["options","pageClick"],methods:{getCurrentPagination:function(){var t=Math.ceil((this.curMax-1)/2),i=Math.ceil(this.curCount/this.curLimit);this.startIndex=1,this.curIndex>t&&(this.startIndex=Math.max(Math.min(this.curIndex-t,i-this.curMax+1),1));var n=Math.max(Math.min(this.curMax,i-this.startIndex+1),1);this.paginationArray.length=0;for(var e=this.startIndex;e<this.startIndex+n;e+=1)this.paginationArray.push(e)}},watch:{options:{handler:function(t){this.curPage=t.page,this.curLimit=t.limit,this.curPoint=t.point,this.curCount=t.count,this.curEnd=t.end,this.curMax=t.max,this.curIndex=t.index,this.getCurrentPagination()},deep:!0}},mounted:function(){this.getCurrentPagination()}}},474:function(t,i,n){i=t.exports=n(457)(!0),i.push([t.i,"","",{version:3,sources:[],names:[],mappings:"",file:"pagination.vue",sourceRoot:""}])},475:function(t,i,n){var e=n(474);"string"==typeof e&&(e=[[t.i,e,""]]),e.locals&&(t.exports=e.locals);n(456)("c418f292",e,!0)},476:function(t,i){t.exports={render:function(){var t=this,i=t.$createElement,n=t._self._c||i;return n("nav",{staticClass:"pagination",attrs:{role:"navigation","aria-label":"pagination"}},[n("ul",{staticClass:"pagination-list"},t._l(t.paginationArray,function(i){return n("li",[n("a",{staticClass:"pagination-link",on:{click:function(n){t.pageClick(i)}}},[t._v(t._s(i))])])}))])},staticRenderFns:[]}},477:function(t,i,n){"use strict";function e(t){this.options={page:0,limit:20,point:null,count:0,end:!1,max:5,index:1},this.set(t)}i.a=e,e.prototype.reset=function(){this.set(this.options)},e.prototype.set=function(t){t=t||{},this.page=parseInt(void 0!==t.page?t.page:void 0!==this.page?this.page:this.options.page),this.limit=parseInt(void 0!==t.limit?t.limit:void 0!==this.limit?this.limit:this.options.limit),this.point=void 0===t.point||null===t.point?this.options.point:parseInt(t.point),this.index=Math.max(Math.ceil(this.page/this.limit),1),this.count=parseInt(void 0!==t.count&&null!==t.count?t.count:void 0!==this.count?this.count:this.options.count),this.end=void 0!==t.end?t.end:void 0!==this.end?this.end:this.options.end,this.max=parseInt(void 0===t.max||null===t.max?this.max||this.options.max:t.max)},e.prototype.get=function(){return{index:this.index,limit:this.limit,point:this.point,page:this.page,count:this.count,end:!!this.end}},e.prototype.setIndex=function(t){this.index=t,this.page=(t-1)*this.limit},e.prototype.getIndex=function(){return this.index},e.prototype.setPage=function(t){this.page=parseInt(t)},e.prototype.getPage=function(){return this.page},e.prototype.setLimit=function(t){this.limit=parseInt(t)},e.prototype.getLimit=function(){return this.limit},e.prototype.setPoint=function(t){this.point=void 0===t||null===t?null:parseInt(t)},e.prototype.getPoint=function(){return this.point||null},e.prototype.setCount=function(t){this.count=parseInt(t)},e.prototype.getCount=function(){return this.count},e.prototype.setEnd=function(t){this.end=t},e.prototype.getEnd=function(){return this.end},e.prototype.isEnd=function(){return this.getEnd()}},506:function(t,i,n){"use strict";Object.defineProperty(i,"__esModule",{value:!0});var e=n(477),o=n(11),a=n(0),s=n.n(a),r=n(458),p=n.n(r),c=n(2),u=n(4),h=n.n(u),l=n(9),d=c.default.extend(h.a),g=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{title:"",message:"",type:"",direction:"",duration:4500,container:".notifications"};return new d({el:document.createElement("div"),propsData:t})};i.default={name:"requestList",components:{PaginationVue:p.a},mixins:[l.a],data:function(){return{page:new e.a,data:[],isLoading:!1,moment:s.a}},methods:{loadData:function(){var t=this;this.isLoading=!0,this.data.length=0,console.log("/api/magazine?point="+this.page.getPoint()+"&page="+this.page.getPage()),this.$http.get("/api/magazine?point="+this.page.getPoint()+"&page="+this.page.getPage(),{page:this.page.get()}).then(function(i){if(200===i.data.code){var n=i.data.data;t.data=n.data,t.page.set(n.page)}}).catch(function(t){console.error(t)})},moveToPage:function(t){o.a.push({path:"/private/magazine/"+t.mg_pk})},moveToPagination:function(t){console.log("curIndex"+t),this.page.setIndex(t),this.loadData()},moveToRegister:function(){o.a.push({path:"/private/magazine/register"})},deleteRow:function(t){var i=this;this.$http.delete("/api/magazine/"+t.mg_pk,{}).then(function(t){console.log(t),g({message:"삭제되었습니다.",type:"success",duration:1500}),i.page.getPage()>i.page.getLimit()?i.page.setPage(i.page.getPage()-i.page.getLimit()):(i.page.setPage(0),i.page.setPoint(null)),i.page.setLimit(20),i.loadData()}).catch(function(t){console.error(t)})}},beforeRouteUpdate:function(t,i,n){console.log("to: "+t),console.log("from: "+i),this.loadData(),n()},mounted:function(){this.loadData()}}},562:function(t,i,n){i=t.exports=n(457)(!0),i.push([t.i,"","",{version:3,sources:[],names:[],mappings:"",file:"index.vue",sourceRoot:""}])},571:function(t,i,n){var e=n(562);"string"==typeof e&&(e=[[t.i,e,""]]),e.locals&&(t.exports=e.locals);n(456)("aa4a10a6",e,!0)},583:function(t,i){t.exports={render:function(){var t=this,i=t.$createElement,n=t._self._c||i;return n("div",[n("div",{staticClass:"tile is-ancestor"},[n("div",{staticClass:"tile is-parent"},[n("article",{staticClass:"tile is-child box"},[n("h4",{staticClass:"title"},[t._v("매거진 목록")]),t._v(" "),n("a",{staticClass:"button is-primary is-pulled-right is-medium",attrs:{id:"addBtn"},on:{click:t.moveToRegister}},[t._v("등록")]),t._v(" "),n("table",{staticClass:"table"},[t._m(0),t._v(" "),t._m(1),t._v(" "),n("tbody",t._l(t.data,function(i,e){return n("tr",{on:{click:function(n){t.moveToPage(i)}}},[n("td",[t._v(t._s(i.mg_pk))]),t._v(" "),n("td",[t._v(t._s(i.mg_subject))]),t._v(" "),n("td",[t._v(t._s(t.getComputedDate(i.mg_reg_dt)))]),t._v(" "),n("td",[t._v(t._s(t.getComputedDate(i.mg_mod_dt)))]),t._v(" "),n("td",[n("button",{staticClass:"button",on:{click:function(n){n.stopPropagation(),t.deleteRow(i)}}},[t._v("삭제")])])])}))])])])]),t._v(" "),n("div",[n("pagination-vue",{attrs:{options:t.page,"page-click":t.moveToPagination}})],1)])},staticRenderFns:[function(){var t=this,i=t.$createElement,n=t._self._c||i;return n("colgroup",[n("col",{attrs:{width:"14%"}}),t._v(" "),n("col",{attrs:{width:"40%"}}),t._v(" "),n("col",{attrs:{width:"16%"}}),t._v(" "),n("col",{attrs:{width:"16%"}}),t._v(" "),n("col",{attrs:{width:"14%"}})])},function(){var t=this,i=t.$createElement,n=t._self._c||i;return n("thead",[n("tr",[n("th",[t._v("번호")]),t._v(" "),n("th",[t._v("제목")]),t._v(" "),n("th",[t._v("등록일")]),t._v(" "),n("th",[t._v("수정일")]),t._v(" "),n("th",[t._v("설정")])])])}]}}});
//# sourceMappingURL=9.f446992371241b41b27a.js.map