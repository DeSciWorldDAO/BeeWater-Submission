import React, { useEffect, useState, useRef } from 'react'; import cytoscape from 'cytoscape'; const HaikuGraph = ({ apiUrl }) => {
    const [haikus, setHaikus] = useState([]); const cyRef = useRef(null); useEffect(() => {
        /*Fetch haikus and their connections */
        fetch(`${apiUrl}/haikus`).then(response => response.json()).then(data => {
            setHaikus(data);
            // Assuming data is in the format that Cytoscape.js expects 
            if (cyRef.current) {
                cyRef.current.elements().remove(); // Clear existing graph 
                cyRef.current.add(data); cyRef.current.layout({ name: 'preset' }).run();
            }
        });
    }, [apiUrl]); useEffect(() => {
        if (!cyRef.current) {
            // Initialize Cytoscape.js 
            cyRef.current = cytoscape({ container: document.getElementById('cy'), elements: haikus, style: [{ selector: 'node', style: { 'background-color': '#666', 'label': 'data(id)', } }, { selector: 'edge', style: { 'width': 3, 'line-color': '#ccc', 'target-arrow-color': '#ccc', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier', } }], layout: { name: 'grid', rows: 1 } });
        }
    }, [haikus]); return <div id="cy" style = {{ width: '600px', height: '600px' }
} />; };
export default HaikuGraph;
