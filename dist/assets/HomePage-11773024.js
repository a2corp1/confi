import{r as i,u as W,j as e}from"./index-946c3423.js";import{B as v}from"./Button-0509c05a.js";import{L as H,A as V,f as P}from"./tokenService-54566c64.js";import{t as Y}from"./dataFormatUtils-eaec876b.js";import{u as q}from"./axios-c189fee4.js";import{C as U}from"./ChartBarIcon-d5df37c4.js";function X({title:c,titleId:d,...g},x){return i.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:x,"aria-labelledby":d},g),c?i.createElement("title",{id:d},c):null,i.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"}))}const G=i.forwardRef(X),Q=G;function Z({title:c,titleId:d,...g},x){return i.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:x,"aria-labelledby":d},g),c?i.createElement("title",{id:d},c):null,i.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"}))}const K=i.forwardRef(Z),_=K;function J({title:c,titleId:d,...g},x){return i.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:x,"aria-labelledby":d},g),c?i.createElement("title",{id:d},c):null,i.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"}))}const ee=i.forwardRef(J),R=ee,le=()=>{const c=W(),[d,g]=i.useState(""),[x,L]=i.useState(!1),[p,N]=i.useState("all"),[I,B]=i.useState([]),C=i.useRef(null),M=i.useRef(null),F=i.useRef(null),{data:S,isLoading:$,error:te}=q({queryKey:["topTokensByMarketCap"],queryFn:P,staleTime:0,refetchOnWindowFocus:!0,refetchOnMount:!0}),y=(S==null?void 0:S.data)||[];i.useEffect(()=>{const t=C.current;if(!t)return;const a=t.getContext("2d");let o;const n=()=>{t&&t.parentElement&&(t.width=t.parentElement.offsetWidth,t.height=t.parentElement.offsetHeight)};window.addEventListener("resize",n),n();const l=[],h=60,w=["#60a5fa","#93c5fd","#3b82f6","#8b5cf6","#c4b5fd","#a78bfa"],j=150;let m={x:null,y:null,radius:100};t.addEventListener("mousemove",r=>{const s=t.getBoundingClientRect();m.x=r.clientX-s.left,m.y=r.clientY-s.top}),t.addEventListener("mouseleave",()=>{m.x=null,m.y=null});for(let r=0;r<h;r++){const s=Math.random()*3+1;l.push({x:Math.random()*t.width,y:Math.random()*t.height,radius:s,baseRadius:s,color:w[Math.floor(Math.random()*w.length)],vx:Math.random()*.4-.2,vy:Math.random()*.4-.2,opacity:Math.random()*.5+.3,pulse:Math.random()*.1,pulseSpeed:Math.random()*.02+.01})}const E=()=>{a.clearRect(0,0,t.width,t.height);for(let r=0;r<l.length;r++){const s=l[r];if(s.pulse+=s.pulseSpeed,(s.pulse>1||s.pulse<0)&&(s.pulseSpeed*=-1),s.radius=s.baseRadius*(1+s.pulse*.3),m.x){const b=m.x-s.x,u=m.y-s.y,f=Math.sqrt(b*b+u*u);if(f<m.radius){const k=(m.radius-f)*.02;s.vx-=b/f*k,s.vy-=u/f*k}}for(let b=r+1;b<l.length;b++){const u=l[b],f=s.x-u.x,k=s.y-u.y,A=Math.sqrt(f*f+k*k);if(A<j){const z=1-A/j;a.beginPath(),a.moveTo(s.x,s.y),a.lineTo(u.x,u.y),a.strokeStyle=`rgba(147, 197, 253, ${z*.2})`,a.lineWidth=z*.8,a.stroke()}}}l.forEach(r=>{r.x+=r.vx,r.y+=r.vy,(r.x<0||r.x>t.width)&&(r.vx*=-1,r.vx+=Math.random()*.02-.01),(r.y<0||r.y>t.height)&&(r.vy*=-1,r.vy+=Math.random()*.02-.01),r.vx*=.995,r.vy*=.995,a.beginPath(),a.arc(r.x,r.y,r.radius,0,Math.PI*2);const s=a.createRadialGradient(r.x,r.y,0,r.x,r.y,r.radius*2);s.addColorStop(0,r.color+Math.floor(r.opacity*255).toString(16).padStart(2,"0")),s.addColorStop(1,r.color+"00"),a.fillStyle=s,a.fill()}),o=requestAnimationFrame(E)};return E(),()=>{window.removeEventListener("resize",n),t.removeEventListener("mousemove",null),t.removeEventListener("mouseleave",null),cancelAnimationFrame(o)}},[]),i.useEffect(()=>{const t=new IntersectionObserver(n=>{n.forEach(l=>{l.isIntersecting&&l.target.classList.add("in-view")})},{threshold:.1}),a=document.querySelectorAll(".animate-on-scroll"),o=setTimeout(()=>{a.forEach(n=>{t.observe(n)})},100);return()=>{clearTimeout(o),a.forEach(n=>{t.unobserve(n)})}},[]),i.useEffect(()=>{const t=a=>{M.current&&!M.current.contains(a.target)&&L(!1)};return document.addEventListener("mousedown",t),()=>{document.removeEventListener("mousedown",t)}},[]),i.useEffect(()=>{if(!F.current)return;document.querySelectorAll(".live-counter").forEach(a=>{const o=parseInt(a.getAttribute("data-target").replace(/,/g,""),10),n=parseInt(a.getAttribute("data-increment"),10),l=parseInt(a.getAttribute("data-interval"),10);let h=parseInt(a.textContent.replace(/,/g,""),10);const w=setInterval(()=>{h+=n,h>o&&(h=o),a.textContent=h.toLocaleString(),h===o&&setTimeout(()=>{const j=o+Math.floor(Math.random()*5)+1;a.setAttribute("data-target",j.toString())},5e3)},l);return()=>clearInterval(w)})},[]),i.useEffect(()=>{const t=[{action:"analyzed",token:"RAY",user:"7aza...3e9"},{action:"scanned",token:"BONK",user:"2bf3...f14"},{action:"tracked",token:"ORCA",user:"9c1t...d45"},{action:"verified",token:"SOL",user:"3fop...a21"},{action:"monitored",token:"JTO",user:"08xe...b12"},{action:"checked",token:"SAMO",user:"v05d...c87"},{action:"reviewed",token:"COPE",user:"m01a...e63"}],a=setInterval(()=>{const o=t[Math.floor(Math.random()*t.length)],n=new Date().toISOString();B(l=>[{...o,timestamp:n},...l].slice(0,5))},4500);return()=>clearInterval(a)},[]);const D=t=>{t.preventDefault(),d.trim()&&c(`/token/${d.trim()}`)},O=({level:t})=>{let a,o,n;switch(t){case"safe":a="bg-green-100 text-green-700 border-green-200",o="Verified",n="✓";break;case"caution":a="bg-yellow-100 text-yellow-700 border-yellow-200",o="Use Caution",n="!";break;case"unknown":a="bg-blue-100 text-blue-700 border-blue-200",o="New Token",n="?";break;default:a="bg-blue-100 text-blue-700 border-blue-200",o="Unknown",n="?"}return e.jsxs("span",{className:`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${a} border`,children:[e.jsx("span",{className:"mr-1",children:n}),o]})},T=()=>p==="all"?y:p==="verified"?y.filter((t,a)=>a%3===0):p==="trending"?y.slice(0,3):y;return e.jsxs("div",{className:"mt-4 md:mt-12 relative",children:[e.jsx("div",{className:"absolute inset-0 overflow-hidden pointer-events-none -z-10",children:e.jsx("canvas",{ref:C,className:"w-full h-full opacity-30"})}),e.jsxs("div",{className:"relative px-6 py-16 sm:py-24 lg:py-32 overflow-hidden rounded-3xl   z-10",children:[e.jsxs("div",{className:"absolute right-6 top-6 w-64 h-auto max-h-40 overflow-hidden rounded-xl bg-white/20 dark:bg-dark-900/20 backdrop-blur-md border border-blue-100/20 dark:border-blue-900/20 text-left p-3 shadow-lg md:block hidden",children:[e.jsxs("h4",{className:"text-xs font-semibold text-blue-700 dark:text-blue-300 border-b border-blue-100 dark:border-dark-700 pb-1 flex items-center justify-between",children:[e.jsx("span",{children:"LIVE ACTIVITY"}),e.jsxs("span",{className:"flex items-center",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-green-500 mr-1 pulse-dot"})," Now"]})]}),e.jsx("div",{className:"space-y-2 mt-2 activity-feed",children:I.map((t,a)=>e.jsxs("div",{className:"text-xs text-gray-600 dark:text-dark-300 flex items-center",children:[e.jsx("span",{className:`h-1.5 w-1.5 rounded-full mr-1.5 ${t.action==="verified"?"bg-green-500":t.action==="analyzed"?"bg-blue-500":"bg-purple-500"}`}),e.jsx("span",{className:"font-medium text-gray-800 dark:text-white",children:t.user}),e.jsx("span",{className:"mx-1",children:t.action}),e.jsx("span",{className:"font-mono",children:t.token})]},a))})]}),e.jsxs("div",{className:"relative max-w-3xl mx-auto text-center",children:[e.jsx("div",{className:"flex items-center justify-center mb-4",children:e.jsx("div",{className:"rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 animate-pulse-slow",children:e.jsx(R,{className:"h-8 w-8 text-blue-600 dark:text-blue-400"})})}),e.jsxs("h1",{className:"text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight",children:["Scan a solana ",e.jsx("span",{className:"text-blue-600 dark:text-blue-400",children:"token"})]}),e.jsxs("p",{className:"text-lg md:text-xl text-gray-600 dark:text-dark-300 mb-8",children:["Discover, analyze, and make informed decisions about any Solana token.",e.jsx("br",{}),"Simple and powerful tools for everyone - from beginners to experts."]}),e.jsxs("div",{className:"flex justify-center space-x-6 mb-8",children:[e.jsxs("div",{className:"stat-card live-stat-card",children:[e.jsxs("div",{className:"relative",children:[e.jsx("div",{className:"text-3xl font-bold text-blue-600 dark:text-blue-400 live-counter","data-target":"4325","data-increment":"1","data-interval":"12000",children:"3,982"}),e.jsx("span",{className:"absolute -top-1 -right-6 pulse-dot bg-green-500"})]}),e.jsx("div",{className:"text-sm text-gray-500 dark:text-dark-400",children:"Tokens Tracked"})]}),e.jsxs("div",{className:"stat-card live-stat-card",children:[e.jsxs("div",{className:"relative",children:[e.jsx("div",{className:"text-3xl font-bold text-blue-600 dark:text-blue-400 live-counter","data-target":"17325","data-increment":"1","data-interval":"3000",children:"284"}),e.jsx("span",{className:"absolute -top-1 -right-6 pulse-dot bg-blue-500"})]}),e.jsx("div",{className:"text-sm text-gray-500 dark:text-dark-400",children:"Scans Today"})]}),e.jsxs("div",{className:"stat-card live-stat-card",children:[e.jsxs("div",{className:"relative",children:[e.jsx("div",{className:"text-3xl font-bold text-blue-600 dark:text-blue-400 live-counter","data-target":"825","data-increment":"1","data-interval":"8000",children:"181"}),e.jsx("span",{className:"absolute -top-1 -right-6 pulse-dot bg-purple-500"})]}),e.jsx("div",{className:"text-sm text-gray-500 dark:text-dark-400",children:"Live Users"})]})]}),e.jsxs("div",{className:"max-w-2xl mx-auto mb-4 relative z-10",children:[e.jsx("form",{onSubmit:D,className:"search-form bg-white dark:bg-dark-900 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700",children:e.jsxs("div",{className:"flex flex-col md:flex-row",children:[e.jsx("div",{className:"relative flex-grow",children:e.jsx("input",{type:"text",value:d,onChange:t=>g(t.target.value),placeholder:"Enter Solana token address or name...",className:"w-full py-4 px-6 rounded-t-xl md:rounded-l-xl md:rounded-tr-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-dark-400 focus:outline-none text-lg"})}),e.jsxs(v,{type:"submit",size:"lg",fullWidth:!1,className:"md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-b-xl md:rounded-r-xl md:rounded-bl-none",children:[e.jsx("span",{className:"mr-2",children:"Analyze Token"}),e.jsx(Q,{className:"h-5 w-5"})]})]})}),e.jsx("div",{className:"mt-3 flex justify-center items-center",children:e.jsxs("div",{className:"scan-status-badge",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-green-500 mr-2 pulse-dot"}),e.jsxs("span",{className:"scan-status-text",children:["Scanner active: ",e.jsx("span",{className:"font-semibold scan-count",children:"243"})," tokens analyzed today"]})]})}),e.jsxs("div",{className:"absolute right-0 -bottom-10",children:[e.jsxs("button",{onClick:()=>L(!x),className:"flex items-center text-sm text-gray-500 dark:text-dark-400 hover:text-blue-600 dark:hover:text-blue-400",children:[e.jsx(_,{className:"h-5 w-5 mr-1"}),"New to Solana?"]}),x&&e.jsxs("div",{ref:M,className:"absolute right-0 bottom-full mb-2 w-72 p-4 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700 text-left z-50",children:[e.jsx("h4",{className:"font-medium text-gray-900 dark:text-white mb-2",children:"Getting Started"}),e.jsx("p",{className:"text-sm text-gray-600 dark:text-dark-300 mb-3",children:"You can analyze any Solana token by entering its address or name. Don't have one? Try one of our recently analyzed tokens below!"}),e.jsx(v,{size:"sm",variant:"outline",as:"link",to:"/getting-started",className:"w-full",children:"View Beginner's Guide"})]})]})]})]})]}),e.jsxs("div",{className:"mt-16 relative z-10",children:[e.jsxs("div",{className:"flex justify-between items-center mb-6",children:[e.jsx("h2",{className:"text-2xl font-bold text-gray-900 dark:text-white",children:"Popular Tokens"}),e.jsxs("div",{className:"flex space-x-2 bg-gray-100 dark:bg-dark-800 rounded-lg p-1",children:[e.jsx("button",{onClick:()=>N("all"),className:`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${p==="all"?"bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm":"text-gray-600 dark:text-dark-300 hover:text-gray-900 dark:hover:text-white"}`,children:"All"}),e.jsx("button",{onClick:()=>N("verified"),className:`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${p==="verified"?"bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm":"text-gray-600 dark:text-dark-300 hover:text-gray-900 dark:hover:text-white"}`,children:"Verified"}),e.jsx("button",{onClick:()=>N("trending"),className:`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${p==="trending"?"bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm":"text-gray-600 dark:text-dark-300 hover:text-gray-900 dark:hover:text-white"}`,children:"Trending"})]})]}),$?e.jsx(H,{height:"h-40",message:"Loading popular tokens..."}):T().length>0?e.jsx("div",{className:"grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 animate-on-scroll fade-in-up",children:T().map((t,a)=>{const n=["safe","caution","unknown"][a%3];return e.jsxs("div",{className:"token-card bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 overflow-hidden group shadow-sm hover:shadow-lg transform hover:-translate-y-1",children:[e.jsxs("div",{className:"p-5 pb-3 flex items-center space-x-4",children:[e.jsx("div",{className:"token-logo-container flex-shrink-0",children:t.logoUrl?e.jsx("img",{src:t.logoUrl,alt:`${t.name} logo`,className:"h-16 w-16 rounded-full border-2 border-gray-200 dark:border-dark-700 object-cover shadow-md",onError:l=>{l.target.src="https://placehold.co/200x200/3b82f6/FFFFFF?text=T",l.target.alt="Token placeholder"}}):e.jsx("div",{className:"h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md",children:t.symbol?t.symbol.charAt(0):"T"})}),e.jsxs("div",{className:"flex-grow",children:[e.jsx("h3",{className:"text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate",children:t.name||"Unknown Token"}),e.jsxs("div",{className:"flex flex-wrap items-center gap-2 mt-1",children:[e.jsx("span",{className:"text-sm font-medium text-gray-500 dark:text-dark-400 bg-gray-100 dark:bg-dark-800 px-2 py-0.5 rounded-md",children:t.symbol||"???"}),e.jsx(O,{level:n})]})]})]}),e.jsx("div",{className:"px-5 pb-3",children:e.jsxs("div",{className:"p-2 bg-gray-50 dark:bg-dark-800 rounded font-mono text-xs text-gray-500 dark:text-dark-400 flex items-center justify-between",children:[e.jsx("span",{className:"truncate",children:Y(t.address,10,6)}),e.jsx("button",{onClick:()=>{navigator.clipboard.writeText(t.address)},className:"ml-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300",title:"Copy address",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"})})})]})}),e.jsx("div",{className:"px-5",children:e.jsxs("div",{className:"grid grid-cols-3 gap-3",children:[e.jsxs("div",{className:"metric-card hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors",children:[e.jsxs("div",{className:"text-xs text-gray-500 dark:text-dark-400 flex items-center gap-1",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3 w-3",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"})}),"Market Cap",e.jsx("span",{className:"inline-block ml-1 cursor-help",title:"The total value of all existing tokens at current price",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3 w-3",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"})})})]}),e.jsxs("div",{className:"text-sm font-medium text-gray-900 dark:text-white",children:["$",t.marketCap.toLocaleString(void 0,{maximumFractionDigits:0})]})]}),e.jsxs("div",{className:"metric-card hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors",children:[e.jsxs("div",{className:"text-xs text-gray-500 dark:text-dark-400 flex items-center gap-1",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3 w-3",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"})}),"Token Price",e.jsx("span",{className:"inline-block ml-1 cursor-help",title:"Current price per token in USD",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3 w-3",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"})})})]}),e.jsxs("div",{className:"text-sm font-medium text-gray-900 dark:text-white",children:["$",t.price<.01?t.price.toFixed(6):t.price.toFixed(4)]})]}),e.jsxs("div",{className:"metric-card hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors",children:[e.jsxs("div",{className:"text-xs text-gray-500 dark:text-dark-400 flex items-center gap-1",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3 w-3",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"})}),"Supply",e.jsx("span",{className:"inline-block ml-1 cursor-help",title:"Total number of tokens in circulation",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3 w-3",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"})})})]}),e.jsx("div",{className:"text-sm font-medium text-gray-900 dark:text-white",children:t.supply?Number(t.supply).toLocaleString(void 0,{maximumFractionDigits:0}):"N/A"})]})]})}),e.jsxs("div",{className:"mt-4 px-5 py-3 bg-gray-50 dark:bg-dark-800/50 flex justify-between items-center border-t border-gray-100 dark:border-dark-700",children:[e.jsxs("span",{className:"text-xs text-gray-500 dark:text-dark-400 flex items-center",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3 w-3 mr-1",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"})}),"Created ",new Date(t.createdAt).toLocaleDateString()]}),e.jsx(v,{as:"link",to:`/token/${t.address}`,variant:"primary",size:"sm",className:"px-4 py-1.5",children:"Analyze"})]}),e.jsx("div",{className:"h-1.5 w-full bg-gray-100 dark:bg-dark-800",children:e.jsx("div",{className:`h-full ${n==="safe"?"bg-green-500":n==="caution"?"bg-yellow-500":"bg-blue-500"}`,style:{width:`${n==="safe"?"100":n==="caution"?"60":"40"}%`}})}),e.jsx("div",{className:"absolute inset-0 bg-gradient-to-br from-blue-600/80 to-indigo-700/80 flex items-center justify-center opacity-0 group-hover:opacity-0 transition-opacity duration-300",children:e.jsxs("div",{className:"text-white text-center p-4",children:[e.jsx("p",{className:"text-xl font-bold",children:"Quick Analysis"}),e.jsxs("div",{className:"mt-2",children:[e.jsxs("p",{children:["Market Cap Rank: #",a+1]}),e.jsxs("p",{children:["Created: ",new Date(t.createdAt).toLocaleDateString()]})]}),e.jsx("button",{className:"mt-4 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium",children:"Full Details"})]})})]},t.id)})}):e.jsxs("div",{className:"text-center py-12 bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 shadow-sm",children:[e.jsx("p",{className:"text-gray-500 dark:text-dark-400",children:"No tokens found"}),e.jsx("p",{className:"mt-2 text-sm text-gray-400 dark:text-dark-500",children:"Try a different filter or search for a token above"})]})]}),e.jsxs("div",{className:"mt-20 animate-on-scroll fade-in-up",children:[e.jsx("h2",{className:"text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center",children:"Live Analysis Tools"}),e.jsx("p",{className:"text-center text-gray-600 dark:text-dark-400 mb-8 max-w-2xl mx-auto",children:"Our scanner constantly updates insights across all Solana tokens"}),e.jsxs("div",{className:"w-full max-w-4xl mx-auto mb-12 bg-white dark:bg-dark-900/60 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-dark-800",children:[e.jsxs("div",{className:"p-4 bg-gray-50 dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 flex justify-between items-center",children:[e.jsx("h3",{className:"font-medium text-gray-900 dark:text-white",children:"Scanner Status"}),e.jsxs("div",{className:"flex items-center",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-green-500 mr-2 pulse-dot"}),e.jsxs("span",{className:"text-sm text-gray-600 dark:text-dark-400",children:["Processing ",e.jsx("span",{className:"font-mono",children:"12"})," tokens/min"]})]})]}),e.jsxs("div",{className:"p-6",children:[e.jsx("div",{className:"grid grid-cols-10 gap-1 scanner-grid mb-4",children:Array(50).fill().map((t,a)=>e.jsx("div",{className:`scanner-cell h-6 rounded 
                    ${Math.random()>.7?"bg-blue-100 dark:bg-blue-900/30":Math.random()>.92?"bg-yellow-100 dark:bg-yellow-900/30":Math.random()>.96?"bg-red-100 dark:bg-red-900/30":"bg-gray-100 dark:bg-dark-800"}`},a))}),e.jsxs("div",{className:"flex justify-between text-xs text-gray-500 dark:text-dark-400 mb-6",children:[e.jsx("span",{children:"Recent tokens scanned"}),e.jsx("span",{className:"text-blue-600 dark:text-blue-400 font-medium scan-count-dynamic",children:"3,241 today"})]}),e.jsxs("div",{className:"grid gap-8 grid-cols-1 md:grid-cols-3",children:[e.jsxs("div",{className:"feature-card",children:[e.jsx("div",{className:"feature-icon bg-blue-100 dark:bg-blue-900/30",children:e.jsx(R,{className:"h-6 w-6 text-blue-600 dark:text-blue-400"})}),e.jsx("h3",{className:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"Token Health Check"}),e.jsx("p",{className:"text-gray-600 dark:text-dark-400 text-sm",children:"Easy-to-understand metrics about token health, community growth, and market activity."}),e.jsx("div",{className:"health-scan-indicator mt-3 h-1 w-full bg-gray-100 dark:bg-dark-800 rounded-full overflow-hidden",children:e.jsx("div",{className:"h-full bg-blue-500 animate-scan-progress"})})]}),e.jsxs("div",{className:"feature-card",children:[e.jsx("div",{className:"feature-icon bg-blue-100 dark:bg-blue-900/30",children:e.jsx(U,{className:"h-6 w-6 text-blue-600 dark:text-blue-400"})}),e.jsx("h3",{className:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"Market Analysis"}),e.jsx("p",{className:"text-gray-600 dark:text-dark-400 text-sm",children:"Track price history, trading volume, and market trends with reliable data and visualizations."}),e.jsx("div",{className:"mini-chart mt-3 flex items-end h-8 space-x-1",children:Array(10).fill().map((t,a)=>e.jsx("div",{className:"chart-bar bg-blue-400 dark:bg-blue-500 rounded-t w-full",style:{height:`${20+Math.random()*80}%`}},a))})]}),e.jsxs("div",{className:"feature-card",children:[e.jsx("div",{className:"feature-icon bg-blue-100 dark:bg-blue-900/30",children:e.jsx(V,{className:"h-6 w-6 text-blue-600 dark:text-blue-400"})}),e.jsx("h3",{className:"text-lg font-medium text-gray-900 dark:text-white mb-2",children:"Community Insights"}),e.jsx("p",{className:"text-gray-600 dark:text-dark-400 text-sm",children:"See token distribution among holders and understand community growth and engagement."}),e.jsxs("div",{className:"mini-distribution mt-3 flex space-x-1",children:[e.jsx("div",{className:"h-6 rounded bg-blue-400 dark:bg-blue-500",style:{width:"58%"}}),e.jsx("div",{className:"h-6 rounded bg-indigo-400 dark:bg-indigo-500",style:{width:"25%"}}),e.jsx("div",{className:"h-6 rounded bg-purple-400 dark:bg-purple-500",style:{width:"12%"}}),e.jsx("div",{className:"h-6 rounded bg-pink-400 dark:bg-pink-500",style:{width:"5%"}})]})]})]})]})]})]}),e.jsx("div",{className:"mt-20 mb-10 relative overflow-hidden",children:e.jsxs("div",{className:"bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-dark-900 dark:to-dark-950 rounded-xl p-8 text-center relative z-10 border border-blue-100 dark:border-dark-800 shadow-lg",children:[e.jsx("h2",{className:"text-2xl font-bold text-gray-900 dark:text-white mb-4",children:"New to Solana Tokens?"}),e.jsx("p",{className:"text-gray-600 dark:text-dark-300 max-w-2xl mx-auto mb-6",children:"Our beginner-friendly guides will help you understand how tokens work, what metrics matter, and how to use our tools to make better decisions."}),e.jsxs("div",{className:"flex flex-col sm:flex-row gap-4 justify-center",children:[e.jsx(v,{as:"link",to:"/learn",size:"lg",variant:"outline",className:"px-8",children:"Beginner Guides"}),e.jsx(v,{as:"link",to:"/search",size:"lg",className:"px-8 bg-blue-600 hover:bg-blue-700 text-white",children:"Start Exploring"})]})]})}),e.jsx("style",{children:`
        /* Stat cards styling */
        .stat-card {
          background-color: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(4px);
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          text-align: center;
          min-width: 7rem;
          border: 1px solid rgba(59, 130, 246, 0.1);
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .stat-card {
            background-color: rgba(30, 41, 59, 0.5);
          }
        }
        
        /* Animate slow pulse */
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        /* Token card styling */
        .token-card {
          transition: all 0.2s ease;
        }
        
        .token-card:hover {
          transform: translateY(-2px);
        }
        
        /* Feature card styling */
        .feature-card {
          background-color: #ffffff;
          padding: 1.5rem;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }
        
        .feature-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          border-color: rgba(59, 130, 246, 0.3);
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .feature-card {
            background-color: #1e293b;
            border-color: #334155;
          }
          
          .feature-card:hover {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
            border-color: rgba(59, 130, 246, 0.4);
          }
        }
        
        .feature-icon {
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }
        
        /* Metric cards */
        .metric-card {
          padding: 0.5rem;
          border-radius: 0.375rem;
          background-color: #f9fafb;
          text-align: center;
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .metric-card {
            background-color: #1e293b;
          }
        }
        
        /* Animate sections on scroll */
        .animate-on-scroll {
          transform: translateY(20px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .animate-on-scroll.in-view {
          opacity: 1;
          transform: translateY(0);
        }
        
   
        
        /* Live counter animation */
        .live-stat-card {
          position: relative;
          overflow: hidden;
        }
        
        .live-stat-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(to right, 
            rgba(59, 130, 246, 0.1), 
            rgba(59, 130, 246, 0.4), 
            rgba(59, 130, 246, 0.1)
          );
          animation: stat-scan 2s infinite linear;
        }
        
        @keyframes stat-scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        /* Pulsing dots */
        .pulse-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse-animation 1.5s infinite;
        }
        
        @keyframes pulse-animation {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        
        /* Scan status badge */
        .scan-status-badge {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(5px);
          border: 1px solid rgba(59, 130, 246, 0.2);
          padding: 0.375rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          color: rgba(59, 130, 246, 0.8);
        }
        
        .scan-count {
          display: inline-block;
          min-width: 1.5rem;
          animation: number-increment 5s infinite;
        }
        
        @keyframes number-increment {
          0%, 20% { content: "243"; }
          40% { content: "244"; }
          60% { content: "245"; }
          80%, 100% { content: "246"; }
        }
        
        /* Scanner grid animation */
        .scanner-grid {
          position: relative;
          overflow: hidden;
        }
        
        .scanner-cell {
          transition: all 0.5s ease;
        }
        
        .scanner-cell:nth-child(3n+1) {
          animation: cell-pulse 3s infinite;
          animation-delay: calc(0.1s * var(--i, 0));
        }
        
        @keyframes cell-pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        
        /* Live activity feed */
        .activity-feed {
          max-height: 150px;
          overflow-y: auto;
        }
        
        .activity-feed > div {
          animation: fade-in 0.5s both;
        }
        
        .activity-feed > div:nth-child(1) {
          animation-delay: 0.1s;
        }
        
        .activity-feed > div:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .activity-feed > div:nth-child(3) {
          animation-delay: 0.3s;
        }
        
        .activity-feed > div:nth-child(4) {
          animation-delay: 0.4s;
        }
        
        .activity-feed > div:nth-child(5) {
          animation-delay: 0.5s;
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Scan progress animation */
        .animate-scan-progress {
          width: 30%;
          animation: scan-progress 3s infinite;
        }
        
        @keyframes scan-progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        
        /* Scan count dynamic increment */
        .scan-count-dynamic::after {
          content: '';
          display: inline-block;
          width: 4px;
          height: 4px;
          background-color: #3b82f6;
          border-radius: 50%;
          margin-left: 4px;
          animation: pulse-animation 1.5s infinite;
        }
        
        /* Mini chart animations */
        .chart-bar {
          transition: height 1s ease;
          animation: bar-pulse 3s infinite;
        }
        
        .chart-bar:nth-child(odd) {
          animation-delay: 0.5s;
        }
        
        @keyframes bar-pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        
        /* Interactive particles connect on hover */
        canvas {
          cursor: pointer;
        }
      `})]})};export{le as default};
