// --- Matter.js Modules ---
const { Engine, Body, Bodies, Constraint, Composite } = Matter;

let engine;
let world;
let GROUNDWIDTH = 600;
let GROUNDHEIGHT = 40;
let WALLWITH = 20;
let WALLHEIGHT = 160;
let CIRCLERADIANS = 2 * Math.PI;

let transitionCount = 0;
let lastTransitionCount = 0;

// 0 is horiztonal pointing right, positive is clockwise, negative is counter-clockwise
// -CIRCLERADIANS*0.25 is straight up
// +CIRCLERADIANS*0.25 is straight down
// -CIRCLERADIANS*0.5 or +CIRCLERADIANS*0.5 is straight left
let angles1 = [-CIRCLERADIANS * 0.1, -CIRCLERADIANS * 0.2];
let angles2 = [CIRCLERADIANS * 0.1, CIRCLERADIANS * 0.25, CIRCLERADIANS * 0.4];
let bestStates = [[0, 0], [0, 1], [0, 2], [1, 2], [1, 0]]; // Each state corresponds to a pair of angles for arm1 and arm2
let possibleStates = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]]; // All possible combinations of angles for arm1 and arm2

let lastDistanceFromWall1 = 0;
let lastDistanceFromWall2 = 0;
let currentStateIndex = 0;
let lastState1Index = 0;
let lastState2Index = 0;
let currentState = possibleStates[0];
let lastState1;
let lastState2;

function setupPhysics() {
    // Initialize Matter physics engine
    engine = Engine.create();
    engine.gravity.y = 1;

    // Boost iterations to give the arm enough rigid strength to push the car body
    engine.positionIterations = 15;
    engine.velocityIterations = 15;

    world = engine.world;

    // Create Ground (Slightly lowered so car can drop onto it)
    ground = Bodies.rectangle(GROUNDWIDTH / 2, 350, GROUNDWIDTH, GROUNDHEIGHT, {
        isStatic: true,
        friction: 0.9 // High friction so the arm can bite and push off
    });
    Composite.add(world, ground);

    // Create wall
    wall = Bodies.rectangle(10, 250, WALLWITH, WALLHEIGHT, {
        isStatic: true,
        friction: 0.9
    });
    Composite.add(world, wall);

    // Drop car safely above the ground
    car = createCar(120, 200, 150, 30, 30);
    Composite.add(world, car);
}

function drawPhysics() {

    let stateChange = false;
    background(240);

    // --- Multi-Joint Motor Control ---
    let motorStrength = 0.001;     // Joint stiffness/torque multiplier, higher values make the arm move faster and more rigidly

    // Transition to the next state at regular intervals (e.g. every second)
    transitionCount = int(millis() / 1000);
    if (transitionCount > lastTransitionCount) {
        lastTransitionCount = transitionCount;
        stateChange = true;
        lastState2Index = lastState1Index;
        lastState1Index = currentStateIndex;
        lastState2 = lastState1;
        lastState1 = currentState;

        // Choose the next state - cycle through the best states
        //currentState = bestStates[transitionCount % bestStates.length]; 

        // Choose a random state from the possible states
        currentStateIndex = Math.floor(Math.random() * possibleStates.length);
        currentState = possibleStates[currentStateIndex];
    }


    // 1. Joint 0 (Chassis to Arm 1) Movement
    let targetAngle1 = car.chassis.angle + angles1[currentState[0]];
    //let angleError1 = 0

    let angleError1 = targetAngle1 - car.arm1.angle;
    let torque1 = angleError1 * motorStrength;
    car.arm1.torque += torque1;
    car.chassis.torque -= torque1;
    Body.setAngle(car.arm1, targetAngle1);


    // Apply torque
    //car.arm1.torque += 1;
    //car.chassis.torque -= 1;

    // 2. Joint 1 (Arm 1 to Arm 2) Movement
    let targetAngle2 = car.arm1.angle + angles2[currentState[1]];
    // Body.setAngle(car.arm2, targetAngle2);
    // let angleError2 = 0

    // // Apply torque
    // car.arm2.torque += 1;
    // car.arm1.torque -= 1; 

    let angleError2 = targetAngle2 - car.arm2.angle;
    let torque2 = angleError2 * motorStrength;
    // Apply torque
    car.arm2.torque += torque2;
    car.arm1.torque -= torque2;
    Body.setAngle(car.arm2, targetAngle2);


    // Actively damp its velocity to remove the "floppiness" and freeze it instantly.
    Body.setAngularVelocity(car.arm1, 0);
    Body.setAngularVelocity(car.arm2, 0)
    // if (Math.abs(angleError1) < 0.05) {
    //     // 0.1 leaves 10% velocity, killing 90% of the wobble instantly
    //     Body.setAngularVelocity(car.arm1, car.arm1.angularVelocity * 0.1); 
    // }
    // if (Math.abs(angleError2) < 0.05) {
    //     Body.setAngularVelocity(car.arm2, car.arm2.angularVelocity * 0.1);
    // }
    // ------------------------------------

    // Sub-stepping for maximum constraint resolution
    let hz = 60;
    let subSteps = 3;
    for (let i = 0; i < subSteps; i++) {
        Engine.update(engine, (1000 / hz) / subSteps);
    }
    //Engine.update(engine)

    // --- Rendering ---
    fill(100);
    noStroke();
    drawGround(ground);
    drawWall(wall);
    drawCar(car);

    // Show distance from wall
    fill(0);
    textSize(16);
    textAlign(LEFT, TOP);
    let distanceFromWall = car.chassis.position.x - (wall.position.x + WALLWITH / 2) - 100;
    text("Distance from wall: " + nf(distanceFromWall, 1, 0) + " px", 10, 10);

    // Show state
    text("Current state: [" + currentState[0] + ", " + currentState[1] + "]", 10, 30);

    if (stateChange) {
        //print(lastDistanceFromWall2, lastDistanceFromWall1, distanceFromWall)
        if (lastState1 != undefined && lastState2 != undefined) {

            reward = round(distanceFromWall - lastDistanceFromWall1)
            print("[" + lastState2[0] + ", " + lastState2[1] + "]", "[" + lastState1[0] + ", " + lastState1[1] + "]", round(distanceFromWall - lastDistanceFromWall1))
            lastDistanceFromWall2 = lastDistanceFromWall1;
            lastDistanceFromWall1 = distanceFromWall;
        return reward
        }
        else {
            return undefined
        }

    }
    else {
        return undefined;
    }
}


function drawGround(body) {
    let pos = body.position;
    let angle = body.angle;

    push();
    translate(pos.x, pos.y);
    rotate(angle);
    rectMode(CENTER);
    rect(0, 0, GROUNDWIDTH, GROUNDHEIGHT); // Matches setup dimensions
    pop();
}

function drawWall(body) {
    let pos = body.position;
    let angle = body.angle;

    push();
    translate(pos.x, pos.y);
    rotate(angle);
    rectMode(CENTER);
    fill(150, 75, 0);
    rect(0, 0, WALLWITH, WALLHEIGHT);
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
createCar = function (xx, yy, width, height, wheelSize) {

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
        density: 0.01,
        frictionAir: 0.3,
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

    // Segment 1: Connected to the front of the chassis
    var arm1 = Bodies.rectangle(xx + width / 2 + arm1Width / 2, yy, arm1Width, arm1Height, {
        collisionFilter: { group: group },
        density: 0.005,
        friction: 0.4,
        frictionStatic: 1.0,
        //frictionAir: 0
    });

    // Segment 2: Connected to the end of arm1
    var arm2 = Bodies.rectangle(xx + width / 2 + arm1Width + arm2Width / 2, yy, arm2Width, arm2Height, {
        collisionFilter: { group: group },
        density: 0.005,
        friction: 0.9, // High friction so the tip can grip the floor
        frictionStatic: 1.0,
        //frictionAir: 0
    });

    // Joint 0: Chassis front edge to Arm 1 start edge
    var jointBase = Constraint.create({
        bodyA: chassis,
        bodyB: arm1,
        pointA: { x: width / 2, y: 0 },
        pointB: { x: -arm1Width / 2, y: 0 },
        stiffness: 0,
        damping: 0,
        length: 0
    });

    // Joint 1: Arm 1 end edge to Arm 2 start edge
    var joint1 = Constraint.create({
        bodyA: arm1,
        bodyB: arm2,
        pointA: { x: arm1Width / 2, y: 0 },
        pointB: { x: -arm2Width / 2, y: 0 },
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