onload = function () {
    let curr_data,V,src,dst;

    const container = document.getElementById('mynetwork');
    const container2 = document.getElementById('mynetwork2');
    const genNew = document.getElementById('generate-graph');
    const solve = document.getElementById('solve');
    const temptext = document.getElementById('temptext');
    const temptext2 = document.getElementById('temptext2');
    const cities = ['Delhi', 'Mumbai', 'Kolkata', 'Goa', 'Lucknow', 'Kota', 'Hyderabad', 'Bangalore', 'Chennai', 'Surat','Pune','Vadodara'];

    const options = {
        edges: {
            labelHighlightBold: true,
            font: {
                size: 20
            },
           width: 2,
        },
        nodes: {
            font: '17px arial red',
            scaling: {
                label: true
            },
            shape:'image',
            image: "cityscape.png",
        }
       
    };
   
    const network = new vis.Network(container);

    network.setOptions(options);
 
    const network2 = new vis.Network(container2);
    network2.setOptions(options);
    let nodes=[];
    function createData(){
        V = Math.floor(Math.random() * 10) + 3; 
        nodes=[];
        for(let i=1;i<=V;i++){
            nodes.push({id:i, label: cities[i-1]})
        }
     
        nodes = new vis.DataSet(nodes);

   
        let edges = [];
        for(let i=2;i<=V;i++){
            let neigh = i - Math.floor(Math.random()*Math.min(i-1,3)+1); 
            edges.push({type: 0, from: i, to: neigh, color: 'orange',label: String(Math.floor(Math.random()*80)+31)});
        }

        for(let i=1;i<=V/2;){

            let c1 = Math.floor(Math.random()*V)+1;
            let c2 = Math.floor(Math.random()*V)+1;
            if(c1!==c2){
                if(c1<c2){
                    let tmp = c1;
                    c1 = c2;
                    c2 = tmp;
                }
               
                let hasroute = 0;
                for(let j=0;j<edges.length;j++){
                    if(edges[j]['from']===c1 && edges[j]['to']===c2) {
                        if(edges[j]['type']===0)
                            hasroute= 1;
                        else
                            hasroute= 2;
                    }
                }

                if(hasroute <= 1) {
                    if (hasroute === 0 && i < V / 4) {
                         edges.push({
                            type: 0,
                            from: c1,
                            to: c2,
                            color: 'orange',
                            label: String(Math.floor(Math.random() * 70) + 31)
                        });
                    } else {
                        edges.push({
                            type: 1,
                            from: c1,
                            to: c2,
                            color: 'green',
                            label: String(Math.floor(Math.random() * 50) + 1)
                        });
                    }
                    i++;
                }
            }
        }
        
       src=1;
       dst=3;
       
        curr_data = {
            nodes: nodes,
            edges: edges
        };
    }

    genNew.onclick = function () {
        
        createData();
        network.setData(curr_data);
        document.getElementById('source').value="";
        document.getElementById('destination').value="";
        temptext.style.display = "inline";
        temptext2.style.display = "inline";
        container2.style.display = "none";
       
    };
    
    

    document.getElementById('enter').onclick=function () { 
       
     
        let input1=document.getElementById('source').value;
    
        let input2=document.getElementById('destination').value;
       let n=nodes.length;
     

       for(let i=0;i<n;i++){
             
             if(cities[i] == input1){
                 src=i+1;
             }
               
             if(cities[i] == input2){
                dst=i+1;
            }


        }
        temptext.style.display  = "none";
        temptext2.style.display  = "none";
        container2.style.display = "inline";
        network2.setData(solveData());
      

    }
 

    function djikstra(graph, sz, src) {
        let vis = Array(sz).fill(0);
        let dist = [];
        for(let i=1;i<=sz;i++)
            dist.push([10000,-1]);
        dist[src][0] = 0;

        for(let i=0;i<sz-1;i++){
            let mn = -1;
            for(let j=0;j<sz;j++){
                if(vis[j]===0){
                    if(mn===-1 || dist[j][0]<dist[mn][0])
                        mn = j;
                }
            }

            vis[mn] = 1;
            for(let j in graph[mn]){
                let edge = graph[mn][j];
                if(vis[edge[0]]===0 && dist[edge[0]][0]>dist[mn][0]+edge[1]){
                    dist[edge[0]][0] = dist[mn][0]+edge[1];
                    dist[edge[0]][1] = mn;
                }
            }
        }

        return dist;
    }

    function createGraph(data){
        let graph = [];
        for(let i=1;i<=V;i++){
            graph.push([]);
        }

        for(let i=0;i<data['edges'].length;i++) {
            let edge = data['edges'][i];
            if(edge['type']===1)
                continue;
            graph[edge['to']-1].push([edge['from']-1,parseInt(edge['label'])]);
            graph[edge['from']-1].push([edge['to']-1,parseInt(edge['label'])]);
        }
        return graph;
    }

    function shouldTakePlane(edges, dist1, dist2, mn_dist) {
        let plane = 0;
        let p1=-1, p2=-1;
        for(let pos in edges){
            let edge = edges[pos];
            if(edge['type']===1){
                let to = edge['to']-1;
                let from = edge['from']-1;
                let wght = parseInt(edge['label']);
                if(dist1[to][0]+wght+dist2[from][0] < mn_dist){
                    plane = wght;
                    p1 = to;
                    p2 = from;
                    mn_dist = dist1[to][0]+wght+dist2[from][0];
                }
                if(dist2[to][0]+wght+dist1[from][0] < mn_dist){
                    plane = wght;
                    p2 = to;
                    p1 = from;
                    mn_dist = dist2[to][0]+wght+dist1[from][0];
                }
            }
        }
        return {plane, p1, p2};
    }

    function solveData() {

        const data = curr_data;

        const graph = createGraph(data);

        let dist1 = djikstra(graph,V,src-1);
        let dist2 = djikstra(graph,V,dst-1);

        let mn_dist = dist1[dst-1][0];

       
        let {plane, p1, p2} = shouldTakePlane(data['edges'], dist1, dist2, mn_dist);

        let new_edges = [];
        if(plane!==0){
            new_edges.push({arrows: { to: { enabled: true}}, from: p1+1, to: p2+1, color: 'green',label: String(plane)});
           
            new_edges.push(...pushEdges(dist1, p1, false));
            new_edges.push(...pushEdges(dist2, p2, true));
        } else{
            new_edges.push(...pushEdges(dist1, dst-1, false));
        }
        const ans_data = {
            nodes: data['nodes'],
            edges: new_edges
        };
        return ans_data;
    }

    function pushEdges(dist, curr, reverse) {
        let tmp_edges = [];
        while(dist[curr][0]!==0){
            let fm = dist[curr][1];
            if(reverse)
                tmp_edges.push({arrows: { to: { enabled: true}},from: curr+1, to: fm+1, color: 'orange', label: String(dist[curr][0] - dist[fm][0])});
            else
                tmp_edges.push({arrows: { to: { enabled: true}},from: fm+1, to: curr+1, color: 'orange', label: String(dist[curr][0] - dist[fm][0])});
            curr = fm;
        }
        return tmp_edges;
    }

    genNew.click();
};
