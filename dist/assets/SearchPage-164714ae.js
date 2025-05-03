import{r as a,u as N,j as e,M as f}from"./index-946c3423.js";import{C as w,B as b}from"./Badge-181dddad.js";import{B as x}from"./Button-0509c05a.js";import{a as S,u as T}from"./axios-c189fee4.js";import{t as E}from"./dataFormatUtils-eaec876b.js";import{C as z}from"./ClockIcon-59f25d58.js";function A({title:s,titleId:n,...t},i){return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:i,"aria-labelledby":n},t),s?a.createElement("title",{id:n},s):null,a.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"}))}const C=a.forwardRef(A),I=C;function R({title:s,titleId:n,...t},i){return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:i,"aria-labelledby":n},t),s?a.createElement("title",{id:n},s):null,a.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"}))}const P=a.forwardRef(R),L=P,_={}.VITE_API_URL||"http://localhost:5009/api",$=async()=>{var s,n;try{return(await S.get(`${_}/search/recent`)).data}catch(t){throw console.error("Error fetching recent searches:",t),new Error(((n=(s=t.response)==null?void 0:s.data)==null?void 0:n.error)||"Failed to fetch recent searches")}},V=()=>{const[s,n]=a.useState(""),[t,i]=a.useState(!1),[l,h]=a.useState(0),[d,p]=a.useState(!1),u=a.useRef(null),c=a.useRef(null),m=N(),{data:g=[],isLoading:B}=T(["recentSearches"],$,{staleTime:60*1e3});a.useEffect(()=>(t?(h(0),c.current=setInterval(()=>{h(r=>{const o=r+3.3333333333333335;return o>=100?(clearInterval(c.current),100):o})},1e3)):c.current&&clearInterval(c.current),()=>{c.current&&clearInterval(c.current)}),[t]);const v=r=>{if(r.preventDefault(),s.trim()){const o=s.trim();o.length>=32&&o.length<=44?(i(!0),setTimeout(()=>{i(!1),m(`/token/${o}`)},3e4)):m(`/token/${o}`)}},j=()=>()=>{};a.useEffect(()=>{if(d&&u.current)return j()},[d]);const k=()=>e.jsx("div",{className:"fixed inset-0 flex flex-col items-center justify-center bg-dark-950/90 backdrop-blur-sm z-50",children:e.jsx("div",{className:"w-full max-w-md p-8 rounded-lg bg-dark-900 border border-dark-700 shadow-glow",children:e.jsxs("div",{className:"flex flex-col items-center",children:[e.jsxs("div",{className:"relative mb-8",children:[e.jsx("div",{className:"h-16 w-16 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center shadow-glow",children:e.jsx("span",{className:"text-3xl font-bold text-white",children:"S"})}),e.jsx("div",{className:"absolute -top-2 -right-2 h-4 w-4 rounded-full bg-accent-500 border border-dark-950 animate-pulse"})]}),e.jsxs("h3",{className:"text-lg font-bold text-white mb-4 terminal-text",children:[e.jsx("span",{className:"text-primary-500",children:"$"})," Analyzing Token Data..."]}),e.jsxs("div",{className:"w-full bg-dark-950 rounded p-4 font-mono text-xs text-dark-300 mb-6 h-32 overflow-y-auto terminal-output",children:[e.jsxs("div",{className:"flex",children:[e.jsx("span",{className:"text-primary-500 mr-2",children:">"}),"Initializing token analyzer..."]}),e.jsxs("div",{className:"flex",children:[e.jsx("span",{className:"text-primary-500 mr-2",children:">"}),"Connecting to blockchain..."]}),e.jsxs("div",{className:"flex",children:[e.jsx("span",{className:"text-primary-500 mr-2",children:">"}),"Fetching token metadata..."]}),e.jsxs("div",{className:"flex",children:[e.jsx("span",{className:"text-primary-500 mr-2",children:">"}),"Reading smart contract..."]}),l>20&&e.jsxs("div",{className:"flex",children:[e.jsx("span",{className:"text-primary-500 mr-2",children:">"}),"Analyzing holder distribution..."]}),l>40&&e.jsxs("div",{className:"flex",children:[e.jsx("span",{className:"text-primary-500 mr-2",children:">"}),"Processing transaction history..."]}),l>60&&e.jsxs("div",{className:"flex",children:[e.jsx("span",{className:"text-primary-500 mr-2",children:">"}),"Calculating metrics..."]}),l>80&&e.jsxs("div",{className:"flex",children:[e.jsx("span",{className:"text-primary-500 mr-2",children:">"}),"Preparing visualization data..."]}),l>95&&e.jsxs("div",{className:"flex",children:[e.jsx("span",{className:"text-primary-500 mr-2",children:">"}),"Finalizing analysis..."]}),e.jsx("div",{className:"blink-cursor",children:"_"})]}),e.jsx("div",{className:"w-full bg-dark-800 rounded-full h-2 mb-4",children:e.jsx("div",{className:"h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 glow-sm transition-all duration-300 progress-pulse",style:{width:`${l}%`}})}),e.jsxs("div",{className:"flex justify-between w-full text-xs text-dark-400",children:[e.jsxs("span",{children:["Analysis progress: ",Math.round(l),"%"]}),e.jsxs("span",{children:["Est. time remaining: ",Math.ceil((100-l)*.3),"s"]})]}),e.jsx(x,{onClick:()=>i(!1),className:"mt-6",variant:"outline",icon:e.jsx(I,{className:"h-4 w-4"}),children:"Cancel Analysis"})]})})});if(t)return e.jsx(k,{});const y=({token:r})=>e.jsxs("div",{className:"token-card bg-dark-900/70 rounded-lg border border-dark-800 overflow-hidden transition-all duration-300 hover:border-primary-600 hover:shadow-glow relative group",children:[e.jsx("div",{className:"absolute inset-0 bg-gradient-to-br from-primary-900/10 to-secondary-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"}),e.jsx("div",{className:"h-1 w-0 group-hover:w-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-700"}),e.jsxs("div",{className:"p-4 relative z-10",children:[e.jsxs("div",{className:"flex justify-between items-start",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-white group-hover:text-blue-400 transition-colors",children:r.name||"Unknown Token"}),e.jsx("p",{className:"text-sm text-dark-400 mt-1",children:r.symbol||"???"})]}),e.jsx(x,{as:"link",to:`/token/${r.token_address}`,variant:"outline",size:"xs",className:"group-hover:border-primary-500 group-hover:bg-dark-800 transition-all duration-300",icon:e.jsx(L,{className:"h-3 w-3 group-hover:text-primary-400"}),iconPosition:"right",onClick:o=>{o.preventDefault(),i(!0),setTimeout(()=>{i(!1),m(`/token/${r.token_address}`)},3e4)},children:"View"})]}),e.jsxs("div",{className:"mt-3 flex items-center space-x-2",children:[e.jsx(b,{variant:"primary",dot:!0,className:"text-xs",children:"Solana Token"}),r.search_count>10&&e.jsx(b,{variant:"secondary",className:"text-xs",children:"Popular"})]}),e.jsx("p",{className:"mt-3 text-xs font-mono text-dark-500 truncate bg-dark-950/50 p-1.5 rounded",children:E(r.token_address,12,8)}),e.jsxs("div",{className:"mt-3 flex justify-between items-center text-xs",children:[e.jsxs("div",{className:"flex items-center text-dark-400",children:[e.jsx(z,{className:"h-3 w-3 mr-1"}),new Date(r.last_searched_at).toLocaleDateString()]}),e.jsxs("span",{className:"px-2 py-0.5 bg-dark-800 rounded-full text-dark-400",children:[r.search_count," searches"]})]})]})]});return e.jsxs("div",{className:"max-w-4xl mx-auto py-8 relative",children:[e.jsx("div",{className:"fixed inset-0 pointer-events-none opacity-5 circuit-pattern"}),e.jsxs("div",{className:"relative z-10",children:[e.jsx("h1",{className:"text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-blue-400 to-secondary-400 mb-6 cyberpunk-header",children:"Token Explorer"}),e.jsx(w,{className:"mb-8 search-form-card hover:shadow-glow-sm transition-all duration-300",children:e.jsxs("div",{className:"p-6",children:[e.jsxs("h2",{className:"text-lg font-medium text-white mb-4 glitch-hover relative inline-block",children:["Search for a Solana Token",e.jsx("div",{className:"h-0.5 w-0 group-hover:w-full bg-primary-500 absolute -bottom-1 left-0 transition-all duration-300"})]}),e.jsxs("form",{onSubmit:v,className:"search-terminal",children:[e.jsxs("div",{className:"flex flex-col md:flex-row gap-4",children:[e.jsxs("div",{className:"relative flex-grow terminal-container",children:[e.jsxs("div",{className:"terminal-header flex items-center px-2 py-1 bg-dark-950 rounded-t-md border-t border-l border-r border-dark-700",children:[e.jsx("div",{className:"h-2 w-2 rounded-full bg-red-500 mr-1.5"}),e.jsx("div",{className:"h-2 w-2 rounded-full bg-yellow-500 mr-1.5"}),e.jsx("div",{className:"h-2 w-2 rounded-full bg-green-500"}),e.jsx("span",{className:"text-xs text-dark-500 ml-2",children:"token_explorer.sh"})]}),e.jsxs("div",{className:"terminal-body relative border border-dark-700 rounded-b-md bg-dark-950 flex items-center",children:[e.jsx("div",{className:"absolute left-3 text-primary-500 font-mono",children:"$"}),e.jsx("input",{ref:u,type:"text",value:s,onChange:r=>n(r.target.value),onFocus:()=>p(!0),onBlur:()=>p(!1),placeholder:"Enter Solana token address...",className:"bg-transparent text-white w-full py-3 pl-7 pr-10 focus:outline-none font-mono text-sm"}),e.jsx("div",{className:"absolute inset-0 pointer-events-none terminal-scanlines"}),e.jsx("div",{className:"absolute right-3 top-1/2 transform -translate-y-1/2",children:e.jsx(f,{className:"h-5 w-5 text-dark-400"})}),d&&e.jsx("div",{className:"cursor-blink"})]})]}),e.jsx(x,{type:"submit",className:"md:w-auto neon-button",icon:e.jsx(f,{className:"h-5 w-5"}),iconPosition:"left",children:"Search"})]}),e.jsx("p",{className:"mt-2 text-sm text-dark-400",children:"Enter the full token address to view detailed analytics"})]})]})}),g.length>0&&e.jsxs("div",{className:"recent-searches-container",children:[e.jsxs("h2",{className:"text-xl font-medium text-white mb-4 relative inline-block group",children:["Recent Searches",e.jsx("div",{className:"h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-primary-500 to-secondary-500 absolute -bottom-1 left-0 transition-all duration-500"})]}),e.jsx("div",{className:"grid gap-4 grid-cols-1 sm:grid-cols-2 token-grid",children:g.map(r=>e.jsx(y,{token:r},r.token_address))})]}),e.jsxs("div",{className:"mt-10 bg-dark-900/50 rounded-lg border border-dark-800 p-5 help-section",children:[e.jsx("h2",{className:"text-xl font-medium text-white mb-4",children:"Search Tips"}),e.jsxs("div",{className:"grid gap-6 sm:grid-cols-2",children:[e.jsxs("div",{className:"flex flex-col space-y-1 help-tip",children:[e.jsx("h3",{className:"font-medium text-primary-400",children:"Token Address Format"}),e.jsx("p",{className:"text-sm text-dark-300",children:"Solana token addresses are typically 32-44 characters long and use base58 encoding."})]}),e.jsxs("div",{className:"flex flex-col space-y-1 help-tip",children:[e.jsx("h3",{className:"font-medium text-secondary-400",children:"Popular Tokens"}),e.jsx("p",{className:"text-sm text-dark-300",children:"Check the recent searches section to see popular tokens being analyzed by others."})]}),e.jsxs("div",{className:"flex flex-col space-y-1 help-tip",children:[e.jsx("h3",{className:"font-medium text-accent-400",children:"Analysis Time"}),e.jsx("p",{className:"text-sm text-dark-300",children:"Initial token analysis may take up to 30 seconds to compile comprehensive data."})]}),e.jsxs("div",{className:"flex flex-col space-y-1 help-tip",children:[e.jsx("h3",{className:"font-medium text-blue-400",children:"Bookmark Results"}),e.jsx("p",{className:"text-sm text-dark-300",children:"Save your token URLs for quick access to analytics in the future."})]})]})]})]}),e.jsx("style",{jsx:!0,children:`
        /* Circuit background pattern */
        .circuit-pattern {
          background-image: 
            linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
            linear-gradient(rgba(139, 92, 246, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.02) 1px, transparent 1px);
          background-size: 50px 50px, 50px 50px, 10px 10px, 10px 10px;
          background-position: -1px -1px, -1px -1px, -1px -1px, -1px -1px;
        }
        
        /* Cyberpunk header style */
        .cyberpunk-header {
          position: relative;
          text-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
        }
        
        .cyberpunk-header::after {
          content: 'Token Explorer';
          position: absolute;
          top: 2px;
          left: 2px;
          color: rgba(239, 68, 68, 0.4);
          z-index: -1;
        }
        
        /* Terminal styling */
        .terminal-container {
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        }
        
        .terminal-scanlines {
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.03) 50%,
            rgba(0, 0, 0, 0.03) 50%
          );
          background-size: 100% 4px;
          z-index: 1;
        }
        
        .cursor-blink {
          position: absolute;
          height: 14px;
          width: 7px;
          background-color: rgba(59, 130, 246, 0.7);
          left: calc(7px + 1ch + ${s.length}ch);
          top: 50%;
          transform: translateY(-50%);
          animation: blink 1s infinite;
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        /* Animated button glow */
        .neon-button {
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }
        
        .neon-button::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          z-index: -1;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899);
          background-size: 400%;
          animation: neon-border 3s linear infinite;
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: 0.5rem;
        }
        
        .neon-button:hover::before {
          opacity: 1;
        }
        
        @keyframes neon-border {
          0% { background-position: 0 0; }
          50% { background-position: 400% 0; }
          100% { background-position: 0 0; }
        }
        
        /* Shadow glow effect */
        .shadow-glow {
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
        }
        
        .shadow-glow-sm {
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.2);
        }
        
        /* Glitch hover effect */
        .glitch-hover {
          position: relative;
        }
        
        .glitch-hover:hover {
          animation: glitch 0.3s infinite;
        }
        
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-1px, 1px); }
          40% { transform: translate(-1px, -1px); }
          60% { transform: translate(1px, 1px); }
          80% { transform: translate(1px, -1px); }
          100% { transform: translate(0); }
        }
        
        /* Terminal text style */
        .terminal-text {
          font-family: monospace;
        }
        
        /* Loading terminal output */
        .terminal-output {
          line-height: 1.5;
        }
        
        .blink-cursor {
          animation: blink 1s infinite;
        }
        
        /* Progress bar pulse */
        .progress-pulse {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          70% { box-shadow: 0 0 0 5px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        
        /* Token card grid animation */
        .token-grid {
          opacity: 0;
          animation: fade-in 0.5s forwards;
        }
        
        @keyframes fade-in {
          to { opacity: 1; }
        }
        
        /* Help section hover effects */
        .help-tip {
          transition: all 0.3s ease;
          padding: 0.75rem;
          border-radius: 0.375rem;
        }
        
        .help-tip:hover {
          background-color: rgba(30, 41, 59, 0.5);
          transform: translateY(-2px);
        }
      `})]})};export{V as default};
