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

import React, { useState, useEffect } from 'react';
import { Button, TextField, List, ListItem, ListItemText, FormControl, Select, MenuItem, InputLabel } from "@mui/material";

const ToolAssociations = ({ client, toolAssociations, selectedAgentId, selectedGuidelineId, updateGuideline }) => {
    const [services, setServices] = useState([]);
    const [tools, setTools] = useState([]);
    const [selectedService, setSelectedService] = useState('');
    const [selectedTool, setSelectedTool] = useState('');

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const servicesList = await client.listServices();
            setServices(servicesList);
        } catch (error) {
            console.error('Failed to fetch services:', error);
        }
    };

    const fetchTools = async (serviceName) => {
        try {
            const serviceDetails = await client.readService(serviceName);
            setTools(serviceDetails.tools || []);
        } catch (error) {
            console.error('Failed to fetch tools:', error);
        }
    };

    const handleServiceChange = (e) => {
        const serviceName = e.target.value;
        setSelectedService(serviceName);
        setSelectedTool('');
        fetchTools(serviceName);
    };

    const handleToolChange = (e) => {
        setSelectedTool(e.target.value);
    };

    const addToolAssociation = async () => {
        if (!selectedGuidelineId || !selectedService || !selectedTool) return;
        const newAssociation = {
            service_name: selectedService,
            tool_name: selectedTool
        };
        const gd = await client.updateGuideline(selectedAgentId, selectedGuidelineId, { toolsAdd: [newAssociation] });
        updateGuideline({
            condition: gd.guideline.condition,
            action: gd.guideline.action,
            connections: gd.connections || [],
            services: gd.tool_associations || []
        });
        /* updateGuideline({
            condition: guideline.condition,
            action: guideline.action,
            connections: guideline.connections || [],
            services: guideline.tool_associations || []
        }); */
        setSelectedService('');
        setSelectedTool('');
    };

    const removeToolAssociation = async (associationId, serviceName, toolName) => {
        if (!selectedGuidelineId) return;
        const oldAssociation = {
            service_name: serviceName,
            tool_name: toolName
        };
        const gd = await client.updateGuideline(selectedAgentId, selectedGuidelineId, { toolsRemove: [oldAssociation] });
        updateGuideline({
            condition: gd.guideline.condition,
            action: gd.guideline.action,
            connections: gd.connections || [],
            services: gd.tool_associations || []
        });
        //updateGuideline(prev => ({ ...prev, tool_associations: prev.tool_associations.filter(a => a.id !== associationId) }));
    };

    console.log("Tools: ", toolAssociations);

    return (
        <div className="mt-4">
            <h5>Tool Associations</h5>
            <List>
                {   !toolAssociations || toolAssociations.map((association, index) => (
                    <ListItem key={index}>
                        <ListItemText primary={`${association.tool_id.service_name} - ${association.tool_id.tool_name}`} />
                        <Button variant="outlined" color="secondary" onClick={() =>
                            removeToolAssociation(association.id, association.tool_id.service_name, association.tool_id.tool_name)}>
                            Remove
                        </Button>
                    </ListItem>
                ))}
            </List>

            <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Select Service</InputLabel>
                <Select value={selectedService} onChange={handleServiceChange}>
                    {services.map(service => (
                        <MenuItem key={service.name} value={service.name}>{service.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mt: 2 }} disabled={!selectedService}>
                <InputLabel>Select Tool</InputLabel>
                <Select value={selectedTool} onChange={handleToolChange}>
                    {tools.map(tool => (
                        <MenuItem key={tool.name} value={tool.name}>{tool.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Button variant="contained" color="primary" onClick={addToolAssociation} sx={{ mt: 2 }}>
                Add Tool Association
            </Button>
        </div>
    );
};

export default ToolAssociations;
