const APPS_SCRIPT_WEB_APP_URL =
"https://script.google.com/macros/s/AKfycbySloUz-3sB_v2ijolC7UIYWJ9UzzzhNsKg2cAWGTfcG_LztdY_bqMmqnBRUVzmVWierg/exec";

let EVENTS=[];

const eventSelect=document.getElementById("eventId");
const eventsList=document.getElementById("eventsList");
const form=document.getElementById("volunteerForm");
const statusDiv=document.getElementById("formStatus");

function formatDate(d){

if(!d) return "";

const dt=new Date(d);

if(!isNaN(dt)) return dt.toLocaleDateString();

return d;

}

function loadEvents(){

eventSelect.innerHTML="<option value=''>Select Event</option>";
eventsList.innerHTML="";

EVENTS.forEach(e=>{

let opt=document.createElement("option");

opt.value=e.id;
opt.textContent=e.name+" - "+formatDate(e.date);

opt.dataset.name=e.name;
opt.dataset.date=e.date;

eventSelect.appendChild(opt);

let div=document.createElement("div");

div.className="event-box";

div.innerHTML=
"<b>"+e.name+"</b><br>"+
"Date: "+formatDate(e.date)+"<br>"+
"Location: "+(e.location||"");

eventsList.appendChild(div);

});

}

async function loadEventsFromBackend(){

let r=await fetch(APPS_SCRIPT_WEB_APP_URL+"?action=getEvents");

let data=await r.json();

EVENTS=data.events||[];

loadEvents();

}

async function loadDashboard(){

let r=await fetch(APPS_SCRIPT_WEB_APP_URL+"?action=getSummary");

let data=await r.json();

document.getElementById("totalParents").textContent=data.totalParents;
document.getElementById("totalKids").textContent=data.totalKids;
document.getElementById("totalJudges").textContent=data.totalJudges;
document.getElementById("eventsCovered").textContent=data.eventsCovered;

let body=document.getElementById("summaryTableBody");

body.innerHTML="";

(data.events||[]).forEach(e=>{

let tr=document.createElement("tr");

tr.innerHTML=
"<td>"+e.eventName+"</td>"+
"<td>"+formatDate(e.eventDate)+"</td>"+
"<td>"+e.parentCount+"</td>"+
"<td>"+e.kidCount+"</td>"+
"<td>"+e.judgeCount+"</td>";

body.appendChild(tr);

});

}

form.addEventListener("submit",async e=>{

e.preventDefault();

let opt=eventSelect.options[eventSelect.selectedIndex];

let payload={

eventId:eventSelect.value,
eventName:opt.dataset.name,
eventDate:opt.dataset.date,
parentName:document.getElementById("parentName").value,
email:document.getElementById("email").value,
phone:document.getElementById("phone").value,
kidName:document.getElementById("kidName").value,
volunteerRole:document.getElementById("volunteerRole").value,
notes:document.getElementById("notes").value

};

let r=await fetch(APPS_SCRIPT_WEB_APP_URL,{

method:"POST",
headers:{"Content-Type":"text/plain"},
body:JSON.stringify(payload)

});

let res=await r.json();

if(res.success){

statusDiv.textContent="Signup successful";

form.reset();

loadDashboard();

}

});

document.querySelectorAll(".tab-btn").forEach(btn=>{

btn.onclick=()=>{

document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
document.querySelectorAll(".tab-panel").forEach(p=>p.classList.remove("active"));

btn.classList.add("active");
document.getElementById(btn.dataset.tab).classList.add("active");

};

});

loadEventsFromBackend();
loadDashboard();
