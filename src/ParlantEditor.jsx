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

import React, { useState } from 'react';
import { Tabs, Tab } from "@mui/material";
import { Button, List, ListItem, ListItemText } from "@mui/material";
import { createRoot } from 'react-dom/client';
import AgentEditor from './AgentEditor';  // Ensure correct path
import GuidelineCreator from './GuidelineCreator';  // Ensure correct path
import GuidelineEditor from './GuidelineEditor';  // Ensure correct path
import ServicesEditor from './ServicesEditor';  // Ensure correct path
import ParlantClient from './ParlantClient';
import './index.css'; // If you're using Tailwind or other styles

export default function ParlantEditor({ serverAddress }) {
    const [tabIndex, setTabIndex] = useState(0);
    const client = new ParlantClient(serverAddress);

    return (

        <div className="flex flex-col h-screen">
            <div className="w-full p-4">
                <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)}>
                    <Tab label="Agent Details" />
                    <Tab label="Create Guidelines" />
                    <Tab label="Edit Guidelines" />
                    <Tab label="Services" />
                    <Tab label="Tags" />
                </Tabs>
                {tabIndex === 0 && (
                    <div className="mt-4">
                        <AgentEditor serverAddress={serverAddress} />
                    </div>
                )}
                {tabIndex === 1 && (
                    <div className="mt-4">
                        <GuidelineCreator client={client} />
                    </div>
                )}
                {tabIndex === 2 && (
                    <div className="mt-4">
                        <GuidelineEditor client={client} />
                    </div>
                )}
                {tabIndex === 3 && (
                    <div className="mt-4">
                        <ServicesEditor client={client} />
                    </div>
                )}
                {tabIndex === 4 && (
                    <div className="mt-4">
                        {/* Content for Tab 5 will go here */}
                    </div>
                )}
            </div>
        </div>
    );
}
