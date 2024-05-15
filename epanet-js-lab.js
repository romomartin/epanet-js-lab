const { Project, Workspace, NodeProperty, LinkProperty, Option } = require("epanet-js");
var fs = require("fs");

const network = fs.readFileSync("model/emitters_lab.inp");

const ws = new Workspace();
const model = new Project(ws);

ws.writeFile("network.inp", network);

model.open("network.inp", "report.rpt", "out.bin");

const pipe1Index = model.getLinkIndex("pipe1");
const node1Index = model.getNodeIndex("node1");
const pipe2Index = model.getLinkIndex("pipe2");
const node2Index = model.getNodeIndex("node2");

const printReport = (cTime)=>{
  const node1pressure = model.getNodeValue(node1Index, NodeProperty.Pressure);
  const node2pressure = model.getNodeValue(node2Index, NodeProperty.Pressure);
  const node1demand = model.getNodeValue(node1Index, NodeProperty.Demand);
  const node2demand = model.getNodeValue(node2Index, NodeProperty.Demand);
  const node1emitter = model.getNodeValue(node1Index, NodeProperty.Emitter);
  const node2emitter = model.getNodeValue(node2Index, NodeProperty.Emitter);
  const pipe1flow = model.getLinkValue(pipe1Index, LinkProperty.Flow);
  const pipe2flow = model.getLinkValue(pipe2Index, LinkProperty.Flow);
  
  console.log(
    `Current Time: - ${cTime}, 
    Node 1 Pressure: ${node1pressure.toFixed(2)}\tDemand ${node1demand.toFixed(2)}\tEmitter ${node1emitter}
    Node 2 Pressure: ${node2pressure.toFixed(2)}\tDemand  ${node2demand.toFixed(2)}\tEmitter ${node2emitter}
    Pipe 1 Flow: ${pipe1flow.toFixed(2)}
    Pipe 2 Flow: ${pipe2flow.toFixed(2)}`
  );
}

//Setting an emitter exp. bigger than 1 breaks the simulation results
//from step 0 on.
model.setOption(Option.Emitexpon, 1.1)

model.openH();
model.initH(1);

let tStep = Infinity;
do {
  const cTime = model.runH();
  printReport(cTime);

  if(tStep >= 3){
    model.setNodeValue(node1Index,NodeProperty.Emitter, 0.2)
  }

  tStep = model.nextH();
} while (tStep > 0);

model.saveH();
model.closeH();


