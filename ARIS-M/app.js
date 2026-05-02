// ▼ Version一元管理
const APP_VERSION = "1.0.0";
document.addEventListener("DOMContentLoaded",()=>{
 document.getElementById("version").textContent = APP_VERSION;
});

let Roll=0,Yaw=0,Pitch=0;
let CRoll=0,CYaw=0,CPitch=0;
let sensorOK=false;

let csv="date,time,Roll,Yaw,Pitch,CRoll,CYaw,CPitch,FPitch,BL,TAlti\n";

function start(){modal.style.display="none"}

function tab(t){
 mainTab.style.display=(t==="main")?"block":"none";
 optionTab.style.display=(t==="opt")?"block":"none";
 tabMain.classList.toggle("active",t==="main");
 tabOpt.classList.toggle("active",t==="opt");
}

camBtn.onclick=async()=>{
 const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
 video.srcObject=s;
 nosignal.style.display="none";
 reticle.style.display="block";
 camBtn.className="btn green";
};

sensorBtn.onclick=async()=>{
 if(DeviceOrientationEvent.requestPermission){
  const r=await DeviceOrientationEvent.requestPermission();
  if(r!=="granted")return;
 }
 window.addEventListener("deviceorientation",e=>{
  Roll=e.gamma||0;
  Pitch=(e.beta||0)-90;
  Yaw=e.alpha||0;
 });
 sensorBtn.className="btn green";
 sensorOK=true;
};

function updateMainBtn(){
 if(!sensorOK){
  mainBtn.textContent="センサを許可してください";
  mainBtn.className="btn trigger red";
 }
 else if(!bl.value){
  mainBtn.textContent="ベースラインを入力してください";
  mainBtn.className="btn trigger red";
 }
 else{
  mainBtn.textContent="計測";
  mainBtn.className="btn trigger green";
 }
}

function loop(){
 const BL=Number(bl.value)||0;
 const AE=Number(ae.value)||0;
 const FRoll = Roll + CRoll;
 const FYaw = Yaw + CYaw;
 const FPitch = Pitch + CPitch;

 const R_Alti = BL * Math.tan((FPitch * 3.14) / 180);
 const RAL = R_Alti - (BL * Math.tan(((FPitch + AE) * 3.14) / 180));

 hBL.textContent=BL;
 hAlt.textContent=R_Alti.toFixed(1);
 hRal.textContent=RAL.toFixed(1);

 fpDisp.textContent=`tan((${FPitch.toFixed(1)} * 3.14)/180)`;

 fRoll.textContent=(FRoll).toFixed(1);
 fYaw.textContent=(FYaw).toFixed(1);
 fPitch.textContent=(FPitch).toFixed(1);

 cRoll.textContent = CRoll.toFixed(1);
 cYaw.textContent  = CYaw.toFixed(1);
 cPitch.textContent = CPitch.toFixed(1);

 const ALv = Number(al.value)||0;
 const alert = Math.abs(RAL) > ALv;
 const color = alert ? "#ff3030" : "#00ff00";

 reticle.style.filter = `drop-shadow(0 0 4px ${color})`;
 hud.style.color = color;

 updateMainBtn();
 requestAnimationFrame(loop);
}
loop();

mainBtn.onclick=()=>{
 if(!sensorOK || !bl.value)return;

 const BL=Number(bl.value);
 const FPitch=Pitch+CPitch;
 const T=BL*Math.tan((FPitch*3.14)/180);

 tAlti.textContent=T.toFixed(2);

 const d=new Date();
 csv+=`${d.getMonth()+1}${d.getDate()},${d.toTimeString().slice(0,8)},${Roll},${Yaw},${Pitch},${CRoll},${CYaw},${CPitch},${FPitch},${BL},${T}\n`;
};

csvBtn.onclick=()=>{
 const blob=new Blob([csv]);
 const a=document.createElement("a");
 a.href=URL.createObjectURL(blob);
 a.download="aris_m_log.csv";
 a.click();
};

calBtn.onclick=()=>{
 CRoll=Roll;
 CYaw=Yaw;
 CPitch=Pitch;
};
