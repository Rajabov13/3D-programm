import{j as t}from"./three-core-Cy1vprC-.js";import{k as c,S as n,f as l,u as m,y as o}from"./index-PyFXmlK8.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=c("HeartCrack",[["path",{d:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",key:"c3ymky"}],["path",{d:"m12 13-1-1 2-2-3-3 2-2",key:"xjdxli"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=c("Heart",[["path",{d:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",key:"c3ymky"}]]);function h({hearts:e,className:s}){const r=m();return t.jsx("div",{className:l("flex items-center gap-1",s),role:"img","aria-label":r("play.hearts",{n:e}),children:Array.from({length:o},(i,a)=>a<e?t.jsx(d,{className:"h-6 w-6 fill-[#f43f5e] text-[#e11d48]","aria-hidden":!0},a):t.jsx(f,{className:"h-6 w-6 text-slate-600","aria-hidden":!0},a))})}function y({value:e,size:s=20,className:r,animate:i=!1}){return t.jsx("span",{className:l("inline-flex items-center gap-0.5",r),role:"img","aria-label":`${e}/3 ⭐`,children:[1,2,3].map(a=>t.jsx(n,{size:s,"aria-hidden":!0,style:i?{animationDelay:`${a*220}ms`}:void 0,className:l(a<=e?"fill-[#fbbf24] text-[#f59e0b]":"fill-white/[0.06] text-white/20",i&&a<=e&&"animate-star-pop")},a))})}export{f as H,y as S,h as a};
