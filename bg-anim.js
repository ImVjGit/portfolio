'use strict';
class BgAnim{
  constructor(){
    this.canvas=document.getElementById('bgCanvas');
    this.ctx=this.canvas.getContext('2d');
    this.parts=[];
    this.codeLines=[];
    this.springLogos=[];
    this.jvmHeap=65;
    this.jvmThreads=[];
    this.resize();
    window.addEventListener('resize',()=>this.resize());
    this.initParticles();
    this.initCodeRain();
    this.initSpringLogos();
    this.initJvmMonitor();
    this.draw();
  }
  resize(){
    this.w=this.canvas.width=window.innerWidth;
    this.h=this.canvas.height=window.innerHeight;
  }
  initParticles(){
    const n=Math.min(50,Math.floor((this.w*this.h)/20000));
    for(let i=0;i<n;i++){
      this.parts.push({
        x:Math.random()*this.w,y:Math.random()*this.h,
        r:1+Math.random()*2,
        dx:-0.1-Math.random()*0.3,dy:-0.1-Math.random()*0.15,
        o:0.02+Math.random()*0.04,
        hue:Math.random()>0.5?35:145
      });
    }
  }
  initCodeRain(){
    const cols=Math.max(3,Math.floor(this.w/120));
    for(let i=0;i<cols;i++){
      const tokens=['class','void','@Bean','@Autowired','public','JVM',
        'Spring','Java','API','@Component','@Service','new','import'];
      this.codeLines.push({
        x:20+Math.random()*(this.w-40),y:-100-Math.random()*600,
        text:tokens[Math.floor(Math.random()*tokens.length)],
        size:8+Math.random()*2,speed:0.15+Math.random()*0.25,
        o:0.02+Math.random()*0.03
      });
    }
  }
  initSpringLogos(){
    const n=Math.max(2,Math.floor(this.w/400));
    for(let i=0;i<n;i++){
      this.springLogos.push({
        x:Math.random()*this.w,y:Math.random()*this.h,
        s:60+Math.random()*120,angle:Math.random()*360,
        speed:0.1+Math.random()*0.2,o:0.02+Math.random()*0.03
      });
    }
  }
  initJvmMonitor(){
    for(let i=0;i<8;i++){
      this.jvmThreads.push({
        x:0,y:0,state:['RUNNABLE','TIMED_WAIT','BLOCKED','WAITING'][Math.floor(Math.random()*4)],
        phase:Math.random()*Math.PI*2,speed:0.3+Math.random()*0.4
      });
    }
  }
  drawLeaf(ctx,x,y,s,angle,o){
    ctx.save();ctx.translate(x,y);ctx.rotate(angle*Math.PI/180);
    ctx.scale(s/120,s/160);ctx.globalAlpha=o;
    ctx.strokeStyle='#6DB33F';ctx.lineWidth=1.5;ctx.fillStyle='#6DB33F';
    ctx.beginPath();
    ctx.moveTo(60,0);
    ctx.bezierCurveTo(85,20,108,50,105,80);
    ctx.bezierCurveTo(102,110,80,140,50,155);
    ctx.bezierCurveTo(25,140,10,110,12,85);
    ctx.bezierCurveTo(14,60,30,25,60,0);
    ctx.fill();ctx.stroke();
    ctx.restore();
  }
  drawJvmMonitor(c){
    const{w,h}=this;const pad=20;const pw=220;const ph=100;
    const x=w-pw-pad;const y=h-ph-pad;
    const t=Date.now()/1000;

    /* Background panel */
    c.save();c.globalAlpha=0.25;
    c.fillStyle='#0a0a0a';c.strokeStyle='rgba(109,179,63,0.3)';c.lineWidth=1;
    c.beginPath();c.roundRect(x,y,pw,ph,6);c.fill();c.stroke();
    c.restore();

    /* Title */
    c.save();c.globalAlpha=0.35;
    c.font='9px JetBrains Mono,monospace';c.fillStyle='#6DB33F';
    c.fillText('JVM Monitor',x+10,y+16);

    /* Heap bar */
    this.jvmHeap+=(-2+Math.random()*4);this.jvmHeap=Math.max(20,Math.min(90,this.jvmHeap));
    const barX=x+10;const barY=y+28;const barW=pw-20;const barH=8;
    c.globalAlpha=0.15;c.fillStyle='#333';c.beginPath();c.roundRect(barX,barY,barW,barH,3);c.fill();
    c.globalAlpha=0.4;c.fillStyle='#f97316';
    c.beginPath();c.roundRect(barX,barY,barW*(this.jvmHeap/100),barH,3);c.fill();
    c.globalAlpha=0.35;c.font='8px JetBrains Mono,monospace';c.fillStyle='#f97316';
    c.fillText(`Heap: ${Math.round(this.jvmHeap)}%`,barX+barW-55,barY-3);

    /* Thread activity */
    c.globalAlpha=0.3;c.fillStyle='#999';c.font='8px JetBrains Mono,monospace';
    c.fillText('Threads:',x+10,y+54);
    for(let i=0;i<this.jvmThreads.length;i++){
      const th=this.jvmThreads[i];
      const tx=x+60+i*18;const ty=y+52;
      th.phase+=th.speed*0.05;
      const pulse=Math.sin(th.phase);
      const color=pulse>0.3?'#6DB33F':pulse<-0.3?'#f97316':'#666';
      c.save();c.globalAlpha=0.15+Math.abs(pulse)*0.25;
      c.beginPath();c.arc(tx,ty,3,0,Math.PI*2);c.fillStyle=color;c.fill();
      c.restore();
    }

    /* GC label */
    c.save();c.globalAlpha=0.2;c.font='7px JetBrains Mono,monospace';c.fillStyle='#666';
    const gcPhase=Math.sin(t*0.3);
    c.fillText(gcPhase>0.7?'GC · Minor':'GC · Idle',x+10,y+75);
    c.restore();
  }
  draw(){
    const c=this.ctx;const{w,h}=this;
    c.clearRect(0,0,w,h);

    /* Grid with subtle wave */
    c.strokeStyle='rgba(255,255,255,0.03)';c.lineWidth=1;
    const t=Date.now()/4000;
    for(let x=0;x<w;x+=40){
      c.beginPath();c.moveTo(x,0);
      for(let y=0;y<h;y+=20){
        const wave=Math.sin(y*0.02+t+x*0.005)*2;
        c.lineTo(x+wave,y);
      }
      c.stroke();
    }
    for(let y=0;y<h;y+=40){
      c.beginPath();c.moveTo(0,y);
      for(let x=0;x<w;x+=20){
        const wave=Math.sin(x*0.02+t*1.3+y*0.003)*2;
        c.lineTo(x,y+wave);
      }
      c.stroke();
    }

    /* Particles */
    for(const p of this.parts){
      p.x+=p.dx;p.y+=p.dy;
      if(p.x<0)p.x=w;if(p.x>w)p.x=0;
      if(p.y<0)p.y=h;if(p.y>h)p.y=0;
      c.beginPath();
      c.arc(p.x,p.y,p.r,0,Math.PI*2);
      c.fillStyle=`hsla(${p.hue},70%,50%,${p.o})`;
      c.fill();
    }

    /* Code rain */
    for(const cl of this.codeLines){
      cl.y+=cl.speed;
      if(cl.y>h+50){cl.y=-30;cl.text=['class','void','@Bean','@Autowired','public','JVM',
          'Spring','Java','API','@Component','@Service','new','import'][Math.floor(Math.random()*13)];}
      c.font=`${cl.size}px 'JetBrains Mono',monospace`;
      c.fillStyle=`rgba(249,115,22,${cl.o})`;
      c.fillText(cl.text,cl.x,cl.y);
    }

    /* Spring logos */
    for(const sl of this.springLogos){
      sl.angle+=sl.speed;
      this.drawLeaf(c,sl.x,sl.y,sl.s,sl.angle,sl.o);
    }

    /* JVM Monitor */
    if(w>600)this.drawJvmMonitor(c);

    requestAnimationFrame(()=>this.draw());
  }
}
