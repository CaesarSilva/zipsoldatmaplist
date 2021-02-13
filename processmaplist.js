var Mapa = require("./map");
const fs = require('fs');
//const AdmZip = require('adm-zip');
var AdmZip ;
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
    RL.question('What will be the process mode? (0 = zip maps, 1(prints textures and scenery images))', processmodequestion);

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
    loadnextmap();
    break;
    case 1:
    console.log("case 1");
    loadnextmap();
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
    ///console.log(result.texture);
    //console.log(result.images);
    processmap(result, mapname);
    //currentmap = new mapS(mapname,result.texture, result.images);
    //maplist.push(currentmap);
    currentmapnum++;
    loadnextmap();
  }
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
