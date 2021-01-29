var Mapa = require("./map");
const fs = require('fs');
const AdmZip = require('adm-zip');
var maplist = [];
var mapnamelist = [];
var currentmapnum = 0 ;
var maplimit = 30;
fs.readFile("maplist.txt" ,'utf8',  (err, data) =>{
  if (err) throw err;
  mapnamelist = data.split("\n");
  console.log(typeof data);
  console.log(mapnamelist);
  loadnextmap();
});
function mapS(mname,mtx,ms){
  this.mapname = mname;
  this.textures = mtx;
  this.scenery = ms;
}
function parsemap(mapname){
  
  if(mapname != "" && fs.existsSync("maps/"+mapname)){
    console.log("parsing map:" + mapname);
    let ab = fs.readFileSync("maps/"+mapname, null).buffer;
    let result = Mapa.Map.parse(ab);
    console.log(result.images);
    currentmap = new mapS(mapname,result.texture, result.images);
    maplist.push(currentmap);
    currentmapnum++;
    loadnextmap();
  }
}
function loadnextmap(){
if((currentmapnum <= maplimit) && (currentmapnum < mapnamelist.length)){
  console.log("current:"+currentmapnum+"maplimit"+maplimit+"l"+mapnamelist.length);
  parsemap(mapnamelist[currentmapnum]);
}
else{
  maplist.forEach(imap =>{
    let imagename = "";
    console.log("Map name:"+imap.mapname);
    console.log("Map texture:"+imap.textures);
    console.log("Map images:"+imap.scenery);
    let Zipmap = new AdmZip();
    imagename = imap.textures;
    if(fs.existsSync("textures/"+imap.textures)){
//sometimes maps.js gets the texture extension wrong, that's why I try replacing them
      Zipmap.addLocalFile("textures/"+imap.textures,"textures");
    }else if(fs.existsSync("textures/"+imap.textures.replace(".bmp",".png"))){
      Zipmap.addLocalFile("textures/"+imap.textures.replace(".bmp",".png"),"textures");

    }else if(fs.existsSync("textures/"+imap.textures.replace(".bmp",".jpg"))){
      Zipmap.addLocalFile("textures/"+imap.textures.replace(".bmp",".jpg"),"textures");

    }
    imap.scenery.forEach( imgf =>{
      if(fs.existsSync("scenery-gfx/"+imgf)){
        Zipmap.addLocalFile("scenery-gfx/"+imgf, "scenery-gfx");
      }

    });
    if(fs.existsSync("maps/"+imap.mapname)){
      Zipmap.addLocalFile("maps/"+imap.mapname, "maps");
    }
    Zipmap.writeZip("zips/"+imap.mapname+'.zip');
  });
}
}
