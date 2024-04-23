# Legislation Tracker

A tracker that shows the sponsors of a bill and the current status of a bill in the New York State Legislature (Assembly and Senate) and the New York City Council.

Compare to the [existing spreadsheet](https://docs.google.com/spreadsheets/d/1oTbQNLVf8iMC0ShOdkilr3Sh9d4-Rf8Gjt0ZyU2Gq18/edit#gid=1038006981).

## Prerequisites

- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Ask for access to the Airtable
- Get the required API keys:

### API keys
Your `.env` file will look like this:
```
# REQUIRED - bill data
# Sign up for key here: https://legislation.nysenate.gov/public
OPEN_LEGISLATION_KEY=myopenlegislationapikey

# REQUIRED - sunrise bill campaigns
# The token "base" is the shared sunrise legislation tracker
# The token "scopes" are data.records:read and schema.bases:read
# Guide to create personal access token: https://airtable.com/developers/web/guides/personal-access-tokens
AIRTABLE_API_KEY=my.airtable.api.key

# OPTIONAL - needed for `legislators/search/offices`
# How to get key: https://docs.openstates.org/api-v3/#api-basics
OPEN_STATES_KEY=my-openstates-key
```

## Local development

1. Clone this repo locally
2. Create a new file at the root of this project called `.env`
3. In the `.env` file, add the required API keys (see below).
4. At the root of this project, in your Terminal or Powershell, run `docker compose build && docker compose up`
5. Visit http://localhost:5173/

### File formatting
Install [prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) to format your code. You can use this in your workspace settings JSON:
```json
    "[javascript]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "editor.formatOnSave": true,
    },
```

If you install [eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint), you will see errors highlighted in VSCode.