(function () {
  function Commit(id, parent, message) {
    this.id = id;
    this.parent = parent;
    this.message = message;
  }

  function Git(name) {
    this.name = name;
    this.lastCommitId = -1;
    this.branches = [];
    var master = new Branch("master", null);
    this.branches.push(master);
    this.HEAD = master;
  }

  function Branch(name, commit) {
    this.name = name;
    this.commit = commit;
  }

  Git.prototype.commit = function (message) {
    var commit = new Commit(++this.lastCommitId, this.HEAD.commit, message);
    this.HEAD.commit = commit;
    return commit;
  };

  Git.prototype.log = function () {
    var commit = this.HEAD.commit,
      history = [];
    while (commit) {
      history.push(commit);
      commit = commit.parent;
    }
    return history;
  };

  Git.prototype.checkout = function (branchName) {
    for (var i = 0; i < this.branches.length; i++) {
      if (this.branches[i].name === branchName) {
        console.log("Switched to existing branch: " + branchName);
        this.HEAD = this.branches[i];
        return this;
      }
    }

    var newBranch = new Branch(branchName, this.HEAD.commit);
    this.branches.push(newBranch);
    this.HEAD = newBranch;

    console.log("Switched to new branch: " + branchName);
    return this;
  };

  window.Git = Git;
})();

var repo = new Git("test");
repo.commit("Initial commit");
repo.commit("Change 1");

var log = repo.log();

console.assert(log.length === 2, "Log length is incorrect");
console.assert(
  !!log[0] && log[0].id === 1,
  "Most recent commit ID is incorrect"
);
console.assert(!!log[1] && log[1].id === 0, "Parent commit ID is incorrect");

//test 2
console.log("Git.checkout() test");
var repo = new Git("test");
repo.commit("Initial commit");

console.assert(repo.HEAD.name === "master"); // Should be on master branch.
repo.checkout("testing");
console.assert(repo.HEAD.name === "testing"); // Should be on new testing branch.
repo.checkout("master");
console.assert(repo.HEAD.name === "master"); // Should be on master branch.
repo.checkout("testing");
console.assert(repo.HEAD.name === "testing"); // Should be on testing branch again.

console.log("3. Branches test");

var repo = new Git("test");
repo.commit("Initial commit");
repo.commit("Change 1");

// Maps the array of commits into a string of commit ids.
// For [C2, C1,C3], it returns "2-1-0"
function historyToIdMapper(history) {
  var ids = history.map(function (commit) {
    return commit.id;
  });
  return ids.join("-");
}

console.assert(historyToIdMapper(repo.log()) === "1-0"); // Should show 2 commits.

repo.checkout("testing");
repo.commit("Change 3");

console.assert(historyToIdMapper(repo.log()) === "2-1-0"); // Should show 3 commits.

repo.checkout("master");
console.assert(historyToIdMapper(repo.log()) === "1-0"); // Should show 2 commits. Master unpolluted.

repo.commit("Change 3");
console.assert(historyToIdMapper(repo.log()) === "3-1-0"); // Continue on master with 4th commit.
