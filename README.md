
# CodeSync

CodeSync is a simple and fast Chrome extension that automatically syncs your CodeChef solution to Github upon a successful submission. It captures the problem details, your submitted code, and performance metrics, then uploads them to GitHub.

## Features

- Automatically detects when you submit a solution on CodeChef
- Extracts problem statement, difficulty, and your solution details
- Creates a README.md file for each problem with problem details
- Uploads your solution code to a specified GitHub repository
- Provides status updates within the CodeChef interface

## Files

The extension consists of two main files:

1. `manifest.json`: The extension's configuration file
2. `content.js`: The main script that runs on CodeChef pages
## Setup

1. Clone this repository or download the files.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the directory containing these files.
5. The extension should now be active in your Chrome browser.

## Configuration

Before using the extension, you need to set up a few things:

1. Create a GitHub personal access token with repo scope.
2. In the `content.js` file, replace the placeholder values for:
   - `GITHUB_API_TOKEN`
   - `GITHUB_REPO_OWNER`
   - `GITHUB_REPO_NAME`

## Usage

1. Check if the CodeSync Active message is displayed beside the submit button, if not refresh the page/extension.
2. Solve a problem on CodeChef.
3. Submit your solution.
4. The extension will automatically detect your submission and start the sync process.
5. You'll see status updates on the CodeChef page indicating the progress.
6. Check your GitHub repository to see the uploaded solution and README.

## Notes

- The extension is only active when the CodeSync Active message is displayed.
- The extension currently works for CodeChef problems only.
- Ensure you have the necessary permissions to push to the specified GitHub repository.
- The extension uses the GitHub API, so be mindful of rate limits.
- For any errors, check out the console.
