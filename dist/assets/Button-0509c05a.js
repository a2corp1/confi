import{j as r,L as f}from"./index-946c3423.js";const j=({children:g,onClick:h,to:t,variant:c="primary",size:m="md",className:x="",icon:e,iconPosition:o="right",fullWidth:b=!1,disabled:i=!1,type:u="button",external:p=!1,...n})=>{const d={primary:"bg-primary-600 hover:bg-primary-700 text-white",secondary:"bg-dark-800 hover:bg-dark-700 text-white border border-dark-700",outline:"bg-transparent hover:bg-dark-800 text-white border border-dark-600 hover:border-dark-500",ghost:"bg-transparent hover:bg-dark-800 text-white",danger:"bg-red-600 hover:bg-red-700 text-white",success:"bg-green-600 hover:bg-green-700 text-white"},l={sm:"py-1.5 px-3 text-sm",md:"py-2 px-4",lg:"py-2.5 px-5 text-lg"},s=`
    ${d[c]||d.primary}
    ${l[m]||l.md}
    ${b?"w-full":""}
    rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50
    ${i?"opacity-60 cursor-not-allowed":""}
    flex items-center justify-center gap-2
    ${x}
  `,a=()=>r.jsxs(r.Fragment,{children:[e&&o==="left"&&r.jsx("span",{children:e}),g,e&&o==="right"&&r.jsx("span",{children:e})]});return t?p?r.jsx("a",{href:t,className:s,target:"_blank",rel:"noopener noreferrer",...n,children:a()}):r.jsx(f,{to:t,className:s,...n,children:a()}):r.jsx("button",{onClick:h,className:s,disabled:i,type:u,...n,children:a()})};export{j as B};
