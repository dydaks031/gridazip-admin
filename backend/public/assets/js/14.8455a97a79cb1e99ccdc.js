webpackJsonp([14],{416:function(t,i,n){n(436);var a=n(1)(n(434),n(437),"data-v-543eb68d",null);t.exports=a.exports},434:function(t,i,n){"use strict";Object.defineProperty(i,"__esModule",{value:!0}),i.default={name:"PaginationVue",data:function(){return{curPage:this.options.page,curLimit:this.options.limit,curPoint:this.options.point,curCount:this.options.count,curEnd:this.options.end,curMax:this.options.max,curIndex:this.options.index,startIndex:1,paginationArray:[]}},props:["options","pageClick"],methods:{getCurrentPagination:function(){var t=Math.ceil((this.curMax-1)/2),i=Math.ceil(this.curCount/this.curLimit);this.startIndex=1,this.curIndex>t&&(this.startIndex=Math.max(Math.min(this.curIndex-t,i-this.curMax+1),1));var n=Math.max(Math.min(this.curMax,i-this.startIndex+1),1);this.paginationArray.length=0;for(var a=this.startIndex;a<this.startIndex+n;a+=1)this.paginationArray.push(a)}},watch:{options:{handler:function(t){this.curPage=t.page,this.curLimit=t.limit,this.curPoint=t.point,this.curCount=t.count,this.curEnd=t.end,this.curMax=t.max,this.curIndex=t.index,this.getCurrentPagination()},deep:!0}},mounted:function(){this.getCurrentPagination()}}},435:function(t,i,n){i=t.exports=n(414)(!0),i.push([t.i,"","",{version:3,sources:[],names:[],mappings:"",file:"pagination.vue",sourceRoot:""}])},436:function(t,i,n){var a=n(435);"string"==typeof a&&(a=[[t.i,a,""]]),a.locals&&(t.exports=a.locals);n(415)("c418f292",a,!0)},437:function(t,i){t.exports={render:function(){var t=this,i=t.$createElement,n=t._self._c||i;return n("nav",{staticClass:"pagination",attrs:{role:"navigation","aria-label":"pagination"}},[n("ul",{staticClass:"pagination-list"},t._l(t.paginationArray,function(i){return n("li",[n("a",{staticClass:"pagination-link",on:{click:function(n){t.pageClick(i)}}},[t._v(t._s(i))])])}))])},staticRenderFns:[]}}});
//# sourceMappingURL=14.8455a97a79cb1e99ccdc.js.map