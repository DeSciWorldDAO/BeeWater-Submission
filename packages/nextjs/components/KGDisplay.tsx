import { ComputePositionConfig } from '@floating-ui/dom';
import { KnowledgeGraph } from "~~/components/KnowledgeGraph";
import { useState } from "react";
import { toast } from "react-hot-toast";
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
const KGDisplay = () => {

    const baseUrl = "http://localhost:3000";
    const getNode = async (id: string, direction: "inside" | "outside") => {
        //const res = await fetch(`${baseUrl}/api/${direction}/${id}`);
        const data = [{ id: "node-1", name: "Node 1", type: "data", hasMore: true, direction: "outside" } as NodeProps, { id: "node-2", name: "Node 1", type: "data", hasMore: true, direction: "inside" } as NodeProps];
        return data;
    };

    const getEdge = async (id: string) => {
        //const res = await fetch(`${baseUrl}/api/edge/${id}`);
        const data = [{ id: "node-2", fromId: "node-0", toId: "node-1" } as EdgeProps, { id: "node-2", fromId: "node-0", toId: "node-2" } as EdgeProps]
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

    return (
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
    )
}

export default KGDisplay;
