// --- Matter.js Modules ---
const { Engine, Body, Bodies, Constraint, Composite } = Matter;

let engine;
let world;

// --- Robot Parts ---
let chassis;
let wheelLeft, wheelRight;
let ground;
let car;

function setup() {
  createCanvas(800, 400);

  // Initialize Matter physics engine
  engine = Engine.create();
  engine.gravity.y = 1; 
  
  // Boost iterations to give the arm enough rigid strength to push the car body
  engine.positionIterations = 20; 
  engine.velocityIterations = 20; 
  
  world = engine.world;

  // 1. Create Ground (Slightly lowered so car can drop onto it)
  ground = Bodies.rectangle(400, 350, 800, 40, { 
    isStatic: true, 
    friction: 0.9 // High friction so the arm can bite and push off
  });
  Composite.add(world, ground);

  // Spawn car safely above the ground (yy = 200) so the arm doesn't spawn stuck in dirt
  car = createCar(150, 200, 150 , 30 , 30);
  Composite.add(world, [car]);
}

let seconds = 0;
let lastSecond = 0;

let angles1 = [0, -2*Math.PI/4];
let angles2 = [0, 2*Math.PI/6, 2*Math.PI/3];
let states = [[0, 0], [0, 1], [0, 2], [1, 2], [1, 0]]; // Each state corresponds to a pair of angles for arm1 and arm2

function draw() {
  background(240);

  // --- Sine Wave Crawling Animation ---
  let time = millis() * 0.0015; // Controls the speed of the rowing cycle
  let motorStrength = 0.5;     // Joint stiffness/torque multiplier

  seconds = int(millis() / 1000);
  if (seconds > lastSecond) {
    lastSecond = seconds;
    print("Time:", seconds, "s");
  } 



  // 1. Joint 0 (Chassis to Arm 1) Movement
  // Base angle points slightly down, oscillating up and down to take steps
  let baseAngle1 = car.chassis.angle //+ (Math.PI * 0.1); 
  let swingRange1 = Math.PI * 0.25; 
  //let targetAngle1 =angles1[seconds % angles1.length]; //baseAngle1 + Math.sin(time) * swingRange1;
  let targetAngle1 = angles1[states[seconds % states.length][0]]; //baseAngle1 + Math.sin(time) * swingRange1;
  Body.setAngle(car.arm1, targetAngle1);
  let angleError1 = 0

//   let angleError1 = targetAngle1 - car.arm1.angle;
//   let torque1 = angleError1 * motorStrength;

//   car.arm1.torque += torque1;
//   car.chassis.torque -= torque1; 
   car.arm1.torque += 1;
   car.chassis.torque -= 1;

  // 2. Joint 1 (Arm 1 to Arm 2) Movement
  // By adding (Math.PI * 0.5) to the time, Arm 2 lags behind Arm 1.
  // This phase delay creates a natural "scooping" or "rowing" motion.
  let baseAngle2 = car.arm1.angle //+ (Math.PI * 0.2); 
  let swingRange2 = Math.PI * 0.4; 
  //let targetAngle2 =angles2[seconds % angles2.length]; //baseAngle2 + Math.sin(time - Math.PI * 0.5) * swingRange2;
  let targetAngle2 = angles2[states[seconds % states.length][1]]; //baseAngle2 + Math.sin(time - Math.PI * 0.5) * swingRange2;
Body.setAngle(car.arm2, targetAngle2);
  let angleError2 = 0

//   let angleError2 = targetAngle2 - car.arm2.angle;
//   let torque2 = angleError2 * motorStrength;

//   car.arm2.torque += torque2;
//   car.arm1.torque -= torque2; 
   car.arm2.torque += 1;
   car.arm1.torque -= 1; 
    // --- HARD LOCK / RESTRAINT SYSTEM ---
  // If the arm is very close to its target position, actively damp its velocity 
  // to remove the "floppiness" and freeze it instantly.
  if (Math.abs(angleError1) < 0.05) {
      // 0.1 leaves 10% velocity, killing 90% of the wobble instantly
      Body.setAngularVelocity(car.arm1, 0); //car.arm1.angularVelocity * 0.1); 
  }
  if (Math.abs(angleError2) < 0.05) {
      Body.setAngularVelocity(car.arm2, 0); //car.arm2.angularVelocity * 0.1);
  }

  // ------------------------------------

  // Sub-stepping for maximum constraint resolution
  let hz = 60;
  let subSteps = 3;
  for (let i = 0; i < subSteps; i++) {
      Engine.update(engine, (1000 / hz) / subSteps);
  }


  // --- Rendering ---
  fill(100);
  noStroke();
  drawGround(ground);

  drawCar(car);
}


function drawGround(body) {
    let pos = body.position;
    let angle = body.angle;

    push();
    translate(pos.x, pos.y);
    rotate(angle);
    rectMode(CENTER);
    rect(0, 0, 800, 40); // Matches setup dimensions
    pop();
}

function drawCar(car) {
    let pos = car.chassis.position;
    let angle = car.chassis.angle;

    // Draw Chassis
    push();
    translate(pos.x, pos.y);
    rotate(angle);
    rectMode(CENTER);
    fill(255, 0, 0);
    rect(0, 0, 150, 30); 
    pop();

    // Draw Wheels
    let wheelA = car.wheelA;
    let wheelB = car.wheelB;
    push();
    noFill();
    stroke(0);
    strokeWeight(2);

    push()
    translate(wheelA.position.x, wheelA.position.y);
    rotate(wheelA.angle);
    ellipse(0, 0, wheelA.circleRadius * 2);
    line(0, 0, wheelA.circleRadius, 0);
    pop()

    push()  
    translate(wheelB.position.x, wheelB.position.y);
    rotate(wheelB.angle);
    ellipse(0, 0, wheelB.circleRadius * 2);
    line(0, 0, wheelB.circleRadius, 0);
    pop()

    pop()

    // Draw the arm
    push();
    let arm1 = car.arm1;
    translate(arm1.position.x, arm1.position.y);
    rotate(arm1.angle);
    rectMode(CENTER);
    fill(0, 255, 0);
    rect(0, 0, car.arm1Width, car.arm1Height); 
    pop();

    // Draw Arm 2
    push();
    let arm2 = car.arm2;
    translate(arm2.position.x, arm2.position.y);
    rotate(arm2.angle);
    rectMode(CENTER);
    fill(0, 200, 255); // Blue color for the secondary arm segment
    rect(0, 0, car.arm2Width, car.arm2Height); 
    pop();    
}

/**
* Creates a composite with simple car setup of bodies and constraints.
*/
createCar = function(xx, yy, width, height, wheelSize) {

    var group = Body.nextGroup(true),
        wheelBase = 20,
        wheelAOffset = -width * 0.5 + wheelBase,
        wheelBOffset = width * 0.5 - wheelBase,
        wheelYOffset = 15; 
        
    var arm1Width = 60;  
    var arm1Height = 12; 
    var arm2Width = 50;  // Width of the second segment
    var arm2Height = 10; // Height of the second segment

    var car = Composite.create({ label: 'Car' });

    var chassis = Bodies.rectangle(xx, yy, width, height, { 
            collisionFilter: { group: group },
            chamfer: { radius: height * 0.5 },
            density: 0.005, 
            //frictionAir: 0, 
        });

    var wheelA = Bodies.circle(xx + wheelAOffset, yy + wheelYOffset, wheelSize, { 
        collisionFilter: { group: group },
        friction: 0.9,    
        frictionStatic: 0,     
        //frictionAir: 0, 
        density: 0.005
    });
                
    var wheelB = Bodies.circle(xx + wheelBOffset, yy + wheelYOffset, wheelSize, { 
        collisionFilter: { group: group },
        friction: 0.9,
        frictionStatic: 0, 
        //frictionAir: 0, 
        density: 0.005
    });
                
    var axelA = Constraint.create({
        bodyB: chassis,
        pointB: { x: wheelAOffset, y: wheelYOffset },
        bodyA: wheelA,
        stiffness: 1, 
        length: 0
    });
                    
    var axelB = Constraint.create({
        bodyB: chassis,
        pointB: { x: wheelBOffset, y: wheelYOffset },
        bodyA: wheelB,
        stiffness: 1, 
        length: 0
    });
    
    // Segment 1: Spawns connected to the front of the chassis
    var arm1 = Bodies.rectangle(xx + width/2 + arm1Width/2, yy, arm1Width, arm1Height, {  
        collisionFilter: { group: group },
        density: 0.002, 
        friction: 0.4,
        frictionStatic: 1.0,
        //frictionAir: 0
    });

    // Segment 2: Spawns connected to the end of arm1
    var arm2 = Bodies.rectangle(xx + width/2 + arm1Width + arm2Width/2, yy, arm2Width, arm2Height, {  
        collisionFilter: { group: group },
        density: 0.002, 
        friction: 0.9, // High friction so the tip can grip the floor
        frictionStatic: 1.0,
        //frictionAir: 0
    });

    // Joint 0: Chassis front edge to Arm 1 start edge
    var jointBase = Constraint.create({
        bodyA: chassis,
        bodyB: arm1,
        pointA: { x: width/2, y: 0 },
        pointB: { x: -arm1Width/2, y: 0 },
        stiffness: 0,
        damping: 0,
        length: 0
    });

    // Joint 1: Arm 1 end edge to Arm 2 start edge
    var joint1 = Constraint.create({
        bodyA: arm1,
        bodyB: arm2,
        pointA: { x: arm1Width/2, y: 0 },
        pointB: { x: -arm2Width/2, y: 0 },
        stiffness: 0,
        damping: 0,
        length: 0
    });

    Composite.addBody(car, chassis);
    Composite.addBody(car, wheelA);
    //Composite.addBody(car, wheelB);
    Composite.addConstraint(car, axelA);
    //Composite.addConstraint(car, axelB);
    Composite.addBody(car, arm1); 
    Composite.addBody(car, arm2); 
    Composite.addConstraint(car, jointBase);
    Composite.addConstraint(car, joint1);

    car.chassis = chassis;
    car.wheelA = wheelA;
    car.wheelB = wheelB;
    car.arm1 = arm1;
    car.arm1Width = arm1Width;
    car.arm1Height = arm1Height;
    car.arm2 = arm2;
    car.arm2Width = arm2Width;
    car.arm2Height = arm2Height;

    return car;
};