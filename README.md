# @pndewit/azure-api-client
A tiny client to communicate with the Azure API.

## Installation

```bash
npm install --save @pndewit/azure-api-client
```

## Usage

```javascript
// Import the package
import AzureAPI from '@pndewit/azure-api-client';

// Set up a client instance with default values for all API requests
const azureAPI = new AzureAPI('my_personal_access_token', 'https://dev.azure.com/my_organization/', 'my_project');

// Start using the client
const repository = await azureAPI.repositories.get('my-repository');
```
