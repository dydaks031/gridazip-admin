webpackJsonp([16],{428:function(e,t,n){n(465);var r=n(1)(n(456),n(469),"data-v-438e7823",null);e.exports=r.exports},456:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(35),o=n.n(r),i=n(190),a=n(12);t.default={name:"private-wrapper",components:{Navbar:i.a,Sidebar:i.b,AppMain:i.c,FooterBar:i.d,NprogressContainer:o.a},beforeMount:function(){var e=this,t=document,n=t.body,r=function(){if(!document.hidden){var t=n.getBoundingClientRect(),r=t.width-3<768;e.toggleDevice(r?"mobile":"other"),e.toggleSidebar({opened:!r})}};document.addEventListener("visibilitychange",r),window.addEventListener("DOMContentLoaded",r),window.addEventListener("resize",r)},computed:n.i(a.mapGetters)({sidebar:"sidebar"}),methods:n.i(a.mapActions)(["toggleDevice","toggleSidebar"])}},462:function(e,t,n){t=e.exports=n(425)(!0),t.push([e.i,"","",{version:3,sources:[],names:[],mappings:"",file:"PrivateWrapper.vue",sourceRoot:""}])},465:function(e,t,n){var r=n(462);"string"==typeof r&&(r=[[e.i,r,""]]),r.locals&&(e.exports=r.locals);n(426)("4f61cea4",r,!0)},469:function(e,t){e.exports={render:function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("nprogress-container"),e._v(" "),n("navbar",{attrs:{show:!0}}),e._v(" "),n("sidebar",{attrs:{show:e.sidebar.opened&&!e.sidebar.hidden}}),e._v(" "),e._t("default"),e._v(" "),n("footer-bar")],2)},staticRenderFns:[]}}});
//# sourceMappingURL=16.1e917f6ccfb4c994f297.js.map