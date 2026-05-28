var Mapa = require("./map");
const fs = require('fs');
const { Blob } = require("buffer");
//const AdmZip = require('adm-zip');
var AdmZip ;
var MapRenderer;
var MapGfx;
var JSDom;
var { PNG } = require("pngjs");//todo move this to prepare
const GL = require("@kmamal/gl");//try to move this to prepare
const readline = require('readline');
var RL = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(Mapa);
console.log("Map  00000000000");
var processmode = 1;
var maplist = [];
var mapnamelist = [];
var currentmapnum = 0 ;
var maplimit = 50;


if(!fs.existsSync("maplist.txt")){
//create maplist.txt here
  fs.readdir("maps", (err, files)=>{
    if(err){
      return console.log("Unable to scan directory: " + err);
    }
    let i = 0;
    //console.log("length"+files.length);
    files.forEach((file)=>{
      //console.log("File:"+file+ " i "+ i++  );
      if(file.endsWith(".pms")){
        //console.log("endswith");
        mapnamelist.push(file);
      }
    });
    //console.log("after foreach"+mapnamelist.length);
    askquestions();
    //return 0;
  });
//console.log("asdasd");
  //console.log("asdasd"+mapnamelist);
}else{
  fs.readFile("maplist.txt" ,'utf8',  (err, data) =>{
    if (err) throw err;
    //console.log(data);
    mapnamelist = data.split("\n");
    console.log(typeof data);
    console.log(mapnamelist);
    //loadnextmap();
    askquestions();
  });
}
function askquestions(){
  let createpmquestion = function (){
    RL = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    RL.on("close" , ()=>{
      console.log("inside last close event");
      RL = null;
      prepare();
    });
    RL.question('What will be the process mode? (0 = zip maps, 1(prints textures and scenery images),2 = screenshots)', processmodequestion);

  };
  let createmlquestion = function (){
    RL = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    RL.on("close" , createpmquestion);
    RL.question('What is the last map to be processed? ('+currentmapnum+'/'+(mapnamelist.length-1)+')\n', maplimitquestion);

  };
  let createcmquestion = function (){
    //readline.question('What is the next map to be processed? (0/'+(mapnamelist.length-1)+')\n', currentmapquestion);
    RL = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    RL.on("close" , createmlquestion);
    RL.question('What is the next map to be processed? (0/'+(mapnamelist.length-1)+')\n', currentmapquestion);
  };
  let processmodequestion = function (ans){
    if(!isNaN(ans)){
      processmode = Number(ans);
    }else{
      console.log("Invalid number, processmode set to 1");
      processmode = 1;
    }
    console.log("processmode:"+processmode);
    RL.close();
  };
  let maplimitquestion = function (ans){
    if(!isNaN(ans)){
      if(Number(ans) >= 0 && Number(ans) < mapnamelist.length){
        maplimit = Number(ans);
        console.log("maplimit set to"+ Number(ans));
      }else{
        console.log("Number of out range("+currentmapnum+'/'+(mapnamelist.length-1)+"). maplimit set to 0");
        maplimit = 0;
      }
    }else{
      console.log("Invalid number, maplimit set to 0");
      maplimit = 0;
    }
    RL.close();
  };

  let currentmapquestion = function (ans){
    console.log(" currentmapquestion");
    if(!isNaN(ans)){
      if(Number(ans) >= 0 && Number(ans) < mapnamelist.length){
        currentmapnum = Number(ans);
        console.log("currentmapnum set to"+ Number(ans));
      }else{
        console.log("Number of out range(0/"+(mapnamelist.length-1)+"). currentmapnum set to 0");
        currentmapnum = 0;
      }
    }else{
      console.log("Invalid number, currentmap set to 0");
      currentmapnum = 0;
    }
    console.log("end of currentmapquestion");
    RL.close();
  };
  let txtquestion = function (ans){
    if(ans == "n" || ans == "N"){
      console.log("maplist.txt not created");
    }else if(ans == "y" || ans == "Y"){
      createmaplisttxt()
      //console.log("Invalid answer, maplist.txt not created");
    }else{
      console.log("Invalid answer, maplist.txt not created");
    }
    //readline.on("close", ()=>{createcmquestion()});
    RL.close();
    //console.log("test");
    //createcmquestion();
  };


  if(!fs.existsSync("maplist.txt")){
    RL.on("close", ()=>{createcmquestion()});
    RL.question('Create maplist.txt (y/n)?\n', txtquestion);
    //RL.setPrompt("1??");
    //RL.prompt();
    //RL.on("line", txtquestion);

    //createcmquestion();
  }else{
    createcmquestion();
  }
  //loadnextmap();
}
function prepare(){
  console.log("inside prepare()");
  switch(processmode){
    case 0:
    console.log("case 0");
    AdmZip = require('adm-zip');
    loadnextmap();console.log("!loadnextmap168");
    break;
    case 1:
    console.log("case 1");
    loadnextmap();console.log("!loadnextmap172")
    break;
    case 2:
    MapRenderer = require("./render.js");
    console.log("prepare 2");
    

    const canvas = {
      width: 800,
      height: 600,
      style: {},
      getContext(type, opts) {
        if (
          type === "webgl" ||
          type === "experimental-webgl" ||
          type === "webgl2"
        ) {
          return globalThis.__realGl;
        }
      
        if (type === "2d") {
          const { createCanvas } = require("canvas");
          const c = createCanvas(this.width, this.height);
          return c.getContext("2d");
        }
      
        return null;
      }
    };
    
    //globalThis.WebGLRenderingContext = WebGLRenderingContext;
    globalThis.window = globalThis;
    globalThis.navigator = { userAgent: "node" };
    globalThis.document = {
      appendChild() {},
  removeChild() {},
      createElement(tag) {
        if (tag === "canvas") return canvas;
    
        if (tag === "a") {
          return {
            setAttribute(name, value) {
              this[name] = value;
            },
            click() {},
          };
        }
    
        return {};
      },
      querySelector(sel) {
        if (sel === "canvas") return canvas;
        return null;
      }
    };
    globalThis.document.body = {
      appendChild() {},
      removeChild() {}
    };
    //globalThis.__realGl = realGl;
   /* MapGfx = require("./gfx.js");
    globalThis.mat3 = MapGfx.mat3;
globalThis.mat3mul = MapGfx.mat3mul;
globalThis.mat3mulx = MapGfx.mat3mulx;
globalThis.mat3muly = MapGfx.mat3muly;
globalThis.mat3ortho = MapGfx.mat3ortho;//called on render
*/
    const { Image } = require("canvas");
    globalThis.Image = Image;

    //var { PNG } = require("pngjs");

    loadnextmap();console.log("loadnextmap276")
    break;

    default:
    console.log("invalid processmode, nothing will be done");
    break;
  }
}
console.log("Mapb  1111111111");
function createmaplisttxt(){
  let stream = fs.createWriteStream("maplist.txt", {flags: "w"});
  let first = true;
  mapnamelist.forEach((mapname)=>{
    if(first){
      stream.write(mapname);
      first = false;
    }else{
      stream.write("\n"+mapname);
    }
  });
  stream.end();
  console.log("maplist.txt created")
}
function parsemap(mapname){
  if(mapname != ""){
    console.log("Parsing map:" + mapname);
    let ab = fs.readFileSync("maps/"+mapname, null).buffer;
    let result = Mapa.Map.parse(ab);
    //console.log("!!width",result)
    ///console.log(result.texture);
    //console.log(result.images);
    try{
      processmap(result, mapname);
    }catch(e){
      console.log("ERROR on processmap:",e)
    }
    //currentmap = new mapS(mapname,result.texture, result.images);
    //maplist.push(currentmap);
    currentmapnum++;
    loadnextmap();//TODO:revert this or add an if
  }
}
function saveScreenshot(buffer,mapname){
  fs.writeFileSync("./mapScreenShots/"+mapname+".png", buffer);
}
function processmap(m,mapname){
if(processmode == 0){
  let imagename = "";
  let Zipmap = new AdmZip();
  imagename = m.texture;
  if(fs.existsSync("textures/"+m.texture)){
    Zipmap.addLocalFile("textures/"+m.texture,"textures");
  }else if(fs.existsSync("textures/"+m.texture.replace(".bmp",".png"))){
    Zipmap.addLocalFile("textures/"+m.texture.replace(".bmp",".png"),"textures");

  }else if(fs.existsSync("textures/"+m.texture.replace(".bmp",".jpg"))){
    Zipmap.addLocalFile("textures/"+m.texture.replace(".bmp",".jpg"),"textures");

  }
  //Zipmap.addLocalFile("textures/kokos.png","textures");
  m.images.forEach( imgf =>{
    if(fs.existsSync("scenery-gfx/"+imgf)){
      Zipmap.addLocalFile("scenery-gfx/"+imgf, "scenery-gfx");
    }

  });
  if(fs.existsSync("maps/"+mapname)){
    Zipmap.addLocalFile("maps/"+mapname);
  }
  Zipmap.writeZip("zips/"+mapname.replace(".pms","")+'.zip');
}else if(processmode == 1){
  console.log("Texture:"+m.texture);
  console.log(m.images);
}else if(processmode == 2){
  console.log("test236");
  console.log(MapRenderer);
  console.log(Mapa);


  var v = [].concat.apply([], m.polygons.map(function(p) { return p.vertices; }));
		var x = v.map(function(v) { return v.x; });
		var y = v.map(function(v) { return v.y; });
		var margin = 10;

		var xmin = Math.floor(Math.min.apply(null, x)) - margin;
		var xmax = Math.ceil(Math.max.apply(null, x)) + margin;
		var ymin = Math.floor(Math.min.apply(null, y)) - margin;
		var ymax = Math.ceil(Math.max.apply(null, y)) + margin;

		var w = Math.abs(xmax - xmin);
		var h = Math.abs(ymax - ymin);

  console.log("w",w,"h",h)
  if(w<=0 || h<=0 || !Number.isFinite(w+h)){
    console.log("skipping map:",mapname);
    return;
  }
  const realGl = GL(w, h);
    
  if (!realGl || typeof realGl.createFramebuffer !== "function") {
    throw new Error("@kmamal/gl did not return a valid WebGL context, mapname"+mapname);
  }
  function WebGLRenderingContext() {}
    Object.assign(WebGLRenderingContext, {
      STREAM_DRAW: realGl.STREAM_DRAW,
      STATIC_DRAW: realGl.STATIC_DRAW,
      DYNAMIC_DRAW: realGl.DYNAMIC_DRAW
    });

    for (const k in realGl) {
      if (typeof realGl[k] === "number") {
        WebGLRenderingContext[k] = realGl[k];
      }
    }
    globalThis.WebGLRenderingContext = WebGLRenderingContext;//all GL stuff moved here
    globalThis.__realGl = realGl;

    MapGfx = require("./gfx.js");
    globalThis.mat3 = MapGfx.mat3;
globalThis.mat3mul = MapGfx.mat3mul;
globalThis.mat3mulx = MapGfx.mat3mulx;
globalThis.mat3muly = MapGfx.mat3muly;
globalThis.mat3ortho = MapGfx.mat3ortho;
  //let canvas = document.querySelector("canvas");
  //let gfx = gfx_create_context(canvas, {alpha: true});
  let canvas = {
    width: 8000,
    height: 6000,
    style: {},
    getContext(type, opts) {
      if (
        type === "webgl" ||
        type === "experimental-webgl" ||
        type === "webgl2"
      ) {
        return globalThis.__realGl;
      }
      return null;
    },
    toBlob(callback, type) {
      console.log("inside toBlob");

  const gl = globalThis.__realGl;
  const w = gl.drawingBufferWidth || this.width;
  const h = gl.drawingBufferHeight || this.height;

  if (!w || !h) {
    throw new Error("Invalid GL size for screenshot");
  }

  gl.finish();
  console.log("error before read", gl.getError());

  const pixels = Buffer.alloc(w * h * 4);
  gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  //console.log("error after read", gl.getError());
  //console.log("w h", w, h);
  //console.log("first 32 bytes", pixels.slice(0, 32));

  const png = new PNG({ width: w, height: h });

  for (let y = 0; y < h; y++) {
    const srcStart = (h - 1 - y) * w * 4;
    const dstStart = y * w * 4;
    pixels.copy(png.data, dstStart, srcStart, srcStart + w * 4);
  }

  const buffer = PNG.sync.write(png);

  saveScreenshot(buffer, mapname);

  if (callback) {
    callback(new Blob([buffer], { type: "image/png" }));
  }
    
    
    
    }//end of toblob



  };
  //console.log(MapGfx);
  let gfx = MapGfx.gfx_create_context(canvas, { alpha: true });
  //globalThis.filelist = [m.texture];//todo, i might get issues
  globalThis.filelist = [];
  if(m.texture == ""){
    m.texture = "ananas.png"; //render.js throws an error in the init() function if texture is null, this is an workaround to avoid htat
  }
  if(m.texture != "" && fs.existsSync("textures/"+m.texture)){
    console.log("adding texture:",m.texture);
    //Zipmap.addLocalFile("scenery-gfx/"+imgf, "scenery-gfx");
    globalThis.filelist.push("/textures/"+m.texture);console.log("adding texture");
  }else{
    console.log("original texture wasnt added, used ananas instead")
    m.texture = "ananas.png";
    globalThis.filelist.push("/textures/"+m.texture);
  }
  m.images.forEach( imgf =>{
    if(fs.existsSync("scenery-gfx/"+imgf)){
      //Zipmap.addLocalFile("scenery-gfx/"+imgf, "scenery-gfx");
      globalThis.filelist.push("/scenery-gfx/"+imgf);
    }
    
  });
//console.log("!!!!filelist after creation",filelist)

let renderer;
  renderer = new MapRenderer.MapRenderer(gfx, m , "", function(){
    console.log("Test!!!!!!!!!!!!!!!!!!!")

    //console.log("canvas",gfx.canvas);
  
  });


    
    //realGl = GL(w, h);
  renderer.screenshot(1);
  //loadnextmap();console.log("!!loadnextmap 433")
}

}

function loadnextmap(){
//parsemap("Airpidates");
console.log("  current:"+currentmapnum+"maplimit"+maplimit+"l"+mapnamelist.length);
if((currentmapnum <= maplimit) && (currentmapnum < mapnamelist.length)){
  console.log("current:"+currentmapnum+"maplimit"+maplimit+"l"+mapnamelist.length);
  parsemap(mapnamelist[currentmapnum]);
}
else{
  /*maplist.forEach(imap =>{
    let imagename = "";
    console.log("Map name:"+imap.mapname);
    console.log("Map texture:"+imap.textures);
    console.log("Map images:"+imap.scenery);
    let Zipmap = new AdmZip();
    imagename = imap.textures;
    if(fs.existsSync("textures/"+imap.textures)){
      Zipmap.addLocalFile("textures/"+imap.textures,"textures");
    }else if(fs.existsSync("textures/"+imap.textures.replace(".bmp",".png"))){
      Zipmap.addLocalFile("textures/"+imap.textures.replace(".bmp",".png"),"textures");

    }else if(fs.existsSync("textures/"+imap.textures.replace(".bmp",".jpg"))){
      Zipmap.addLocalFile("textures/"+imap.textures.replace(".bmp",".jpg"),"textures");

    }
    //Zipmap.addLocalFile("textures/kokos.png","textures");
    imap.scenery.forEach( imgf =>{
      if(fs.existsSync("scenery-gfx/"+imgf)){
        Zipmap.addLocalFile("scenery-gfx/"+imgf, "scenery-gfx");
      }

    });
    if(fs.existsSync("maps/"+imap.mapname)){
      Zipmap.addLocalFile("maps/"+imap.mapname);
    }
    Zipmap.writeZip("zips/"+imap.mapname+'.zip');
    //file.writeZip(imap.mapname+'output.zip');
  });*/
}
}
