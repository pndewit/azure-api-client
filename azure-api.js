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

export default class AzureAPI {
  /**
   * @param {String} pat
   * @param {String} collectionUri
   * @param {String} project
     */
  constructor(pat, collectionUri, project) {
    this.pat = Buffer.from(`:${pat}`).toString('base64');
    this.baseUrl = `${collectionUri}${project}/_apis`;
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
    return /** @type Promise<String|Object> */ (fetch(
      `${this.baseUrl}/sourceProviders/tfsgit/filecontents?repository=${repository}&commitOrBranch=${commitOrBranch}&path=${path}`,
      { pat: this.pat, json },
    ));
  }

  repositories = {
    /**
     * Gets a repository
     * See the {@link https://learn.microsoft.com/en-us/rest/api/azure/devops/git/repositories/get-repository?view=azure-devops-rest-7.0 docs} for more info
     * @param repository {String} Repository ID
     * @returns {Promise<Repository>}
     */
    get: repository =>
      /** @type Promise<Repository> */ (fetch(`${this.baseUrl}/git/repositories/${repository}`, { pat: this.pat, json: true })),
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
      /** @type Promise<PullRequest> */ (fetch(`${this.baseUrl}/git/repositories/${repository}/pullrequests/${prId}`, {
        pat: this.pat,
        json: true,
      })),

    /**
     * Gets all Pull Request labels
     * See the {@link https://learn.microsoft.com/en-us/rest/api/azure/devops/git/pull-request-labels/list?view=azure-devops-rest-7.0 docs} for more info
     * @param repository {String} Repository ID
     * @param prId {String} Pull Request ID
     * @returns {Promise<{count:Number, value:PullRequestLabel[]}>}
     */
    getLabels: (repository, prId) =>
      /** @type Promise<{count:Number, value:PullRequestLabel[]}> */ (fetch(`${this.baseUrl}/git/repositories/${repository}/pullrequests/${prId}/labels`, {
        pat: this.pat,
        json: true,
      })),

    /**
     * Adds a label to the given Pull Request
     * See the {@link https://learn.microsoft.com/en-us/rest/api/azure/devops/git/pull-request-labels/create?view=azure-devops-rest-7.0 docs} for more info
     * @param repository {String} Repository ID
     * @param prId {String} Pull Request ID
     * @param name {String} The label to be added
     * @returns {Promise<PullRequestLabel>}
     */
    addLabel: (repository, prId, name) =>
      /** @type Promise<PullRequestLabel> */ (fetch(
        `${this.baseUrl}/git/repositories/${repository}/pullrequests/${prId}/labels?api-version=7.0`,
        {
          pat: this.pat,
          json: true,
          method: 'POST',
          body: { name },
        },
        )
      ),

    /**
     * Deletes a label from the set of those assigned to the given pull request.
     * See the {@link https://learn.microsoft.com/en-us/rest/api/azure/devops/git/pull-request-labels/delete?view=azure-devops-rest-7.0 docs} for more info
     * @param repository {String} Repository ID
     * @param prId {String} Pull Request ID
     * @param labelIdOrName {String} The label to be removed
     * @returns {Promise<PullRequestLabel>}
     */
    deleteLabel: (repository, prId, labelIdOrName) =>
      /** @type Promise<PullRequestLabel> */ (
        fetch(
          `${this.baseUrl}/git/repositories/${repository}/pullrequests/${prId}/labels/${labelIdOrName}?api-version=7.0`,
          {
            pat: this.pat,
            json: true,
            parse: false,
            method: 'DELETE',
          },
        )
      ),

    /**
     * Adds a comment to the given Pull Request
     * See the {@link https://learn.microsoft.com/en-us/rest/api/azure/devops/git/pull-request-threads/create?view=azure-devops-rest-7.0 docs} for more info
     * @param repository {String} Repository ID
     * @param prId {String} Pull Request ID
     * @param comment {Object}
     * @param comment.content {String} The comment to be added
     * @param comment.status {'active'|'fixed'} The comment status
     * @returns {Promise<PullRequestLabel>}
     */
    postComment: (repository, prId, comment) =>
      /** @type Promise<PullRequestLabel> */ (fetch(
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
      )),

    
    /**
     * Updates the given Pull Request's draft state
     * @param repository {String} Repository ID
     * @param prId {String} Pull Request ID
     * @param isDraft {Boolean} Whether the PR is a draft
     * @returns {Promise<PullRequestLabel>}
     */
    updateDraftState: (repository, prId, isDraft) => 
      /** @type Promise<PullRequestLabel> */ (fetch(
        `${this.baseUrl}/git/repositories/${repository}/pullrequests/${prId}?api-version=7.0`,
        {
          method: 'PATCH',
          body: { isDraft },
          pat: this.pat,
          json: true,
        },
      )),
  };
}
