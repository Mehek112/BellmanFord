let graph = [];
let V = 0;
let positions = [];

function addEdge() 
{
    let src = parseInt(document.getElementById("src").value);
    let dest = parseInt(document.getElementById("dest").value);
    let weight = parseInt(document.getElementById("weight").value);

    graph.push({ src, dest, weight });
    V = Math.max(V, src + 1, dest + 1);
    drawGraph();
}

function resetGraph() 
{
    graph = [];
    V = 0;
    positions = [];
    let ctx = document.getElementById("graphCanvas").getContext("2d");
    ctx.clearRect(0, 0, 600, 450);
    document.getElementById("distanceTable").innerHTML = "";
    document.getElementById("algorithmLog").innerHTML = "";

    document.getElementById("src").value = "";
    document.getElementById("dest").value = "";
    document.getElementById("weight").value = "";
    document.getElementById("sourceVertex").value = "";
}
function showTable(dist) 
{
    let table = "<tr><th>Vertex</th><th>Distance</th></tr>";
    dist.forEach((d, i) => {
        table += `<tr><td>${i}</td><td>${d === Infinity ? "∞" : d}</td></tr>`;});
    document.getElementById("distanceTable").innerHTML = table;
}
async function runBellmanFord() 
{
    let src = parseInt(document.getElementById("sourceVertex").value);
    let dist = Array(V).fill(Infinity);
    dist[src] = 0;

    let log = "<tr><th>Step</th><th>Edge (u → v)</th><th>Distances</th></tr>";
    let k = 1;

    for (let i = 0; i < V - 1; i++) 
    {
        for (let { src: u, dest: v, weight: w } of graph) 
        {
            if (dist[u] !== Infinity && dist[u] + w < dist[v]) 
            {
                dist[v] = dist[u] + w;
            }

            drawGraph(u, v, dist); //drawgraph using the edges
            await new Promise(res => setTimeout(res, 500));

            let snapshot = dist.map(d => (d === Infinity ? "∞" : d)).join(", ");
            log += `<tr><td>${k++}</td><td>${u} → ${v}</td><td>${snapshot}</td></tr>`;
            document.getElementById("algorithmLog").innerHTML = log;
        }
    }

    for (let { src: u, dest: v, weight: w } of graph) 
    {
        if (dist[u] !== Infinity && dist[u] + w < dist[v])
        {
            alert("Graph contains a negative weight cycle");
            return;
        }
    }

    showTable(dist);
    document.getElementById("algorithmLog").innerHTML += "<tr><td colspan='3'><b>Algorithm completed successfully.</b></td></tr>";
}

function drawGraph(highlightSrc = -1, highlightDest = -1, dist = []) 
{
    let canvas = document.getElementById("graphCanvas");
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    positions = [];

    for (let i = 0; i < V; i++) 
    {
        let angle = (2 * Math.PI * i) / V;
        let x = 250 + 150 * Math.cos(angle);
        let y = 200 + 150 * Math.sin(angle);
        positions.push({ x, y });

        // node circle
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = (i === highlightSrc || i === highlightDest) ? "yellow" : "white";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "dimgray";
        ctx.stroke();

        // node text
        ctx.fillStyle = "black";
        ctx.font = "bold 16px Arial";
        ctx.fillText(i, x - 5, y + 5);

        // distance at every vertex in red
        if (dist[i] !== undefined) 
        {
            ctx.font = "16px Arial";
            ctx.fillStyle = "red";
            ctx.fillText(dist[i] === Infinity ? "∞" : dist[i], x - 15, y - 25);
        }
    }

    for (let edge of graph) 
    {
        let from = positions[edge.src];
        let to = positions[edge.dest];
        let dx = to.x - from.x;
        let dy = to.y - from.y;
        let len = Math.sqrt(dx * dx + dy * dy);
        let ux = dx / len;
        let uy = dy / len;

        // bidirectional edges offset
        let isBidirectional = graph.some(e => e.src === edge.dest && e.dest === edge.src);
        let offset = isBidirectional ? 10 : 0;
        let nx = -uy, ny = ux;

        let startX = from.x + ux * 20 + nx * offset;
        let startY = from.y + uy * 20 + ny * offset;
        let endX = to.x - ux * 20 + nx * offset;
        let endY = to.y - uy * 20 + ny * offset;

        // Draw edge
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = (edge.src === highlightSrc && edge.dest === highlightDest) ? "red" : "black";
        ctx.lineWidth = (edge.src === highlightSrc && edge.dest === highlightDest) ? 3 : 1.5;
        ctx.stroke();

        // Draw arrowhead
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - ux * 10 - uy * 5, endY - uy * 10 + ux * 5);
        ctx.lineTo(endX - ux * 10 + uy * 5, endY - uy * 10 - ux * 5);
        ctx.closePath();
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();

        // Draw weight 40% of edge-no overlap
        let wx = startX + (endX - startX) * 0.4;
        let wy = startY + (endY - startY) * 0.4;
        ctx.fillStyle = "black";
        ctx.font = "14px Arial";
        ctx.fillText(edge.weight, wx + 5, wy - 5);
    }
}


