export default function CommunityPanel(){
 const configured=process.env.NEXT_PUBLIC_COMMUNITY_URL;let link:string|undefined;
 try{const u=new URL(configured??'');if(u.protocol==='https:'&&(['discord.gg','discord.com'].includes(u.hostname)))link=u.href;}catch{}
 return <section className="card"><h2>Learn with other graduates</h2><p>Study groups, interview debriefs and voluntary introductions. Community access is free; introductions do not guarantee interviews.</p>{link?<a className="btn secondary" href={link} target="_blank" rel="noreferrer">Open pilot community ↗</a>:<p className="tiny muted">Community invitations will appear here once the owner has set up the server and human moderation.</p>}<p className="tiny muted">Keep CVs and sensitive documents private. Report requests for money, credentials or guaranteed sponsorship to a moderator.</p></section>;
}
