// Configuration
const GITHUB_API_TOKEN = '';
const GITHUB_REPO_OWNER = 'rithikg24';
const GITHUB_REPO_NAME = 'CodeChef-Solutions';

// File extension mapping
const FILE_EXTENSIONS = {
    'PyPy 3': '.py',
    Python3: '.py',
    'C++17': '.cpp',
    'C++20': '.cpp',
    C: '.c',
    Java: '.java',
    'C#': '.cs',
    JavaScript: '.js',
    Ruby: '.rb',
    Swift: '.swift',
    Go: '.go',
    Kotlin: '.kt',
    Scala: '.scala',
    Rust: '.rs',
    PHP: '.php',
    TypeScript: '.ts',
    R:'.r',
    SQL: '.sql',
    'MS SQL Server': '.sql',
    OracleDB: '.sql',
};

// Helper functions
function extractProblemTitle(document) {
    const titleElement = document.querySelector("#problem-statement");
    return titleElement.children[0].innerText;
}

function formatTitleForFilename(title) {
    return title.replace(/ /g, '-');
}

function convertArrayToString(arr) {
    return arr.slice(1).join('');
}

function extractProblemStatement(document) {
    const problemStatementElement = document.getElementById("problem-statement");
    const problemStatementParts = [];

    Array.from(problemStatementElement.children).forEach(child => {
        if (child.classList.contains("_input_output__table_1x1re_194")) {
            const preTags = child.querySelectorAll("pre");
            if (preTags.length >= 2) {
                problemStatementParts.push("<h4>Input:</h4>");
                problemStatementParts.push(preTags[0].outerHTML);
                problemStatementParts.push("<h4>Output:</h4>");
                problemStatementParts.push(preTags[1].outerHTML);
            }
        } else {
            problemStatementParts.push(child.outerHTML);
        }
    });

    return problemStatementParts;
}

function extractProblemCode(document) {
    const urlParts = document.URL.split('/');
    return urlParts[urlParts.length - 1].split('?')[0];
}

function extractProblemDifficulty(document) {
    const difficultyElement = document.querySelector("span._value_lvmtf_32._dark_lvmtf_29");
    return difficultyElement ? difficultyElement.innerHTML : "";
}

async function fetchSubmissionCode(submissionId) {
    const plainCodeURL = "https://www.codechef.com/viewplaintext/";
    try {
        const response = await fetch(plainCodeURL + submissionId);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const preTag = doc.querySelector('pre');
        const codeContent = preTag.innerHTML;
        const tempElement = document.createElement('textarea');
        tempElement.innerHTML = codeContent;
        return tempElement.value;
    } catch (error) {
        console.error("Error fetching the Code", error);
        return "Error fetching the Code";
    }
}

function createStatusElement() {
    const statusElement = document.createElement('p');
    statusElement.className = "statusElement";
    //_leftContainer_aot9r_79
    const statusParentDiv = document.querySelector("._leftContainer_hhp7w_79");
    statusParentDiv.appendChild(statusElement);
}

function updateStatusElement(statusText, statusColor) {
    const statusDiv = document.querySelector(".statusElement");
    statusDiv.textContent = statusText;
    statusDiv.style.color = statusColor;
}

function utoa(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}

async function uploadReadmeToGithub(problemStatement, problemCode, fileName) {
    const filePath = `${problemCode}-${fileName}/README.md`;
    const apiUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${filePath}`;

    const body = {
        message: "Create README - CodeSync",
        content: utoa(problemStatement),
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (response.ok) {
            console.log('Readme uploaded/updated successfully');
        } else {
            console.error('Failed to upload/update Readme');
        }
    } catch (error) {
        console.error('Error uploading README:', error);
    }
}

async function uploadCodeToGithub(code, filePath, commitMessage, problemStatement, fileName, problemCode) {
    const apiUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${filePath}`;

    try {
        const response = await fetch(apiUrl, {
            headers: { 'Authorization': `token ${GITHUB_API_TOKEN}` },
        });

        let method = 'PUT';
        let body = {
            message: commitMessage,
            content: utoa(code),
        };

        let fileExists = false;

        if (response.ok) {
            const data = await response.json();
            body.sha = data.sha;
            fileExists = true;
        } else {
            await uploadReadmeToGithub(problemStatement, problemCode, fileName);
        }

        const updateResponse = await fetch(apiUrl, {
            method: method,
            headers: {
                'Authorization': `token ${GITHUB_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (updateResponse.ok) {
            updateStatusElement(`Successfully ${fileExists ? 'Updated' : 'Uploaded'} to Github.`, "#00FF00");
            return true;
        } else {
            updateStatusElement("Failed to Upload to Github.", "#FF0000");
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        updateStatusElement("Error Uploading to Github.", "#FF0000");
        return false;
    }
}

// Main functionality
(function() {
    console.log(document.URL);

    let debounceTimer;

    function debounce(func, delay) {
        return function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(func, delay);
        };
    }

    function processProblemSubmission() {
        let hasRun = false;
        document.getElementById("vertical-tab-panel-1").click();

        function checkForSubmissionTable() {
            if (hasRun) return;

            let submissionTable;
            if (window.innerWidth < 975) {
                submissionTable = document.querySelectorAll("._my-submissions_1jl4n_157");
            } else {
                submissionTable = document.querySelectorAll("#MUIDataTableBodyRow-0");
            }

            if (submissionTable.length > 0) {
                const submissionRow = submissionTable[1];
                let submissionId, executionTime, memoryUsage, programmingLanguage;

                if (window.innerWidth < 975) {
                    function checkForDataContainers() {
                        if (hasRun) return;

                        const dataContainers = submissionRow.querySelectorAll("._data__container_1jl4n_188");
                        if (dataContainers.length > 0 && dataContainers[0].children.length > 3) {
                            submissionId = dataContainers[0].children[0].querySelector('a')?.innerHTML;
                            executionTime = dataContainers[0].children[2]?.children[0]?.children[1]?.innerHTML;
                            memoryUsage = dataContainers[0].children[2]?.children[1]?.children[1]?.innerHTML;
                            programmingLanguage = dataContainers[0].children[3]?.children[0]?.children[1]?.innerHTML;
                            if (submissionId && executionTime && memoryUsage && programmingLanguage) {
                                processSubmissionData();
                            } else {
                                setTimeout(checkForDataContainers, 100);
                            }
                        } else {
                            setTimeout(checkForDataContainers, 100);
                        }
                    }
                    checkForDataContainers();
                } else {
                    if (submissionRow && submissionRow.children.length > 4) {
                        submissionId = submissionRow.children[0]?.children[1]?.innerHTML;
                        executionTime = submissionRow.children[2]?.children[1]?.innerHTML;
                        memoryUsage = submissionRow.children[3]?.children[1]?.innerHTML;
                        programmingLanguage = submissionRow.children[4]?.children[1]?.innerHTML;
                        if (submissionId && executionTime && memoryUsage && programmingLanguage) {
                            processSubmissionData();
                        } else {
                            setTimeout(checkForSubmissionTable, 100);
                        }
                    } else {
                        setTimeout(checkForSubmissionTable, 100);
                    }
                }

                function processSubmissionData() {
                    if (hasRun) return;
                    hasRun = true;
                    document.getElementById("vertical-tab-panel-0").click();
                    console.log(submissionId, executionTime, memoryUsage, programmingLanguage);
                    createStatusElement();
                    if(submissionId) {
                        updateStatusElement("Getting Submission Details...", "#00FF00");
                        const problemStatement = extractProblemStatement(document);
                        const problemStatementString = convertArrayToString(problemStatement);
                        const problemCode = extractProblemCode(document);
                        const problemDifficulty = extractProblemDifficulty(document);
                        const fileExtension = FILE_EXTENSIONS[programmingLanguage] || ".txt";
                        const fileName = formatTitleForFilename(extractProblemTitle(document));
                        const filePath = `${problemCode}-${fileName}/${fileName}${fileExtension}`;
                        const commitMessage = `Time: ${executionTime} Space: ${memoryUsage} - CodeSync`;
                        const finalReadme = `<h2><a href="${document.URL}">${extractProblemTitle(document)}</a></h2><h4>Difficulty: ${problemDifficulty}</h4>`;
                        const completeReadme = finalReadme + problemStatementString;
                        
                        updateStatusElement("Uploading to Github...", "#00FF00");
                        fetchSubmissionCode(submissionId).then(async code => {
                            const success = await uploadCodeToGithub(code, filePath, commitMessage, completeReadme, fileName, problemCode);
                            if (success) {
                                updateStatusElement("Successfully uploaded to Github", "#00FF00");
                            } else {
                                updateStatusElement("Failed to upload to Github", "#FF0000");
                            }
                        });
                    } else {
                        updateStatusElement("Failed to get Submission Details...", "#FF0000");
                    }
                }
            } else {
                setTimeout(checkForSubmissionTable, 100);
            }
        }

        checkForSubmissionTable();
    }

    function handleSubmitButtonClick() {
        console.log("submit_btn clicked");
        let observerRun = false;
        const observer = new MutationObserver(function(mutations) {
            if (observerRun) return;
            mutations.forEach(function(mutation) {
                const subtaskResult = document.querySelector("._status-success_vov4h_275");
                if (subtaskResult && !observerRun) {
                    observerRun = true;
                    processProblemSubmission();
                    observer.disconnect();
                }
            });
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function attachSubmitButtonListener() {
        const submitBtn = document.getElementById("submit_btn");
        if (submitBtn && !submitBtn.hasAttribute('data-listener-attached')) {
            console.log('submit btn found and listener attached');
            submitBtn.addEventListener("click", handleSubmitButtonClick);
            submitBtn.setAttribute('data-listener-attached', 'true');
        }
    }

    function waitForSubmitButton() {
        const checkInterval = setInterval(() => {
            if (document.getElementById("submit_btn")) {
                clearInterval(checkInterval);
                attachSubmitButtonListener();
            }
        }, 100);
    }

    // Initial setup
    waitForSubmitButton();

    // Handle window resize
    window.addEventListener('resize', debounce(() => {
        console.log("Window resized, checking submit button.");
        attachSubmitButtonListener();
    }, 250));
})();