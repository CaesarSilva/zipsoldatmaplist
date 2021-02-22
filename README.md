# zipsoldatmaplist
It can zip soldat maps(and their images) individually, and also print the image names in the terminal.
It depends on maps.js, from urraka/pms-info and adm-zip(to zip files).  
https://github.com/urraka/pms-info  
npm install adm-zip  
Put it in the parent folder of the "maps" folder and run it using nodejs.  
node processmaplist.js  
It will look for a file called maplist.txt, if it doesn't exist it will look at the "maps" folder and put all the PMS map names into an array, and ask the user if he or she wants to create a maplist.txt.  
After that it will ask the user the number of the first map to be processed(1st map = 0).  
It will then ask the user number of the last map to be processed.  
After that it will ask the user the "process mode", 0 will zip the maps with its images, 1 will just print the textures and image names.

  
## saving output
On linux:  
node processmaplist.js | tee myoutput.txt  
or
node processmaplist.js | tee -a myoutput.txt (it will append the output to this file instead of overwritting it)  
Note: using > or >> will redirect the output to the file and the user won't be able to read the questions.


On windows:  
node processmaplist.js > myoutput.txt  
node processmaplist.js >> myoutput.txt (it will append the output to this file instead of overwritting it)  
Note: I haven't tested that on windows.
