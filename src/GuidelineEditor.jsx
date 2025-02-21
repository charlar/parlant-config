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
    const [guidelineDetails, setGuidelineDetails] = useState({ condition: '', action: '', connections: [], services: [] });
    const [selectedGuidelineId, setSelectedGuidelineId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

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
            readGuideline(selectedAgentId, selectedGuidelineId);
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
                <List>
                    {guidelines.map((guideline) => (
                        <ListItem button key={guideline.id} onClick={() => selectGuideline(guideline)}>
                            <ListItemText primary={guideline.condition} secondary={guideline.action} />
                        </ListItem>
                    ))}
                </List>
            </div>

            <div className="fullWidth p-3">
                <h4>Guideline Details</h4>
                <Divider className="mb-10" />

                <TextField
                    multiline
                    minRows={4}
                    fullWidth
                    label="Condition"
                    name="condition"
                    value={guidelineDetails.condition}
                    disabled
                    sx={{ mt: 1 }}
                />

                <TextField
                    multiline
                    minRows={10}
                    fullWidth
                    label="Action"
                    name="action"
                    value={guidelineDetails.action}
                    disabled
                    sx={{ mt: 1 }}
                />

                {errorMessage && (
                    <Alert severity="error" className="mb-3">
                        {errorMessage}
                    </Alert>
                )}

                {selectedGuidelineId && (
                    <Button variant="outlined" color="secondary" onClick={() => client.deleteGuideline(selectedAgentId, selectedGuidelineId)}>
                        Delete Guideline
                    </Button>
                )}

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
