import { useAccount } from 'wagmi';
import React, { useState } from 'react';
import type { Haikipu } from '~~/types/dbSchema';
import { useSigner } from '~~/utils/wagmi-utils';
import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import toast from 'react-hot-toast';
const HaikuInput = () => {

    interface ISelectProps {
        options: string[];
        label: string;
        onSelect: (value: string) => void;
    }

    const options = ["R&D", "Treasury", "Comms", "DevWork"];

    const selection: ISelectProps = {
        options: options,
        label: "Department",
        onSelect: (value: string) => { }
    }

    const HaikuForm = () => {
        const SelectComponent: React.FC<ISelectProps> = ({ options, label, onSelect }) => {

            const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
                const value = event.target.value;
                setSelectedOption(value);
                onSelect(value);
            };

            return (
                <div className="mb-4">
                    <label htmlFor={selectedOption} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <select
                        id={label}
                        name={label}
                        value={selectedOption}
                        onChange={handleChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {options.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
            );
        };

        const [selectedOption, setSelectedOption] = useState(options[0]);

        const [contextSummary, setContextSummary] = useState('');
        const [haiku, setHaiku] = useState('');
        const [explainer, setExplainer] = useState('');
        const [title, setTitle] = useState('');
        const { address } = useAccount();

        const handleSubmit = async (event: any) => {
            event.preventDefault();
            const uid = await Attest(title);
            if (!uid) return;
            const requestObject: Haikipu = {
                _id: uid,
                address: address || '',
                title,
                option: selectedOption,
                contextSummary,
                haiku,
                explainer
            };
            const response = await fetch("/api/newHaiku", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestObject),
            });
            // Here you would typically send the requestObject to a server or API
            const data = await response.json();

            console.log(requestObject, data);
            // For demonstration, we'll just display the haiku and explainer
            setHaiku(data.haiku);
            setExplainer(data.explainer);
        };

        const signer = useSigner();

        const Attest = async (hackName: string) => {

            const easContractAddress = "0xbD75f629A22Dc1ceD33dDA0b68c546A1c035c458";
            const schemaUID = "0x3b1be860b499c1c49462c79befd38034914a97ff2e9e1648529106d9b271f65e";
            "0x8d915de0951fc02b7f25f1744f77737e017ffb132057b5debd0c9ec7df2cc343";
            const eas = new EAS(easContractAddress);
            // Signer must be an ethers-like signer.

            if (!signer) return;
            eas.connect(signer);
            // Initialize SchemaEncoder with the schema string
            const offchain = await eas.getOffchain();
            const schemaEncoder = new SchemaEncoder("string hackName");
            const encodedData = schemaEncoder.encodeData([
                { name: "hackName", value: hackName, type: "string" }
            ]);
            const offchainAttestation = await offchain.signOffchainAttestation({
                recipient: address || "0x",
                // Unix timestamp of when attestation expires. (0 for no expiration)
                expirationTime: BigInt(0),
                // Unix timestamp of current time
                time: BigInt(Date.now()),
                revocable: true, // Be aware that if your schema is not revocable, this MUST be false
                schema: schemaUID,
                refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
                data: encodedData,
            }, signer);

            toast.success("Attesting Hack!");
            const uid = offchainAttestation.uid;

            console.log(uid);
            return uid;
        }

        return (
            <>
                <div className="mb-4">
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <SelectComponent {...selection} />
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <input type="text" id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter Title" className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        <div className="mb-6">
                            <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">Enter Context Summary</label>
                            <textarea
                                id="summary"
                                name="summary"
                                rows={3}
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter Context Summary..."
                                value={contextSummary}
                                onChange={(e) => setContextSummary(e.target.value)}
                            ></textarea>
                        </div>
                        <label htmlFor="haiku" className="block text-sm font-medium text-gray-700 mb-1">Haiku</label>
                        <textarea
                            id="haiku"
                            name="haiku"
                            rows={3}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Haiku..."
                            value={haiku}
                            readOnly
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="explainer" className="block text-sm font-medium text-gray-700 mb-1">Haiku Explainer</label>
                        <textarea
                            id="explainer"
                            name="explainer"
                            rows={3}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter Haiku Explainer..."
                            value={explainer}
                            readOnly
                        ></textarea>
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50">Submit</button>
                    </div>
                </form>
            </>
        );
    }

    return (
        <div className="ml-2 mt-6 text-gray-800">
            <div className="p-4 container mx-auto  min-w-[450px] w-max">
                <div className="max-w-2xl mx-auto bg-gray-100 p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-xl font-semibold">Haiku Encoder</h1>
                        <span className="text-sm font-medium text-gray-600">Manual Upload</span>
                    </div>

                    <HaikuForm />
                </div>
            </div>
        </div>)
}
export default HaikuInput;
