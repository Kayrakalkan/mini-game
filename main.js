import * as BABYLON from '@babylonjs/core'; // imported babylon.js directory 
import * as CANNON from 'cannon'; // i add cannon library to import the physics
import * as GUI from "@babylonjs/gui/2D";
import "@babylonjs/loaders";

const canvas = document.getElementById('renderCanvas'); 
const engine = new BABYLON.Engine(canvas, true);  
var camera;



var loadingScreenDivPercent = window.document.getElementById("loadingScreenPercent");// get loadingScreenPercent from html and define 

function customLoadingScreen() {  // i create custom loading screen
    console.log("customLoadingScreen creation")
}
customLoadingScreen.prototype.displayLoadingUI = function () {
    console.log("customLoadingScreen loading")
};
customLoadingScreen.prototype.hideLoadingUI = function () { // when if page is loaded to disappear loading page
    console.log("customLoadingScreen loaded")
    loadingScreenDivPercent.style.display = "none";

};
var loadingScreen = new customLoadingScreen(); // define the loading screen 
engine.loadingScreen = loadingScreen;

engine.displayLoadingUI(); 

var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    
    // i enabled a physics
    scene.enablePhysics(new BABYLON.Vector3(0, -30, 0), new BABYLON.CannonJSPlugin(true, 10, CANNON));

    camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(0, 7, 0), scene);
    camera.attachControl(canvas, true);
    camera.ellipsoid.set(7, 3, 7); // i added ellipsoid to the camera for physics
    camera.checkCollisions = true; // i turned on camera collisions
    camera.applyGravity = true; // i turned on gravity

    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    var box = BABYLON.Mesh.CreateBox("crate", 7, scene); // i create the box and define the texture
    box.material = new BABYLON.StandardMaterial("Mat", scene);
    box.material.diffuseTexture = new BABYLON.Texture("textures/crate.png", scene);
    box.material.diffuseTexture.hasAlpha = true;
    box.position = new BABYLON.Vector3(0, 5, 30);
    // i added physics to the box
    box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.9 }, scene); 
    box.checkCollisions = true; // i turned on box collisions
    box.actionManager = new BABYLON.ActionManager(scene); // i create a action manager to the box 
    box.actionManager.registerAction( // the function opens the model when the box is clicked
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
            modal.style.display = "block";
            span.onclick = function() {
                modal.style.display = "none";
              }
        })  
    );

    // i created a ground and set a floor texture than added physics same logic
    var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
    ground.position = new BABYLON.Vector3(0, 0, 0);
    ground.material = new BABYLON.StandardMaterial("groundMat", scene);
    ground.material.diffuseTexture = new BABYLON.Texture("textures/floor.jpg", scene);
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
    ground.checkCollisions = true;

    // gun importing 
    BABYLON.SceneLoader.ImportMesh("", "assets/", "guns.glb", scene, function (meshes) { 
        var gun = meshes[0]; // define the gun
        gun.scaling.set(80, 80, 80); // define the gun scale
        gun.position.set(1.5, -5, 0.5);  // define the gun possition
        gun.parent = camera; // i created camera parent for gun
        gun.rotate(new BABYLON.Vector3(0, 0, 0),550); // i rotated gun because gun look opposite way
        engine.hideLoadingUI(); // i added this line because when loaded the guns.glb file to disappear loadingui
    },
    function (evt) { // this function related loading percent i got help documentation then i write 
        var loadedPercent = 0;
        if (evt.lengthComputable) {
            loadedPercent = (evt.loaded * 100 / evt.total).toFixed();
        } else {
            var dlCount = evt.loaded / (1024 * 1024);
            loadedPercent = Math.floor(dlCount * 100.0) / 100.0;
        }
        // i get loadingScreenPercent froum from html file and i added loading... text 
        document.getElementById("loadingScreenPercent").innerHTML = (" loading... ") + loadedPercent ;
    }
);



    scene.collisionsEnabled = true; // i turned on the scene collisions 
    var modal = document.getElementById("myModal"); // i get modal from html
    var span = document.getElementsByClassName("close")[0]; // i get modal close button from html
    // i created box and added physics
    var secondBox = BABYLON.Mesh.CreateBox("box1", 7, scene);
    secondBox.material = new BABYLON.StandardMaterial("Mat", scene);
    secondBox.material.diffuseTexture = new BABYLON.Texture("textures/crate.png", scene);
    secondBox.material.diffuseTexture.hasAlpha = true;
    secondBox.position = new BABYLON.Vector3(30, 5, 0);
    secondBox.physicsImpostor = new BABYLON.PhysicsImpostor(secondBox, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.9 }, scene); 
    secondBox.checkCollisions = true;
    secondBox.actionManager = new BABYLON.ActionManager(scene); // i create a action manager to the box 
    secondBox.actionManager.registerAction( // the function opens the model when the box is clicked
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
            modal.style.display = "block";
            span.onclick = function() {
                modal.style.display = "none";
              }
        })
        
    ); 

    const jump = function(){
        camera.position.y = 15;
    };
    const sit = function(){
        camera.position.y = 4;
    };
    const lastPosition = function(){
        camera.position.y = 7;
    };
    let fallDelay = 1000; // Milisaniye cinsinden bekleme süresi

    const inputMap = {};
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnKeyDownTrigger,
        function(evt) {
            inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }
    ));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnKeyUpTrigger,
        function(evt) {
            inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }
    ));
    scene.onBeforeRenderObservable.add(() => {
        if (inputMap["w"]) {
            jump();
                setTimeout(() => {
                    lastPosition();
                }, fallDelay);      
        }
        if (inputMap["s"]) {
            sit();
            setTimeout(() => {
                lastPosition();
            }, fallDelay);      
        }
    });

    let adt = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    let xAddPos = 0;
    let yAddPos = 0;
    let xAddRot = 0;
    let yAddRot = 0;
    let sideJoystickOffset = 150;
    let bottomJoystickOffset = -50;
    let translateTransform;    


  let leftThumbContainer = makeThumbArea("leftThumb", 2, "blue", null);
      leftThumbContainer.height = "200px";
      leftThumbContainer.width = "200px";
      leftThumbContainer.isPointerBlocker = true;
      leftThumbContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      leftThumbContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
      leftThumbContainer.alpha = 0.4;
      leftThumbContainer.left = sideJoystickOffset;
      leftThumbContainer.top = bottomJoystickOffset;

  let leftInnerThumbContainer = makeThumbArea("leftInnterThumb", 4, "blue", null);
      leftInnerThumbContainer.height = "80px";
      leftInnerThumbContainer.width = "80px";
      leftInnerThumbContainer.isPointerBlocker = true;
      leftInnerThumbContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
      leftInnerThumbContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;


  let leftPuck = makeThumbArea("leftPuck",0, "blue", "blue");
          leftPuck.height = "60px";
          leftPuck.width = "60px";
          leftPuck.isPointerBlocker = true;
          leftPuck.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
          leftPuck.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;


      leftThumbContainer.onPointerDownObservable.add(function(coordinates) {
          leftPuck.isVisible = true;
          leftPuck.floatLeft = coordinates.x-(leftThumbContainer._currentMeasure.width*.5)-sideJoystickOffset;
          leftPuck.left = leftPuck.floatLeft;
          leftPuck.floatTop = adt._canvas.height - coordinates.y-(leftThumbContainer._currentMeasure.height*.5)+bottomJoystickOffset;
          leftPuck.top = leftPuck.floatTop*-1;
          leftPuck.isDown = true;
          leftThumbContainer.alpha = 0.9;
      });

      leftThumbContainer.onPointerUpObservable.add(function(coordinates) {
          xAddPos = 0;
          yAddPos = 0;
          leftPuck.isDown = false;
          leftPuck.isVisible = false;
          leftThumbContainer.alpha = 0.4;
      });


      leftThumbContainer.onPointerMoveObservable.add(function(coordinates) {
          if (leftPuck.isDown) {
              xAddPos = coordinates.x-(leftThumbContainer._currentMeasure.width*.5)-sideJoystickOffset;
              yAddPos = adt._canvas.height - coordinates.y-(leftThumbContainer._currentMeasure.height*.5)+bottomJoystickOffset;
              leftPuck.floatLeft = xAddPos;
              leftPuck.floatTop = yAddPos*-1;
              leftPuck.left = leftPuck.floatLeft;
              leftPuck.top = leftPuck.floatTop;
              }
      });

   adt.addControl(leftThumbContainer);
   leftThumbContainer.addControl(leftInnerThumbContainer);
   leftThumbContainer.addControl(leftPuck);
   leftPuck.isVisible = false;

  

      camera.attachControl(canvas, true);

    scene.registerBeforeRender(function(){
              translateTransform = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(xAddPos/3000, 0, yAddPos/3000), BABYLON.Matrix.RotationY(camera.rotation.y));
              camera.cameraDirection.addInPlace(translateTransform);
              camera.cameraRotation.y += xAddRot/15000*-1;
              camera.cameraRotation.x += yAddRot/15000*-1;
        }); 

function makeThumbArea(name, thickness, color, background, curves){
   let rect = new GUI.Ellipse();
       rect.name = name;
       rect.thickness = thickness;
       rect.color = color;
       rect.background = background;
       rect.paddingLeft = "0px";
       rect.paddingRight = "0px";
       rect.paddingTop = "0px";
       rect.paddingBottom = "0px";

   return rect;
}

    return scene;
};

var scene = createScene();


function checkCollisions() { // this function related when the camera pushes the box then it works
    var cameraPosition = camera.position;
    var boxPosition = scene.getMeshByName("crate").position; // get box possition
    var distance = BABYLON.Vector3.Distance(cameraPosition, boxPosition);
    var box1Position = scene.getMeshByName("box1").position;
    var distance1 = BABYLON.Vector3.Distance(cameraPosition, box1Position);

    if (distance < 12) {
        var modal = document.getElementById("myModal"); // get modal from html
        var span = document.getElementsByClassName("close")[0]; // get modal close button from html
        var pushDirection = cameraPosition.subtract(boxPosition).normalize();
        // when camera pushes the box then create new box
        scene.getMeshByName("crate").applyImpulse(pushDirection.scale(10), scene.getMeshByName("crate").getAbsolutePosition());
        var model = BABYLON.MeshBuilder.CreateBox("newModel", { size: 4 }, scene);
        model.material = new BABYLON.StandardMaterial("Mat", scene);
        model.material.diffuseTexture = new BABYLON.Texture("textures/bloc.jpg", scene);
        model.position = new BABYLON.Vector3(0, 2, 0);
        // when camera pushes the box then opens modal
        modal.style.display = "block";
            span.onclick = function() {
                modal.style.display = "none";
              }
    }
    
    if (distance1 < 12) {
        var modal = document.getElementById("myModal");
        var span = document.getElementsByClassName("close")[0];
        var pushDirection = cameraPosition.subtract(box1Position).normalize();
        scene.getMeshByName("box1").applyImpulse(pushDirection.scale(10), scene.getMeshByName("box1").getAbsolutePosition());
        var model = BABYLON.MeshBuilder.CreateBox("newModel", { size: 4 }, scene);
        model.material = new BABYLON.StandardMaterial("Mat", scene);
        model.material.diffuseTexture = new BABYLON.Texture("textures/albedo.png", scene);
        model.position = new BABYLON.Vector3(10, 2, 0);
        console.log("albedo created")
        modal.style.display = "block";
        span.onclick = function() {
            modal.style.display = "none";
          }
    }
} 
engine.runRenderLoop(function () {
    if (scene){
        scene.render();
    }
    checkCollisions();
});

window.addEventListener('resize', function () {
    engine.resize();
});