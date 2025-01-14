let scene,camera,renderer,labelRenderer,labelDiv,controls,earth,clouds,marker,orbits,directionalLight,sat_model,label,point_light;

let changeSatelliteModel,drawOrbits;



import * as THREE from 'https://cdn.skypack.dev/three@v0.131.3';

import { GLTFLoader } from 'https://cdn.skypack.dev/pin/three@v0.131.3-QQa34rwf1xM5cawaQLl8/mode=imports,min/unoptimized/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://cdn.skypack.dev/pin/three@v0.131.3-QQa34rwf1xM5cawaQLl8/mode=imports,min/unoptimized/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'https://cdn.skypack.dev/pin/three@v0.131.3-QQa34rwf1xM5cawaQLl8/mode=imports,min/unoptimized/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'https://cdn.skypack.dev/pin/three@v0.131.3-QQa34rwf1xM5cawaQLl8/mode=imports,min/unoptimized/examples/jsm/renderers/CSS2DRenderer.js';


function init(){


    THREE.DefaultLoadingManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {

        let p = (itemsLoaded / itemsTotal * 100).toFixed();

        document.querySelector('.progress-bar').style.width = p + "%";
        document.querySelector('.progress-bar').textContent = p + "%";
        console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    
    };
    THREE.DefaultLoadingManager.onLoad = function ( ) {
        document.getElementById('loading').style.display = 'none';    
        document.querySelector('.progress-bar').style.display = 'none';
        document.querySelector('.menu').style.pointerEvents = "all";
    };

    scene = new THREE.Scene();
 
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
    );

    renderer = new THREE.WebGLRenderer({antialias:true,alpha: false});
    renderer.setSize(window.innerWidth,window.innerHeight);
    document.getElementById('three_map').appendChild(renderer.domElement);
    
    
    labelRenderer = new CSS2DRenderer();
	labelRenderer.setSize( window.innerWidth, window.innerHeight );
	labelRenderer.domElement.style.position = 'absolute';
	labelRenderer.domElement.style.top = '0px';
	document.getElementById('three_map').appendChild(labelRenderer.domElement);

    let isMobile = navigator.userAgent &&
    navigator.userAgent.toLowerCase().indexOf('mobile') >= 0;
    let isSmall = window.innerWidth < 1000;

    function onResize(){

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth,window.innerHeight);
        labelRenderer.setSize( window.innerWidth, window.innerHeight );
    
    }

    window.addEventListener("resize",onResize);
    onResize();


    
    const Cubeloader = new THREE.CubeTextureLoader();
    
    scene.background = Cubeloader.load([
            
        'src/images/skybox/space/space_lf.png',
        'src/images/skybox/space/space_rt.png',
        'src/images/skybox/space/space_up.png',
        'src/images/skybox/space/space_dn.png',
        'src/images/skybox/space/space_ft.png',
        'src/images/skybox/space/space_bk.png'

    ]);


    const TextureLoader = new THREE.TextureLoader();
    const GLTFloader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath( './src/draco/');
    GLTFloader.setDRACOLoader( dracoLoader );
    


    controls = new OrbitControls(camera,labelRenderer.domElement);

    controls.minDistance = 15;
    controls.maxDistance = 300;

    controls.enableDamping= true;
    controls.enableKeys = false;
    controls.enablePan = false;

    /*

    controls.minAzimuthAngle = 6;
    controls.maxAzimuthAngle = 7;
    controls.maxPolarAngle = 2.5;
    controls.minPolarAngle = 2.2;

    controls.enableZoom = false;
    controls.enableDamping= true;
    controls.enableKeys = false;
    controls.enablePan = false;
    controls.enabled = true;

    */

    var obj = new THREE.Object3D();
    marker = new THREE.Object3D();

    function randomStarPosition(){
        return Math.floor((Math.random() * ( 300 - -300 + 1 )) - 250) ;
    }

    for(let i =0; i< 50; i++){
        let  star = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 32, 32),
            new THREE.MeshBasicMaterial({color:0xffffff}));
        
            star.position.x = randomStarPosition();
            star.position.y = randomStarPosition();
            star.position.z = randomStarPosition();
    
            scene.add(star);
    }


    TextureLoader.load("src/images/textures/earth_atmos_2048.jpg",(eTexture)=>{

        earth = new THREE.Mesh(
            new THREE.SphereGeometry(50, 32, 32),
            new THREE.MeshPhongMaterial({map: eTexture}));
            obj.add(earth);

            TextureLoader.load("src/images/textures/earth_clouds_2048.png",(cTexture)=>{

                clouds = new THREE.Mesh(
                    new THREE.SphereGeometry(51, 32, 32),
                    new THREE.MeshPhongMaterial({map: cTexture,transparent: true,}));
                    obj.add(clouds);

                    GLTFloader.load('./src/3d/default_sat.glb',(gltf)=>{

                        sat_model = gltf;
                        sat_model.scene.name = 'satellite';
                        sat_model.scene.scale.x = 0.1;
                        sat_model.scene.scale.y = 0.1;
                        sat_model.scene.scale.z = 0.1;
                        sat_model.scene.position.set(70,0,0);
                        sat_model.scene.quaternion.setFromUnitVectors(
                            new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0));
                
                        point_light =  new THREE.Mesh( 
                            new THREE.SphereGeometry( 0.5, 32, 32 ),
                            new THREE.MeshBasicMaterial( { color: 0xff1100,transparent: true } ) ) ;
                        point_light.name = 'point_light';    
                
                        point_light.position.set(71,0,0);
                        point_light.material.opacity = 0.6;
                        
                                new TWEEN.Tween(point_light.scale)
                                .to({x : 10, y : 10, z: 10},3000)
                                .repeat(Infinity)
                                .start();
                
                                new TWEEN.Tween(point_light.material)
                                .to({opacity:0},1000)
                                .repeat(Infinity)
                                .start();
                
                
                        labelDiv = document.createElement( 'div' );
                        labelDiv.className = 'three_label';
                        labelDiv.textContent = '';
                        labelDiv.style.marginTop = '-1em';
                        label = new CSS2DObject( labelDiv );
                        label.position.set( 72,0,0);
                        labelDiv.addEventListener('click',()=>{
                            
                            console.log('clicked');
                            new TWEEN.Tween(camera.position).to(
                                sat_model.scene.getWorldPosition(new THREE.Vector3()),
                                2000
                            ).start();
                            new TWEEN.Tween(camera.rotation).to(
                                sat_model.scene.getWorldQuaternion(new THREE.Vector3()),
                                2000
                            ).start();
                        })
                
                        marker.add( label );
                        marker.add(point_light);
                        marker.add(sat_model.scene);
                
                        scene.add(obj);
    
                    });

            });

    });
   

    
    

    

    changeSatelliteModel = (src)=>{

        marker.remove(sat_model.scene);
        obj.remove(marker);

        GLTFloader.load('./src/3d/'+src+'.glb',(gltf)=>{
            sat_model =  gltf;
            sat_model.scene.scale.x = 0.1;
            sat_model.scene.scale.y = 0.1;
            sat_model.scene.scale.z = 0.1;
            sat_model.scene.position.set(70,0,0);
    
            sat_model.scene.quaternion.setFromUnitVectors(
                new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0));
            
                marker.add(sat_model.scene);
                obj.add(marker);
        });

    }

    

    /*
    var pointer = new THREE.Mesh(
        new THREE.CylinderGeometry(2, 0, 10),
        new THREE.MeshPhongMaterial({color: 0xcc9900}));

    pointer.position.set(55, 0, 0); // rotating obj should set (X > 0, 0, 0)
    pointer.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0));
    
    marker.add(pointer);

    */

    
    //var lightA = new THREE.AmbientLight(0xffffff);
    //lightA.position.set(0, 200, 0);
    //scene.add(lightA);

    directionalLight = new THREE.DirectionalLight( 0xffffff, 0.9 );
    scene.add( directionalLight );
    

    /*
    marker.quaternion.setFromEuler(
        new THREE.Euler(0, 19.252689* rad, 47.494341 * rad, "YZX")
        ); 
        */


    camera.position.z += 200;

        

    drawOrbits = ()=>{

        obj.remove(orbits);
        orbits = new THREE.Group();
    
        let colors = [
            "orange",
            "red",
            "green"
        ];
        
        for(let ii = 0; ii < window.sat_orbits.length; ii++){

            let points = [];

            for(let i = 0; i < window.sat_orbits[ii].length; i++ ){

                let cord = {
                    lat : THREE.Math.degToRad( 90 - window.sat_orbits[ii][i][0] ),
                    lng : THREE.Math.degToRad( window.sat_orbits[ii][i][1] )
                }
    
                points.push( 
                    new THREE.Vector3().setFromSphericalCoords( 70, cord.lat, cord.lng)
                )
                
            }
    
    
            let orbit = new THREE.Line( 
                new THREE.BufferGeometry().setFromPoints( points ),
                new THREE.LineBasicMaterial( {  color: colors[ii], linewidth: 0.5 } )
                 );

                 orbits.add(orbit);

        }

        obj.add(orbits);

    
            
    }


    animate();



}
 

 


function animate(){

    requestAnimationFrame(animate);

    if(window.sat_is_changed){
        
        if(window.tles[window.current_sat].has3D != ""){
            changeSatelliteModel("c_"+window.current_sat);
        }else{
            changeSatelliteModel('default_sat');
        }

        drawOrbits();
        labelDiv.innerHTML = window.current_sat.toUpperCase();
        window.sat_is_changed = false;

    
        
    }

    if(window.cords != undefined){

        /*
        marker.position.set(
            new THREE.Vector3().setFromSphericalCoords( 
                    0, 
                    THREE.Math.degToRad( 90 - window.sat_cords.lat ), 
                    THREE.Math.degToRad( window.sat_cords.lng )
                ));
                */
                
                

        
        //marker.quaternion.setFromEuler(
            //new THREE.Euler(window.sat_cords.lat * Math.PI / 180,0, window.sat_cords.lng * Math.PI / 180,"XYZ"));

            
        marker.quaternion.setFromEuler(
            new THREE.Euler(THREE.Math.degToRad( 
                90 - window.cords.sat.lng ),
                0,
                THREE.Math.degToRad( window.cords.sat.lat ),
                "XYZ"
                ));

                

    }

    if(sat_model != undefined){

        sat_model.scene.rotation.x += 0.0003;
        sat_model.scene.rotation.y += 0.0003;
        sat_model.scene.rotation.z += 0.0003;

        clouds.rotation.y += 0.0005;

        //let o = new THREE.Vector3(); 
        //sat_model.scene.getWorldPosition(o);
        //controls.target = o;
        //console.log(controls.target);
    
    }
    
    
    directionalLight.position.copy(camera.position);
    directionalLight.rotation.copy(camera.rotation);
   
    renderer.clear();
    controls.update();
    TWEEN.update();
    renderer.render(scene,camera);
    labelRenderer.render( scene, camera );
    
}


init();


