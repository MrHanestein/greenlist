type Member={onboardedAt:Date|null;searchStatus:string;subscriptionTier:string;subscriptionValidUntil:Date|null;productEvents:{kind:string;createdAt:Date}[]};
export function pilotMetrics(users:Member[],now=new Date()){
 const meaningful=new Set(['PACK_CREATED','PACK_REVIEWED','SUBMISSION_CONFIRMED','ASSESSMENT_COMPLETED','PRACTICE_COMPLETED','INTERVIEW_PRACTISED']);
 const activated=users.filter(u=>u.onboardedAt);
 const paying=activated.filter(u=>u.subscriptionTier==='PLUS'&&u.subscriptionValidUntil&&u.subscriptionValidUntil>now);
 const eligible=paying.filter(u=>u.searchStatus==='SEARCHING'&&now.getTime()-u.onboardedAt!.getTime()>=28*86400000);
 const activeWeekFour=eligible.filter(u=>u.productEvents.some(e=>meaningful.has(e.kind)&&e.createdAt.getTime()>=u.onboardedAt!.getTime()+21*86400000&&e.createdAt.getTime()<u.onboardedAt!.getTime()+28*86400000));
 return {activated:activated.length,paying:paying.length,weekFourEligible:eligible.length,weekFourActive:activeWeekFour.length,weekFourRate:eligible.length?activeWeekFour.length/eligible.length:null};
}
