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

import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import ParlantEditor from './ParlantEditor';  // Ensure correct path
import './index.css'; // If you're using Tailwind or other styles

const SERVER_ADDRESS = 'http://localhost:8800';

const App = () => {
    return (
        <div className="p-4">
            <div className="p-4 text-2xl font-bold bg-blue-500 text-white text-center">
                Parlant Configuration Editor
            </div>
            <ParlantEditor serverAddress={SERVER_ADDRESS} />
        </div>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);

