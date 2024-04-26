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
    }
    components;
    id;
    position;
    velocity;
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
$$(".particleSimulator").forEach((sim) => {
    console.log(getAllComments(sim)[0].replace(/\s/g,''));
    let parameters = JSON.parse(getAllComments(sim)[0].replace(/\s/g,''));
    let molecularObjects = [];
    let atoms = [];
    parameters.atoms.forEach((atom) => {
        atoms.push(new Atom([0,0],atom.radius,atom.color));
    });
    let i = 0;
    let CANVASWIDTH = parameters.canvas.width;
    let CANVASHEIGHT = parameters.canvas.height;
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
    let c = document.createElement("canvas");
    c.setAttribute("width",CANVASWIDTH);
    c.setAttribute("height",CANVASHEIGHT);
    let playing = false;
    let playButton = document.createElement("button");
    playButton.innerText = "Play";
    playButton.addEventListener("click",() => {
        if (playButton.innerText == "Play") {
            playButton.innerText = "Pause";
        }
        if (playButton.innerText == "Pause") {
            playButton.innerText = "Play";
        }
        playing = !playing;
    })
    sim.appendChild(playButton);
    let temperature = document.createElement("input");
    temperature.setAttribute("type","range");
    sim.appendChild(temperature)
    sim.appendChild(c);
    temperature.value=10;
    function reactantWithAvgRand(obj1,obj2,reactant,posRadius,velRadius) {
        let components = [];
        parameters.particles[reactant].components.forEach((component) => {
            components.push(shiftAtom(atoms[component.id],component.offset))
        })
        let randPos = randCirc(posRadius);
        let randVel = randCirc(velRadius);
        return new MolecularObject(components,reactant,[(obj1.position[0]+obj2.position[0])/2+randPos[0],(obj1.position[1]+obj2.position[1])/2+randPos[1]],[(obj1.velocity[0]+obj2.velocity[0])/2+randVel[0],(obj1.velocity[1]+obj2.velocity[1])/2+randVel[1]])
    }
    // var c = sim
    let ctx = c.getContext("2d");
    function render() {
        ctx.clearRect(0, 0, c.width, c.height);
        for (let i = 0; i < molecularObjects.length; i++) {
            object = molecularObjects[i]
            object.components.forEach((component) => {
                ctx.beginPath();
                ctx.arc(object.position[0]+component.position[0], object.position[1]+component.position[1], component.radius, 0, 2 * Math.PI);
                ctx.fillStyle = component.color;
                ctx.fill();
            })
            object.position[0] += 1/10*temperature.value/10*object.velocity[0];
            object.position[1] += 1/10*temperature.value/10*object.velocity[1];
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
                if (sqrDistance(object.position,other.position)<300) {
                    let reacted = false;
                    for (let k = 0; k < parameters.reactions.length; k++) {
                        let reaction = parameters.reactions[k];
                        if ((object.id==reaction.reagents[0] && other.id == reaction.reagents[1]) || (object.id==reaction.reagents[0] && other.id == reaction.reagents[1])) {
                            console.log("HI")
                            reaction.reactants.forEach((reactant) => {
                                molecularObjects.push(reactantWithAvgRand(object,other,reactant,10,5))
                            })
                            if (j<i) {
                                molecularObjects.splice(i,1);
                                molecularObjects.splice(j,1);
                            }
                            if (i<j) {
                                molecularObjects.splice(j,1);
                                molecularObjects.splice(i,1);
                            }
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
    }
    render()
    setInterval(() => {if (playing){render()}},1000/100);
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
