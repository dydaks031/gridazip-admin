webpackJsonp([4,15,16],{427:function(t,e,a){a(450);var i=a(1)(a(448),a(451),"data-v-543eb68d",null);t.exports=i.exports},428:function(t,e,a){a(465);var i=a(1)(a(456),a(469),"data-v-438e7823",null);t.exports=i.exports},434:function(t,e,a){a(567);var i=a(1)(a(487),a(595),"data-v-94babcba",null);t.exports=i.exports},448:function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default={name:"PaginationVue",data:function(){return{curPage:this.options.page,curLimit:this.options.limit,curPoint:this.options.point,curCount:this.options.count,curEnd:this.options.end,curMax:this.options.max,curIndex:this.options.index,startIndex:1,paginationArray:[]}},props:["options","pageClick"],methods:{getCurrentPagination:function(){var t=Math.ceil((this.curMax-1)/2),e=Math.ceil(this.curCount/this.curLimit);this.startIndex=1,this.curIndex>t&&(this.startIndex=Math.max(Math.min(this.curIndex-t,e-this.curMax+1),1));var a=Math.max(Math.min(this.curMax,e-this.startIndex+1),1);this.paginationArray.length=0;for(var i=this.startIndex;i<this.startIndex+a;i+=1)this.paginationArray.push(i)}},watch:{options:{handler:function(t){this.curPage=t.page,this.curLimit=t.limit,this.curPoint=t.point,this.curCount=t.count,this.curEnd=t.end,this.curMax=t.max,this.curIndex=t.index,this.getCurrentPagination()},deep:!0}},mounted:function(){this.getCurrentPagination()}}},449:function(t,e,a){e=t.exports=a(425)(!0),e.push([t.i,"","",{version:3,sources:[],names:[],mappings:"",file:"pagination.vue",sourceRoot:""}])},450:function(t,e,a){var i=a(449);"string"==typeof i&&(i=[[t.i,i,""]]),i.locals&&(t.exports=i.locals);a(426)("c418f292",i,!0)},451:function(t,e){t.exports={render:function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("nav",{staticClass:"pagination",attrs:{role:"navigation","aria-label":"pagination"}},[a("ul",{staticClass:"pagination-list"},t._l(t.paginationArray,function(e){return a("li",[a("a",{staticClass:"pagination-link",on:{click:function(a){t.pageClick(e)}}},[t._v(t._s(e))])])}))])},staticRenderFns:[]}},452:function(t,e,a){"use strict";function i(t){this.filter=t||{}}e.a=i;var c=a(5),n=a.n(c);i.prototype.set=function(t){this.filter=n.a.extend(this.filter,t)},i.prototype.get=function(){return this.filter},i.prototype.setFilter=function(t,e){this.filter[t]=e},i.prototype.getFilter=function(t){return this.filter[t]||null}},453:function(t,e,a){"use strict";function i(t){this.options={page:0,limit:20,point:null,count:0,end:!1,max:5,index:1},this.set(t)}e.a=i,i.prototype.reset=function(){this.set(this.options)},i.prototype.set=function(t){t=t||{},this.page=parseInt(void 0!==t.page?t.page:void 0!==this.page?this.page:this.options.page),this.limit=parseInt(void 0!==t.limit?t.limit:void 0!==this.limit?this.limit:this.options.limit),this.point=void 0===t.point||null===t.point?this.options.point:parseInt(t.point),this.index=Math.max(Math.ceil(this.page/this.limit),1),this.count=parseInt(void 0!==t.count&&null!==t.count?t.count:void 0!==this.count?this.count:this.options.count),this.end=void 0!==t.end?t.end:void 0!==this.end?this.end:this.options.end,this.max=parseInt(void 0===t.max||null===t.max?this.max||this.options.max:t.max)},i.prototype.get=function(){return{index:this.index,limit:this.limit,point:this.point,page:this.page,count:this.count,end:!!this.end}},i.prototype.setIndex=function(t){this.index=t,this.page=(t-1)*this.limit},i.prototype.getIndex=function(){return this.index},i.prototype.setPage=function(t){this.page=parseInt(t)},i.prototype.getPage=function(){return this.page},i.prototype.setLimit=function(t){this.limit=parseInt(t)},i.prototype.getLimit=function(){return this.limit},i.prototype.setPoint=function(t){this.point=void 0===t||null===t?null:parseInt(t)},i.prototype.getPoint=function(){return this.point||null},i.prototype.setCount=function(t){this.count=parseInt(t)},i.prototype.getCount=function(){return this.count},i.prototype.setEnd=function(t){this.end=t},i.prototype.getEnd=function(){return this.end},i.prototype.isEnd=function(){return this.getEnd()}},456:function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var i=a(35),c=a.n(i),n=a(190),r=a(12);e.default={name:"private-wrapper",components:{Navbar:n.a,Sidebar:n.b,AppMain:n.c,FooterBar:n.d,NprogressContainer:c.a},beforeMount:function(){var t=this,e=document,a=e.body,i=function(){if(!document.hidden){var e=a.getBoundingClientRect(),i=e.width-3<768;t.toggleDevice(i?"mobile":"other"),t.toggleSidebar({opened:!i})}};document.addEventListener("visibilitychange",i),window.addEventListener("DOMContentLoaded",i),window.addEventListener("resize",i)},computed:a.i(r.mapGetters)({sidebar:"sidebar"}),methods:a.i(r.mapActions)(["toggleDevice","toggleSidebar"])}},462:function(t,e,a){e=t.exports=a(425)(!0),e.push([t.i,"","",{version:3,sources:[],names:[],mappings:"",file:"PrivateWrapper.vue",sourceRoot:""}])},465:function(t,e,a){var i=a(462);"string"==typeof i&&(i=[[t.i,i,""]]),i.locals&&(t.exports=i.locals);a(426)("4f61cea4",i,!0)},469:function(t,e){t.exports={render:function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",[a("nprogress-container"),t._v(" "),a("navbar",{attrs:{show:!0}}),t._v(" "),a("sidebar",{attrs:{show:t.sidebar.opened&&!t.sidebar.hidden}}),t._v(" "),t._t("default"),t._v(" "),a("footer-bar")],2)},staticRenderFns:[]}},487:function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var i=a(453),c=a(452),n=a(427),r=a.n(n),o=a(9),s=a(428),d=a.n(s),l=a(13),p=a.n(l),v=a(10),u=a(0),b=a.n(u),_=a(24),m=a.n(_),h=a(5),A=a.n(h),g=a(4),f=a.n(g),C=a(2),x=a(192),w=a.n(x),y=C.default.extend(f.a),k=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{title:"",message:"",type:"",direction:"",duration:4500,container:".notifications"};return new y({el:document.createElement("div"),propsData:t})};e.default={name:"contractReceiptIndex",components:{PrivateWrapper:d.a,PaginationVue:r.a,Notification:f.a,Datepicker:p.a,ImageEnlargedView:m.a},mixins:[o.a],data:function(){return{moment:b.a,page:new i.a,filter:new c.a,contractReceiptList:[],receiptAccount:[],receiptList:[],userPermit:"",searchOptions:{status:""},enlargedImage:{image:{},imageGroup:[],index:0}}},methods:{loadContractReceipt:function(){var t=this;this.checkPermission(),this.$http.get("/api/contract/receipt?status="+this.searchOptions.status).then(function(e){if(200!==e.data.code)return t.contractReceiptList=[],void k({message:e.data.data.msg,type:"danger",duration:1500});t.contractReceiptList=e.data.data.contract,t.receiptAccount=e.data.data.receiptAccount||[],t.receiptList=[],t.contractReceiptList.forEach(function(e){var a=function(t,e){return t+e};e.receipt.forEach(function(a){a.contractName=e.name,t.receiptList.push(a)}),e.priceSummary={laborPrice:A.a.reduce(A.a.pluck(e.price,"laborPrice"),a,0),resourcePrice:A.a.reduce(A.a.pluck(e.price,"resourcePrice"),a,0),etcPrice:A.a.reduce(A.a.pluck(e.price,"etcPrice"),a,0),totalPrice:A.a.reduce(A.a.pluck(e.price,"totalPrice"),a,0)},e.receipt.forEach(function(t){switch(t.type){case 0:t.typeToString="인건비";break;case 1:t.typeToString="자재비";break;case 2:t.typeToString="기타잡비"}switch(t.status){case-1:t.statusName="삭제";break;case 0:t.statusName="반려";break;case 1:t.statusName="대기";break;case 2:t.statusName="승인";break;case 3:t.statusName="입금완료"}})})})},changeReceiptStatus:function(t,e){var a=this;this.checkPermission();var i=t.pcPk,c=void 0;(0!==e||(c=window.prompt("반려사유를 입력해 주십시오.")))&&this.$http.put("/api/contract/"+i+"/receipt/"+t.pk,{status:e,rejectReason:c}).then(function(t){a.loadContractReceipt()})},moveToRegisterReceipt:function(){v.a.push({path:"/private/receipt/register"})},checkPermission:function(){this.userPermit=this.$auth.user().user_permit},openImageEnlargedView:function(t){var e=[];A.a.forEach(t.attachment,function(t){e.push({si_url:t.url})}),e.length>0&&(this.enlargedImage.image=e[0],this.enlargedImage.index=0,this.enlargedImage.imageGroup=e,this.$modal.show("imageEnlargedView"))},excelExport:function(t,e){var a=document.getElementById("receiptTable"),i=w.a.utils.book_new(),c=w.a.utils.table_to_sheet(a);return c["!cols"]=[{wch:10},{wch:20},{wch:10},{wch:10},{wch:25},{wch:15},{wch:10},{wch:10},{wch:20},{wch:10},{wch:10},{wch:10},{wch:10},{wch:10}],w.a.utils.book_append_sheet(i,c,"결재목록"),w.a.writeFile(i,e||"결재내역-"+this.moment().format("YYYY-MM-DD HH:mm:ss")+".xlsx")},getAttachmentUrl:function(t){var e=t.attachment,a=[];return A.a.forEach(e,function(t){a.push(t.url)}),a}},mounted:function(){this.loadContractReceipt()}}},556:function(t,e,a){e=t.exports=a(425)(!0),e.push([t.i,'article[data-v-94babcba]{overflow:auto}#addBtn[data-v-94babcba]{margin:1rem 0}.search input[data-v-94babcba],.search select[data-v-94babcba]{width:auto}.search-btn[data-v-94babcba]{line-height:60px}.search-btn a[data-v-94babcba]{vertical-align:bottom}.excel-btn[data-v-94babcba]{margin-right:1rem}.no-data[data-v-94babcba]{text-align:center}.searchbox div.control[data-v-94babcba]{margin-right:3rem}.receiptAccount .subtitle[data-v-94babcba]{font-weight:700}.receiptAccount table thead[data-v-94babcba],.receiptAccount table thead tr[data-v-94babcba]:hover{background-color:#dfdfdf}.receiptAccount table thead tr th[data-v-94babcba]{color:#000;border:1px solid #ccc}.proceeding-contract-list .title-view[data-v-94babcba]{margin-bottom:1rem}.proceeding-contract-list .title-view .subtitle[data-v-94babcba]{float:left;font-weight:700;margin:.5rem 0}.proceeding-contract-list .title-view .summary-info[data-v-94babcba]{float:right}.proceeding-contract-list .title-view .summary-info span[data-v-94babcba]{margin:0 .5rem}.proceeding-contract-list .contract-column-summary[data-v-94babcba]{background-color:#dfdfdf;border:1px solid #ccc;color:#000}.proceeding-contract-list .contract-row-summary[data-v-94babcba]{background-color:#dfdfdf;color:#000}.proceeding-contract-list .contract-row-summary td[data-v-94babcba]{border:1px solid #ccc}.proceeding-contract-list .contract-receipt-list[data-v-94babcba]{padding:.5rem 0}.proceeding-contract-list .contract-receipt-list thead[data-v-94babcba],.proceeding-contract-list .contract-receipt-list thead tr[data-v-94babcba]:hover{background-color:#dfdfdf}.proceeding-contract-list .contract-receipt-list thead tr th[data-v-94babcba]{color:#000;border:1px solid #ccc}.proceeding-contract-list .contract-receipt-list tbody[data-v-94babcba]{font-size:.9rem}.proceeding-contract-list .contract-receipt-list tbody th[data-v-94babcba]{background:#dfdfdf;color:#000;border:1px solid #ccc}.proceeding-contract-list .contract-receipt-list tbody td[data-v-94babcba]{border:1px solid #ccc}.proceeding-contract-list .contract-receipt-list tbody td button.is-primary[data-v-94babcba]{background:#4285f4}.proceeding-contract-list .contract-receipt-list tbody td.receipt-button-wrapper[data-v-94babcba]{text-align:center;vertical-align:middle}@media screen and (max-width:768px){.excel-btn[data-v-94babcba]{margin:.5rem 0}.contract-receipt-wrapper[data-v-94babcba]{background:transparent;box-shadow:none;padding:0}.contract-receipt-wrapper>div[data-v-94babcba]{overflow-x:auto}.contract-receipt-wrapper>p[data-v-94babcba]{float:none;padding:.5rem}.contract-receipt-wrapper .proceeding-contract-list[data-v-94babcba]{margin:.5rem 0}.contract-receipt-wrapper .proceeding-contract-list .title-view .subtitle[data-v-94babcba]{float:inherit}.contract-receipt-wrapper .proceeding-contract-list .title-view .summary-info[data-v-94babcba]{float:inherit;display:block}.contract-receipt-wrapper .proceeding-contract-list .title-view .summary-info span[data-v-94babcba]{display:block;margin:.25rem 0}.contract-receipt-wrapper .proceeding-contract-list .contract-receipt-list tbody[data-v-94babcba]:before{content:"";display:block;height:2rem}}',"",{version:3,sources:["/Users/ohw/WebstormProjects/admin.gridazip.com/frontend/client/views/contractReceipt/index.vue"],names:[],mappings:"AACA,yBAAyB,aAAa,CACrC,AACD,yBAAyB,aAAa,CACrC,AAGD,+DAAgC,UAAU,CACzC,AACD,6BAA6B,gBAAgB,CAC5C,AACD,+BAA+B,qBAAqB,CACnD,AACD,4BAA4B,iBAAiB,CAC5C,AACD,0BAA0B,iBAAiB,CAC1C,AACD,wCAAwC,iBAAiB,CACxD,AACD,2CAA2C,eAAgB,CAC1D,AAGD,mGAAsD,wBAAwB,CAC7E,AACD,mDAAmD,WAAY,qBAAwB,CACtF,AACD,uDAAuD,kBAAkB,CACxE,AACD,iEAAiE,WAAW,gBAAiB,cAAe,CAC3G,AACD,qEAAqE,WAAW,CAC/E,AACD,0EAA0E,cAAe,CACxF,AACD,oEAAoE,yBAAyB,sBAAyB,UAAW,CAChI,AACD,iEAAiE,yBAAyB,UAAW,CACpG,AACD,oEAAoE,qBAAwB,CAC3F,AACD,kEAAkE,eAAgB,CACjF,AAGD,yJAAiF,wBAAwB,CACxG,AACD,8EAA8E,WAAY,qBAAwB,CACjH,AACD,wEAAwE,eAAgB,CACvF,AACD,2EAA2E,mBAAmB,WAAY,qBAAwB,CACjI,AACD,2EAA2E,qBAAwB,CAClG,AACD,6FAA6F,kBAAkB,CAC9G,AACD,kGAAkG,kBAAkB,qBAAqB,CACxI,AACD,oCACA,4BAA4B,cAAe,CAC1C,AACD,2CAA2C,uBAAuB,gBAAgB,SAAS,CAC1F,AACD,+CAA+C,eAAe,CAC7D,AACD,6CAA6C,WAAW,aAAc,CACrE,AACD,qEAAqE,cAAe,CACnF,AACD,2FAA2F,aAAa,CACvG,AACD,+FAA+F,cAAc,aAAa,CACzH,AACD,oGAAoG,cAAc,eAAgB,CACjI,AACD,yGAAyG,WAAW,cAAc,WAAW,CAC5I,CACA",file:"index.vue",sourcesContent:["\narticle[data-v-94babcba]{overflow:auto\n}\n#addBtn[data-v-94babcba]{margin:1rem 0\n}\n.search input[data-v-94babcba]{width:auto\n}\n.search select[data-v-94babcba]{width:auto\n}\n.search-btn[data-v-94babcba]{line-height:60px\n}\n.search-btn a[data-v-94babcba]{vertical-align:bottom\n}\n.excel-btn[data-v-94babcba]{margin-right:1rem\n}\n.no-data[data-v-94babcba]{text-align:center\n}\n.searchbox div.control[data-v-94babcba]{margin-right:3rem\n}\n.receiptAccount .subtitle[data-v-94babcba]{font-weight:bold\n}\n.receiptAccount table thead[data-v-94babcba]{background-color:#dfdfdf\n}\n.receiptAccount table thead tr[data-v-94babcba]:hover{background-color:#dfdfdf\n}\n.receiptAccount table thead tr th[data-v-94babcba]{color:black;border:1px solid #cccccc\n}\n.proceeding-contract-list .title-view[data-v-94babcba]{margin-bottom:1rem\n}\n.proceeding-contract-list .title-view .subtitle[data-v-94babcba]{float:left;font-weight:bold;margin:0.5rem 0\n}\n.proceeding-contract-list .title-view .summary-info[data-v-94babcba]{float:right\n}\n.proceeding-contract-list .title-view .summary-info span[data-v-94babcba]{margin:0 0.5rem\n}\n.proceeding-contract-list .contract-column-summary[data-v-94babcba]{background-color:#dfdfdf;border:1px solid #cccccc;color:black\n}\n.proceeding-contract-list .contract-row-summary[data-v-94babcba]{background-color:#dfdfdf;color:black\n}\n.proceeding-contract-list .contract-row-summary td[data-v-94babcba]{border:1px solid #cccccc\n}\n.proceeding-contract-list .contract-receipt-list[data-v-94babcba]{padding:0.5rem 0\n}\n.proceeding-contract-list .contract-receipt-list thead[data-v-94babcba]{background-color:#dfdfdf\n}\n.proceeding-contract-list .contract-receipt-list thead tr[data-v-94babcba]:hover{background-color:#dfdfdf\n}\n.proceeding-contract-list .contract-receipt-list thead tr th[data-v-94babcba]{color:black;border:1px solid #cccccc\n}\n.proceeding-contract-list .contract-receipt-list tbody[data-v-94babcba]{font-size:0.9rem\n}\n.proceeding-contract-list .contract-receipt-list tbody th[data-v-94babcba]{background:#dfdfdf;color:black;border:1px solid #cccccc\n}\n.proceeding-contract-list .contract-receipt-list tbody td[data-v-94babcba]{border:1px solid #cccccc\n}\n.proceeding-contract-list .contract-receipt-list tbody td button.is-primary[data-v-94babcba]{background:#4285F4\n}\n.proceeding-contract-list .contract-receipt-list tbody td.receipt-button-wrapper[data-v-94babcba]{text-align:center;vertical-align:middle\n}\n@media screen and (max-width: 768px){\n.excel-btn[data-v-94babcba]{margin:0.5rem 0\n}\n.contract-receipt-wrapper[data-v-94babcba]{background:transparent;box-shadow:none;padding:0\n}\n.contract-receipt-wrapper>div[data-v-94babcba]{overflow-x:auto\n}\n.contract-receipt-wrapper>p[data-v-94babcba]{float:none;padding:0.5rem\n}\n.contract-receipt-wrapper .proceeding-contract-list[data-v-94babcba]{margin:0.5rem 0\n}\n.contract-receipt-wrapper .proceeding-contract-list .title-view .subtitle[data-v-94babcba]{float:inherit\n}\n.contract-receipt-wrapper .proceeding-contract-list .title-view .summary-info[data-v-94babcba]{float:inherit;display:block\n}\n.contract-receipt-wrapper .proceeding-contract-list .title-view .summary-info span[data-v-94babcba]{display:block;margin:0.25rem 0\n}\n.contract-receipt-wrapper .proceeding-contract-list .contract-receipt-list tbody[data-v-94babcba]:before{content:'';display:block;height:2rem\n}\n}\n"],sourceRoot:""}])},567:function(t,e,a){var i=a(556);"string"==typeof i&&(i=[[t.i,i,""]]),i.locals&&(t.exports=i.locals);a(426)("2e6db022",i,!0)},595:function(t,e){t.exports={render:function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",[a("div",{staticClass:"search box"},[a("div",{staticClass:"block"},[a("div",{staticClass:"is-clearfix"},[a("div",{staticClass:"is-pulled-left is-horizontal searchbox"},[a("div",{staticClass:"control is-inline-block"},[a("label",{staticClass:"label"},[t._v("진행상태")]),t._v(" "),a("div",{staticClass:"select"},[a("select",{directives:[{name:"model",rawName:"v-model",value:t.searchOptions.status,expression:"searchOptions.status"}],on:{change:function(e){var a=Array.prototype.filter.call(e.target.options,function(t){return t.selected}).map(function(t){return"_value"in t?t._value:t.value});t.$set(t.searchOptions,"status",e.target.multiple?a:a[0])}}},[a("option",{attrs:{value:"",selected:"selected"}},[t._v("선택")]),t._v(" "),a("option",{attrs:{value:"0"}},[t._v("반려")]),t._v(" "),a("option",{attrs:{value:"1"}},[t._v("기안")]),t._v(" "),a("option",{attrs:{value:"2"}},[t._v("승인")]),t._v(" "),a("option",{attrs:{value:"3"}},[t._v("입금완료")])])])])]),t._v(" "),a("div",{staticClass:"is-pulled-right search-btn"},[a("a",{staticClass:"button is-info",on:{click:t.loadContractReceipt}},[t._v("검색")])])])])]),t._v(" "),a("div",{staticClass:"tile is-ancestor"},[a("div",{staticClass:"tile is-parent"},[a("article",{staticClass:"tile is-child box contract-receipt-wrapper"},[a("div",{staticClass:"is-clearfix"},[a("p",{staticClass:"subtitle is-3 is-pulled-left"},[t._v("결재 요청내역")]),t._v(" "),a("a",{staticClass:"button is-primary is-pulled-right is-medium",on:{click:t.moveToRegisterReceipt}},[t._v("등록")]),t._v(" "),a("button",{staticClass:"button is-info is-pulled-right is-medium excel-btn",on:{click:function(e){t.excelExport("xlsx")}}},[t._v("엑셀 다운로드")])]),t._v(" "),"C"===t.userPermit?a("div",{staticClass:"receiptAccount"},[a("h1",{staticClass:"subtitle"},[t._v("입금 요청 내역 집계")]),t._v(" "),a("table",{staticClass:"table is-bordered"},[t._m(0),t._v(" "),a("tbody",[t._l(t.receiptAccount,function(e){return a("tr",[a("td",[t._v(t._s(e.accountBank))]),t._v(" "),a("td",[t._v(t._s(e.accountNumber))]),t._v(" "),a("td",[t._v(t._s(e.accountHolder))]),t._v(" "),a("td",[t._v(t._s(e.price))])])}),t._v(" "),0===t.receiptAccount.length?a("tr",[a("td",{staticClass:"no-data",attrs:{colspan:"4"}},[t._v("입금할 내역이 없습니다.")])]):t._e()],2)])]):t._e(),t._v(" "),a("div",[a("ul",{staticClass:"proceeding-contract-list"},t._l(t.contractReceiptList,function(e){return a("li",{staticClass:"contractItem box"},[a("div",{staticClass:"title-view is-clearfix"},[a("h1",{staticClass:"subtitle"},[t._v(t._s(e.name)+" 현장 비용현황")]),t._v(" "),a("div",{staticClass:"summary-info is-flex"},[a("span",[t._v("당 현장 견적금액: "+t._s(t.addCommas(e.contractTotalCosts))+"원")]),t._v(" "),a("span",[t._v("현 집행금액: "+t._s(t.addCommas(e.receiptTotalCosts))+"원")]),t._v(" "),a("span",[t._v("집행률: "+t._s((e.receiptTotalCosts/e.contractTotalCosts*100).toFixed(2))+"%")])])]),t._v(" "),a("table",{staticClass:"table is-bordered contract-summary"},[t._m(1,!0),t._v(" "),a("tbody",[t._l(e.price,function(e){return a("tr",[a("td",[t._v(t._s(t.addCommas(e.ctName)))]),t._v(" "),a("td",{staticClass:"is-hidden-mobile"},[t._v(t._s(t.addCommas(e.laborPrice)))]),t._v(" "),a("td",{staticClass:"is-hidden-mobile"},[t._v(t._s(t.addCommas(e.resourcePrice)))]),t._v(" "),a("td",{staticClass:"is-hidden-mobile"},[t._v(t._s(t.addCommas(e.etcPrice)))]),t._v(" "),a("td",{staticClass:"contract-column-summary"},[t._v(t._s(t.addCommas(e.totalPrice)))])])}),t._v(" "),a("tr",{staticClass:"contract-row-summary"},[a("td",[t._v("계")]),t._v(" "),a("td",{staticClass:"is-hidden-mobile"},[t._v(t._s(t.addCommas(e.priceSummary.laborPrice)))]),t._v(" "),a("td",{staticClass:"is-hidden-mobile"},[t._v(t._s(t.addCommas(e.priceSummary.resourcePrice)))]),t._v(" "),a("td",{staticClass:"is-hidden-mobile"},[t._v(t._s(t.addCommas(e.priceSummary.etcPrice)))]),t._v(" "),a("td",[t._v(t._s(t.addCommas(e.priceSummary.totalPrice)))])])],2)]),t._v(" "),a("div",{staticClass:"title-view"},[a("h1",{staticClass:"subtitle"},[t._v(t._s(e.name)+" 현장 입금 요청내역")])]),t._v(" "),a("table",{staticClass:"table is-bordered contract-receipt-list is-hidden-touch"},[t._m(2,!0),t._v(" "),t._l(e.receipt,function(e){return-1!==e.status?a("tbody",[a("tr",[a("td",[t._v(t._s(e.drafter))]),t._v(" "),a("td",{attrs:{t:"d"}},[t._v(t._s(t.moment(e.date,"YYYY-MM-DDTHH:mm:ss.SSSZ").format("YY-MM-DD")))]),t._v(" "),a("td",[t._v(t._s(e.ctName))]),t._v(" "),a("td",[t._v(t._s(e.typeToString))]),t._v(" "),a("td",[t._v(t._s(e.contents))]),t._v(" "),a("td",[t._v(t._s(t.addCommas(e.price)))]),t._v(" "),a("td",[t._v(t._s(0===e.isVatIncluded?"미포함":"포함"))]),t._v(" "),a("td",{attrs:{t:"s"}},[t._v("\n                    "+t._s(e.accountNumber)),a("br"),t._v("\n                    "+t._s(e.accountBank)),a("br"),t._v("\n                    "+t._s(e.accountHolder)+"\n                  ")]),t._v(" "),a("td",[e.attachment.length>0?a("a",{attrs:{href:"#"},on:{click:function(a){t.openImageEnlargedView(e)}}},[t._v("링크")]):t._e()]),t._v(" "),a("td",[t._v(t._s(e.statusName))]),t._v(" "),a("td",[t._v(t._s(e.memo))]),t._v(" "),a("td",{staticClass:"receipt-button-wrapper"},["C"===t.userPermit||"B"===t.userPermit&&2!==e.status?a("button",{staticClass:"button is-danger is-medium",on:{click:function(a){t.changeReceiptStatus(e,0)}}},[t._v("반려")]):t._e(),t._v(" "),0===e.status?a("button",{staticClass:"button is-danger is-medium",on:{click:function(a){t.changeReceiptStatus(e,-1)}}},[t._v("삭제")]):t._e(),t._v(" "),"B"===t.userPermit&&2!==e.status?a("button",{staticClass:"button is-primary is-medium",on:{click:function(a){t.changeReceiptStatus(e,2)}}},[t._v("승인")]):t._e(),t._v(" "),"C"===t.userPermit?a("button",{staticClass:"button is-primary is-medium",on:{click:function(a){t.changeReceiptStatus(e,3)}}},[t._v("입금완료")]):t._e()])])]):t._e()})],2),t._v(" "),0!==t.contractReceiptList.length?a("table",{staticClass:"table is-bordered contract-receipt-list is-hidden-desktop"},t._l(e.receipt,function(e){return-1!==e.status?a("tbody",[a("tr",[a("th",[t._v("날짜")]),t._v(" "),a("td",[t._v(t._s(t.moment(e.date,"YYYY-MM-DDTHH:mm:ss.SSSZ").format("YYYY-MM-DD")))])]),t._v(" "),a("tr",[a("th",[t._v("공사")]),t._v(" "),a("td",[t._v(t._s(e.ctName))])]),t._v(" "),a("tr",[a("th",[t._v("구분")]),t._v(" "),a("td",[t._v(t._s(e.typeToString))])]),t._v(" "),a("tr",[a("th",[t._v("내용")]),t._v(" "),a("td",[t._v(t._s(e.contents))])]),t._v(" "),a("tr",[a("th",[t._v("금액")]),t._v(" "),a("td",[t._v(t._s(t.addCommas(e.price)))])]),t._v(" "),a("tr",[a("th",[t._v("부가세")]),t._v(" "),a("td",[t._v(t._s(0===e.isVatIncluded?"미포함":"포함"))])]),t._v(" "),a("tr",[a("th",[t._v("은행명")]),t._v(" "),a("td",[t._v(t._s(e.accountBank))])]),t._v(" "),a("tr",[a("th",[t._v("예금주")]),t._v(" "),a("td",[t._v(t._s(e.accountHolder))])]),t._v(" "),a("tr",[a("th",[t._v("계좌번호")]),t._v(" "),a("td",[t._v(t._s(e.accountNumber))])]),t._v(" "),a("tr",[a("th",[t._v("첨부서류")]),t._v(" "),a("td",[a("a",{attrs:{href:"#"},on:{click:function(a){t.openImageEnlargedView(e)}}},[t._v("링크")])])]),t._v(" "),a("tr",[a("th",[t._v("진행상태")]),t._v(" "),a("td",[t._v(t._s(e.statusName))])]),t._v(" "),e.rejectReason?t._e():a("tr",[a("th",[t._v("메모")]),t._v(" "),a("td",[t._v(t._s(e.memo))])]),t._v(" "),e.rejectReason?a("tr",[a("th",[t._v("반려사유")]),t._v(" "),a("td",[t._v(t._s(e.rejectReason))])]):t._e(),t._v(" "),a("tr",[a("td",{staticClass:"receipt-button-wrapper",attrs:{colspan:"2"}},["C"===t.userPermit||"B"===t.userPermit&&2!==e.status?a("button",{staticClass:"button is-danger is-medium",on:{click:function(a){t.changeReceiptStatus(e,0)}}},[t._v("반려")]):t._e(),t._v(" "),0===e.status?a("button",{staticClass:"button is-danger is-medium",on:{click:function(a){t.changeReceiptStatus(e,-1)}}},[t._v("삭제")]):t._e(),t._v(" "),"B"===t.userPermit&&2!==e.status?a("button",{staticClass:"button is-primary is-medium",on:{click:function(a){t.changeReceiptStatus(e,2)}}},[t._v("승인")]):t._e(),t._v(" "),"C"===t.userPermit?a("button",{staticClass:"button is-primary is-medium",on:{click:function(a){t.changeReceiptStatus(e,3)}}},[t._v("입금완료")]):t._e()])])]):t._e()})):t._e()])})),t._v(" "),a("table",{directives:[{name:"show",rawName:"v-show",value:!1,expression:"false"}],staticClass:"table is-bordered contract-receipt",attrs:{id:"receiptTable"}},[t._m(3),t._v(" "),t._l(t.receiptList,function(e){return-1!==e.status?a("tbody",[a("tr",[a("td",{attrs:{t:"d"}},[t._v(t._s(t.moment(e.date,"YYYY-MM-DDTHH:mm:ss.SSSZ").format("YYYY-MM-DD")))]),t._v(" "),a("td",[t._v(t._s(e.contractName))]),t._v(" "),a("td",[t._v(t._s(e.ctName))]),t._v(" "),a("td",[t._v(t._s(1===e.type?"자재비":"인건비"))]),t._v(" "),a("td",[t._v(t._s(e.contents))]),t._v(" "),a("td",[t._v(t._s(t.addCommas(e.price)))]),t._v(" "),a("td",[t._v(t._s(0===e.isVatIncluded?"미포함":"포함"))]),t._v(" "),a("td",[t._v(t._s(e.accountBank))]),t._v(" "),a("td",[t._v(t._s(e.accountHolder))]),t._v(" "),a("td",{attrs:{t:"s"}},[t._v(t._s(e.accountNumber))]),t._v(" "),a("td",[t._v(t._s(e.statusName))]),t._v(" "),a("td",[t._v(t._s(e.memo))]),t._v(" "),a("td",[t._v(t._s(e.rejectReason))])])]):t._e()})],2)])])])]),t._v(" "),a("div"),t._v(" "),a("ImageEnlargedView",{attrs:{image:t.enlargedImage.image,imageGroup:t.enlargedImage.imageGroup,index:t.enlargedImage.index,isReceipt:!0}})],1)},staticRenderFns:[function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("thead",[a("tr",[a("th",[t._v("은행명")]),t._v(" "),a("th",[t._v("계좌번호")]),t._v(" "),a("th",[t._v("예금주")]),t._v(" "),a("th",[t._v("금액")])])])},function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("thead",[a("tr",[a("th",[t._v("공사")]),t._v(" "),a("th",{staticClass:"is-hidden-mobile"},[t._v("인건비")]),t._v(" "),a("th",{staticClass:"is-hidden-mobile"},[t._v("자재비")]),t._v(" "),a("th",{staticClass:"is-hidden-mobile"},[t._v("기타잡비")]),t._v(" "),a("th",{staticClass:"contract-column-summary"},[t._v("계")])])])},function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("thead",[a("tr",[a("th",[t._v("기안자")]),t._v(" "),a("th",[t._v("비용청구일자")]),t._v(" "),a("th",[t._v("공사")]),t._v(" "),a("th",[t._v("비용구분")]),t._v(" "),a("th",[t._v("비용상세내역")]),t._v(" "),a("th",[t._v("청구금액")]),t._v(" "),a("th",[t._v("부가세")]),t._v(" "),a("th",[t._v("입금정보")]),t._v(" "),a("th",[t._v("첨부서류")]),t._v(" "),a("th",[t._v("결재상태")]),t._v(" "),a("th",[t._v("메모")]),t._v(" "),a("th",[t._v("결재")])])])},function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("thead",[a("tr",[a("th",[t._v("날짜")]),t._v(" "),a("th",[t._v("현장")]),t._v(" "),a("th",[t._v("공사")]),t._v(" "),a("th",[t._v("구분")]),t._v(" "),a("th",[t._v("내용")]),t._v(" "),a("th",[t._v("금액")]),t._v(" "),a("th",[t._v("부가세")]),t._v(" "),a("th",[t._v("은행명")]),t._v(" "),a("th",[t._v("예금주")]),t._v(" "),a("th",[t._v("계좌번호")]),t._v(" "),a("th",[t._v("진행상태")]),t._v(" "),a("th",[t._v("메모")]),t._v(" "),a("th",[t._v("반려사유")])])])}]}}});
//# sourceMappingURL=4.283b5a895c51584debea.js.map