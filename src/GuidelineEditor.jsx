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
import { Button, TextField, List, ListItem, ListItemText, Divider, Alert, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import ParlantClient from './ParlantClient';
import ServiceList from './GuidelineServices';

const GuidelineEditor = ({ client }) => {
    const [agents, setAgents] = useState([]);
    const [selectedAgentId, setSelectedAgentId] = useState(null);
    const [guidelines, setGuidelines] = useState([]);
    const [newGuideline, setNewGuideline] = useState({ condition: '', action: '', connections: [], services: [] });
    const [guidelineDetails, setGuidelineDetails] = useState({ condition: '', action: '', connections: [], services: [] });
    const [selectedGuidelineId, setSelectedGuidelineId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [cutGuideline, setCurGuideline] = useState(null);

    useEffect(() => {
        if (document.visibilityState === 'visible') {
            fetchAgents();
        }
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            fetchAgents();
        }
    };

    useEffect(() => {
        if (selectedAgentId) {
            fetchGuidelines(selectedAgentId);
            setGuidelineDetails({ condition: '', action: '', connections: [], services: [] });
            setSelectedGuidelineId(null);
        } else {
            setGuidelines([]);
        }
    }, [selectedAgentId]);

    useEffect(() => {
        if (selectedGuidelineId) {
            readGuideline(selectedAgentId, selectedGuidelineId)

        } else {
            setGuidelineDetails({ condition: '', action: '', connections: [], services: [] });
        }
    }, [selectedGuidelineId]);


    const fetchAgents = async () => {
        try {
            const agentsList = await client.fetchAgents();
            setAgents(agentsList);
        } catch (error) {
            console.error('Failed to fetch agents:', error);
        }
    };

    const fetchGuidelines = async (agentId) => {
        try {
            const guidelinesList = await client.fetchGuidelines(agentId);
            setGuidelines(guidelinesList);
        } catch (error) {
            console.error('Failed to fetch guidelines:', error);
        }
    };

    const readGuideline = async (agentId, guidelineId) => {
        try {
            const gd = await client.readGuideline(agentId, guidelineId);
            console.log(gd)

            setGuidelineDetails({
                condition: gd.guideline.condition,
                action: gd.guideline.action,
                connections: gd.connections || [],
                services: gd.tool_associations || []
            });

        } catch (error) {
            console.error('Failed to fetch guidelines:', error);
        }
    };


    const selectGuideline = (guideline) => {
        setSelectedGuidelineId(guideline.id);
        setErrorMessage('');
    };

    console.log("guideline: ", guidelineDetails);
    return (
        <div className="d-flex vh-100">
            <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="agent-select-label">Select Agent</InputLabel>
                <Select
                    labelId="agent-select-label"
                    value={selectedAgentId || ''}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                >
                    {agents.map(agent => (
                        <MenuItem key={agent.id} value={agent.id}>
                            {agent.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <div className="fullWidth border-end overflow-auto p-3">
                <Button variant="primary" onClick={() => {
                    setSelectedGuidelineId(null);
                    setGuidelineDetails({ condition: '', action: '', connections: [], services: [] });
                    setErrorMessage('');
                }} className="w-100 mb-3">
                    Add New Guideline
                </Button>
                <List>
                    {guidelines.map((guideline) => (
                        <ListItem button key={guideline.id} onClick={() => selectGuideline(guideline)}>
                            <ListItemText primary={guideline.condition} secondary={guideline.action} />
                        </ListItem>
                    ))}
                </List>
            </div>

            <div className="fullWidth p-3">
                <h4>{selectedGuidelineId ? 'Edit Guideline' : 'Add New Guideline'}</h4>
                <Divider className="mb-10" />

                <TextField
                    fullWidth
                    label="Condition"
                    name="condition"
                    value={selectedGuidelineId ? guidelineDetails.condition : newGuideline.condition}
                    onChange={(e) => {
                        const { name, value } = e.target;
                        setGuidelineDetails((prev) => ({ ...prev, [name]: value }));
                    }}
                    sx={{ mt: 1 }}
                />

                <TextField
                    fullWidth
                    label="Action"
                    name="action"
                    value={selectedGuidelineId ? guidelineDetails.action : newGuideline.action}
                    onChange={(e) => {
                        const { name, value } = e.target;
                        setGuidelineDetails((prev) => ({ ...prev, [name]: value }));
                    }}
                    sx={{ mt: 1 }}
                />

                {errorMessage && (
                    <Alert severity="error" className="mb-3">
                        {errorMessage}
                    </Alert>
                )}

                <div className="d-flex gap-3">
                    {selectedGuidelineId ? (
                        <>
                            <Button variant="primary" onClick={() => client.updateGuideline(selectedAgentId, selectedGuidelineId, guidelineDetails)}>
                                Update Guideline
                            </Button>
                            <Button variant="outlined" color="secondary" onClick={() => client.deleteGuideline(selectedAgentId, selectedGuidelineId)}>
                                Delete Guideline
                            </Button>
                        </>
                    ) : (
                        <Button variant="primary" onClick={() => client.addGuideline(selectedAgentId, [newGuideline])}>
                            Add Guideline
                        </Button>
                    )}
                </div>

                <ServiceList
                    client={client}
                    toolAssociations={guidelineDetails.services}
                    selectedAgentId={selectedAgentId}
                    selectedGuidelineId={selectedGuidelineId}
                    updateGuideline={setGuidelineDetails}
                />
            </div>
        </div>
    );
};

export default GuidelineEditor;
