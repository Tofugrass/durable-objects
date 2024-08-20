require('dotenv').config()
import http = require("node:http");



const hostname = 'localhost';
const port = 3000;

const draftTimers: Record<string, NodeJS.Timeout> = {};

const server = http.createServer((req, res) => {
  const return500 = (msg:string) => {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`${msg}\n`);
  }
  const return401 = () => {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`You are not authorized!\n`);
  }
  const return200 = (msg:string) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`${msg}\n`);
  }
  if(!req.url){
    return500('Missing req.url!');
    return;
  }
  console.log(req.url)
  
  if(req.headers.authorization !== `Bearer ${process.env.CRONHOOKS_API_KEY}`){
    console.log('unauthorized access attempt', req.url, req.headers)
    return401();
    return;
  }

  const urlParams = new URLSearchParams(req.url.slice(req.url.indexOf('?') + 1, req.url.length));
  const league_id = urlParams.get('league_id');
  const user_id = urlParams.get('user_id');
  const time_to_pick = urlParams.get('ttp');
  console.log({league_id, user_id, time_to_pick})

  if(req.url.includes('/set-timer')){
    if(!league_id){
      return500('Missing league_id!');
      return;
    }
    if(!user_id){
      return500('Missing user_id!');
      return;
    }
    if(!time_to_pick){
      return500('Missing ttp!');
      return;
    }
    if(isNaN(+time_to_pick)){
      return500('ttp is not numeric!');
      return;
    }
    if(draftTimers[league_id]){
      //start draft timer
      clearTimeout(draftTimers[league_id]);
      delete draftTimers[league_id]
    }
    //start draft timer
    const timerID = setTimeout(() => {
      void timerExpired(league_id, user_id);
    }, +time_to_pick * 1000);

    //store draft timer
    draftTimers[league_id] = timerID;
    
    return200('Called set-timer!');
    return;
  }
  else if(req.url.includes('/cancel-timer')){
    if(!league_id){
      return500('Missing league_id!');
      return;
    }
    if(!draftTimers[league_id]){
      console.log('Missing timer on call to cancel-timer!')
      return500('Missing timer on call to cancel-timer!');
      return;
    }
    //start draft timer
    clearTimeout(draftTimers[league_id]);
    delete draftTimers[league_id]
    
    return200('Called cancel-timer!');
    return;
  }
  else{
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World from github!\n');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

const timerExpired = async (league_id: string, user_id: string) => {
  try{
    const response = await fetch(`https://lolfantasy.gg/api/auto-draft/`, 
      {
        headers:new Headers({"Content-Type": "application/json; charset=utf-8", "Authorization": `Bearer ${process.env.CRONHOOKS_WEBHOOK_SECRET}`}) , 
        method: 'POST', 
        body:JSON.stringify({ league_id, user_id })
      },
    )
  }
  catch(err){
    console.log('Issue sending auto-draft webhook')
    console.error(err)
  }
}
