function filterNone() {
    return NodeFilter.FILTER_ACCEPT;
}

function getAllComments(rootElem) {
    var comments = [];
    // Fourth argument, which is actually obsolete according to the DOM4 standard, is required in IE 11
    var iterator = document.createNodeIterator(rootElem, NodeFilter.SHOW_COMMENT, filterNone, false);
    var curNode;
    while (curNode = iterator.nextNode()) {
        comments.push(curNode.nodeValue);
    }
    return comments;
}
function $(x) {
    return document.querySelector(x)
}
function $$(x) {
    return document.querySelectorAll(x)
}
class Atom {
    constructor(position,radius,color) {
        this.position = position;
        this.radius = radius;
        this.color = color;
    }
    position;
    radius;
    color;
}
class MolecularObject {
    constructor(components,id,position,velocity) {
        this.components = components;
        this.id = id;
        this.position = position;
        this.velocity = velocity;
        this.invincible_timer = 0;
    }
    components;
    id;
    position;
    velocity;
    invincible_timer;
}
function randCirc(radius) {
    let angle = Math.random()*2*Math.PI;
    return [radius*Math.cos(angle),radius*Math.sin(angle)]
}
function sqrDistance(p1,p2) {
    return (p1[0]-p2[0])*(p1[0]-p2[0])+(p1[1]-p2[1])*(p1[1]-p2[1])
}
function objectWithAvg(obj1,obj2,components,id) {
    return new MolecularObject(components,id,[(obj1.position[0]+obj2.position[0])/2,(obj1.position[1]+obj2.position[1])/2],[(obj1.velocity[0]+obj2.velocity[0])/2,(obj1.velocity[1]+obj2.velocity[1])/2])
}
function shiftAtom(atom,shift) {
    return new Atom([atom.position[0]+shift[0],atom.position[1]+shift[1]],atom.radius,atom.color)
}
function isColliding(object,other) {
    for (let i = 0; i < object.components.length; i++) {
        for (let j = 0; j < other.components.length; j++) {
            if (sqrDistance([object.components[i].position[0]+object.position[0],
                            object.components[i].position[1]+object.position[1]],
                            [other.components[j].position[0]+other.position[0],
                            other.components[j].position[1]+other.position[1]])<(object.components[i].radius+other.components[j].radius)*(object.components[i].radius+other.components[j].radius)) {
                                return true;
                            }
        }
    }
    return false;
}
$$(".particleSimulator").forEach((sim) => {
    console.log(getAllComments(sim)[0].replace(/\s/g,''));
    let parameters = JSON.parse(getAllComments(sim)[0].replace(/\s/g,''));
    let molecularObjects = [];
    let atoms = [];
    parameters.atoms.forEach((atom) => {
        atoms.push(new Atom([0,0],atom.radius,atom.color));
    });
    let CANVASWIDTH = parameters.canvas.width;
    let CANVASHEIGHT = parameters.canvas.height;
    function setup() {
        let i = 0;
        molecularObjects = [];
        parameters.particles.forEach((particle) => {
            let components = [];
            particle.components.forEach((component) => {
                components.push(shiftAtom(atoms[component.id],component.offset));
            })
            for (let j = 0; j < particle.amount; j++) {
                molecularObjects.push(new MolecularObject(components,i,[Math.random()*(CANVASWIDTH-20)+10,Math.random()*(CANVASHEIGHT-20)+10],randCirc(Math.random()*10+5)));
            }
            i++;
        })
    }
    setup();
    let c = document.createElement("canvas");
    c.setAttribute("width",CANVASWIDTH);
    c.setAttribute("height",CANVASHEIGHT);
    let playing = false;
    let playButton = document.createElement("button");
    playButton.innerText = "Play";
    playButton.addEventListener("click",() => {
        console.log(playButton.innerText)
        if (playButton.innerText == "Play") {
            playButton.innerText = "Pause";
        } else if (playButton.innerText == "Pause") {
            playButton.innerText = "Play";
        }
        playing = !playing;
    })
    let resetButton = document.createElement("button");
    resetButton.innerText = "Reset";
    resetButton.addEventListener("click", () => {
        setup();
        render();
    })
    
    let temperature = document.createElement("input");
    temperature.setAttribute("type","range");
    
    let br = document.createElement("br");
    
    sim.appendChild(c);
    sim.appendChild(br);
    sim.appendChild(playButton);
    sim.appendChild(resetButton);
    sim.appendChild(temperature)
    temperature.value=10;
    function productWithAvgRand(obj1,obj2,product,posRadius,velRadius) {
        let components = [];
        parameters.particles[product].components.forEach((component) => {
            components.push(shiftAtom(atoms[component.id],component.offset))
        })
        let randPos = randCirc(posRadius);
        let randVel = randCirc(velRadius);
        return new MolecularObject(components,product,[(obj1.position[0]+obj2.position[0])/2+randPos[0],(obj1.position[1]+obj2.position[1])/2+randPos[1]],[(obj1.velocity[0]+obj2.velocity[0])/2+randVel[0],(obj1.velocity[1]+obj2.velocity[1])/2+randVel[1]])
    }
    // var c = sim
    let ctx = c.getContext("2d");
    let reactionCounts = [];
    for (let i = 0; i < parameters.reactions.length; i++) {
        reactionCounts.push(0);
    }
    function render(collide) {
        ctx.clearRect(0, 0, c.width, c.height);
        for (let i = 0; i < molecularObjects.length; i++) {
            object = molecularObjects[i]
            if (object.invincible_timer!=0) {
                object.invincible_timer -=1;
            }
            object.components.forEach((component) => {
                ctx.beginPath();
                ctx.arc(object.position[0]+component.position[0], object.position[1]+component.position[1], component.radius, 0, 2 * Math.PI);
                ctx.fillStyle = component.color;
                ctx.fill();
            })
            object.position[0] += 1/10*temperature.value/5*object.velocity[0];
            object.position[1] += 1/10*temperature.value/5*object.velocity[1];
            if (object.position[0]>CANVASWIDTH-10) {
                object.position[0]=CANVASWIDTH-10;
                object.velocity[0] *= -1;
            }
            if (object.position[0]<10) {
                object.position[0]=10;
                object.velocity[0] *= -1;
            }
            if (object.position[1]>CANVASHEIGHT-10) {
                object.position[1]=CANVASHEIGHT-10;
                object.velocity[1] *= -1;
            }
            if (object.position[1]<10) {
                object.position[1]=10;
                object.velocity[1] *= -1;
            }
            for (let j = 0; j < molecularObjects.length; j++) {
                other = molecularObjects[j]
                if (i == j) {
                    continue;
                }
                if (isColliding(object,other) && object.invincible_timer==0 && other.invincible_timer==0 && collide) {
                    let reacted = false;
                    for (let k = 0; k < parameters.reactions.length; k++) {
                        let reaction = parameters.reactions[k];
                        if ((object.id==reaction.reactants[0] && other.id == reaction.reactants[1]) || (object.id==reaction.reactants[0] && other.id == reaction.reactants[1])) {
                            console.log("HI")
                            reaction.products.forEach((product) => {
                                let createdProduct = productWithAvgRand(object,other,product,10,5);
                                console.log(Math.floor(600/temperature.value));
                                createdProduct.invincible_timer=Math.floor(600/temperature.value);
                                molecularObjects.push(createdProduct);
                            })
                            if (j<i) {
                                molecularObjects.splice(i,1);
                                molecularObjects.splice(j,1);
                            }
                            if (i<j) {
                                molecularObjects.splice(j,1);
                                molecularObjects.splice(i,1);
                            }
                            reactionCounts[k]++;
                            reacted = true;
                            break;
                        }
                    }
                    if (reacted) {
                        break;
                    }
                }
            }
        }
        // console.log(reactionCounts);
    }
    render(false)
    setInterval(() => {if (playing){render(true)}},1000/60);
})








// var molecularObjects = [];
// var atom1 = new Atom([0,0],10,"red");
// var atom2 = new Atom([0,0],10,"blue");
// var CANVASWIDTH = 350;
// var CANVASHEIGHT = 200;
// for (let i = 0; i < 5; i++) {
//     molecularObjects.push(new MolecularObject([atom1],0,[Math.random()*(CANVASWIDTH-20)+10,Math.random()*(CANVASHEIGHT-20)+10],randCirc(10)));
//     molecularObjects.push(new MolecularObject([atom2],1,[Math.random()*(CANVASWIDTH-20)+10,Math.random()*(CANVASHEIGHT-20)+10],randCirc(10)));
// }

// var c = $$(".reactionCanvas")[0];
// var ctx = c.getContext("2d");
// function render() {
//     ctx.clearRect(0, 0, c.width, c.height);
//     for (let i = 0; i < molecularObjects.length; i++) {
//         object = molecularObjects[i]
//         object.components.forEach((component) => {
//             ctx.beginPath();
//             ctx.arc(object.position[0]+component.position[0], object.position[1]+component.position[1], component.radius, 0, 2 * Math.PI);
//             ctx.fillStyle = component.color;
//             ctx.fill();
//         })
//         object.position[0] += 1/4*$("#temperature").value/50*object.velocity[0];
//         object.position[1] += 1/4*$("#temperature").value/50*object.velocity[1];
//         if (object.position[0]>CANVASWIDTH-10) {
//             object.velocity[0] *= -1;
//         }
//         if (object.position[0]<10) {
//             object.velocity[0] *= -1;
//         }
//         if (object.position[1]>CANVASHEIGHT-10) {
//             object.velocity[1] *= -1;
//         }
//         if (object.position[1]<10) {
//             object.velocity[1] *= -1;
//         }
//         for (let j = 0; j < molecularObjects.length; j++) {
//             other = molecularObjects[j]
//             if (i == j) {
//                 continue;
//             }
//             if (sqrDistance(object.position,other.position)<300) {
//                 if ((object.id==0 && other.id == 1) || (object.id==1 && other.id == 0)) {
//                     console.log("HI")
//                     molecularObjects.push(objectWithAvg(object,other,[shiftAtom(atom1,[-5,0]),shiftAtom(atom2,[5,0])]))
//                     if (j<i) {
//                         molecularObjects.splice(i,1);
//                         molecularObjects.splice(j,1);
//                     }
//                     if (i<j) {
//                         molecularObjects.splice(j,1);
//                         molecularObjects.splice(i,1);
//                     }
//                     break;
//                 }
//             }
//         }
//     }
// }
// render()
// setInterval(() => {
//     render()
// }, 1000/60)
// var id1 = 0;
// var id2 = 1;
