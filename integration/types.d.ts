export type LandUnit='nali'|'gaj'|'sqft'|'sqm';
export interface Property {
 id:string;slug:string;name:string;area:string;type:string;access:string;
 status:'Available'|'Sold';size:number;unit:LandUnit;rate:number|null;
 rateUnit:LandUnit|'total';image:string;view:string;aspect:string;
 documents:string;description:string;demo:boolean;
}
export interface Enquiry {
 fields:Record<string,string>;property?:Property;message:string;
}
export interface HostOptions {
 root:HTMLElement;content?:object;properties?:Property[];basePath?:string;
 onNavigate?:(url:string,options:{replace:boolean;scroll:boolean;reason:'navigation'|'filters'})=>void;
 onEnquiry?:(enquiry:Enquiry)=>Promise<{message?:string}|void>;
 motion?:boolean|{scroll?:boolean;revealSelector?:string;footerSelector?:string};
}
