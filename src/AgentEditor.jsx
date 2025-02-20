// Copyright 2025 Charles Larson
//
//  Licensed under the Apache License, Version 2.0(the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.

import React, { useEffect, useState } from 'react';
import { Button, TextField, List, ListItem, ListItemText } from "@mui/material";
import './index.css'; // If you're using Tailwind or other styles

export default function AgentEditor({ serverAddress }) {
    const [agents, setAgents] = useState([]);
    const [selectedAgentId, setSelectedAgentId] = useState(null);
    const [agentDetails, setAgentDetails] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            const response = await fetch(`${serverAddress}/agents`);
            const agentsList = await response.json();
            setAgents(agentsList);
        } catch (error) {
            console.error('Failed to fetch agents:', error);
        }
    };

    const selectAgent = async (id) => {
        try {
            const response = await fetch(`${serverAddress}/agents/${id}`);
            const agent = await response.json();
            setSelectedAgentId(id);
            agent.description = agent.description ?? '';
            setAgentDetails({ name: agent.name, description: agent.description });
        } catch (error) {
            console.error('Failed to retrieve agent:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAgentDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
    };

    const saveAgent = async () => {
        try {
            if (selectedAgentId) {
                await fetch(`${serverAddress}/agents/${selectedAgentId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(agentDetails),
                });
            } else {
                const response = await fetch(`${serverAddress}/agents`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(agentDetails),
                });
                const newAgent = await response.json();
                setAgents([...agents, newAgent]);
                setSelectedAgentId(newAgent.id);
            }
            fetchAgents();
        } catch (error) {
            console.error('Failed to save agent:', error);
        }
    };

    const addNewAgent = () => {
        setSelectedAgentId(null);
        setAgentDetails({ name: '', description: '' });
    };

    const deleteAgent = async () => {
        if (selectedAgentId) {
            try {
                await fetch(`${serverAddress}/agents/${selectedAgentId}`, {
                    method: 'DELETE',
                });
                setSelectedAgentId(null);
                setAgentDetails({ name: '', description: '' });
                fetchAgents();
            } catch (error) {
                console.error('Failed to delete agent:', error);
            }
        }
    };

    return (
        <div className="flex flex-row h-screen">
            <div className="w-1/4 border-r overflow-y-auto">
                <div className="p-4">
                    <Button variant="contained" onClick={addNewAgent} className="w-full mb-4">
                        Add New Agent
                    </Button>
                    <List>
                        {agents.map((agent) => (
                            <ListItem button="true" key={agent.id} onClick={() => selectAgent(agent.id)}>
                                <ListItemText primary={agent.name} />
                            </ListItem>
                        ))}
                    </List>
                </div>
            </div>
            <div className="w-3/4 p-4">
                <div className="mt-4">
                    <TextField
                        fullWidth
                        label="Name"
                        name="name"
                        value={agentDetails.name}
                        onChange={handleInputChange}
                        sx={{ mt: 1 }}
                    />
                    <TextField
                        fullWidth
                        multiline
                        rows={10}
                        label="Description"
                        name="description"
                        value={agentDetails.description}
                        onChange={handleInputChange}
                        sx={{ mt: 1 }}
                    />
                    <div className="flex space-x-4">
                        <Button variant="contained" color="primary" onClick={saveAgent}>
                            Save
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={deleteAgent} disabled={!selectedAgentId}>
                            Delete
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
