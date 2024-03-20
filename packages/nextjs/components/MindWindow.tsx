
import "react-knowledge-graph/KnowledgeGraph/index.css";
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from 'react-dom';
import "~~/styles/dropup.css";
import "~~/styles/styles.css";
import "~~/styles/window.css";
import { useGlobalState } from "~~/services/store/store";
import { HaikuCanvas } from "~~/app/haiku";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";
import coseBilkent from 'cytoscape-cose-bilkent';
import cytoscapePopper from 'cytoscape-popper';
import tippy from 'tippy.js';
import { ComputePositionConfig } from '@floating-ui/dom';
import { KnowledgeGraph } from "~~/components/KnowledgeGraph";
import toast from "react-hot-toast";


declare module 'cytoscape-popper' {
    interface PopperOptions extends ComputePositionConfig {
    }
    interface PopperInstance {
        update(): void;
    }
}
type NodeProps = {
    id: string;
    name: string; // 节点名称
    type: string; // 节点类型
    hasMore: boolean; // 是否有子节点
    direction: "root" | "inside" | "outside";
};
type EdgeProps = {
    id: string; // 边id
    fromId: string;
    toId: string;
    description: string;
};
type explore = (id: React.Key) => Promise<{
    inside: Node.NodeProps[];
    outside: Node.NodeProps[];
    edge: Edge.EdgeProps[];
}>;


const MindWindow = () => {



    const [canvasIndex, setCanvasIndex] = useState(0);
    const { setMyCanvas, myCanvas, canvasDb } = useGlobalState();
    const windowRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLDivElement>(null); // Reference for the title bar
    const hc = new HaikuCanvas(myCanvas.owner, myCanvas.id)
    hc.canvas = myCanvas.canvas
    hc.nonce = myCanvas.nonce
    const update = hc.addCanvasHaikuNode



    const updateHandler = async () => {
        try {
            console.log(hc);
            await update();
            toast.success("Canvas Updated");
        } catch (error) {
            console.log(error)
        }
    }


    const baseUrl = "http://localhost:3000";
    const getNode = async (id: string, direction: "inside" | "outside") => {
        //const res = await fetch(`${baseUrl}/api/${direction}/${id}`);
        const data = { id: "node-1", name: "Node 1", type: "data", hasMore: true, direction: "inside" };
        return data;
    };

    const getEdge = async (id: string) => {
        const res = await fetch(`${baseUrl}/api/edge/${id}`);
        const data = await res.json();
        return data;
    };

    const explore = async (id: string, node: NodeProps) => {
        const results = Promise.all([
            getNode(id, "inside"),
            getNode(id, "outside"),
            getEdge(id),
        ]);
        const data = await results;
        return { inside: data[0], outside: data[1], edges: data[2] };
    };

    const [basicDistence, setBasicDistence] = useState<number>(80);

    useEffect(() => {
        const wwindow = windowRef.current;
        if (!wwindow) return;

        const dragrd = wwindow.querySelector<HTMLDivElement>(".drag-rd");
        const dragru = wwindow.querySelector<HTMLDivElement>(".drag-ru");
        const draglu = wwindow.querySelector<HTMLDivElement>(".drag-lu");
        const dragld = wwindow.querySelector<HTMLDivElement>(".drag-ld");

        const resizeMouseDown = (event: MouseEvent, corner: string) => {
            event.preventDefault();
            const startX = event.clientX;
            const startY = event.clientY;
            const startWidth = wwindow.offsetWidth;
            const startHeight = wwindow.offsetHeight;
            const startPosLeft = wwindow.offsetLeft;
            const startPosTop = wwindow.offsetTop;

            const onMouseMove = (event: MouseEvent) => {
                let newWidth = startWidth;
                let newHeight = startHeight;
                let newLeft = startPosLeft;
                let newTop = startPosTop;

                switch (corner) {
                    case "rd":
                        newWidth = startWidth + event.clientX - startX;
                        newHeight = startHeight + event.clientY - startY;
                        break;
                    case "ru":
                        newWidth = startWidth + event.clientX - startX;
                        newHeight = startHeight - (event.clientY - startY);
                        newTop = startPosTop + (event.clientY - startY);
                        break;
                    case "lu":
                        newWidth = startWidth - (event.clientX - startX);
                        newHeight = startHeight - (event.clientY - startY);
                        newLeft = startPosLeft + (event.clientX - startX);
                        newTop = startPosTop + (event.clientY - startY);
                        break;
                    case "ld":
                        newWidth = startWidth - (event.clientX - startX);
                        newHeight = startHeight + event.clientY - startY;
                        newLeft = startPosLeft + (event.clientX - startX);
                        break;
                }

                if (newWidth > 100) {
                    wwindow.style.width = newWidth + "px";
                    wwindow.style.left = newLeft + "px";
                }
                if (newHeight > 100) {
                    wwindow.style.height = newHeight + "px";
                    wwindow.style.top = newTop + "px";
                }
            };

            const onMouseUp = () => {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
            };

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        };

        dragrd?.addEventListener("mousedown", event => resizeMouseDown(event, "rd"));
        dragru?.addEventListener("mousedown", event => resizeMouseDown(event, "ru"));
        draglu?.addEventListener("mousedown", event => resizeMouseDown(event, "lu"));
        dragld?.addEventListener("mousedown", event => resizeMouseDown(event, "ld"));

        // Draggable functionality
        const titleBar = titleRef.current;
        let isDragging = false;
        let dragStartX = 0;
        let dragStartY = 0;

        const onTitleMouseDown = (event: MouseEvent) => {
            isDragging = true;
            dragStartX = event.clientX - wwindow.offsetLeft;
            dragStartY = event.clientY - wwindow.offsetTop;
            event.preventDefault(); // Prevent text selection
        };

        const onTitleMouseMove = (event: MouseEvent) => {
            if (!isDragging) return;
            wwindow.style.left = `${event.clientX - dragStartX}px`;
            wwindow.style.top = `${event.clientY - dragStartY}px`;
        };

        const onTitleMouseUp = () => {
            isDragging = false;
        };

        titleBar?.addEventListener("mousedown", onTitleMouseDown);
        document.addEventListener("mousemove", onTitleMouseMove);
        document.addEventListener("mouseup", onTitleMouseUp);

        return () => {
            dragrd?.removeEventListener("mousedown", event => resizeMouseDown(event, "rd"));
            dragru?.removeEventListener("mousedown", event => resizeMouseDown(event, "ru"));
            draglu?.removeEventListener("mousedown", event => resizeMouseDown(event, "lu"));
            dragld?.removeEventListener("mousedown", event => resizeMouseDown(event, "ld"));
            titleBar?.removeEventListener("mousedown", onTitleMouseDown);
            document.removeEventListener("mousemove", onTitleMouseMove);
            document.removeEventListener("mouseup", onTitleMouseUp);
        };
    }, []);

    const handleCanvas = () => {
        console.log("Canvas Index: ", canvasIndex, canvasDb);
        if (canvasIndex - 1 < 0) {
            setCanvasIndex(canvasDb.length - 1);
        } else {
            setCanvasIndex(canvasIndex - 1);
        }

        setMyCanvas(canvasDb[canvasIndex]);
    }




    return (

        <div id="desktop" className="bg desktop">
            <div ref={windowRef} id="window" className="window">
                <div ref={titleRef} className="title no-select" id="windowTitle">
                    <img className="img" src="/iexp.png" alt="" />
                    Enjoy Explorer
                </div>
                <div className="drag-rd"></div>
                <div className="drag-ru"></div>
                <div className="drag-lu"></div>
                <div className="drag-ld"></div>
                <div className="p-12 content overflow-y-auto">
                    <h1>MindWindow Explorer</h1>
                    Canvas: {myCanvas.title}<br />
                    Owner: {myCanvas.owner?.substring(0, 7)}<br />
                    Haiku: {myCanvas.canvas?.node[0].haikipu.haiku}

                    <div className="relative h-[500px] w-[500px] border-2">
                        <KnowledgeGraph
                            explore={explore}
                            basicDistence={basicDistence}
                            width={"100%"}
                            height={"99vh"}
                            position={{ x: 300, y: 300 }}
                            onClickAddon={(node: any) => {
                                toast.success("addon" + node.id);
                            }}
                            onClickInfo={(node: any) => {
                                toast.success("info" + node.id);
                            }}
                            style={{ background: "#fff", color: "#000" }}
                            node={{
                                id: "node-0",
                                type: "Node0",
                                hasMore: true,
                                direction: "root",
                                name: "First Node in the Pack",
                            }
                            }


                            onExploreEnd={() => {
                                toast.success("已经到尾节点了!");
                            }}
                            edgeConfig={{
                                hoveredColor: "#e27272",
                                stroke: "#DEDEDE",
                                strokeWidth: 1,
                            }}
                            typeConfig={{
                                根节点: {
                                    radius: 20,
                                    fill: "#747ba6",
                                    hoverStyle: {
                                        fill: "#3949a3",
                                    },
                                },
                                model: {
                                    radius: 15,
                                    fill: "#b4e5a2",
                                    typeSize: 8,
                                    nameSize: 8,
                                    hoverStyle: {
                                        fill: "#6be73e",
                                    },
                                },
                                data: {
                                    radius: 15,
                                    fill: "#ea52ea",
                                    typeSize: 8,
                                    nameSize: 8,
                                    hoverStyle: {
                                        fill: "#e5a2e5",
                                    },
                                },
                                test: {
                                    radius: 13,
                                    fill: "#89c4fb",
                                    typeSize: 8,
                                    nameSize: 8,
                                    hoverStyle: {
                                        fill: "#2f8fe8",
                                    },
                                },
                            }}
                        />
                    </div>




                    <button onClick={handleCanvas} className="btn btn-primary">Change Canvas</button>
                    <button onClick={updateHandler} className="btn btn-primary">Update Canvas</button>
                </div>
            </div>
        </div >

    );
}


export default MindWindow;
