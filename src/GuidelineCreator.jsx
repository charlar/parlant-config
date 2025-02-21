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
import {
    Button, TextField, List, ListItem, ListItemText, Divider,
    Alert, Select, MenuItem, FormControl, InputLabel, LinearProgress
} from "@mui/material";
import ParlantClient from './ParlantClient';

const GuidelineCreator = ({ client }) => {
    const [agents, setAgents] = useState([]);
    const [selectedAgentId, setSelectedAgentId] = useState(null);
    const [newGuideline, setNewGuideline] = useState({ condition: '', action: '' });
    const [evaluation, setEvaluation] = useState(null);
    const [evaluationStatus, setEvaluationStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            const agentsList = await client.fetchAgents();
            setAgents(agentsList);
        } catch (error) {
            console.error('Failed to fetch agents:', error);
        }
    };

    const evaluateGuideline = async () => {
        if (!selectedAgentId) {
            setErrorMessage('Please select an agent before evaluating.');
            return;
        }
        try {
            const evalResponse = await client.createEvaluation(selectedAgentId, newGuideline.condition, newGuideline.action);
            setEvaluation(evalResponse);
            setEvaluationStatus('pending');
            setProgress(evalResponse.progress);
            pollEvaluation(evalResponse.id);
        } catch (error) {
            console.error('Failed to evaluate guideline:', error);
            setErrorMessage('Failed to evaluate guideline.');
        }
    };

    const pollEvaluation = async (evaluationId) => {
        let status = 'pending';
        while (status === 'pending' || status === 'running') {
            try {
                const evalResponse = await client.readEvaluation(evaluationId, { waitForCompletion: 0 });
                console.log(evalResponse)
                setEvaluation(evalResponse);
                setEvaluationStatus(evalResponse.status);
                setProgress(evalResponse.progress);
                if (evalResponse.status === 'completed' || evalResponse.status === 'failed') break;
            } catch (error) {
                console.error('Failed to read evaluation:', error);
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        setProgress(100);
    };

    const commitGuideline = async () => {
        try {
            await client.addGuideline(selectedAgentId, evaluation.invoices);
            setEvaluation(null);
            setEvaluationStatus(null);
        } catch (error) {
            console.error('Failed to commit guideline:', error);
            setErrorMessage('Failed to commit guideline.');
        }
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

            <TextField
                multiline
                minRows={4}
                fullWidth
                label="Condition"
                name="condition"
                value={newGuideline.condition}
                onChange={(e) => setNewGuideline(prev => ({ ...prev, condition: e.target.value }))}
                sx={{ mt: 1 }}
            />
            <TextField
                multiline
                minRows={10}
                fullWidth
                label="Action"
                name="action"
                value={newGuideline.action}
                onChange={(e) => setNewGuideline(prev => ({ ...prev, action: e.target.value }))}
                sx={{ mt: 1 }}
            />
            {errorMessage && (
                <Alert severity="error" className="mb-3">
                    {errorMessage}
                </Alert>
            )}
            <Button variant="contained" color="primary" onClick={evaluateGuideline} sx={{ mt: 2 }}>
                Evaluate
            </Button>
            {evaluation && (
                <div className="mt-4">
                    <div className="mt-2">
                        <LinearProgress variant="determinate" value={progress} />
                    </div>
                    <h5>Evaluation Status: {evaluation.status}</h5>
                    {evaluation.status === 'completed' && evaluation.invoices[0].data.guideline && (
                        <div>
                            {evaluation.invoices[0].data.guideline.coherence_checks && (
                                <div>
                                    <h6>Coherence Checks</h6>
                                    <List>
                                        {evaluation.invoices[0].data.guideline.coherence_checks.map((check, index) => (
                                            <ListItem key={index}>
                                                <ListItemText primary={check.issue} secondary={check.severity} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </div>
                            )}
                            {evaluation.invoices[0].data.guideline.connection_propositions && (
                                <div>
                                    <h6>Connection Propositions</h6>
                                    <List>
                                        {evaluation.invoices[0].data.guideline.connection_propositions.map((prop, index) => (
                                            <ListItem key={index}>
                                                <ListItemText primary={`Source: ${prop.source.condition} → Target: ${prop.target.condition}`} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </div>
                            )}
                        </div>
                    )}
                    {evaluation.status === 'completed' && (
                        <Button variant="contained" color="secondary" onClick={commitGuideline} sx={{ mt: 2 }}>
                            Commit
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

export default GuidelineCreator;
