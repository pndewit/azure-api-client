import { doFetch as fetch } from './fetch.js';

/**
 * @typedef Repository {Object}
 * @property {String} defaultBranch
 * @property {Boolean} isFork
 * @property {String} name

 * @typedef PullRequest {Object}
 * @property {{commitId:String}} lastMergeCommit
 * @property {{commitId:String}} lastMergeTargetCommit

 * @typedef PullRequestLabel {Object}
 * @property {Boolean} active
 * @property {String} name
 */

export default class AzureApi {
  constructor(pat, organization, project) {
    this.pat = pat;
    this.baseUrl = `https://dev.azure.com/${organization}/${project}/_apis`;
  }

  /**
   * Gets a file from a repository
   * See the {@link https://learn.microsoft.com/en-us/rest/api/azure/devops/build/source-providers/get-file-contents?view=azure-devops-rest-7.0 docs} for more info
   * @param repository {String} Repository ID
   * @param commitOrBranch {String} The commit or branch from which a file's contents are retrieved
   * @param path {String} Path to the file relative to the root of the repository
   * @param json {Boolean} Whether the file is a JSON file
   * @returns {Promise<String|Object>}
   */
  getFile(repository, commitOrBranch, path, json = false) {
    return fetch(
      `${this.baseUrl}/sourceProviders/tfsgit/filecontents?repository=${repository}&commitOrBranch=${commitOrBranch}&path=${path}`,
      { pat: this.pat, json },
    );
  }

  repositories = {
    /**
     * Gets a repository
     * See the {@link https://learn.microsoft.com/en-us/rest/api/azure/devops/git/repositories/get-repository?view=azure-devops-rest-7.0 docs} for more info
     * @param repository {String} Repository ID
     * @returns {Promise<Repository>}
     */
    get: repository =>
      fetch(`${this.baseUrl}/git/repositories/${repository}`, { pat: this.pat, json: true }),
  };

  pullrequests = {
    /**
     * Gets a Pull Request
     * See the {@link https://learn.microsoft.com/en-us/rest/api/azure/devops/git/pull-requests/get-pull-request?view=azure-devops-rest-7.0 docs} for more info
     * @param repository {String} Repository ID
     * @param prId {String} Pull Request ID
     * @returns {Promise<PullRequest>}
     */
    get: (repository, prId) =>
      fetch(`${this.baseUrl}/git/repositories/${repository}/pullrequests/${prId}`, {
        pat: this.pat,
        json: true,
      }),

    /**
     * Gets all Pull Request labels
     * See the {@link https://learn.microsoft.com/en-us/rest/api/azure/devops/git/pull-request-labels/list?view=azure-devops-rest-7.0 docs} for more info
     * @param repository {String} Repository ID
     * @param prId {String} Pull Request ID
     * @returns {Promise<{count:Number, value:PullRequestLabel[]}>}
     */
    getLabels: (repository, prId) =>
      fetch(`${this.baseUrl}/git/repositories/${repository}/pullrequests/${prId}/labels`, {
        pat: this.pat,
        json: true,
      }),

    /**
     * Adds a label to the given Pull Request
     * See the {@link https://learn.microsoft.com/en-us/rest/api/azure/devops/git/pull-request-labels/create?view=azure-devops-rest-7.0 docs} for more info
     * @param repository {String} Repository ID
     * @param prId {String} Pull Request ID
     * @param name {String} The label to be added
     * @returns {Promise<PullRequestLabel>}
     */
    addLabel: (repository, prId, name) =>
      fetch(
        `${this.baseUrl}/git/repositories/${repository}/pullrequests/${prId}/labels?api-version=7.0`,
        {
          pat: this.pat,
          json: true,
          method: 'POST',
          body: { name },
        },
      ),

    /**
     * Adds a comment to the given Pull Request
     * See the {@link https://learn.microsoft.com/en-us/rest/api/azure/devops/git/pull-request-threads/create?view=azure-devops-rest-7.0 docs} for more info
     * @param repository {String} Repository ID
     * @param prId {String} Pull Request ID
     * @param comment {Object}
     * @param comment.content {String} The comment to be added
     * @param comment.status {'active', 'fixed'} The comment status
     * @returns {Promise<PullRequestLabel>}
     */
    postComment: (repository, prId, comment) =>
      fetch(
        `${this.baseUrl}/git/repositories/${repository}/pullrequests/${prId}/threads?api-version=7.0`,
        {
          method: 'POST',
          body: {
            comments: [{ commentType: 'text', content: comment.content }],
            status: comment.status,
          },
          pat: this.pat,
          json: true,
        },
      ),
  };
}
