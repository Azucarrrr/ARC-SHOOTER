console.log(gsap)
//selecting canvas element
const canvas = document.querySelector('canvas')

//2d context 2D GAME
const c = canvas.getContext('2d')

//resizing canvas to screen size
canvas.width = innerWidth
canvas.height = innerHeight

//selecting scoreEL for score updation
const scoreEl = document.querySelector('#scoreEl')

//select buttton
const startGameBtn = document.querySelector('#startGameBtn')

//select whole div 
const modalEl = document.querySelector('#modalEl')

//select score
const bigScoreEl = document.querySelector('#bigScoreEl')

//creating class for player
class Player {

    //constructor to create properties each created player has, this keyword is used
    constructor(x, y, radius, color){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    //create draw player function
    draw(){
        //begin path to specify we want to draw
        c.beginPath()

        //arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean | undefined): void
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)

        //fill style to specify color
        c.fillStyle = this.color
        c.fill()
    }
}

//creating projectiles that player shoots
class Projectile {
    constructor(x, y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius 
        this.color = color
        this.velocity = velocity
    }

    draw(){
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
    
    //update class properties for velocity
    update(){

        //draw function inside update function
        this.draw()

        //x and y values mapped through valocity
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

//creating enemy
class Enemy {
    constructor(x, y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius 
        this.color = color
        this.velocity = velocity
    }

    draw(){
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
    
    //update class properties for velocity
    update(){

        //draw function inside update function
        this.draw()

        //x and y values mapped through valocity
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

//to slow down particles
const friction = 0.97

//particles class for after hit effect
class Particle {
    constructor(x, y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius 
        this.color = color
        this.velocity = velocity
        this.alpha = 1  //for fading partcle effect opacity
    }

    draw(){
        c.save() //call a global canvas function

        c.globalAlpha = this.alpha //fade out alpha

        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()

        c.restore() //call global code between save and restore
    }
    
    //update class properties for velocity
    update(){

        //draw function inside update function
        this.draw()

        //shrinking velocity overtime by multiplying friction
        this.velocity.x *= friction
        this.velocity.y *= friction
        
        //x and y values mapped through valocity
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01 //decrement to help fade
    }
}

//setting player in middle
const x = canvas.width / 2
const y = canvas.height / 2

//creating player 
let player = new Player(x, y, 15, 'white')
player.draw()

//projectile values

// const projectile2 = new Projectile(canvas.width / 2, canvas.height / 2, 5, 'green', {x:-1, y:-1})

//grouping of projectiles
//manage multiple instances of object which adds as we click on screen
let projectiles = []

//enemy array
let enemies = []

//particle array
let particles = []

//restart init function clears game
function init() {
    player = new Player(x, y, 15, 'white')
    projectiles = []
    enemies = []
    particles = []
    score = 0
    scoreEl.innerHTML = score
    bigScoreEl.innerHTML = score

}
//spawning enemies
function spawnEnemies(){
    //call function for each specific instance
    setInterval(() => {
        //radius above x cuz of scope
        //random radius from 4 to 30
        const radius = Math.random() * (30 - 4) + 4

        let x;
        let y;
        
        if(Math.random() <0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        }else{
            x = Math.random() * canvas.width
            y = Math.random() * 0.5 ? 0 - radius : canvas.height + radius
        }
       
        //random hue 
        const color =`hsl(${Math.random() * 360} , 50%, 50%)`      //backticks for templete literal

       //enemy direction
       //canvas.height - y =>  destination - source
        const angle = Math.atan2(canvas.height/ 2 - y,canvas.width/2 - x)

         //x and y velocity
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        enemies.push(new Enemy(x, y, radius, color, velocity))
        
    }, 1000)
}

let animationId

let score = 0

//animate function lopping over and over again by calling function animate itself
//this is done for velocity
function animate(){
    animationId = requestAnimationFrame(animate)
    //style fr blur effect
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'
    //clear rectangle is used within the whole canvas so that only one projectile at a time comes out of player
    c.fillRect(0, 0, canvas.width, canvas.height)

    //bringing back player after clearrect
    player.draw()

    particles.forEach((particle, index) => {
        //if alpha decrements to 0 remove particle from paricles array
        if(particle.alpha <= 0){
            particles.splice(index,1)
        }else{
            particle.update() // otherwise keep on forming paricles when hit
        }
    })

    //updating each projectile in array
    projectiles.forEach((projectile, index) => {
        projectile.update() 


        // when projectile goes off screen remove from array
        if (
            projectile.x + projectile.radius < 0 || 
            projectile.x - projectile.radius > canvas.width || 
            projectile.y + projectile.radius < 0 || 
            projectile.y - projectile.radius > canvas.height
        ){
            setTimeout(() => {
                projectiles.splice(index, 1)
            })
        }
    })

    enemies.forEach((enemy, index)  => {
        enemy.update()

        //distance between player and actual enemy through hypotenuse
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

        //end game when enemy and player touch each other
        if(dist - enemy.radius - player.radius < 1){
            cancelAnimationFrame(animationId)
            modalEl.style.display = "flex"
            bigScoreEl.innerHTML = score
        }

        //for loop under loop
        //for every enemy for every projectile
        projectiles.forEach((projectile, projectileIndex) => {
            //distance between projectile and actual enemy through hypotenuse
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            
            //when projectile touches enemy 
            if(dist - enemy.radius - projectile.radius < 1)
            {
                //increase score when hit
                score += 100
                //set score in html to actual score value
                scoreEl.innerHTML = score

                //particle explosion
                //to prevent flashing this waits uptill very last frame to remve in array
                for(let i = 0; i<enemy.radius * 2; i++){
                    //push new particle when projectile touches enemy 
                    particles.push(new Particle(projectile.x,projectile.y, Math.random() * 2, enemy.color, {x: (Math.random() - 0.5) * Math.random() * 5, y: (Math.random() - 0.5) * Math.random() * 5}))  //-0.5 to achieve negative value
                }


                //shrink using gsap
                if(enemy.radius - 10 > 10)
                {
                    //if shrinks increase score by 100
                    score += 100
                    //set score in html to actual score value
                    scoreEl.innerHTML = score

                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    enemy.radius -= 10
                    setTimeout(() => {
                    //shrink large enemy
                        projectiles.splice(projectileIndex,1)
                    }, 0)
                }
                else{
                    //if totally removed then
                    score += 250
                    scoreEl.innerHTML = score

                    setTimeout(() => {
                    //remove element and projectile from array when shoot enemy
                        enemies.splice(index , 1)
                        projectiles.splice(projectileIndex,1)
                    }, 0)
                }                
            }  
        })
    })
}

//event of click coordinate with value of x and y 
addEventListener('click', (event) => {
   //tan = y/x , y first arg  and x second arg
   //distance of center from mouse
    const angle = Math.atan2(event.clientY - canvas.height/2,event.clientX - canvas.width/2)

  //x and y velocity
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }
    
    //pushing into array each time we click on screen
    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'red', velocity))
})
//to get the right projectile we need to get angle
                //            A
                //            .
                //        .   .   -> y velocity
                //     .      .
                //  .  .   .  . 
                // o            B
            
                                            //   a.tan2(y,x) = AOB    //      |
                // x velocity
                                             // angle(AOB) = velocity angle
                                            //   tan(AOB) = y/x

//commented these ot cuz only need em when we click start game button
// animate()
// spawnEnemies() 

//add animate and enemies when start game
startGameBtn.addEventListener('click', () => {
    init()
    animate()
    spawnEnemies()

    //remove the div when start game
    modalEl.style.display = "none"
})