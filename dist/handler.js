"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleEvent = exports.handleAction = exports.queryActualPullRequest = exports.createActionContext = void 0;
const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs/promises");
const notifier_1 = require("./notifier");
const renderer_1 = require("./renderer");
async function createActionContext() {
    const owner = github.context.repo.owner;
    const name = github.context.repo.repo;
    const githubToken = core.getInput('githubToken');
    const slackToken = core.getInput('slackToken');
    const slackChannel = core.getInput('slackChannel');
    const file = await fs.readFile(core.getInput('slackAccounts'), 'utf8');
    const slackAccounts = JSON.parse(file);
    return {
        owner,
        name,
        githubToken,
        slackToken,
        slackChannel,
        slackAccounts,
    };
}
exports.createActionContext = createActionContext;
async function queryActualPullRequest(token, vars) {
    const queryString = `
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
                mergeable
                merged
                number
                reviewRequests(last: 100) {
                    totalCount
                    edges {
                        node {
                            requestedReviewer {
                                ... on User {
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
    const oktokit = github.getOctokit(token);
    return await oktokit.graphql(queryString, { ...vars });
}
exports.queryActualPullRequest = queryActualPullRequest;
function dumpSlackAccounts(cx) {
    core.info('- cx.slackAccounts');
    let count = 0;
    for (const login in cx.slackAccounts) {
        core.info(`    - ${login}: ${cx.slackAccounts[login]}`);
        count += 1;
    }
    core.info(`    - (total ${count} accounts)`);
}
async function handleAction(ev) {
    const { action, number } = ev;
    if (['closed', 'review_request_removed', 'review_requested', 'submitted'].includes(action)) {
        const cx = await createActionContext();
        dumpSlackAccounts(cx);
        const { owner, name } = cx;
        const result = await queryActualPullRequest(cx.githubToken, { owner, name, number });
        const message = await (0, notifier_1.findSlackMessage)(cx, number);
        let ts = message?.ts; // So the message not found, ts is undefined.
        const model = { ...cx, ...ev, ...result, ts };
        if (message) {
            ts = await (0, notifier_1.updatePullRequestInfo)(cx, model);
        }
        else {
            ts = await (0, notifier_1.postPullRequestInfo)(cx, model);
        }
        if (ts) {
            if (action === 'closed') {
                await (0, notifier_1.postChangeLog)(cx, ts, () => (0, renderer_1.ClosedLog)(model));
            }
            else if (['review_requested', 'review_request_removed'].includes(action)) {
                await (0, notifier_1.postChangeLog)(cx, ts, () => (0, renderer_1.ReviewRequestedLog)(model));
            }
            else if (action === 'submitted') {
                await (0, notifier_1.postChangeLog)(cx, ts, () => (0, renderer_1.SubmittedLog)(model));
            }
        }
    }
    else {
        core.info(`Unsupported trigger action: ${ev.event} > "${action}"`);
    }
}
exports.handleAction = handleAction;
async function handleEvent() {
    const { eventName, payload: { action } } = github.context;
    if (eventName === 'pull_request') {
        const payload = github.context.payload;
        const number = payload.pull_request.number;
        const reviewRequest = (payload.requested_reviewer) && {
            requestedReviewer: {
                login: payload.requested_reviewer.login,
                url: payload.requested_reviewer.html_url,
            },
        }; // <- undefined when action is 'closed'
        handleAction({ event: 'pull_request', action: action || '', number, reviewRequest });
    }
    else if (eventName === 'pull_request_review') {
        const payload = github.context.payload;
        const number = payload.pull_request.number;
        const review = {
            author: {
                login: payload.review.user.login,
                url: payload.review.user.html_url,
            },
            body: payload.review.body,
            // Since it is uppercase in the definition of GitHub GraphQL, align it
            state: (payload.review.state).toUpperCase(),
            updatedAt: payload.review.submitted_at,
        };
        handleAction({ event: 'pull_request_review', action: action || '', number, review });
    }
    else {
        core.info(`Unsupported trigger event: "${eventName}"`);
    }
}
exports.handleEvent = handleEvent;
//# sourceMappingURL=handler.js.map