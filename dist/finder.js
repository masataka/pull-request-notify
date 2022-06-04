"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findActualPullRequest = exports.queryActualPullRequest = exports.findPullRequestNumber = exports.listPullRequests = void 0;
const workflow_1 = require("./workflow");
const pull_request_list_string = `
query ($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
        owner {
            login
        }
        name
        pullRequests(last: 100) {
            nodes {
                mergeCommit {
                    messageBody
                    messageHeadline
                    sha: oid
                }
                number
            }
        }
    }
}
`;
async function listPullRequests(vars) {
    const octokit = (0, workflow_1.getOctokit)();
    return await octokit.graphql(pull_request_list_string, { ...vars });
}
exports.listPullRequests = listPullRequests;
async function findPullRequestNumber(vars) {
    const octokit = (0, workflow_1.getOctokit)();
    if (vars.sha) {
        const list = await listPullRequests(vars);
        if (list) {
            for (const pullRequest of list.repository.pullRequests.nodes) {
                if (pullRequest.mergeCommit && pullRequest.mergeCommit.sha === vars.sha) {
                    console.log(`Hit! #${pullRequest.number}, sha: ${vars.sha}`);
                    return pullRequest.number;
                }
            }
        }
    }
    return 0;
}
exports.findPullRequestNumber = findPullRequestNumber;
const pull_request_query_string = `
query ($owner: String!, $name: String!, $number: Int!) {
    repository(owner: $owner, name: $name) {
        name
        owner {
            login
            url
        }
        pullRequest(number: $number) {
            author {
                login
                url
            }
            baseRefName
            body
            changedFiles
            commits {
                totalCount
            }
            headRefName
            mergeCommit {
                messageBody
                messageHeadline
                sha: oid
            }
            mergeable
            merged
            number
            reviewRequests(last: 100) {
                totalCount
                edges {
                    node {
                        requestedReviewer {
                            ... on Team {
                                __typename
                                login: name
                                url
                            }
                            ... on User {
                                __typename
                                login
                                url
                            }
                        }
                    }
                }
            }
            reviews(last: 100) {
                totalCount
                edges {
                    node {
                    author {
                        login
                        url
                    }
                    body
                    state
                    updatedAt
                    }
                }
            }
            state
            title
            url
        }
        url
    }
}
`;
async function queryActualPullRequest(vars) {
    const octokit = (0, workflow_1.getOctokit)();
    return await octokit.graphql(pull_request_query_string, { ...vars });
}
exports.queryActualPullRequest = queryActualPullRequest;
async function findActualPullRequest(vars) {
    let number = vars.number;
    if (number == 0) {
        number = await findPullRequestNumber(vars);
    }
    if (number == 0) {
        // PullRequest Not Found
        return null;
    }
    return await queryActualPullRequest({ ...vars, number });
}
exports.findActualPullRequest = findActualPullRequest;
//# sourceMappingURL=finder.js.map