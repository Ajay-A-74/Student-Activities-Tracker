let tasks=[];

function addTask(){

const name=document.getElementById("tname").value;
const priority=document.getElementById("tpri").value;
const hours=document.getElementById("thr").value;
const minutes=document.getElementById("tmn").value;
const due=document.getElementById("tdue").value;

if(name===""){
alert("Enter task name");
return;
}

const task={
id:Date.now(),
name:name,
priority:priority,
time:hours+"h "+minutes+"m",
due:due,
done:false
};

tasks.push(task);

renderTasks();

document.getElementById("tname").value="";
}

function completeTask(id){

tasks=tasks.map(task=>{
if(task.id===id){
task.done=true;
}
return task;
});

renderTasks();
}

function deleteTask(id){

tasks=tasks.filter(task=>task.id!==id);

renderTasks();
}

function renderTasks(){

const active=document.getElementById("tlist");
const done=document.getElementById("dlist");

active.innerHTML="";
done.innerHTML="";

tasks.forEach(task=>{

const div=document.createElement("div");
div.className="task";

div.innerHTML=`
<span>${task.name} (${task.time})</span>
<div>
<button onclick="completeTask(${task.id})">✔</button>
<button onclick="deleteTask(${task.id})">🗑</button>
</div>
`;

if(task.done){
div.classList.add("completed");
done.appendChild(div);
}else{
active.appendChild(div);
}

});

}
