"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmittedLog = exports.ReviewRequestedLog = exports.DeployCompleteLog = exports.ClosedLog = exports.EditedLog = void 0;
const jsx_runtime_1 = require("jsx-slack/jsx-runtime");
const jsx_slack_1 = require("jsx-slack");
const renderer_1 = require("./renderer");
function EditedLog(props) {
    const { login } = props.sender;
    const slack = props.slackAccounts[login];
    return ((0, jsx_runtime_1.jsx)(jsx_slack_1.Blocks, { children: (0, jsx_runtime_1.jsx)(jsx_slack_1.Context, { children: (0, jsx_runtime_1.jsxs)("b", { children: [(0, jsx_runtime_1.jsx)(renderer_1.UserLink, { login: login, slack: slack }), " edited this body text "] }) }) }));
}
exports.EditedLog = EditedLog;
function ClosedLog(props) {
    const { merged } = props.repository.pullRequest;
    if (!merged) {
        return null;
    }
    return ((0, jsx_runtime_1.jsx)(jsx_slack_1.Blocks, { children: (0, jsx_runtime_1.jsx)(jsx_slack_1.Context, { children: (0, jsx_runtime_1.jsxs)("b", { children: ["This pull request has been closed ", merged ? 'and the merge is complete' : 'without merge'] }) }) }));
}
exports.ClosedLog = ClosedLog;
function DeployCompleteLog(props) {
    const { login } = props.sender;
    const slack = props.slackAccounts[login];
    const message = props.pushMessage.trim();
    return ((0, jsx_runtime_1.jsxs)(jsx_slack_1.Blocks, { children: [(0, jsx_runtime_1.jsxs)(jsx_slack_1.Context, { children: [(0, jsx_runtime_1.jsx)("span", { children: (0, jsx_runtime_1.jsxs)("b", { children: ["The workflow launched by ", (0, jsx_runtime_1.jsx)(renderer_1.UserLink, { login: login, slack: slack }), "'s merge commit is complete."] }) }), (0, jsx_runtime_1.jsxs)("span", { children: ["> sha: ", props.sha] })] }), message ? (0, jsx_runtime_1.jsx)(jsx_slack_1.Section, { children: (0, jsx_runtime_1.jsx)("b", { children: message }) }) : null] }));
}
exports.DeployCompleteLog = DeployCompleteLog;
function ReviewRequestedLog(props) {
    const { login } = props.reviewRequest.requestedReviewer;
    const slack = props.slackAccounts[login];
    const msg = props.action === 'review_requested' ? 'Awaiting' : 'Removed';
    return ((0, jsx_runtime_1.jsx)(jsx_slack_1.Blocks, { children: (0, jsx_runtime_1.jsx)(jsx_slack_1.Context, { children: (0, jsx_runtime_1.jsxs)("b", { children: [msg, " requested review from ", (0, jsx_runtime_1.jsx)(renderer_1.UserLink, { login: login, slack: slack })] }) }) }));
}
exports.ReviewRequestedLog = ReviewRequestedLog;
function SubmittedLog(props) {
    const { state, author: { login }, body } = props.review;
    const slack = props.slackAccounts[login];
    if (state === 'APPROVED') {
        const authorLogin = props.repository.pullRequest.author.login;
        const authorSlack = props.slackAccounts[authorLogin];
        return ((0, jsx_runtime_1.jsxs)(jsx_slack_1.Blocks, { children: [(0, jsx_runtime_1.jsx)(jsx_slack_1.Context, { children: (0, jsx_runtime_1.jsxs)("b", { children: [(0, jsx_runtime_1.jsx)(renderer_1.UserLink, { login: login, slack: slack }), " approved ", (0, jsx_runtime_1.jsx)(renderer_1.UserLink, { login: authorLogin, slack: authorSlack }), "'s changes."] }) }), (0, jsx_runtime_1.jsx)(renderer_1.Description, { text: body })] }));
    }
    if (body) {
        return ((0, jsx_runtime_1.jsxs)(jsx_slack_1.Blocks, { children: [(0, jsx_runtime_1.jsx)(jsx_slack_1.Context, { children: (0, jsx_runtime_1.jsxs)("b", { children: [(0, jsx_runtime_1.jsx)(renderer_1.UserLink, { login: login, slack: slack }), " commented."] }) }), (0, jsx_runtime_1.jsx)(renderer_1.Description, { text: body })] }));
    }
    return null;
}
exports.SubmittedLog = SubmittedLog;
//# sourceMappingURL=logger.js.map