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
    Select, MenuItem, FormControl, InputLabel, Typography
} from "@mui/material";

const ServicesEditor = ({ client }) => {
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [serviceDetails, setServiceDetails] = useState({ name: '', kind: 'sdk', url: '', source: '', tools: [] });

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

    const selectService = async (name) => {
        try {
            const service = await client.readService(name);
            setSelectedService(name);
            setServiceDetails({
                name: service.name,
                kind: service.kind,
                url: service.url || '',
                source: service.kind === 'openapi' ? service.source || '' : '',
                tools: service.tools || []
            });
        } catch (error) {
            console.error('Failed to retrieve service:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setServiceDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
    };

    const saveService = async () => {
        try {
            const config = { url: serviceDetails.url };
            if (serviceDetails.kind === 'openapi') {
                config.source = serviceDetails.source;
            }
            await client.updateService(serviceDetails.name, serviceDetails.kind, config);
            fetchServices();
        } catch (error) {
            console.error('Failed to save service:', error);
        }
    };

    const addNewService = () => {
        setSelectedService(null);
        setServiceDetails({ name: '', kind: 'sdk', url: '', source: '', tools: [] });
    };

    const deleteService = async () => {
        if (selectedService) {
            try {
                await client.deleteService(selectedService);
                setSelectedService(null);
                setServiceDetails({ name: '', kind: 'sdk', url: '', source: '', tools: [] });
                fetchServices();
            } catch (error) {
                console.error('Failed to delete service:', error);
            }
        }
    };

    return (
        <div className="flex flex-row h-screen">
            <div className="w-1/4 border-r overflow-y-auto">
                <div className="p-4">
                    <Button variant="contained" onClick={addNewService} className="w-full mb-4">
                        Add New Service
                    </Button>
                    <List>
                        {services.map((service) => (
                            <ListItem button="true" key={service.name} onClick={() => selectService(service.name)}>
                                <ListItemText primary={service.name} />
                            </ListItem>
                        ))}
                    </List>
                </div>
            </div>
            <div className="w-3/4 p-4">
                <div className="mt-4">
                    <TextField
                        fullWidth
                        label="Service Name"
                        name="name"
                        value={serviceDetails.name}
                        onChange={handleInputChange}
                        sx={{ mt: 1 }}
                    />
                    <FormControl fullWidth sx={{ mt: 1 }}>
                        <InputLabel>Service Kind</InputLabel>
                        <Select
                            name="kind"
                            value={serviceDetails.kind}
                            onChange={handleInputChange}
                        >
                            <MenuItem value="sdk">SDK</MenuItem>
                            <MenuItem value="openapi">OpenAPI</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="Service URL"
                        name="url"
                        value={serviceDetails.url}
                        onChange={handleInputChange}
                        sx={{ mt: 1 }}
                    />
                    {serviceDetails.kind === 'openapi' && (
                        <TextField
                            fullWidth
                            label="Source URL"
                            name="source"
                            value={serviceDetails.source}
                            onChange={handleInputChange}
                            sx={{ mt: 1 }}
                        />
                    )}
                    <div className="flex space-x-4 mt-4">
                        <Button variant="contained" color="primary" onClick={saveService}>
                            Save
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={deleteService} disabled={!selectedService}>
                            Delete
                        </Button>
                    </div>
                    {selectedService && serviceDetails.tools.length > 0 && (
                        <div className="mt-4">
                            <h6>Available Tools</h6>
                            <List>
                                {serviceDetails.tools.map((tool, index) => (
                                    <ListItem key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                        <ListItemText primary={tool.name} secondary={tool.description || 'No description'} />
                                        {tool.parameters && Object.keys(tool.parameters).length > 0 && (
                                            <div className="mt-2" style={{ paddingLeft: '20px', width: '100%' }}>
                                                <strong>Parameters:</strong>
                                                <div style={{ marginTop: '5px' }}>
                                                    {Object.entries(tool.parameters).map(([param, details]) => (
                                                        <div key={param} style={{ marginTop: '3px' }}>
                                                            <strong>{param}:</strong> {details.type || 'Unknown Type'} - {details.description || ''}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </ListItem>
                                ))}
                            </List>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServicesEditor;
