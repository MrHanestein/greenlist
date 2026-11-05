import { SignJWT,jwtVerify } from 'jose';
import { prisma } from './prisma';
import { HttpError } from './http';
function secret(){const key=process.env.AUTOFILL_API_TOKEN_SECRET;if(!key || key.length<32)throw new HttpError(503,'Extension access is not configured');return new TextEncoder().encode(key);}
export async function issueAutofillToken(userId:string,version:number){return new SignJWT({scope:'autofill',version}).setProtectedHeader({alg:'HS256'}).setSubject(userId).setIssuer('greenlist').setAudience('greenlist-extension').setIssuedAt().setExpirationTime('7d').sign(secret());}
export async function extensionUser(req:Request){
 const token=req.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];if(!token)throw new HttpError(401,'Connect your extension in Account');
 let payload;
 try{payload=(await jwtVerify(token,secret(),{algorithms:['HS256'],issuer:'greenlist',audience:'greenlist-extension'})).payload;}catch{throw new HttpError(401,'Extension connection expired; reconnect in Account');}
 if(payload.scope!=='autofill' || !payload.sub)throw new HttpError(401,'Invalid extension scope');
 const user=await prisma.user.findUnique({where:{id:payload.sub}});
 if(!user || user.deletingAt || user.extensionVersion!==payload.version)throw new HttpError(401,'Extension connection revoked');
 return user;
}