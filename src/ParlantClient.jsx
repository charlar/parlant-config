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
class ParlantClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async createEvaluation(agentId, condition, action, coherenceCheck = true, connectionProposition = true) {
        const url = `${this.baseUrl}/index/evaluations`;
        const requestBody = {
            agent_id: agentId,
            payloads: [
                {
                    guideline: {
                        coherence_check: coherenceCheck,
                        connection_proposition: connectionProposition,
                        content: {
                            condition: condition,
                            action: action
                        },
                        operation: "add"
                    },
                    kind: "guideline"
                }
            ]
        };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error creating evaluation:", error);
            throw error;
        }
    }

    async readEvaluation(evaluationId, { waitForCompletion = null } = {}) {
        let url = `${this.baseUrl}/index/evaluations/${evaluationId}`;
        if (waitForCompletion != null) {
            url += `?wait_for_completion=${waitForCompletion}`;
        }

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error reading evaluation:", error);
            throw error;
        }
    }

    async fetchGuidelines(agentId) {
        try {
            const response = await fetch(`${this.baseUrl}/agents/${agentId}/guidelines`);
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            const guidelinesList = await response.json();
            return guidelinesList;
        } catch (error) {
            console.error('Failed to fetch guidelines:', error);
            throw error;
        }
    }

    async addGuideline(agentId, invoices) {
        const bodyFields = {
            invoices: invoices
        };

        try {
            const response = await fetch(`${this.baseUrl}/agents/${agentId}/guidelines`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyFields),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'An error occurred while adding the guideline.');
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to add guideline:', error);
            throw error;
        }
    }

    async readGuideline(agentId, guidelineId) {
        const url = `${this.baseUrl}/agents/${agentId}/guidelines/${guidelineId}`;

        try {
            const response = await fetch(url)

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'An error occurred while reading the guideline.');
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to read guideline:', error);
            throw error;
        }
    }



    async updateGuideline(agentId, guidelineId, { connectionsAdd = [], connectionsRemove = [], toolsAdd = [], toolsRemove = [] } = {}) {
        const url = `${this.baseUrl}/agents/${agentId}/guidelines/${guidelineId}`;
        const requestBody = {
            connections: {
                add: connectionsAdd,
                remove: connectionsRemove
            },
            tool_associations: {
                add: toolsAdd,
                remove: toolsRemove
            }
        };

        try {
            const response = await fetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'An error occurred while updating the guideline.');
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to update guideline:', error);
            throw error;
        }
    }

    async deleteGuideline(agentId, guidelineId) {
        try {
            const response = await fetch(`${this.baseUrl}/agents/${agentId}/guidelines/${guidelineId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to delete guideline:', error);
            throw error;
        }
    }

    async fetchAgents() {
        try {
            const response = await fetch(`${this.baseUrl}/agents`);
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            const agentsList = await response.json();
            return agentsList;
        } catch (error) {
            console.error('Failed to fetch agents:', error);
            throw error;
        }
    }

    async getAgent(id) {
        try {
            const response = await fetch(`${this.baseUrl}/agents/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            const agent = await response.json();
            agent.description = agent.description ?? '';
            return agent;
        } catch (error) {
            console.error('Failed to retrieve agent:', error);
            throw error;
        }
    }

    async saveAgent(agentDetails, agentId = null) {
        try {
            if (agentId) {
                const response = await fetch(`${this.baseUrl}/agents/${agentId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(agentDetails),
                });

                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }
            } else {
                const response = await fetch(`${this.baseUrl}/agents`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(agentDetails),
                });

                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }

                return await response.json();
            }
        } catch (error) {
            console.error('Failed to save agent:', error);
            throw error;
        }
    }

    async deleteAgent(agentId) {
        try {
            const response = await fetch(`${this.baseUrl}/agents/${agentId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to delete agent:', error);
            throw error;
        }
    }

    async updateService(name, kind, config) {
        const url = `${this.baseUrl}/services/${name}`;
        const requestBody = { kind };

        if (kind === "sdk") {
            requestBody.sdk = config;
        } else if (kind === "openapi") {
            requestBody.openapi = config;
        }

        try {
            const response = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error updating service:", error);
            throw error;
        }
    }

    async readService(name) {
        const url = `${this.baseUrl}/services/${name}`;
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error reading service:", error);
            throw error;
        }
    }

    async deleteService(name) {
        const url = `${this.baseUrl}/services/${name}`;
        try {
            const response = await fetch(url, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
        } catch (error) {
            console.error("Error deleting service:", error);
            throw error;
        }
    }

    async listServices() {
        const url = `${this.baseUrl}/services`;
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error listing services:", error);
            throw error;
        }
    }
}

export default ParlantClient;