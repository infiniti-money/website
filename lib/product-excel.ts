"use client";
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import type { Product } from "./catalog";
export const headers = ["name","category","price","original_price","stock","image","description","specs","tag","active"] as const;
type Column = typeof headers[number];
const demo: Record<Column,string> = {
 name:"Laptop văn phòng tham khảo",category:"Laptop",price:"1000000",original_price:"1000000",stock:"0",
 image:"/product-placeholder.svg",description:"Sản phẩm minh họa, cần cập nhật trước khi bán",
 specs:"RAM 16GB · SSD 512GB",tag:"Mẫu",active:"0"
};
const safe = (v: unknown) => String(v ?? "").replace(/[\u0000-\u001f]/g," ").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
function column(i:number) { let col=""; for(let n=i+1;n;n=Math.floor((n-1)/26))col=String.fromCharCode(65+(n-1)%26)+col;return col; }
function worksheet(rows: Array<Record<Column,string>>) {
 const values = [headers.map(h=>h),...rows.map(p=>headers.map(h=>p[h] ?? ""))];
 const xmlRows = values.map((row,i)=>`<row r="${i+1}">${row.map((value,j)=>`<c r="${column(j)}${i+1}" t="inlineStr"><is><t xml:space="preserve">${safe(value)}</t></is></c>`).join("")}</row>`).join("");
 return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${xmlRows}</sheetData></worksheet>`;
}
export function exportXlsx(rows: Array<Record<Column,string>>, filename:string) {
 const files:Record<string,Uint8Array> = {
  "[Content_Types].xml":strToU8('<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'),
  "_rels/.rels":strToU8('<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'),
  "xl/workbook.xml":strToU8('<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="San pham" sheetId="1" r:id="rId1"/></sheets></workbook>'),
  "xl/_rels/workbook.xml.rels":strToU8('<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'),
  "xl/worksheets/sheet1.xml":strToU8(worksheet(rows))
 };
 const bytes=zipSync(files,{level:6});
 const blob = new Blob([new Uint8Array(bytes)],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
 const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
}
export function templateXlsx(){exportXlsx([demo],"mau-nhap-san-pham.xlsx");}
export function productRows(products:Product[]):Array<Record<Column,string>> {
 return products.map(p=>Object.fromEntries(headers.map(h=>[h,String(p[h]??"")])) as Record<Column,string>);
}
export async function importXlsx(file:File):Promise<Array<Record<Column,string>>> {
 if(file.size>5*1024*1024)throw new Error("File Excel tối đa 5 MB.");
 if(!/\.xlsx$/i.test(file.name))throw new Error("Chỉ hỗ trợ tệp .xlsx.");
 const zipped=unzipSync(new Uint8Array(await file.arrayBuffer()));
 const worksheetName=Object.keys(zipped).find(n=>/^xl\/worksheets\/sheet\d+\.xml$/.test(n));
 if(!worksheetName)throw new Error("Không tìm thấy bảng tính Excel.");
 const doc=new DOMParser().parseFromString(strFromU8(zipped[worksheetName]),"application/xml");
 if(doc.querySelector("parsererror"))throw new Error("Nội dung Excel không hợp lệ.");
 const shared=zipped["xl/sharedStrings.xml"]?new DOMParser().parseFromString(strFromU8(zipped["xl/sharedStrings.xml"]),"application/xml"):null;
 const strings=shared?Array.from(shared.getElementsByTagName("si")).map(si=>si.textContent??""):[];
 const rows=Array.from(doc.getElementsByTagName("row")).map(row=>{
   const cells:Record<number,string>={};
   for(const c of Array.from(row.getElementsByTagName("c"))){
     const letters=(c.getAttribute("r")||"").match(/^[A-Z]+/)?.[0]||"A";
     let idx=0;for(const letter of letters)idx=idx*26+letter.charCodeAt(0)-64;idx--;
     const raw=c.getElementsByTagName("v")[0]?.textContent??c.getElementsByTagName("is")[0]?.textContent??"";
     cells[idx]=c.getAttribute("t")==="s"?(strings[Number(raw)]??""):raw;
   }
   return cells;
 });
 const first=rows.shift()||{};
 if(headers.some((h,i)=>String(first[i]??"").trim()!==h))throw new Error("Sai tiêu đề cột. Vui lòng tải và sử dụng Excel mẫu.");
 if(rows.length>2000)throw new Error("Mỗi lần chỉ nhập tối đa 2.000 sản phẩm.");
 return rows.filter(row=>Object.values(row).some(v=>v.trim())).map(row=>Object.fromEntries(headers.map((h,i)=>[h,String(row[i]??"").trim()])) as Record<Column,string>);
}
