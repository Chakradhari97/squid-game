import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'


//import doll from '../static/scene.gltf'

/**
 * Base
 */
// Debug
//const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color( 0xeeeeee)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const roadLine = textureLoader.load('./textures/race-track.png')



/**
 * GLTF loader
 */

function createCube(size, rotX=0 ,rotZ=0 , map, color) {
    const geometry = new THREE.BoxGeometry(size.w, size.h, size.d);
    const material = new THREE.MeshStandardMaterial( {
        map: map,
        color: color
    })
    const cube = new THREE.Mesh(geometry, material)
    cube.position.y = -2.4
    cube.rotation.x = rotX
    cube.rotation.z = rotZ
    scene.add(cube)
    return cube 
}

/**
 * Car geometery
 */

//Global position
const start_position = 4
const end_position = -start_position
const text = document.querySelector(".text")
const TIMIT_LIMIT = 25
let gameStat = "loading"
let isLookingBack = true

const loader = new GLTFLoader()

const dracoLoader = new DRACOLoader ()
dracoLoader.setDecoderPath('three/examples/js/libs/draco/')
loader.setDRACOLoader( dracoLoader )


function delay(ms){
    return new Promise(resolve => setTimeout(resolve, ms))
}

class Killer 
{
    constructor() 
    {

    loader.load('./scene.gltf', (gltf) => {
        
            this.killer = gltf.scene
            this.killer.scale.set(.05, .05, .05)
            scene.add(this.killer)
            this.killer.rotation.set(0, 0.1, 0)
            this.killer.position.set(0, -1, 0)
            
        })
    }

    lookBackward() { 
        gsap.to(this.killer.rotation, {y: -Math.PI, duration: 1})
        setTimeout(() => isLookingBack = true, 150)
    }

    lookForward() { 
        gsap.to(this.killer.rotation, {y: 0, duration: 1})
        setTimeout(() => isLookingBack = false, 450)
    }

    async start(){
        this.lookBackward()
        await delay((Math.random() * 750) + 750)
        this.lookForward()
        await delay((Math.random() * 1000) + 1000)
        this.start()
    }

}

function createTrack() {
    //createCube({w: .03, h: 1.5, d: .1}, start_position, -.2, finishLine)
    //createCube({w: .03, h: 1.5, d: .1}, end_position, .2, finishLine)
    createCube({w: start_position * 2, h: 1.5, d: 0}, (2), Math.PI ,roadLine)
}
createTrack()


/**
 * Object
 */
class Player {
    constructor(){
        {
            function createWheels() {
                const geometry = new THREE.BoxBufferGeometry(12, 12, 33);
                const material = new THREE.MeshLambertMaterial({ color: 0x333333 });
                const wheel = new THREE.Mesh(geometry, material);
                return wheel;
            }

            function createLight(){
                const lightGeometry = new THREE.CircleGeometry(4, 32)
                const lightMaterial = new THREE.MeshLambertMaterial( { 
                    color: 0xffff00,
                    side: THREE.DoubleSide
                })
                const light = new THREE.Mesh(lightGeometry, lightMaterial)
                return light;

            }
            function createCar() {
                const car = new THREE.Group();
               
               const backWheel = createWheels();
               backWheel.position.y = 6;
               backWheel.position.x = -18;
               car.add(backWheel);
               
               const frontWheel = createWheels();
               frontWheel.position.y = 6;  
               frontWheel.position.x = 15;
               car.add(frontWheel);

               const ligth1 = createLight()
               ligth1.position.x= 31
               ligth1.position.y= 12
               ligth1.position.z= 8
               ligth1.rotation.y = Math.PI / 2
               car.add(ligth1)
               
               const ligth2 = createLight()
               ligth2.position.x= 31
               ligth2.position.y= 12
               ligth2.position.z= -8
               ligth2.rotation.y = Math.PI / 2
               car.add(ligth2)
             
               const main = new THREE.Mesh(
                  new THREE.BoxBufferGeometry(60, 15, 30),
                  new THREE.MeshLambertMaterial({ color: 0x6B9BF3})
                );
                main.position.y = 12;
                car.add(main);
              
                const cabin = new THREE.Mesh(
                  new THREE.BoxBufferGeometry(33, 12, 24),
                  new THREE.MeshLambertMaterial({ color: 0x032667 })
                );
                cabin.position.x = -6;
                cabin.position.y = 25.5;
                car.add(cabin);
              
                return car;
            }
            
            const car = createCar();
            car.scale.set(.015, .015, .015)
            car.position.set(0, -2.4, 0)
            car.rotation.set(94.65, Math.PI, 0)
            scene.add(car);

            this.player = car
            this.playerInfo = {
                movement : start_position - 0.5,
                velocity : 0 
            }
        }
}
    
//Conditions
    ride(){
        //gsap.to(this.player.position, {x: this.player.position.x -= this.playerInfo.velocity, duration: 1, ease: true})
        this.playerInfo.velocity = 0.01
    }

    stop(){
        gsap.to(this.playerInfo, {velocity: 0, duration: .1, ease: true})
        //this.playerInfo.velocity = 0
    }

    check(){
        if(this.playerInfo.velocity > 0 &&  !isLookingBack){
            console.log("You lose!")
            text.innerText = "You Lose!"
            gameStat = "over"
        }
        
        if(this.player.position.x < end_position + 1){
            //console.log("You WIN!")
            text.innerText = "YOU WIN!!"
            gameStat = "over"
        }
    }
    update() {
        this.check()
        this.playerInfo.movement -= this.playerInfo.velocity
        this.player.position.x = this.playerInfo.movement
    
}
}

let player = new Player()
let killer = new Killer()

async function init() {
    await delay(800)
    text.innerText = "Starting in 3"
    await delay(800)
    text.innerText = "Starting in 2"
    await delay(800)
    text.innerText = "Starting in 1"
    await delay(800)
    text.innerText = "GO..!!"
    startGame()


}

function startGame(){
    gameStat = "started"
    let progressBar = createCube({w: 8, h: .1, d: .08,}, 0, 0, 0, 0x1E8449  )
    progressBar.position.y = 4
    //progressbar.rotation.x = -0.5
    gsap.to(progressBar.scale, {x: 0, duration: TIMIT_LIMIT, ease: "none"})
    killer.start()
    setTimeout(() => {
        if(gameStat != "over"){
            text.innerText = "Ran out of Time"
            gameStat = "over"
        }
    }, TIMIT_LIMIT * 1000)
}
init()

// setTimeout(() => {
//     killer.start()
// }, 1000)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

window.addEventListener('keydown', (e) => {
    if(gameStat != "started") return
    if(e.key == "ArrowLeft" ){
        player.ride()
    }
})

window.addEventListener('keyup', (e) => {
    if(gameStat != "started") return
    if(e.key == "ArrowLeft"){
        player.stop()
    }
})
function setupKeyLogger() {
    document.onkeydown = function(e) {
      console.log(e);
    }
  }
  //setupKeyLogger()

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 10
scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true


/**
 * Light
 */

const ambientLight = new THREE.AmbientLight (0xffffff)
scene.add(ambientLight)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
// /renderer.outputEncoding = THREE.sRGBEncoding

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //Update Player
    if(gameStat == "over") return
    player.update()

    // Update controls
    //controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()