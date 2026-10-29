const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || 'smart-water-demo-secret';
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(__dirname));
let stations=[{id:'ST-001',name:'Lake View Station',location:'Hyderabad',status:'Active'}];
let measurements=[{id:'M-001',stationId:'ST-001',ph:7.2,turbidity:2.1,temperature:25.4}];
let alerts=[{id:'A-001',stationId:'ST-001',severity:'Medium',message:'Elevated turbidity',status:'Open'}];
let transactions=[];
let users=[];
const crud=(name,store)=>{
  app.get('/api/'+name,(req,res)=>res.json(store));
  app.get('/api/'+name+'/:id',(req,res)=>{const x=store.find(v=>v.id===req.params.id); x?res.json(x):res.status(404).json({error:'Not found'});});
  app.post('/api/'+name,(req,res)=>{const x={...req.body,id:req.body.id||name.slice(0,-1).toUpperCase()+'-'+String(store.length+1).padStart(3,'0')};store.push(x);transactions.push({type:'CREATE',resource:name,id:x.id,time:new Date().toISOString()});res.status(201).json(x);});
  app.put('/api/'+name+'/:id',(req,res)=>{const i=store.findIndex(v=>v.id===req.params.id);if(i<0)return res.sendStatus(404);store[i]={...store[i],...req.body,id:req.params.id};transactions.push({type:'UPDATE',resource:name,id:req.params.id,time:new Date().toISOString()});res.json(store[i]);});
  app.delete('/api/'+name+'/:id',(req,res)=>{const i=store.findIndex(v=>v.id===req.params.id);if(i<0)return res.sendStatus(404);const [x]=store.splice(i,1);transactions.push({type:'DELETE',resource:name,id:x.id,time:new Date().toISOString()});res.json(x);});
};
crud('stations',stations);crud('measurements',measurements);crud('alerts',alerts);
app.get('/api/transactions',(req,res)=>res.json(transactions));
app.post('/api/register',(req,res)=>{const {name,email,role,password}=req.body;if(!name||!email||!role||!password)return res.status(400).json({error:'All registration fields are required'});if(users.some(u=>u.email===email.toLowerCase()))return res.status(409).json({error:'Account already exists'});users.push({name,email:email.toLowerCase(),role,password});res.status(201).json({message:'Stakeholder registered',stakeholder:{name,email,role}});});
app.post('/api/login',(req,res)=>{const email=(req.body.email||req.body.username||'').toLowerCase();const password=req.body.password||'';const user=users.find(u=>u.email===email&&u.password===password);if(!user)return res.status(401).json({error:'Invalid email or password'});const token=jwt.sign({user:user.email,name:user.name,role:user.role},SECRET,{expiresIn:'1h'});res.json({token,user:{name:user.name,email:user.email,role:user.role}});});
function auth(req,res,next){const h=req.headers.authorization||'';try{req.user=jwt.verify(h.replace('Bearer ','') ,SECRET);next();}catch(e){res.status(401).json({error:'JWT required'});}}
app.get('/api/secure/dashboard',auth,(req,res)=>res.json({message:'Authorized Smart Water dashboard',user:req.user}));
app.get('/api/health',(req,res)=>res.json({ok:true,experiments:'1-15'}));
const { runStaticChecks, runLiveChecks } = require('./test-all');
app.get('/api/test-all', async (req, res) => {
  const staticResults = runStaticChecks();
  const liveResults = await runLiveChecks(`http://localhost:${PORT}`);
  res.json({generatedAt:new Date().toISOString(), static:staticResults, live:liveResults});
});

app.listen(PORT,()=>console.log(`Smart Water unified server: http://localhost:${PORT}`));
